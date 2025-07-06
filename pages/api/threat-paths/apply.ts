import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/neo4j'
import { addThreatPath } from '../../../utils/threatPathUtils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      threatPathName, 
      pathNodes, 
      pathEdges, 
      alarmLevel, 
      animation 
    } = req.body

    if (!threatPathName || !pathNodes || !pathEdges) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'threatPathName, pathNodes, and pathEdges are required'
      })
    }

    const session = await getSession()
    let updatedElements = 0

    try {
      // Update nodes with threat path information
      for (const nodeUid of pathNodes) {
        const result = await session.run(`
          MATCH (n {uid: $uid})
          SET n.TC_THREAT_PATH = CASE 
            WHEN n.TC_THREAT_PATH IS NULL THEN $threatPath
            ELSE n.TC_THREAT_PATH + ',' + $threatPath
          END
          SET n.TC_ALARM = $alarmLevel
          SET n.TC_ANIMATION = $animation
          RETURN n
        `, {
          uid: nodeUid,
          threatPath: threatPathName,
          alarmLevel: alarmLevel || 'Warning',
          animation: animation || 'pulse'
        })

        if (result.records.length > 0) {
          updatedElements++
        }
      }

      // Update edges with threat path information
      for (const edge of pathEdges) {
        const result = await session.run(`
          MATCH (from {uid: $fromUid})-[r]->(to {uid: $toUid})
          SET r.TC_THREAT_PATH = CASE 
            WHEN r.TC_THREAT_PATH IS NULL THEN $threatPath
            ELSE r.TC_THREAT_PATH + ',' + $threatPath
          END
          SET r.TC_ALARM = $alarmLevel
          SET r.TC_ANIMATION = $animation
          RETURN r
        `, {
          fromUid: edge.from,
          toUid: edge.to,
          threatPath: threatPathName,
          alarmLevel: alarmLevel || 'Warning',
          animation: animation || 'pulse'
        })

        if (result.records.length > 0) {
          updatedElements++
        }
      }

      res.status(200).json({
        success: true,
        message: `Applied threat path "${threatPathName}" to ${updatedElements} elements`,
        data: {
          threatPathName,
          elementsUpdated: updatedElements,
          nodesUpdated: pathNodes.length,
          edgesUpdated: pathEdges.length
        }
      })
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Apply threat path error:', error)
    res.status(500).json({ 
      error: 'Failed to apply threat path',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
