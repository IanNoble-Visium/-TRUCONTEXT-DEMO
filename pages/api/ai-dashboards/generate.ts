import type { NextApiRequest, NextApiResponse } from 'next'
import { generateJSON } from '../../../lib/openai'
import { getSession } from '../../../lib/neo4j'

// Shape returned to client
// { cards: [{ title, viz_type: 'table'|'bar'|'pie'|'graph', cypher, options? }], name?, prompt }

async function summarizeSchema() {
  const session = await getSession()
  try {
    // Gather labels and node property keys
    const nodeRes = await session.run(`
      MATCH (n)
      WITH labels(n) AS labels, keys(n) AS keys
      RETURN labels, keys
      LIMIT 200
    `)
    const relRes = await session.run(`
      MATCH ()-[r]->()
      WITH type(r) AS type, keys(r) AS keys
      RETURN type, keys
      LIMIT 200
    `)

    const nodeLabels: Record<string, Set<string>> = {}
    nodeRes.records.forEach(rec => {
      const labels: string[] = rec.get('labels') || []
      const keys: string[] = rec.get('keys') || []
      const label = labels[0] || 'Unknown'
      if (!nodeLabels[label]) nodeLabels[label] = new Set<string>()
      keys.forEach(k => nodeLabels[label].add(k))
    })

    const relTypes: Record<string, Set<string>> = {}
    relRes.records.forEach(rec => {
      const type: string = rec.get('type')
      const keys: string[] = rec.get('keys') || []
      if (!relTypes[type]) relTypes[type] = new Set<string>()
      keys.forEach(k => relTypes[type].add(k))
    })

    const schema = {
      node_types: Object.entries(nodeLabels).map(([label, set]) => ({ label, properties: Array.from(set) })),
      rel_types: Object.entries(relTypes).map(([type, set]) => ({ type, properties: Array.from(set) }))
    }
    return schema
  } finally {
    await session.close()
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { prompt } = req.body as { prompt?: string }
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Missing prompt' })

    const schema = await summarizeSchema()
    const schemaDescription = JSON.stringify({
      expected_output: {
        name: 'string (optional) name for the dashboard',
        prompt: 'string original user prompt',
        cards: [
          {
            title: 'string',
            viz_type: "one of: 'table' | 'bar' | 'pie' | 'graph'",
            cypher: 'string Neo4j Cypher query; use properties and labels present',
            options: 'object with chart settings (optional)'
          }
        ]
      },
      cypher_examples: {
        aggregation: "MATCH (n:Label) WITH n.property as prop, COUNT(n) as count RETURN prop, count ORDER BY count DESC LIMIT 10",
        relationship_count: "MATCH (a:LabelA)-[r:REL_TYPE]->(b:LabelB) WITH type(r) as rel_type, COUNT(*) as count RETURN rel_type, count",
        simple_list: "MATCH (n:Label) RETURN n.name as name, n.property as value LIMIT 20"
      },
      schema: schema
    })

    const system = `Generate a domain-agnostic dashboard from the user's prompt for a Neo4j graph.\n` +
      `- Use ONLY labels, relationship types, and properties evident in the provided schema.\n` +
      `- Return STRICT JSON matching the expected_output above.\n` +
      `- Choose appropriate viz_type for each card.\n` +
      `- Ensure each cypher runs without APOC and returns concise fields for charting.\n` +
      `- Use proper Cypher syntax: MATCH ... WITH ... RETURN (no GROUP BY clause).\n` +
      `- For aggregations, use WITH clause before RETURN: MATCH ... WITH field, COUNT(*) as count RETURN field, count\n` +
      `- Prefer lower cardinality aggregations for charts; use LIMIT 20 when appropriate.\n` +
      `- Test queries should be valid Neo4j Cypher without syntax errors.`

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

