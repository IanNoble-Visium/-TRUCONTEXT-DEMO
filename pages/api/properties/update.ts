import { NextApiRequest, NextApiResponse } from 'next'
import { updateNodeProperties, updateEdgeProperties, getDatasetIdByName, initializeDatabase } from '../../../lib/postgres'
import { updateNodePropertiesInNeo4j, updateEdgePropertiesInNeo4j } from '../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Properties update API called:', req.method, req.url)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Initializing database...')
    // Initialize database schema on first request
    await initializeDatabase()
    console.log('Database initialized successfully')

    const { 
      elementType, 
      elementId, 
      properties, 
      datasetName,
      fromUid,
      toUid 
    } = req.body

    // Validate required fields
    if (!elementType || !elementId || !properties || !datasetName) {
      return res.status(400).json({ 
        error: 'Missing required fields: elementType, elementId, properties, and datasetName are required' 
      })
    }

    if (!['node', 'edge'].includes(elementType)) {
      return res.status(400).json({ 
        error: 'Invalid elementType: must be "node" or "edge"' 
      })
    }

    // Get dataset ID
    const datasetId = await getDatasetIdByName(datasetName)
    if (!datasetId) {
      return res.status(404).json({ 
        error: `Dataset "${datasetName}" not found` 
      })
    }

    // Update properties in both PostgreSQL and Neo4j
    let postgresSuccess = false
    let neo4jSuccess = false
    let errors: string[] = []

    if (elementType === 'node') {
      // Update PostgreSQL
      try {
        await updateNodeProperties(datasetId, elementId, properties)
        postgresSuccess = true
        console.log(`✅ PostgreSQL: Updated node ${elementId} properties`)
      } catch (error) {
        const errorMsg = `PostgreSQL node update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }

      // Update Neo4j
      try {
        neo4jSuccess = await updateNodePropertiesInNeo4j(elementId, properties)
        if (neo4jSuccess) {
          console.log(`✅ Neo4j: Updated node ${elementId} properties`)
        } else {
          const errorMsg = `Neo4j node update failed: Node ${elementId} not found`
          console.warn('⚠️', errorMsg)
          errors.push(errorMsg)
        }
      } catch (error) {
        const errorMsg = `Neo4j node update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }

    } else if (elementType === 'edge') {
      // For edges, we need fromUid and toUid
      if (!fromUid || !toUid) {
        return res.status(400).json({
          error: 'For edge updates, fromUid and toUid are required'
        })
      }

      // Update PostgreSQL
      try {
        await updateEdgeProperties(datasetId, fromUid, toUid, properties)
        postgresSuccess = true
        console.log(`✅ PostgreSQL: Updated edge ${fromUid}->${toUid} properties`)
      } catch (error) {
        const errorMsg = `PostgreSQL edge update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }

      // Update Neo4j
      try {
        neo4jSuccess = await updateEdgePropertiesInNeo4j(fromUid, toUid, properties)
        if (neo4jSuccess) {
          console.log(`✅ Neo4j: Updated edge ${fromUid}->${toUid} properties`)
        } else {
          const errorMsg = `Neo4j edge update failed: Edge ${fromUid}->${toUid} not found`
          console.warn('⚠️', errorMsg)
          errors.push(errorMsg)
        }
      } catch (error) {
        const errorMsg = `Neo4j edge update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error('❌', errorMsg)
        errors.push(errorMsg)
      }
    }

    // Determine response based on success status
    const overallSuccess = postgresSuccess || neo4jSuccess
    const statusCode = overallSuccess ? 200 : 500

    res.status(statusCode).json({
      success: overallSuccess,
      message: overallSuccess
        ? `${elementType} properties updated successfully`
        : `Failed to update ${elementType} properties`,
      elementType,
      elementId,
      datasetName,
      updatedProperties: Object.keys(properties),
      syncStatus: {
        postgresql: postgresSuccess,
        neo4j: neo4jSuccess,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('Property update API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
