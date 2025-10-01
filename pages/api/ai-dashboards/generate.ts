import type { NextApiRequest, NextApiResponse } from 'next'
import { generateJSON } from '../../../lib/openai'
import { getSession } from '../../../lib/neo4j'

async function validateQuery(cypher: string): Promise<{isValid: boolean, error?: string, hasResults?: boolean}> {
  const session = await getSession()
  try {
    // Test the query with a small limit
    const testQuery = cypher.includes('LIMIT') ? cypher : `${cypher} LIMIT 1`
    const result = await session.run(testQuery)

    return {
      isValid: true,
      hasResults: result.records.length > 0
    }
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message,
      hasResults: false
    }
  } finally {
    await session.close()
  }
}

function generateFallbackCards(prompt: string, schema: any): any[] {
  const cards = []
  const promptLower = prompt.toLowerCase()

  // Vulnerability severity analysis
  if (promptLower.includes('vulnerability') && (promptLower.includes('severity') || promptLower.includes('distribution'))) {
    cards.push({
      title: 'Vulnerability Severity Distribution',
      viz_type: 'bar',
      cypher: 'MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity) WITH s.showname as severity, COUNT(v) as count RETURN severity, count ORDER BY count DESC LIMIT 10'
    })
  }

  // Machine vulnerability analysis
  if (promptLower.includes('machine') && promptLower.includes('vulnerability')) {
    cards.push({
      title: 'Machines with Most Vulnerabilities',
      viz_type: 'bar',
      cypher: 'MATCH (v:Vulnerability)-[:ON]->(m:Machine) WITH m.showname as machine, COUNT(v) as vuln_count RETURN machine, vuln_count ORDER BY vuln_count DESC LIMIT 10'
    })
  }

  // Domain analysis
  if (promptLower.includes('domain') || promptLower.includes('machine')) {
    cards.push({
      title: 'Machine Distribution by Domain',
      viz_type: 'pie',
      cypher: 'MATCH (m:Machine)-[:IN]->(d:Domain) WITH d.showname as domain, COUNT(m) as machine_count RETURN domain, machine_count ORDER BY machine_count DESC LIMIT 10'
    })
  }

  // Exploit analysis
  if (promptLower.includes('exploit')) {
    cards.push({
      title: 'Exploit Launch Capabilities',
      viz_type: 'bar',
      cypher: 'MATCH (m:Machine)-[:LAUNCHES]->(e:Exploit) WITH m.showname as machine, COUNT(e) as exploit_count RETURN machine, exploit_count ORDER BY exploit_count DESC LIMIT 10'
    })
  }

  // CWE analysis
  if (promptLower.includes('cwe') || promptLower.includes('weakness')) {
    cards.push({
      title: 'Common Weakness Enumeration Distribution',
      viz_type: 'bar',
      cypher: 'MATCH (v:Vulnerability)-[:CWE]->(c:Cwe) WITH c.showname as weakness, COUNT(v) as count RETURN weakness, count ORDER BY count DESC LIMIT 10'
    })
  }

  // Software analysis
  if (promptLower.includes('software')) {
    cards.push({
      title: 'Software Vulnerability Mapping',
      viz_type: 'bar',
      cypher: 'MATCH (v:Vulnerability)-[:SOFTWARE]->(s:Software) WITH s.showname as software, COUNT(v) as vuln_count RETURN software, vuln_count ORDER BY vuln_count DESC LIMIT 10'
    })
  }

  // Default fallback
  if (cards.length === 0) {
    cards.push({
      title: 'Vulnerability Severity Overview',
      viz_type: 'bar',
      cypher: 'MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity) WITH s.showname as severity, COUNT(v) as count RETURN severity, count ORDER BY count DESC LIMIT 10'
    })
  }

  return cards
}

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
      // Common patterns for AI to use based on actual data
      commonQueries: [
        {
          pattern: "Vulnerability severity distribution",
          example: "MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity) WITH s.showname as severity, COUNT(v) as count RETURN severity, count ORDER BY count DESC LIMIT 10"
        },
        {
          pattern: "Machine vulnerability count",
          example: "MATCH (v:Vulnerability)-[:ON]->(m:Machine) WITH m.showname as machine, COUNT(v) as vuln_count RETURN machine, vuln_count ORDER BY vuln_count DESC LIMIT 10"
        },
        {
          pattern: "Domain machine distribution",
          example: "MATCH (m:Machine)-[:IN]->(d:Domain) WITH d.showname as domain, COUNT(m) as machine_count RETURN domain, machine_count ORDER BY machine_count DESC LIMIT 10"
        },
        {
          pattern: "Exploit launch capabilities",
          example: "MATCH (m:Machine)-[:LAUNCHES]->(e:Exploit) WITH m.showname as machine, COUNT(e) as exploit_count RETURN machine, exploit_count ORDER BY exploit_count DESC LIMIT 10"
        },
        {
          pattern: "CWE weakness distribution",
          example: "MATCH (v:Vulnerability)-[:CWE]->(c:Cwe) WITH c.showname as weakness, COUNT(v) as count RETURN weakness, count ORDER BY count DESC LIMIT 10"
        },
        {
          pattern: "Software vulnerability mapping",
          example: "MATCH (v:Vulnerability)-[:SOFTWARE]->(s:Software) WITH s.showname as software, COUNT(v) as vuln_count RETURN software, vuln_count ORDER BY vuln_count DESC LIMIT 10"
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
    const { prompt, viz_type } = req.body as { prompt?: string, viz_type?: string }
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Missing prompt' })

    // Default viz_type if not provided
    const requestedVizType = viz_type || 'bar'

    const schema = await getDetailedSchema()
    const schemaDescription = JSON.stringify({
      expected_output: {
        name: 'string (optional) name for the dashboard',
        prompt: 'string original user prompt',
        cards: [
          {
            title: 'string - MUST be a descriptive, human-readable title that summarizes what the query shows (e.g., "Top 10 Machines by Vulnerability Count", "Vulnerability Severity Distribution", "Exploit Launch Capabilities by Machine")',
            viz_type: `'${requestedVizType}' (use this exact value: ${requestedVizType})`,
            cypher: 'string Neo4j Cypher query (legacy field for backward compatibility)',
            cypherAggregation: 'string Cypher query that returns aggregated data for charts/tables (e.g., WITH ... COUNT() RETURN field, count)',
            cypherGraph: 'string Cypher query that returns nodes and relationships for mini-topology (e.g., RETURN n, r, m)',
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
6. **IMPORTANT**: Generate BOTH cypherAggregation AND cypherGraph for EVERY card, regardless of the requested viz_type

CARD TITLE REQUIREMENTS:
- Each card MUST have a unique, descriptive, human-readable title
- Titles should summarize what the query shows, NOT just repeat the user prompt
- Use business-friendly language that executives and analysts can understand
- Include key metrics or entities in the title (e.g., "Top 10 Machines by Vulnerability Count" instead of "Machine Analysis")
- Avoid generic titles like "Card 1", "Dashboard Card", or "Query Results"
- Examples of GOOD titles:
  * "Vulnerability Severity Distribution"
  * "Top 10 Machines with Most Exploits"
  * "Domain-Based Machine Clustering"
  * "Critical CVE Weaknesses by Type"
  * "Exploit Launch Capabilities by Machine"
- Examples of BAD titles:
  * "Card 1"
  * "Query Results"
  * "Dashboard"
  * "Analysis"

DUAL QUERY GENERATION:
For each card, you MUST generate TWO queries:
- **cypherAggregation**: Returns aggregated data for charts/tables (WITH ... COUNT() RETURN field, count)
- **cypherGraph**: Returns nodes and relationships for mini-topology visualization (RETURN n, r, m)

This allows users to switch between visualization types without regenerating queries.

VISUALIZATION TYPE HANDLING:
${requestedVizType === 'mini-topology' ? `
**MINI-TOPOLOGY MODE ACTIVATED**
For mini-topology visualizations, you MUST generate queries that return actual graph structures (nodes and relationships), NOT aggregated data.

MINI-TOPOLOGY QUERY RULES:
- RETURN actual node and relationship objects using variables: RETURN n, r, m
- DO NOT use WITH clause for aggregation
- DO NOT use COUNT(), SUM(), or other aggregation functions
- DO NOT return just properties - return the full node/relationship objects
- Use LIMIT 10-20 to keep the graph manageable
- Pattern: MATCH (n:Label1)-[r:REL_TYPE]->(m:Label2) RETURN n, r, m LIMIT 10

MINI-TOPOLOGY EXAMPLES:
- For "Show Machines and Exploits": MATCH (m:Machine)-[r:LAUNCHES]->(e:Exploit) RETURN m, r, e LIMIT 10
- For "Show Vulnerabilities on Machines": MATCH (v:Vulnerability)-[r:ON]->(m:Machine) RETURN v, r, m LIMIT 15
- For "Show Exploit targets": MATCH (e:Exploit)-[r:VICTIM]->(m:Machine) RETURN e, r, m LIMIT 10
- For "Show Domain structure": MATCH (m:Machine)-[r:IN]->(d:Domain) RETURN m, r, d LIMIT 20
` : `
**CHART/TABLE MODE**
For ${requestedVizType} visualizations, generate queries that return aggregated data for charts/tables.

QUERY COMPLEXITY MATCHING:
- Analyze the user prompt carefully to identify ALL mentioned entity types and relationships
- If the prompt mentions multiple entities (e.g., "Exploits, Machines, Vulnerabilities"), your query MUST include ALL of them
- If the prompt mentions relationships or connections (e.g., "targets", "exploits", "associated with"), use multi-hop relationship traversals
- Match the complexity of your Cypher query to the complexity of the user's request
- DO NOT simplify complex prompts into basic single-entity queries
- If the prompt asks about relationships between entities, your query must traverse those relationships
`}

CYPHER SYNTAX RULES:
- Never use GROUP BY (not valid in Cypher)
${requestedVizType === 'mini-topology' ?
  '- For mini-topology: RETURN node and relationship objects directly (e.g., RETURN n, r, m)' :
  '- Use WITH clause for aggregations: MATCH (n:Label) WITH n.property as field, COUNT(n) as count RETURN field, count'
}
- Always add LIMIT 10-20 to keep results manageable
- Use exact label names with backticks if needed: MATCH (n:\`${schema.nodeLabels[0] || 'Label'}\`)
- For multi-entity queries, use relationship patterns: MATCH (a:LabelA)-[:REL]->(b:LabelB)-[:REL2]->(c:LabelC)

EXAMPLE VALID QUERIES (use these exact patterns):
${schema.commonQueries.map(q => `- ${q.pattern}: ${q.example}`).join('\n')}

CRITICAL: Use these exact relationship paths:
- Vulnerability → CVSS → Cvss → SEVERITY → CvssSeverity (for severity data)
- Vulnerability → ON → Machine (for affected machines)
- Vulnerability → CWE → Cwe (for weakness types)
- Vulnerability → SOFTWARE → Software (for affected software)
- Machine → IN → Domain (for domain mapping)
- Machine → LAUNCHES → Exploit (for exploit capabilities)
- Exploit → VICTIM → Machine (for exploit targets)

${requestedVizType === 'mini-topology' ? `
MINI-TOPOLOGY QUERY EXAMPLES (RETURN NODES AND RELATIONSHIPS):
- For "Show Exploits and their target Machines": MATCH (e:Exploit)-[r:VICTIM]->(m:Machine) RETURN e, r, m LIMIT 10
- For "Vulnerabilities on Machines": MATCH (v:Vulnerability)-[r:ON]->(m:Machine) RETURN v, r, m LIMIT 15
- For "Machine exploit capabilities": MATCH (m:Machine)-[r:LAUNCHES]->(e:Exploit) RETURN m, r, e LIMIT 10
- For "Domain structure": MATCH (m:Machine)-[r:IN]->(d:Domain) RETURN m, r, d LIMIT 20
` : `
CHART/TABLE QUERY EXAMPLES (RETURN AGGREGATED DATA):
- For "Show Exploits and their target Machines": MATCH (e:Exploit)-[:VICTIM]->(m:Machine) WITH e.showname as exploit, COUNT(DISTINCT m) as machine_count RETURN exploit, machine_count ORDER BY machine_count DESC LIMIT 10
- For "Vulnerabilities with severity and affected machines": MATCH (v:Vulnerability)-[:CVSS]->(c:Cvss)-[:SEVERITY]->(s:CvssSeverity), (v)-[:ON]->(m:Machine) WITH v.showname as vuln, s.showname as severity, COUNT(DISTINCT m) as machines RETURN vuln, severity, machines ORDER BY machines DESC LIMIT 10
- For "Exploits, Machines, and Vulnerabilities": MATCH (e:Exploit)-[:VICTIM]->(m:Machine)<-[:ON]-(v:Vulnerability) WITH e.showname as exploit, COUNT(DISTINCT m) as machines, COUNT(DISTINCT v) as vulns RETURN exploit, machines, vulns ORDER BY machines DESC LIMIT 10
`}

Generate dashboard cards that will return actual data from this specific database schema.`

    let json = await generateJSON(`${system}\n\nUser prompt: ${prompt}`, schemaDescription)

    // Basic validation
    if (!json || !Array.isArray(json.cards)) {
      console.warn('AI did not return valid cards, using fallback')
      const fallbackCards = generateFallbackCards(prompt, schema)
      // Apply requested viz_type to fallback cards
      fallbackCards.forEach(card => {
        card.viz_type = requestedVizType
      })
      json = {
        name: `${prompt} Dashboard`,
        prompt: prompt,
        cards: fallbackCards
      }
    } else {
      // Ensure all cards use the requested viz_type
      json.cards.forEach((card: any) => {
        card.viz_type = requestedVizType
      })
    }

    // Validate each query and filter out invalid ones
    const validatedCards = []
    for (const card of json.cards) {
      let isValid = false

      // Validate cypherAggregation if present
      if (card.cypherAggregation) {
        const validation = await validateQuery(card.cypherAggregation)
        if (validation.isValid && validation.hasResults) {
          isValid = true
        } else {
          console.warn(`Invalid cypherAggregation for card "${card.title}":`, validation.error)
        }
      }

      // Validate cypherGraph if present
      if (card.cypherGraph) {
        const validation = await validateQuery(card.cypherGraph)
        if (validation.isValid && validation.hasResults) {
          isValid = true
        } else {
          console.warn(`Invalid cypherGraph for card "${card.title}":`, validation.error)
        }
      }

      // Fallback to legacy cypher field
      if (!isValid && card.cypher) {
        const validation = await validateQuery(card.cypher)
        if (validation.isValid && validation.hasResults) {
          isValid = true
          // Migrate legacy cypher to appropriate field based on viz_type
          if (card.viz_type === 'mini-topology') {
            card.cypherGraph = card.cypher
          } else {
            card.cypherAggregation = card.cypher
          }
        } else {
          console.warn(`Skipping invalid query for card "${card.title}":`, validation.error)
          // Try to fix common issues and re-validate
          let fixedQuery = card.cypher
          if (fixedQuery.includes('GROUP BY')) {
            fixedQuery = fixedQuery.replace(/GROUP BY [^\\s]+/i, 'ORDER BY count DESC')
          }
          if (!fixedQuery.includes('LIMIT')) {
            fixedQuery += ' LIMIT 10'
          }

          const revalidation = await validateQuery(fixedQuery)
          if (revalidation.isValid && revalidation.hasResults) {
            card.cypher = fixedQuery
            if (card.viz_type === 'mini-topology') {
              card.cypherGraph = fixedQuery
            } else {
              card.cypherAggregation = fixedQuery
            }
            isValid = true
            console.log(`Fixed and validated query for card "${card.title}"`)
          }
        }
      }

      if (isValid) {
        validatedCards.push(card)
      }
    }

    if (validatedCards.length === 0) {
      // Fallback to pre-validated queries based on the prompt
      const fallbackCards = generateFallbackCards(prompt, schema)
      if (fallbackCards.length > 0) {
        json.cards = fallbackCards
        json.name = json.name || `${prompt} Dashboard`
        console.log('Using fallback cards due to AI validation failures')
      } else {
        return res.status(500).json({
          error: 'No valid queries generated',
          details: 'All generated queries failed validation or returned no results'
        })
      }
    } else {
      json.cards = validatedCards
    }

    // Attach prompt if missing
    json.prompt = json.prompt || prompt
    json.cards = validatedCards

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

