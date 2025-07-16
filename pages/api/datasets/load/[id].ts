import { NextApiRequest, NextApiResponse } from 'next'
import { loadDataset, initializeDatabase } from '../../../../lib/postgres'
import { clearDatabase, importDataset, addMissingProperties } from '../../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Initialize database schema on first request
    await initializeDatabase()

    const { id } = req.query
    const datasetId = parseInt(id as string, 10)

    if (isNaN(datasetId)) {
      return res.status(400).json({ error: 'Invalid dataset ID' })
    }

    // Load dataset from PostgreSQL
    const { dataset, nodes, edges } = await loadDataset(datasetId)

    // Transform to the format expected by Neo4j import
    const datasetStructure = {
      nodes,
      edges,
      storedQueries: [] // Empty for now, could be extended later
    }

    // Add missing properties (timestamps, geolocation) if needed
    const processedData = addMissingProperties(datasetStructure)

    // Clear existing Neo4j data and import new data
    await clearDatabase()
    await importDataset(processedData)

    res.status(200).json({
      message: 'Dataset loaded successfully into visualization',
      dataset: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description
      },
      nodes: processedData.nodes.length,
      edges: processedData.edges.length,
      currentDatasetName: dataset.name // Include dataset name for client-side storage
    })
  } catch (error) {
    console.error('Load dataset error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Dataset not found' })
    }
    
    res.status(500).json({ 
      error: 'Failed to load dataset',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
