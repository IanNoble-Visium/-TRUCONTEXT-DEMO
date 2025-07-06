import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getSession()
    let clearedElements = 0

    try {
      // Clear threat paths from all nodes
      const nodeResult = await session.run(`
        MATCH (n)
        WHERE n.TC_THREAT_PATH IS NOT NULL
        REMOVE n.TC_THREAT_PATH
        RETURN count(n) as clearedNodes
      `)

      const clearedNodes = nodeResult.records[0]?.get('clearedNodes')?.toNumber() || 0
      clearedElements += clearedNodes

      // Clear threat paths from all edges
      const edgeResult = await session.run(`
        MATCH ()-[r]->()
        WHERE r.TC_THREAT_PATH IS NOT NULL
        REMOVE r.TC_THREAT_PATH
        RETURN count(r) as clearedEdges
      `)

      const clearedEdges = edgeResult.records[0]?.get('clearedEdges')?.toNumber() || 0
      clearedElements += clearedEdges

      res.status(200).json({
        success: true,
        message: `Cleared threat paths from ${clearedElements} elements`,
        data: {
          totalElementsCleared: clearedElements,
          nodesCleared: clearedNodes,
          edgesCleared: clearedEdges
        }
      })
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Clear threat paths error:', error)
    res.status(500).json({ 
      error: 'Failed to clear threat paths',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
