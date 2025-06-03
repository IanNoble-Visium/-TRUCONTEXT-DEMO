import { NextApiRequest, NextApiResponse } from 'next'
import { getAllGraphData } from '../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const graphData = await getAllGraphData()
    res.status(200).json(graphData)
  } catch (error) {
    console.error('Graph data error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch graph data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 