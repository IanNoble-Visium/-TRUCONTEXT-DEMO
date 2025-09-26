import { NextApiRequest, NextApiResponse } from 'next'
import { getClient, initializeDatabase } from '../../../lib/database'
import { checkIconExists } from '../../../utils/cloudinary-icons'

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
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// GET /api/icon-mappings - List all mappings with optional filtering
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { 
      source_type, 
      is_active, 
      limit = '100', 
      offset = '0',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query

    let query = 'SELECT * FROM icon_mappings WHERE 1=1'
    const params: any[] = []
    let paramCount = 0

    // Add filters
    if (source_type) {
      paramCount++
      query += ` AND source_type ILIKE $${paramCount}`
      params.push(`%${source_type}%`)
    }

    if (is_active !== undefined) {
      paramCount++
      query += ` AND is_active = $${paramCount}`
      params.push(is_active === 'true')
    }

    // Add sorting
    const validSortColumns = ['id', 'source_type', 'target_type', 'priority', 'created_at', 'updated_at']
    const sortColumn = validSortColumns.includes(sort_by as string) ? sort_by : 'created_at'
    const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC'
    query += ` ORDER BY ${sortColumn} ${sortDirection}`

    // Add pagination
    paramCount++
    query += ` LIMIT $${paramCount}`
    params.push(parseInt(limit as string))

    paramCount++
    query += ` OFFSET $${paramCount}`
    params.push(parseInt(offset as string))

    const result = await client.query(query, params)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM icon_mappings WHERE 1=1'
    const countParams: any[] = []
    let countParamCount = 0

    if (source_type) {
      countParamCount++
      countQuery += ` AND source_type ILIKE $${countParamCount}`
      countParams.push(`%${source_type}%`)
    }

    if (is_active !== undefined) {
      countParamCount++
      countQuery += ` AND is_active = $${countParamCount}`
      countParams.push(is_active === 'true')
    }

    const countResult = await client.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

    return res.status(200).json({
      mappings: result.rows,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        has_more: total > parseInt(offset as string) + parseInt(limit as string)
      }
    })

  } finally {
    client.release()
  }
}

// POST /api/icon-mappings - Create new mapping
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { source_type, target_type, description, priority = 1, is_active = true } = req.body

    // Validation
    if (!source_type || !target_type) {
      return res.status(400).json({ 
        error: 'source_type and target_type are required' 
      })
    }

    // Check if target icon exists in Cloudinary
    const iconExists = await checkIconExists(target_type)
    if (!iconExists) {
      return res.status(400).json({
        error: 'Target icon does not exist in Cloudinary',
        target_type,
        suggestion: 'Please verify the icon name or upload the icon to Cloudinary'
      })
    }

    // Check for existing mapping with same source_type and priority
    const existingResult = await client.query(
      'SELECT id FROM icon_mappings WHERE source_type = $1 AND priority = $2',
      [source_type, priority]
    )

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Mapping with same source_type and priority already exists',
        existing_id: existingResult.rows[0].id
      })
    }

    // Insert new mapping
    const insertResult = await client.query(`
      INSERT INTO icon_mappings (source_type, target_type, description, priority, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [source_type, target_type, description, priority, is_active])

    const newMapping = insertResult.rows[0]

    // Update mapping chains
    await updateMappingChains(client, source_type)

    return res.status(201).json({
      mapping: newMapping,
      message: 'Icon mapping created successfully'
    })

  } finally {
    client.release()
  }
}

// PUT /api/icon-mappings - Update existing mapping
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { id, source_type, target_type, description, priority, is_active } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Mapping ID is required' })
    }

    // Check if mapping exists
    const existingResult = await client.query(
      'SELECT * FROM icon_mappings WHERE id = $1',
      [id]
    )

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mapping not found' })
    }

    const existingMapping = existingResult.rows[0]

    // Validate target icon if it's being changed
    if (target_type && target_type !== existingMapping.target_type) {
      const iconExists = await checkIconExists(target_type)
      if (!iconExists) {
        return res.status(400).json({
          error: 'Target icon does not exist in Cloudinary',
          target_type
        })
      }
    }

    // Build update query dynamically
    const updates: string[] = []
    const params: any[] = []
    let paramCount = 0

    if (source_type !== undefined) {
      paramCount++
      updates.push(`source_type = $${paramCount}`)
      params.push(source_type)
    }

    if (target_type !== undefined) {
      paramCount++
      updates.push(`target_type = $${paramCount}`)
      params.push(target_type)
    }

    if (description !== undefined) {
      paramCount++
      updates.push(`description = $${paramCount}`)
      params.push(description)
    }

    if (priority !== undefined) {
      paramCount++
      updates.push(`priority = $${paramCount}`)
      params.push(priority)
    }

    if (is_active !== undefined) {
      paramCount++
      updates.push(`is_active = $${paramCount}`)
      params.push(is_active)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    paramCount++
    params.push(id)

    const updateQuery = `
      UPDATE icon_mappings 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const updateResult = await client.query(updateQuery, params)
    const updatedMapping = updateResult.rows[0]

    // Update mapping chains if source_type changed
    if (source_type && source_type !== existingMapping.source_type) {
      await updateMappingChains(client, source_type)
      await updateMappingChains(client, existingMapping.source_type)
    }

    return res.status(200).json({
      mapping: updatedMapping,
      message: 'Icon mapping updated successfully'
    })

  } finally {
    client.release()
  }
}

// DELETE /api/icon-mappings - Delete mapping
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Mapping ID is required' })
    }

    // Get mapping before deletion for chain updates
    const existingResult = await client.query(
      'SELECT source_type FROM icon_mappings WHERE id = $1',
      [id]
    )

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mapping not found' })
    }

    const sourceType = existingResult.rows[0].source_type

    // Delete the mapping
    await client.query('DELETE FROM icon_mappings WHERE id = $1', [id])

    // Update mapping chains
    await updateMappingChains(client, sourceType)

    return res.status(200).json({
      message: 'Icon mapping deleted successfully'
    })

  } finally {
    client.release()
  }
}

// Helper function to update mapping chains and detect cycles
async function updateMappingChains(client: any, sourceType: string) {
  try {
    const chain = await resolveMappingChain(client, sourceType)
    
    await client.query(`
      INSERT INTO icon_mapping_chains (source_type, resolved_type, chain_path, has_cycle, chain_length)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (source_type) 
      DO UPDATE SET 
        resolved_type = EXCLUDED.resolved_type,
        chain_path = EXCLUDED.chain_path,
        has_cycle = EXCLUDED.has_cycle,
        chain_length = EXCLUDED.chain_length,
        created_at = CURRENT_TIMESTAMP
    `, [
      sourceType,
      chain.resolved_type,
      JSON.stringify(chain.path),
      chain.has_cycle,
      chain.path.length
    ])

  } catch (error) {
    console.error('Failed to update mapping chain for', sourceType, error)
  }
}

// Helper function to resolve mapping chain
async function resolveMappingChain(client: any, sourceType: string, visited = new Set<string>()): Promise<{
  resolved_type: string,
  path: string[],
  has_cycle: boolean
}> {
  const path = [sourceType]
  
  if (visited.has(sourceType)) {
    return {
      resolved_type: sourceType,
      path,
      has_cycle: true
    }
  }

  visited.add(sourceType)
  
  // Get active mapping for this source type
  const result = await client.query(`
    SELECT target_type FROM icon_mappings 
    WHERE source_type = $1 AND is_active = true 
    ORDER BY priority ASC 
    LIMIT 1
  `, [sourceType])

  if (result.rows.length === 0) {
    return {
      resolved_type: sourceType,
      path,
      has_cycle: false
    }
  }

  const targetType = result.rows[0].target_type
  
  if (targetType === sourceType) {
    return {
      resolved_type: sourceType,
      path,
      has_cycle: true
    }
  }

  // Recursively resolve the chain
  const nextChain = await resolveMappingChain(client, targetType, visited)
  
  return {
    resolved_type: nextChain.resolved_type,
    path: [...path, ...nextChain.path.slice(1)],
    has_cycle: nextChain.has_cycle
  }
}
