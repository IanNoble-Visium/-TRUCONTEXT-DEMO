import { NextApiRequest, NextApiResponse } from 'next'
import { getClient, initializeDatabase, createBackup } from '../../../lib/database'
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
        return await handleExport(req, res)
      case 'POST':
        return await handleImport(req, res)
      case 'PUT':
        return await handleBatchValidation(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Bulk API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// GET /api/icon-mappings/bulk - Export mappings
async function handleExport(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { 
      include_usage = 'false', 
      include_validation = 'false',
      include_chains = 'false',
      format = 'json'
    } = req.query

    if (format !== 'json') {
      return res.status(400).json({ 
        error: 'Only JSON format is currently supported' 
      })
    }

    // Get all mappings
    const mappingsResult = await client.query(`
      SELECT * FROM icon_mappings 
      ORDER BY source_type, priority
    `)

    const exportData: any = {
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
        total_mappings: mappingsResult.rows.length,
        database: 'PostgreSQL'
      },
      mappings: mappingsResult.rows
    }

    // Include usage data if requested
    if (include_usage === 'true') {
      const usageResult = await client.query(`
        SELECT * FROM icon_usage 
        ORDER BY last_used DESC
      `)
      exportData.usage = usageResult.rows
      exportData.metadata.total_usage_records = usageResult.rows.length
    }

    // Include validation data if requested
    if (include_validation === 'true') {
      const validationResult = await client.query(`
        SELECT v.*, m.source_type, m.target_type 
        FROM icon_validation v
        JOIN icon_mappings m ON v.mapping_id = m.id
        ORDER BY v.checked_at DESC
      `)
      exportData.validation = validationResult.rows
      exportData.metadata.total_validation_records = validationResult.rows.length
    }

    // Include mapping chains if requested
    if (include_chains === 'true') {
      const chainsResult = await client.query(`
        SELECT * FROM icon_mapping_chains 
        ORDER BY source_type
      `)
      exportData.chains = chainsResult.rows
      exportData.metadata.total_chain_records = chainsResult.rows.length
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="icon-mappings-export-${new Date().toISOString().split('T')[0]}.json"`)

    return res.status(200).json(exportData)

  } finally {
    client.release()
  }
}

// POST /api/icon-mappings/bulk - Import mappings
async function handleImport(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { 
      mappings, 
      options = {} 
    } = req.body

    if (!mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ 
        error: 'mappings array is required' 
      })
    }

    const {
      validate_icons = true,
      skip_duplicates = true,
      update_existing = false,
      dry_run = false
    } = options

    const results = {
      total_processed: 0,
      successful_imports: 0,
      skipped_duplicates: 0,
      validation_failures: 0,
      errors: [] as any[],
      imported_mappings: [] as any[],
      skipped_mappings: [] as any[],
      failed_mappings: [] as any[]
    }

    // Begin transaction for atomic import
    await client.query('BEGIN')

    try {
      for (const mapping of mappings) {
        results.total_processed++

        // Validate required fields
        if (!mapping.source_type || !mapping.target_type) {
          results.validation_failures++
          results.failed_mappings.push({
            mapping,
            error: 'Missing required fields: source_type and target_type'
          })
          continue
        }

        // Validate icon exists if requested
        if (validate_icons) {
          const iconExists = await checkIconExists(mapping.target_type)
          if (!iconExists) {
            results.validation_failures++
            results.failed_mappings.push({
              mapping,
              error: `Target icon '${mapping.target_type}' does not exist in Cloudinary`
            })
            continue
          }
        }

        // Check for existing mapping
        const existingResult = await client.query(
          'SELECT id FROM icon_mappings WHERE source_type = $1 AND priority = $2',
          [mapping.source_type, mapping.priority || 1]
        )

        if (existingResult.rows.length > 0) {
          if (skip_duplicates && !update_existing) {
            results.skipped_duplicates++
            results.skipped_mappings.push({
              mapping,
              reason: 'Duplicate mapping exists and skip_duplicates is enabled'
            })
            continue
          } else if (update_existing) {
            // Update existing mapping
            if (!dry_run) {
              const updateResult = await client.query(`
                UPDATE icon_mappings 
                SET target_type = $1, description = $2, is_active = $3
                WHERE source_type = $4 AND priority = $5
                RETURNING *
              `, [
                mapping.target_type,
                mapping.description || null,
                mapping.is_active !== undefined ? mapping.is_active : true,
                mapping.source_type,
                mapping.priority || 1
              ])
              results.imported_mappings.push(updateResult.rows[0])
            }
            results.successful_imports++
            continue
          }
        }

        // Insert new mapping
        if (!dry_run) {
          const insertResult = await client.query(`
            INSERT INTO icon_mappings (source_type, target_type, description, priority, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `, [
            mapping.source_type,
            mapping.target_type,
            mapping.description || null,
            mapping.priority || 1,
            mapping.is_active !== undefined ? mapping.is_active : true
          ])
          results.imported_mappings.push(insertResult.rows[0])
        }
        results.successful_imports++
      }

      if (dry_run) {
        await client.query('ROLLBACK')
        results.imported_mappings = [] // Clear since it's a dry run
      } else {
        await client.query('COMMIT')
      }

      return res.status(200).json({
        message: dry_run ? 'Dry run completed successfully' : 'Import completed successfully',
        results,
        summary: {
          total_processed: results.total_processed,
          successful_imports: results.successful_imports,
          skipped_duplicates: results.skipped_duplicates,
          validation_failures: results.validation_failures,
          error_count: results.errors.length,
          success_rate: results.total_processed > 0 
            ? Math.round((results.successful_imports / results.total_processed) * 100) 
            : 0
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } finally {
    client.release()
  }
}

// PUT /api/icon-mappings/bulk - Batch validation
async function handleBatchValidation(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { 
      validate_all = true,
      mapping_ids = []
    } = req.body

    let mappingsToValidate: any[] = []

    if (validate_all) {
      // Validate all mappings
      const allMappingsResult = await client.query('SELECT * FROM icon_mappings ORDER BY id')
      mappingsToValidate = allMappingsResult.rows
    } else if (mapping_ids.length > 0) {
      // Validate specific mappings
      const specificMappingsResult = await client.query(
        'SELECT * FROM icon_mappings WHERE id = ANY($1)',
        [mapping_ids]
      )
      mappingsToValidate = specificMappingsResult.rows
    } else {
      return res.status(400).json({
        error: 'Either validate_all must be true or mapping_ids must be provided'
      })
    }

    const validationResults = {
      total_validated: 0,
      valid_mappings: 0,
      invalid_mappings: 0,
      validation_details: [] as any[],
      summary: {
        icon_existence_failures: 0,
        cycle_detections: 0,
        format_errors: 0,
        other_errors: 0
      }
    }

    // Begin transaction for batch validation updates
    await client.query('BEGIN')

    try {
      for (const mapping of mappingsToValidate) {
        validationResults.total_validated++

        const validationDetail = {
          mapping_id: mapping.id,
          source_type: mapping.source_type,
          target_type: mapping.target_type,
          is_valid: true,
          errors: [] as string[],
          warnings: [] as string[]
        }

        // Check 1: Target icon exists
        try {
          const iconExists = await checkIconExists(mapping.target_type)
          if (!iconExists) {
            validationDetail.is_valid = false
            validationDetail.errors.push(`Target icon '${mapping.target_type}' does not exist in Cloudinary`)
            validationResults.summary.icon_existence_failures++
          }
        } catch (error) {
          validationDetail.is_valid = false
          validationDetail.errors.push(`Failed to check icon existence: ${error}`)
          validationResults.summary.other_errors++
        }

        // Check 2: Format validation
        if (!/^[a-zA-Z0-9_-]+$/.test(mapping.source_type)) {
          validationDetail.is_valid = false
          validationDetail.errors.push('Source type contains invalid characters')
          validationResults.summary.format_errors++
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(mapping.target_type)) {
          validationDetail.is_valid = false
          validationDetail.errors.push('Target type contains invalid characters')
          validationResults.summary.format_errors++
        }

        // Check 3: Self-reference
        if (mapping.source_type === mapping.target_type) {
          validationDetail.warnings.push('Mapping is a self-reference')
        }

        // Check 4: Cycle detection (simplified)
        try {
          const cycleCheck = await checkForCycle(client, mapping.source_type, new Set())
          if (cycleCheck.hasCycle) {
            validationDetail.is_valid = false
            validationDetail.errors.push(`Mapping creates a cycle: ${cycleCheck.cyclePath.join(' -> ')}`)
            validationResults.summary.cycle_detections++
          }
        } catch (error) {
          validationDetail.warnings.push(`Could not check for cycles: ${error}`)
        }

        // Update validation record in database
        await client.query(`
          INSERT INTO icon_validation (mapping_id, is_valid, error_message, checked_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (mapping_id) 
          DO UPDATE SET 
            is_valid = EXCLUDED.is_valid,
            error_message = EXCLUDED.error_message,
            checked_at = EXCLUDED.checked_at
        `, [
          mapping.id,
          validationDetail.is_valid,
          validationDetail.errors.length > 0 ? validationDetail.errors.join('; ') : null
        ])

        if (validationDetail.is_valid) {
          validationResults.valid_mappings++
        } else {
          validationResults.invalid_mappings++
        }

        validationResults.validation_details.push(validationDetail)
      }

      await client.query('COMMIT')

      return res.status(200).json({
        message: 'Batch validation completed',
        results: validationResults,
        summary: {
          total_validated: validationResults.total_validated,
          valid_mappings: validationResults.valid_mappings,
          invalid_mappings: validationResults.invalid_mappings,
          validation_rate: validationResults.total_validated > 0 
            ? Math.round((validationResults.valid_mappings / validationResults.total_validated) * 100)
            : 0,
          ...validationResults.summary
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } finally {
    client.release()
  }
}

// Helper function to check for cycles
async function checkForCycle(client: any, sourceType: string, visited: Set<string>): Promise<{
  hasCycle: boolean,
  cyclePath: string[]
}> {
  if (visited.has(sourceType)) {
    return {
      hasCycle: true,
      cyclePath: Array.from(visited)
    }
  }

  visited.add(sourceType)

  const result = await client.query(`
    SELECT target_type FROM icon_mappings 
    WHERE source_type = $1 AND is_active = true 
    ORDER BY priority ASC 
    LIMIT 1
  `, [sourceType])

  if (result.rows.length === 0) {
    return {
      hasCycle: false,
      cyclePath: []
    }
  }

  const targetType = result.rows[0].target_type
  return await checkForCycle(client, targetType, new Set(visited))
}
