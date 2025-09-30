import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/neo4j'

// Lightweight schema retrieval for prompt enhancement
async function getSchemaContext() {
  const session = await getSession()
  try {
    // Get all node labels with counts
    const labelsResult = await session.run(`
      MATCH (n)
      RETURN DISTINCT labels(n) as labels, count(*) as count
      ORDER BY count DESC
      LIMIT 20
    `)

    const nodeTypes: Array<{label: string, count: number}> = []
    labelsResult.records.forEach(record => {
      const labels = record.get('labels') as string[]
      const count = record.get('count').low || record.get('count')
      labels.forEach(label => {
        nodeTypes.push({ label, count })
      })
    })

    // Get all relationship types with counts
    const relsResult = await session.run(`
      MATCH ()-[r]->()
      RETURN DISTINCT type(r) as rel_type, count(*) as count
      ORDER BY count DESC
      LIMIT 20
    `)

    const relationshipTypes = relsResult.records.map(record => ({
      type: record.get('rel_type') as string,
      count: record.get('count').low || record.get('count')
    }))

    // Get sample properties for top node types
    const nodeProperties: Record<string, string[]> = {}
    const topLabels = [...new Set(nodeTypes.slice(0, 10).map(n => n.label))]

    for (const label of topLabels) {
      const propsResult = await session.run(`
        MATCH (n:\`${label}\`)
        WITH n LIMIT 5
        UNWIND keys(n) as key
        RETURN DISTINCT key
        ORDER BY key
        LIMIT 10
      `)

      nodeProperties[label] = propsResult.records.map(record =>
        record.get('key') as string
      )
    }

    // Get common relationship patterns
    const patternResult = await session.run(`
      MATCH (a)-[r]->(b)
      RETURN DISTINCT labels(a)[0] as source, type(r) as rel, labels(b)[0] as target, count(*) as count
      ORDER BY count DESC
      LIMIT 15
    `)

    const patterns = patternResult.records.map(record => ({
      source: record.get('source') as string,
      relationship: record.get('rel') as string,
      target: record.get('target') as string,
      count: record.get('count').low || record.get('count')
    }))

    return {
      nodeTypes,
      relationshipTypes,
      nodeProperties,
      patterns
    }
  } finally {
    await session.close()
  }
}

// Enhanced prompt using OpenAI/Gemini
async function enhancePromptWithAI(originalPrompt: string, schema: any): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('MISSING_API_KEY')
  }

  // Prepare schema context for AI
  const schemaContext = `
Available Neo4j Database Schema:

Node Types (with counts):
${schema.nodeTypes.map((n: any) => `- ${n.label} (${n.count} nodes)`).join('\n')}

Relationship Types (with counts):
${schema.relationshipTypes.map((r: any) => `- ${r.type} (${r.count} relationships)`).join('\n')}

Common Relationship Patterns:
${schema.patterns.map((p: any) => `- (${p.source})-[${p.relationship}]->(${p.target}) [${p.count} instances]`).join('\n')}

Sample Properties by Node Type:
${Object.entries(schema.nodeProperties).map(([label, props]: [string, any]) => 
  `- ${label}: ${props.join(', ')}`
).join('\n')}
`

  const systemPrompt = `You are an expert at analyzing user intent and rewriting prompts to be more specific and data-aware for Neo4j graph database dashboards.

Your task:
1. Analyze the user's original prompt
2. Match it against the available Neo4j schema (node types, relationships, properties)
3. Rewrite the prompt to be more specific, descriptive, and actionable
4. Ensure the enhanced prompt will generate a valid Cypher query that returns meaningful results
5. Include specific entity types, properties, and aggregations from the schema
6. Make the prompt clear enough to generate accurate visualizations

Guidelines:
- Be specific about what data to show (e.g., "vulnerability distribution" → "vulnerability distribution by CVSS severity levels")
- Include relevant entity types from the schema (e.g., "machines" → "Machine nodes")
- Suggest appropriate groupings or filters based on available properties
- Mention useful aggregations (counts, averages, top N, etc.)
- Keep the enhanced prompt concise but descriptive (1-2 sentences)
- Focus on what would make a good dashboard card visualization

Return ONLY the enhanced prompt text, nothing else.`

  const userPrompt = `${schemaContext}

Original user prompt: "${originalPrompt}"

Enhance this prompt to be more specific and data-aware based on the available schema.`

  // Use OpenAI if available, otherwise try Gemini
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai')
    const client = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })

      const enhancedPrompt = response.choices[0]?.message?.content?.trim() || originalPrompt
      return enhancedPrompt
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('INVALID_API_KEY')
      } else if (error.status === 429) {
        throw new Error('QUOTA_EXCEEDED')
      }
      throw error
    }
  } else if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    try {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const enhancedPrompt = response.text().trim() || originalPrompt
      return enhancedPrompt
    } catch (error: any) {
      if (error.message?.includes('API_KEY')) {
        throw new Error('INVALID_API_KEY')
      }
      throw error
    }
  }

  throw new Error('MISSING_API_KEY')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid prompt',
        details: 'Prompt must be a non-empty string'
      })
    }

    // Get Neo4j schema context
    let schema
    try {
      schema = await getSchemaContext()
    } catch (error) {
      console.error('Failed to retrieve Neo4j schema:', error)
      return res.status(500).json({
        error: 'Failed to retrieve database schema',
        details: 'Could not connect to Neo4j database',
        code: 'SCHEMA_ERROR'
      })
    }

    // Enhance prompt with AI
    try {
      const enhancedPrompt = await enhancePromptWithAI(prompt.trim(), schema)
      
      return res.status(200).json({
        originalPrompt: prompt.trim(),
        enhancedPrompt,
        schemaUsed: {
          nodeTypeCount: schema.nodeTypes.length,
          relationshipTypeCount: schema.relationshipTypes.length,
          patternCount: schema.patterns.length
        }
      })
    } catch (error: any) {
      if (error.message === 'MISSING_API_KEY') {
        return res.status(400).json({
          error: 'AI service not configured',
          details: 'OpenAI or Gemini API key required. Add OPENAI_API_KEY or GEMINI_API_KEY to your .env.local file.',
          code: 'MISSING_API_KEY',
          fallback: true
        })
      } else if (error.message === 'INVALID_API_KEY') {
        return res.status(401).json({
          error: 'Invalid API key',
          details: 'The provided API key is invalid or expired. Please check your .env.local configuration.',
          code: 'INVALID_API_KEY',
          fallback: true
        })
      } else if (error.message === 'QUOTA_EXCEEDED') {
        return res.status(429).json({
          error: 'API quota exceeded',
          details: 'Your API quota has been exceeded. Please try again later or upgrade your plan.',
          code: 'QUOTA_EXCEEDED',
          fallback: true
        })
      }
      
      throw error
    }
  } catch (error: any) {
    console.error('Enhance prompt error:', error)
    return res.status(500).json({
      error: 'Failed to enhance prompt',
      details: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    })
  }
}

