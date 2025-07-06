import { NextApiRequest, NextApiResponse } from 'next'
import { calculateShortestPath } from '../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { startNodeUid, endNodeUid } = req.body

    if (!startNodeUid || !endNodeUid) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'Both startNodeUid and endNodeUid are required'
      })
    }

    if (startNodeUid === endNodeUid) {
      return res.status(400).json({
        error: 'Invalid path',
        details: 'Start and end nodes cannot be the same'
      })
    }

    const pathResult = await calculateShortestPath(startNodeUid, endNodeUid)

    res.status(200).json({
      success: true,
      data: pathResult
    })
  } catch (error) {
    console.error('Threat path calculation error:', error)
    res.status(500).json({ 
      error: 'Failed to calculate threat path',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
