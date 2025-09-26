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

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).json({ error: 'Method not allowed' })
    }

    return await handleTest(req, res)
  } catch (error) {
    console.error('Test API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST /api/icon-mappings/test - Test icon mapping resolution
async function handleTest(req: NextApiRequest, res: NextApiResponse) {
  const client = await getClient()
  
  try {
    const { source_type, test_type = 'resolution' } = req.body

    if (!source_type) {
      return res.status(400).json({ 
        error: 'source_type is required' 
      })
    }

    if (test_type === 'resolution') {
      // Test complete resolution chain
      const resolutionResult = await testResolutionChain(client, source_type)
      return res.status(200).json({
        test_type: 'resolution',
        source_type,
        result: resolutionResult
      })
    } else if (test_type === 'validation') {
      // Test mapping validation
      const { target_type } = req.body
      if (!target_type) {
        return res.status(400).json({ 
          error: 'target_type is required for validation test' 
        })
      }

      const validationResult = await testMappingValidation(source_type, target_type)
      return res.status(200).json({
        test_type: 'validation',
        source_type,
        target_type,
        result: validationResult
      })
    } else {
      return res.status(400).json({
        error: 'Invalid test_type. Must be "resolution" or "validation"'
      })
    }

  } finally {
    client.release()
  }
}

// Test complete resolution chain
async function testResolutionChain(client: any, sourceType: string) {
  const startTime = Date.now()
  const visited = new Set<string>()
  const resolutionPath: Array<{
    step: number,
    source_type: string,
    target_type: string | null,
    mapping_found: boolean,
    icon_exists: boolean,
    is_cycle: boolean
  }> = []

  let currentType = sourceType
  let step = 0
  let hasCycle = false
  let finalIconExists = false

  try {
    while (step < 10) { // Max 10 steps to prevent infinite loops
      step++
      
      // Check for cycle
      if (visited.has(currentType)) {
        hasCycle = true
        resolutionPath.push({
          step,
          source_type: currentType,
          target_type: null,
          mapping_found: false,
          icon_exists: false,
          is_cycle: true
        })
        break
      }

      visited.add(currentType)

      // Look for mapping
      const mappingResult = await client.query(`
        SELECT target_type FROM icon_mappings 
        WHERE source_type = $1 AND is_active = true 
        ORDER BY priority ASC 
        LIMIT 1
      `, [currentType])

      if (mappingResult.rows.length === 0) {
        // No mapping found, check if icon exists directly
        const iconExists = await checkIconExists(currentType)
        resolutionPath.push({
          step,
          source_type: currentType,
          target_type: null,
          mapping_found: false,
          icon_exists: iconExists,
          is_cycle: false
        })
        finalIconExists = iconExists
        break
      }

      const targetType = mappingResult.rows[0].target_type
      const iconExists = await checkIconExists(targetType)

      resolutionPath.push({
        step,
        source_type: currentType,
        target_type: targetType,
        mapping_found: true,
        icon_exists: iconExists,
        is_cycle: false
      })

      if (iconExists) {
        finalIconExists = true
        break
      }

      currentType = targetType
    }

    const endTime = Date.now()
    const finalType = resolutionPath[resolutionPath.length - 1]?.target_type || sourceType

    return {
      success: true,
      resolution_time_ms: endTime - startTime,
      final_type: finalType,
      final_icon_exists: finalIconExists,
      has_cycle: hasCycle,
      steps_taken: step,
      resolution_path: resolutionPath,
      summary: {
        source_type: sourceType,
        resolved_to: finalType,
        mappings_traversed: resolutionPath.filter(p => p.mapping_found).length,
        total_steps: step,
        is_resolvable: finalIconExists && !hasCycle
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      resolution_time_ms: Date.now() - startTime,
      resolution_path: resolutionPath
    }
  }
}

// Test mapping validation
async function testMappingValidation(sourceType: string, targetType: string) {
  const startTime = Date.now()
  const validationResults: Array<{
    check: string,
    passed: boolean,
    details?: string
  }> = []

  try {
    // Check 1: Source type format
    const sourceValid = /^[a-zA-Z0-9_-]+$/.test(sourceType)
    validationResults.push({
      check: 'source_type_format',
      passed: sourceValid,
      details: sourceValid ? 'Valid format' : 'Contains invalid characters'
    })

    // Check 2: Target type format
    const targetValid = /^[a-zA-Z0-9_-]+$/.test(targetType)
    validationResults.push({
      check: 'target_type_format',
      passed: targetValid,
      details: targetValid ? 'Valid format' : 'Contains invalid characters'
    })

    // Check 3: Target icon exists in Cloudinary
    const iconExists = await checkIconExists(targetType)
    validationResults.push({
      check: 'target_icon_exists',
      passed: iconExists,
      details: iconExists ? 'Icon found in Cloudinary' : 'Icon not found in Cloudinary'
    })

    // Check 4: Not a self-reference
    const notSelfRef = sourceType !== targetType
    validationResults.push({
      check: 'not_self_reference',
      passed: notSelfRef,
      details: notSelfRef ? 'Not a self-reference' : 'Source and target are the same'
    })

    // Check 5: Source type length
    const sourceLengthOk = sourceType.length <= 255
    validationResults.push({
      check: 'source_type_length',
      passed: sourceLengthOk,
      details: sourceLengthOk ? 'Within length limit' : 'Exceeds 255 characters'
    })

    // Check 6: Target type length
    const targetLengthOk = targetType.length <= 255
    validationResults.push({
      check: 'target_type_length',
      passed: targetLengthOk,
      details: targetLengthOk ? 'Within length limit' : 'Exceeds 255 characters'
    })

    const allPassed = validationResults.every(r => r.passed)
    const endTime = Date.now()

    return {
      success: true,
      validation_time_ms: endTime - startTime,
      is_valid: allPassed,
      checks_passed: validationResults.filter(r => r.passed).length,
      total_checks: validationResults.length,
      validation_results: validationResults,
      recommendation: allPassed 
        ? 'Mapping is valid and can be created'
        : 'Fix validation issues before creating mapping'
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      validation_time_ms: Date.now() - startTime,
      validation_results: validationResults
    }
  }
}
