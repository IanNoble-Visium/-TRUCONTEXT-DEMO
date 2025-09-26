import type { NextApiRequest, NextApiResponse } from 'next'
import { generateJSON } from '../../../lib/openai'
import { getSession } from '../../../lib/neo4j'

// Shape returned to client
// { cards: [{ title, viz_type: 'table'|'bar'|'pie'|'graph', cypher, options? }], name?, prompt }

async function getDetailedSchema() {
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

    // Get properties for each node label
    const nodeProperties: Record<string, string[]> = {}

    for (const label of Array.from(nodeLabels)) {
      const propsResult = await session.run(`
        MATCH (n:\`${label}\`)
        WITH n LIMIT 10
        UNWIND keys(n) as key
        RETURN DISTINCT key
        ORDER BY key
      `)

      nodeProperties[label] = propsResult.records.map(record =>
        record.get('key') as string
      )
    }

    // Get relationship patterns with counts
    const relationshipPatterns: Array<{source: string, relationship: string, target: string, count: number}> = []

    for (const relType of relationshipTypes) {
      const patternResult = await session.run(`
        MATCH (a)-[r:\`${relType}\`]->(b)
        RETURN DISTINCT labels(a)[0] as source_label,
               type(r) as rel_type,
               labels(b)[0] as target_label,
               count(*) as count
        ORDER BY count DESC
        LIMIT 3
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

    return {
      nodeLabels: Array.from(nodeLabels),
      relationshipTypes,
      nodeProperties,
      relationshipPatterns,
      // Common patterns for AI to use
      commonQueries: [
        {
          pattern: "Count by category",
          example: `MATCH (n:${Array.from(nodeLabels)[0] || 'Node'}) WITH n.showname as category, COUNT(n) as count RETURN category, count ORDER BY count DESC LIMIT 10`
        },
        {
          pattern: "Relationship distribution",
          example: relationshipPatterns.length > 0 ?
            `MATCH (a:${relationshipPatterns[0].source})-[r:${relationshipPatterns[0].relationship}]->(b:${relationshipPatterns[0].target}) WITH type(r) as rel_type, COUNT(*) as count RETURN rel_type, count` :
            "MATCH ()-[r]->() WITH type(r) as rel_type, COUNT(*) as count RETURN rel_type, count"
        }
      ]
    }
  } finally {
    await session.close()
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { prompt } = req.body as { prompt?: string }
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Missing prompt' })

    const schema = await getDetailedSchema()
    const schemaDescription = JSON.stringify({
      expected_output: {
        name: 'string (optional) name for the dashboard',
        prompt: 'string original user prompt',
        cards: [
          {
            title: 'string',
            viz_type: "one of: 'table' | 'bar' | 'pie' | 'graph'",
            cypher: 'string Neo4j Cypher query; use ONLY the exact labels, relationships, and properties from the schema',
            options: 'object with chart settings (optional)'
          }
        ]
      },
      schema: {
        available_node_labels: schema.nodeLabels,
        available_relationship_types: schema.relationshipTypes,
        node_properties: schema.nodeProperties,
        relationship_patterns: schema.relationshipPatterns,
        common_query_examples: schema.commonQueries
      },
      cypher_rules: {
        "CRITICAL": "Use ONLY the exact labels, relationships, and properties listed in the schema above",
        "aggregation_syntax": "MATCH (n:Label) WITH n.property as field, COUNT(n) as count RETURN field, count ORDER BY count DESC LIMIT 10",
        "relationship_syntax": "MATCH (a:LabelA)-[r:REL_TYPE]->(b:LabelB) WITH COUNT(*) as count RETURN count",
        "property_access": "Use n.showname for display names, n.uid for unique identifiers",
        "no_group_by": "Never use GROUP BY - use WITH clause for aggregations",
        "limit_results": "Always add LIMIT 10-20 for chart data"
      }
    })

    const system = `You are a Neo4j Cypher expert generating dashboard queries for a cybersecurity graph database.

CRITICAL REQUIREMENTS:
1. Use ONLY the exact node labels, relationship types, and properties from the provided schema
2. The schema contains: ${schema.nodeLabels.join(', ')} as node labels
3. Available relationships: ${schema.relationshipTypes.join(', ')}
4. All nodes have 'showname' property for display and 'uid' for unique identification
5. Return STRICT JSON matching the expected_output format

CYPHER SYNTAX RULES:
- Never use GROUP BY (not valid in Cypher)
- Use WITH clause for aggregations: MATCH (n:Label) WITH n.property as field, COUNT(n) as count RETURN field, count
- Always add ORDER BY count DESC LIMIT 10-20 for charts
- Use exact label names with backticks if needed: MATCH (n:\`${schema.nodeLabels[0] || 'Label'}\`)

EXAMPLE VALID QUERIES:
${schema.commonQueries.map(q => `- ${q.pattern}: ${q.example}`).join('\n')}

Generate dashboard cards that will return actual data from this specific database schema.`

    const json = await generateJSON(`${system}\n\nUser prompt: ${prompt}`, schemaDescription)

    // Basic validation
    if (!json || !Array.isArray(json.cards)) {
      return res.status(500).json({ error: 'AI did not return cards' })
    }

    // Attach prompt if missing
    json.prompt = json.prompt || prompt

    res.status(200).json({ dashboard: json })
  } catch (error) {
    console.error('AI generate error:', error)
    const errorMessage = (error as Error).message

    // Check for specific API key error
    if (errorMessage.includes('Missing OPENAI_API_KEY')) {
      return res.status(500).json({
        error: 'AI service not configured',
        details: 'Missing OPENAI_API_KEY environment variable. Please add your OpenAI API key to .env.local and restart the server.',
        code: 'MISSING_API_KEY'
      })
    }

    // Check for quota exceeded errors
    if (errorMessage.includes('429 Too Many Requests') || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded')) {
      return res.status(500).json({
        error: 'API quota exceeded',
        details: 'Your Google Gemini API quota has been exceeded. Please check your billing details or wait for the quota to reset. Visit https://ai.google.dev/gemini-api/docs/rate-limits for more information.',
        code: 'QUOTA_EXCEEDED'
      })
    }

    // Check for other API-related errors
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key') || errorMessage.includes('Incorrect API key') || errorMessage.includes('Invalid OpenAI API key')) {
      return res.status(500).json({
        error: 'Invalid API key',
        details: 'The OpenAI API key is invalid. Please: 1) Verify the key at https://platform.openai.com/api-keys, 2) Ensure billing is set up on your OpenAI account, 3) Check if the key has expired, 4) Try regenerating the API key.',
        code: 'INVALID_API_KEY'
      })
    }

    res.status(500).json({
      error: 'Failed to generate dashboard',
      details: errorMessage,
      code: 'GENERATION_ERROR'
    })
  }
}

