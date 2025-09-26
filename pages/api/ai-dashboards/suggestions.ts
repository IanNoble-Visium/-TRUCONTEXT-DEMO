import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '../../../lib/neo4j'
import { generateJSON } from '../../../lib/openai'

async function analyze() {
  const session = await getSession()
  try {
    const labelsRes = await session.run(`MATCH (n) RETURN labels(n) AS labels LIMIT 500`)
    const relsRes = await session.run(`MATCH ()-[r]->() RETURN type(r) AS type LIMIT 500`)

    const labels = new Set<string>()
    labelsRes.records.forEach(r => {
      const arr: string[] = r.get('labels') || []
      arr.forEach(l => labels.add(l))
    })

    const rels = new Set<string>()
    relsRes.records.forEach(r => rels.add(r.get('type')))

    return { labels: Array.from(labels), relationships: Array.from(rels) }
  } finally {
    await session.close()
  }
}

function heuristicSuggestions(labels: string[]): string[] {
  const s: string[] = []
  const has = (n: string) => labels.some(l => l.toLowerCase().includes(n))
  if (has('vulnerab') || has('cve')) {
    s.push('Top CVEs impacting the most assets with severity distribution')
    s.push('Asset exposure graph showing exploit paths to internet-facing systems')
  }
  if (has('user')) {
    s.push('Suspicious user lateral movement paths over the last 24 hours')
  }
  if (has('alert') || has('incident')) {
    s.push('Alerts by severity and affected systems with time trend')
  }
  if (s.length < 5) {
    s.push('Top categories with counts and a relationship graph of those categories')
    s.push('Recent items activity timeline and key entity breakdown by type')
  }
  return s.slice(0, 8)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const summary = await analyze()

    // Ask Gemini for domain-aware, cybersecurity-focused suggestions using schema
    try {
      const schemaDescription = JSON.stringify({ summary, expected_output: { suggestions: ['string'] } })
      const json = await generateJSON(
        `Generate 8 concise cybersecurity-relevant dashboard prompt ideas for this graph schema. ` +
          `Be specific to the labels and relationships when possible. Do not mention labels not present.`,
        schemaDescription
      )
      if (json && Array.isArray(json.suggestions) && json.suggestions.length > 0) {
        return res.status(200).json({ suggestions: json.suggestions })
      }
    } catch (e) {
      const errorMessage = (e as Error).message
      console.warn('Gemini suggestions fallback to heuristic:', errorMessage)

      // If API key is missing, return fallback with indicator
      if (errorMessage.includes('Missing OPENAI_API_KEY')) {
        const suggestions = heuristicSuggestions(summary.labels)
        return res.status(200).json({
          suggestions,
          fallback: true,
          message: 'Using fallback suggestions. Configure OPENAI_API_KEY for AI-powered suggestions.'
        })
      }
    }

    // Fallback heuristics
    const suggestions = heuristicSuggestions(summary.labels)
    return res.status(200).json({ suggestions })
  } catch (error) {
    console.error('Suggestions error:', error)

    // For suggestions, always try to return something useful
    try {
      const fallbackSuggestions = [
        'Top categories with counts and a relationship graph of those categories',
        'Recent items activity timeline and key entity breakdown by type',
        'Network topology showing connections between different node types',
        'Distribution of properties across different entity types'
      ]
      return res.status(200).json({
        suggestions: fallbackSuggestions,
        fallback: true,
        message: 'Using basic suggestions due to configuration issues.'
      })
    } catch {
      res.status(500).json({ error: 'Failed to generate suggestions', details: (error as Error).message })
    }
  }
}

