import { NextApiRequest, NextApiResponse } from 'next'
import { getClient, initializeDatabase } from '../../../lib/database'

// Initialize database on first request
let dbInitialized = false

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase()
      dbInitialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await ensureDbInitialized()

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Usage API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// GET /api/icon-mappings/usage - Get usage statistics
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { 
      source_type, 
      context, 
      component,
      limit = '50',
      sort_by = 'usage_count',
      sort_order = 'DESC',
      time_range = '30d'
    } = req.query

    // Calculate time filter
    let timeFilter = ''
    let timeParams: any[] = []
    let paramCount = 0

    if (time_range) {
      const timeRangeMap: { [key: string]: string } = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days'
      }
      
      const interval = timeRangeMap[time_range as string] || '30 days'
      paramCount++
      timeFilter = ` AND last_used >= NOW() - INTERVAL '${interval}'`
    }

    // Build main query
    let query = 'SELECT * FROM icon_usage WHERE 1=1'
    const params: any[] = []

    if (source_type) {
      paramCount++
      query += ` AND source_type ILIKE $${paramCount}`
      params.push(`%${source_type}%`)
    }

    if (context) {
      paramCount++
      query += ` AND context = $${paramCount}`
      params.push(context)
    }

    if (component) {
      paramCount++
      query += ` AND component = $${paramCount}`
      params.push(component)
    }

    query += timeFilter

    // Add sorting
    const validSortColumns = ['usage_count', 'last_used', 'first_used', 'source_type', 'target_type']
    const sortColumn = validSortColumns.includes(sort_by as string) ? sort_by : 'usage_count'
    const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC'
    query += ` ORDER BY ${sortColumn} ${sortDirection}`

    // Add limit
    paramCount++
    query += ` LIMIT $${paramCount}`
    params.push(parseInt(limit as string))

    const result = await client.query(query, params)

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_mappings,
        SUM(usage_count) as total_usage,
        AVG(usage_count) as avg_usage_per_mapping,
        MAX(usage_count) as max_usage,
        COUNT(DISTINCT source_type) as unique_source_types,
        COUNT(DISTINCT target_type) as unique_target_types,
        COUNT(DISTINCT context) as unique_contexts,
        COUNT(DISTINCT component) as unique_components
      FROM icon_usage 
      WHERE 1=1 ${timeFilter}
    `

    const summaryResult = await client.query(summaryQuery, timeParams)
    const summary = summaryResult.rows[0]

    // Get top usage by context
    const contextQuery = `
      SELECT 
        context,
        COUNT(*) as mapping_count,
        SUM(usage_count) as total_usage
      FROM icon_usage 
      WHERE 1=1 ${timeFilter}
      GROUP BY context
      ORDER BY total_usage DESC
      LIMIT 10
    `

    const contextResult = await client.query(contextQuery, timeParams)

    // Get top usage by component
    const componentQuery = `
      SELECT 
        component,
        COUNT(*) as mapping_count,
        SUM(usage_count) as total_usage
      FROM icon_usage 
      WHERE 1=1 ${timeFilter}
      GROUP BY component
      ORDER BY total_usage DESC
      LIMIT 10
    `

    const componentResult = await client.query(componentQuery, timeParams)

    // Get most used mappings
    const topMappingsQuery = `
      SELECT 
        source_type,
        target_type,
        SUM(usage_count) as total_usage,
        COUNT(*) as context_count,
        MAX(last_used) as last_used
      FROM icon_usage 
      WHERE 1=1 ${timeFilter}
      GROUP BY source_type, target_type
      ORDER BY total_usage DESC
      LIMIT 20
    `

    const topMappingsResult = await client.query(topMappingsQuery, timeParams)

    return res.status(200).json({
      usage_records: result.rows,
      summary: {
        total_mappings: parseInt(summary.total_mappings),
        total_usage: parseInt(summary.total_usage || 0),
        avg_usage_per_mapping: parseFloat(summary.avg_usage_per_mapping || 0),
        max_usage: parseInt(summary.max_usage || 0),
        unique_source_types: parseInt(summary.unique_source_types),
        unique_target_types: parseInt(summary.unique_target_types),
        unique_contexts: parseInt(summary.unique_contexts),
        unique_components: parseInt(summary.unique_components)
      },
      breakdown: {
        by_context: contextResult.rows.map(row => ({
          context: row.context,
          mapping_count: parseInt(row.mapping_count),
          total_usage: parseInt(row.total_usage)
        })),
        by_component: componentResult.rows.map(row => ({
          component: row.component,
          mapping_count: parseInt(row.mapping_count),
          total_usage: parseInt(row.total_usage)
        })),
        top_mappings: topMappingsResult.rows.map(row => ({
          source_type: row.source_type,
          target_type: row.target_type,
          total_usage: parseInt(row.total_usage),
          context_count: parseInt(row.context_count),
          last_used: row.last_used
        }))
      },
      filters: {
        time_range,
        source_type,
        context,
        component
      }
    })

  } finally {
    client.release()
  }
}

// POST /api/icon-mappings/usage - Record usage
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { 
      source_type, 
      target_type, 
      context = 'unknown', 
      component = 'unknown' 
    } = req.body

    // Validation
    if (!source_type || !target_type) {
      return res.status(400).json({ 
        error: 'source_type and target_type are required' 
      })
    }

    // Insert or update usage record
    const upsertQuery = `
      INSERT INTO icon_usage (source_type, target_type, context, component, usage_count, first_used, last_used)
      VALUES ($1, $2, $3, $4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (source_type, target_type, context, component)
      DO UPDATE SET 
        usage_count = icon_usage.usage_count + 1,
        last_used = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await client.query(upsertQuery, [
      source_type,
      target_type,
      context,
      component
    ])

    const usageRecord = result.rows[0]

    return res.status(200).json({
      usage_record: usageRecord,
      message: 'Usage recorded successfully'
    })

  } finally {
    client.release()
  }
}
