import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/neo4j'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const session = await getSession()
    
    try {
      // Get all node labels
      const labelsResult = await session.run(`
        MATCH (n) 
        RETURN DISTINCT labels(n) as labels
      `)
      
      const nodeLabels = new Set<string>()
      labelsResult.records.forEach(record => {
        const labels = record.get('labels') as string[]
        labels.forEach(label => nodeLabels.add(label))
      })

      // Get all relationship types
      const relsResult = await session.run(`
        MATCH ()-[r]->() 
        RETURN DISTINCT type(r) as rel_type
      `)
      
      const relationshipTypes = relsResult.records.map(record => 
        record.get('rel_type') as string
      )

      // Get sample properties for each node label
      const nodeProperties: Record<string, string[]> = {}
      
      for (const label of Array.from(nodeLabels)) {
        const propsResult = await session.run(`
          MATCH (n:${label}) 
          WITH n LIMIT 5
          UNWIND keys(n) as key
          RETURN DISTINCT key
          ORDER BY key
        `)
        
        nodeProperties[label] = propsResult.records.map(record => 
          record.get('key') as string
        )
      }

      // Get sample data for validation
      const sampleData: Record<string, any> = {}
      
      for (const label of Array.from(nodeLabels).slice(0, 5)) {
        const sampleResult = await session.run(`
          MATCH (n:${label}) 
          RETURN n LIMIT 3
        `)
        
        sampleData[label] = sampleResult.records.map(record => {
          const node = record.get('n')
          return {
            labels: node.labels,
            properties: node.properties
          }
        })
      }

      // Get relationship patterns
      const relationshipPatterns: Array<{source: string, relationship: string, target: string, count: number}> = []
      
      for (const relType of relationshipTypes.slice(0, 10)) {
        const patternResult = await session.run(`
          MATCH (a)-[r:${relType}]->(b)
          RETURN DISTINCT labels(a)[0] as source_label, 
                 type(r) as rel_type, 
                 labels(b)[0] as target_label,
                 count(*) as count
          ORDER BY count DESC
          LIMIT 5
        `)
        
        patternResult.records.forEach(record => {
          relationshipPatterns.push({
            source: record.get('source_label') as string,
            relationship: record.get('rel_type') as string,
            target: record.get('target_label') as string,
            count: record.get('count').low || record.get('count')
          })
        })
      }

      const schema = {
        nodeLabels: Array.from(nodeLabels),
        relationshipTypes,
        nodeProperties,
        sampleData,
        relationshipPatterns,
        summary: {
          totalNodeLabels: nodeLabels.size,
          totalRelationshipTypes: relationshipTypes.length,
          totalPatterns: relationshipPatterns.length
        }
      }

      res.status(200).json(schema)
      
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Schema discovery error:', error)
    res.status(500).json({ 
      error: 'Failed to discover schema', 
      details: (error as Error).message 
    })
  }
}
