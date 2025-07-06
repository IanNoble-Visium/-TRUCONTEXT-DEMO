import { NextApiRequest, NextApiResponse } from 'next'
import { getAvailableNodes } from '../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const nodes = await getAvailableNodes()

    res.status(200).json({
      success: true,
      data: nodes
    })
  } catch (error) {
    console.error('Get available nodes error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch available nodes',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
