import { NextApiRequest, NextApiResponse } from 'next'
import { clearDatabase, importDataset, addMissingProperties, DatasetStructure } from '../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data: DatasetStructure = req.body

    // Validate the data structure
    if (!data.nodes || !Array.isArray(data.nodes)) {
      return res.status(400).json({ error: 'Invalid data format: nodes array is required' })
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      return res.status(400).json({ error: 'Invalid data format: edges array is required' })
    }

    // Validate node structure
    for (const node of data.nodes) {
      if (!node.uid || !node.type || !node.showname) {
        return res.status(400).json({ 
          error: 'Invalid node format: uid, type, and showname are required' 
        })
      }
    }

    // Validate edge structure
    for (const edge of data.edges) {
      if (!edge.from || !edge.to || !edge.type) {
        return res.status(400).json({ 
          error: 'Invalid edge format: from, to, and type are required' 
        })
      }
    }

    // Validate that all edge references exist as nodes
    const nodeIds = new Set(data.nodes.map(n => n.uid))
    for (const edge of data.edges) {
      if (!nodeIds.has(edge.from)) {
        return res.status(400).json({ 
          error: `Edge references non-existent node: ${edge.from}` 
        })
      }
      if (!nodeIds.has(edge.to)) {
        return res.status(400).json({ 
          error: `Edge references non-existent node: ${edge.to}` 
        })
      }
    }

    // Add missing properties (timestamps, geolocation)
    const processedData = addMissingProperties(data)

    // Clear existing data and import new data
    await clearDatabase()
    await importDataset(processedData)

    res.status(200).json({ 
      message: 'Dataset uploaded successfully',
      nodes: processedData.nodes.length,
      edges: processedData.edges.length
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to upload dataset',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 