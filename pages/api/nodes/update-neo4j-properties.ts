import type { NextApiRequest, NextApiResponse } from 'next'
import { updateNodePropertiesInNeo4j } from '../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { uid, properties } = req.body

    if (!uid || !properties || typeof properties !== 'object') {
      return res.status(400).json({ error: 'Missing required fields: uid and properties' })
    }

    const success = await updateNodePropertiesInNeo4j(uid, properties)

    if (success) {
      res.status(200).json({ success: true })
    } else {
      res.status(404).json({ error: 'Node not found in Neo4j' })
    }
  } catch (error) {
    console.error('Update Neo4j node properties error:', error)
    res.status(500).json({ error: 'Failed to update node properties in Neo4j' })
  }
}