import type { NextApiRequest, NextApiResponse } from 'next'
import { generateJSON } from '../../../lib/gemini'
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
      schema: schema
    })

    const system = `Generate a domain-agnostic dashboard from the user's prompt for a Neo4j graph.\n` +
      `- Use ONLY labels, relationship types, and properties evident in the provided schema.\n` +
      `- Return STRICT JSON matching the expected_output above.\n` +
      `- Choose appropriate viz_type for each card.\n` +
      `- Ensure each cypher runs without APOC and returns concise fields for charting.\n` +
      `- Prefer lower cardinality aggregations for charts; use LIMIT 20 when appropriate.`

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
    res.status(500).json({ error: 'Failed to generate dashboard', details: (error as Error).message })
  }
}

