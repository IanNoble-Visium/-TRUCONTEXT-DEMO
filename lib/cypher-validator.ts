/**
 * Cypher Query Validator and Fixer
 * Validates and fixes common Cypher syntax errors before execution
 */

export interface CypherValidationResult {
  isValid: boolean
  fixedQuery?: string
  errors: string[]
  warnings: string[]
}

export function validateAndFixCypher(query: string): CypherValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let fixedQuery = query.trim()

  // 1. Fix GROUP BY syntax (most common error)
  if (fixedQuery.toUpperCase().includes('GROUP BY')) {
    // Handle the specific pattern: RETURN field AS alias, COUNT(...) AS alias GROUP BY field
    const pattern = /MATCH\s+(.+?)\s+RETURN\s+(.+?)\s+AS\s+(\w+),\s*(COUNT\(.+?\))\s+AS\s+(\w+)\s+GROUP\s+BY\s+(.+?)(?:\s|$)/i
    const match = fixedQuery.match(pattern)

    if (match) {
      const matchClause = match[1]
      const fieldExpression = match[2]
      const fieldAlias = match[3]
      const countExpression = match[4]
      const countAlias = match[5]
      const groupByField = match[6]

      // Rebuild with proper Cypher syntax
      fixedQuery = `MATCH ${matchClause} WITH ${fieldExpression} as ${fieldAlias}, ${countExpression} as ${countAlias} RETURN ${fieldAlias}, ${countAlias} ORDER BY ${countAlias} DESC`
      warnings.push('Fixed GROUP BY syntax - converted to proper Cypher WITH clause')
    } else {
      // Fallback: remove GROUP BY and add ORDER BY
      fixedQuery = fixedQuery.replace(/\s+GROUP\s+BY\s+[^\s]+/i, ' ORDER BY count DESC')
      warnings.push('Removed GROUP BY clause and added ORDER BY')
    }
  }

  // 2. Check for missing RETURN clause
  if (!fixedQuery.toUpperCase().includes('RETURN')) {
    errors.push('Query must include a RETURN clause')
  }

  // 3. Check for proper MATCH clause
  if (!fixedQuery.toUpperCase().includes('MATCH')) {
    errors.push('Query must start with a MATCH clause')
  }

  // 4. Fix common relationship syntax errors
  fixedQuery = fixedQuery.replace(/\-\[\:(\w+)\]\-\>/g, '-[:$1]->')
  fixedQuery = fixedQuery.replace(/\-\[(\w+)\:\w+\]\-\>/g, '-[r:$1]->')

  // 5. Ensure proper spacing around operators
  fixedQuery = fixedQuery.replace(/([A-Za-z])\s*=\s*([A-Za-z])/g, '$1 = $2')

  // 6. Add LIMIT if query might return too many results and doesn't have one
  if (!fixedQuery.toUpperCase().includes('LIMIT') && 
      !fixedQuery.toUpperCase().includes('COUNT(') &&
      fixedQuery.toUpperCase().includes('RETURN')) {
    fixedQuery += ' LIMIT 100'
    warnings.push('Added LIMIT 100 to prevent large result sets')
  }

  // 7. Check for valid aggregation syntax
  const aggregationPattern = /(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*[^)]+\s*\)/gi
  const aggregations = fixedQuery.match(aggregationPattern)
  if (aggregations) {
    aggregations.forEach(agg => {
      if (!agg.match(/\(\s*[\w.]+\s*\)/)) {
        warnings.push(`Check aggregation syntax: ${agg}`)
      }
    })
  }

  // 8. Validate node/relationship patterns
  const nodePattern = /\([^)]*\)/g
  const nodes = fixedQuery.match(nodePattern)
  if (nodes) {
    nodes.forEach(node => {
      if (node.includes(':') && !node.match(/\(\w*:\w+[^)]*\)/)) {
        warnings.push(`Check node pattern syntax: ${node}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    fixedQuery: fixedQuery,
    errors,
    warnings
  }
}

/**
 * Quick validation for common Cypher patterns
 */
export function isValidCypherPattern(query: string): boolean {
  const upperQuery = query.toUpperCase()
  
  // Must have MATCH and RETURN
  if (!upperQuery.includes('MATCH') || !upperQuery.includes('RETURN')) {
    return false
  }
  
  // Should not have GROUP BY (use WITH instead)
  if (upperQuery.includes('GROUP BY')) {
    return false
  }
  
  // Basic syntax checks
  const openParens = (query.match(/\(/g) || []).length
  const closeParens = (query.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    return false
  }
  
  return true
}
