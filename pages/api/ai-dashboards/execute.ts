import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/neo4j'
import { validateAndFixCypher } from '../../../lib/cypher-validator'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { cypher, params } = req.body as { cypher?: string; params?: Record<string, any> }
    if (!cypher || !cypher.trim()) return res.status(400).json({ error: 'Missing cypher' })

    // Validate and fix the Cypher query
    const validation = validateAndFixCypher(cypher)

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid Cypher query',
        details: validation.errors.join('; '),
        originalQuery: cypher
      })
    }

    const queryToExecute = validation.fixedQuery || cypher
    console.log('Original cypher:', cypher)
    if (validation.fixedQuery !== cypher) {
      console.log('Fixed cypher:', queryToExecute)
      console.log('Warnings:', validation.warnings)
    }

    const session = await getSession()
    try {
      const result = await session.run(queryToExecute, params || {})
      const records = result.records.map(r => {
        const obj: Record<string, any> = {}
        for (let i = 0; i < r.keys.length; i++) {
          const k = String(r.keys[i])
          const v = r.get(i)
          obj[k] = serializeNeo4jValue(v)
        }
        return obj
      })
      // Include validation info in response if query was fixed
      const response: any = { columns: (result.records[0]?.keys as string[]) || [], rows: records }
      if (validation.warnings.length > 0) {
        response._meta = {
          queryFixed: validation.fixedQuery !== cypher,
          warnings: validation.warnings,
          originalQuery: cypher,
          executedQuery: queryToExecute
        }
      }

      res.status(200).json(response)
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Cypher execute error:', error)
    res.status(500).json({ error: 'Failed to execute query', details: (error as Error).message })
  }
}

function serializeNeo4jValue(v: any): any {
  if (!v) return v
  if (Array.isArray(v)) return v.map(serializeNeo4jValue)
  if (typeof v === 'object') {
    // Neo4j node/relationship/path handling
    if (v.properties && v.labels) {
      // Node
      return { labels: v.labels, properties: v.properties, id: v.properties?.uid || undefined }
    }
    if (v.properties && v.type) {
      // Relationship
      return { type: v.type, properties: v.properties }
    }
    if (v.start && v.end && v.segments) {
      // Path -> flatten
      return {
        start: serializeNeo4jValue(v.start),
        end: serializeNeo4jValue(v.end),
        length: v.length
      }
    }
  }
  return v
}

