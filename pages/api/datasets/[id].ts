import { NextApiRequest, NextApiResponse } from 'next'
import { loadDataset, deleteDataset, initializeDatabase } from '../../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize database schema on first request
    await initializeDatabase()

    const { id } = req.query
    const datasetId = parseInt(id as string, 10)

    if (isNaN(datasetId)) {
      return res.status(400).json({ error: 'Invalid dataset ID' })
    }

    if (req.method === 'GET') {
      // Load a specific dataset
      try {
        const result = await loadDataset(datasetId)
        res.status(200).json(result)
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return res.status(404).json({ error: 'Dataset not found' })
        }
        throw error
      }
    } else if (req.method === 'DELETE') {
      // Delete a specific dataset
      try {
        await deleteDataset(datasetId)
        res.status(200).json({ message: 'Dataset deleted successfully' })
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return res.status(404).json({ error: 'Dataset not found' })
        }
        throw error
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Dataset API error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
