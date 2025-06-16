import { NextApiRequest, NextApiResponse } from 'next'
import { listDatasets, saveDataset, initializeDatabase } from '../../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize database schema on first request
    await initializeDatabase()

    if (req.method === 'GET') {
      // List all datasets
      const datasets = await listDatasets()
      res.status(200).json(datasets)
    } else if (req.method === 'POST') {
      // Save a new dataset
      const { name, description, nodes, edges } = req.body

      // Validate required fields
      if (!name || !nodes || !edges) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, nodes, and edges are required' 
        })
      }

      if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return res.status(400).json({ 
          error: 'Invalid data format: nodes and edges must be arrays' 
        })
      }

      // Validate node structure
      for (const node of nodes) {
        if (!node.uid || !node.type || !node.showname) {
          return res.status(400).json({ 
            error: 'Invalid node format: uid, type, and showname are required' 
          })
        }
      }

      // Validate edge structure
      for (const edge of edges) {
        if (!edge.from || !edge.to || !edge.type) {
          return res.status(400).json({ 
            error: 'Invalid edge format: from, to, and type are required' 
          })
        }
      }

      // Validate that all edge references exist as nodes
      const nodeIds = new Set(nodes.map(n => n.uid))
      for (const edge of edges) {
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

      try {
        const dataset = await saveDataset(name, description, nodes, edges)
        res.status(201).json({
          message: 'Dataset saved successfully',
          dataset,
          nodes: nodes.length,
          edges: edges.length
        })
      } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate key')) {
          return res.status(409).json({ 
            error: 'Dataset name already exists. Please choose a different name.' 
          })
        }
        throw error
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Datasets API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
