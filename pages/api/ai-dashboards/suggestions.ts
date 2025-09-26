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

function schemaAwareSuggestions(labels: string[], relationships: string[]): string[] {
  const s: string[] = []
  const hasLabel = (n: string) => labels.some(l => l.toLowerCase().includes(n.toLowerCase()))
  const hasRel = (n: string) => relationships.some(r => r.toLowerCase().includes(n.toLowerCase()))

  // Vulnerability-focused suggestions based on actual schema
  if (hasLabel('Vulnerability')) {
    s.push('Show vulnerability distribution by severity levels')
    if (hasLabel('Machine') && hasRel('ON')) {
      s.push('Show machines with the most vulnerabilities')
    }
    if (hasLabel('CvssSeverity') && hasRel('SEVERITY')) {
      s.push('Display CVSS severity breakdown across all vulnerabilities')
    }
    if (hasLabel('Software') && hasRel('SOFTWARE')) {
      s.push('Show software components with associated vulnerabilities')
    }
  }

  // Machine and Domain analysis
  if (hasLabel('Machine') && hasLabel('Domain')) {
    s.push('Show machine distribution across domains')
    if (hasRel('LAUNCHES') && hasLabel('Exploit')) {
      s.push('Display machines that can launch exploits')
    }
  }

  // Exploit analysis
  if (hasLabel('Exploit') && hasLabel('Machine')) {
    s.push('Show exploit launch capabilities by machine')
  }

  // CWE analysis
  if (hasLabel('Cwe') && hasLabel('Vulnerability')) {
    s.push('Show Common Weakness Enumeration (CWE) distribution')
  }

  // References and external data
  if (hasLabel('References') && hasLabel('ExternalEntry')) {
    s.push('Show external reference sources and their usage')
  }

  // Generic fallbacks using actual labels
  if (s.length < 6) {
    s.push(`Show distribution of ${labels[0] || 'entities'} by type`)
    s.push(`Display relationship patterns between different node types`)
    if (labels.length > 1) {
      s.push(`Analyze connections between ${labels[0]} and ${labels[1]} entities`)
    }
  }

  return s.slice(0, 8)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const summary = await analyze()

    // Ask AI for domain-aware, cybersecurity-focused suggestions using actual schema
    try {
      const schemaDescription = JSON.stringify({
        available_labels: summary.labels,
        available_relationships: summary.relationships,
        expected_output: { suggestions: ['string'] },
        context: "This is a cybersecurity graph database with vulnerability, machine, and exploit data"
      })
      const json = await generateJSON(
        `Generate 8 specific dashboard suggestions for this cybersecurity graph database. ` +
          `Use ONLY the exact labels: ${summary.labels.join(', ')} and relationships: ${summary.relationships.join(', ')}. ` +
          `Focus on vulnerability analysis, machine security, exploit tracking, and severity assessment. ` +
          `Make suggestions actionable for security analysts.`,
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
        const suggestions = schemaAwareSuggestions(summary.labels, summary.relationships)
        return res.status(200).json({
          suggestions,
          fallback: true,
          message: 'Using schema-aware suggestions. Configure OPENAI_API_KEY for AI-powered suggestions.'
        })
      }
    }

    // Fallback heuristics
    const suggestions = schemaAwareSuggestions(summary.labels, summary.relationships)
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

