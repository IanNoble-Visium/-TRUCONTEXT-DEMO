export interface JSONValidationError {
  type: 'syntax' | 'structure' | 'reference'
  message: string
  line?: number
  column?: number
  position?: number
  context?: string
  suggestion?: string
  severity: 'error' | 'warning'
}

export interface JSONValidationResult {
  isValid: boolean
  errors: JSONValidationError[]
  warnings: JSONValidationError[]
  parsedData?: any
}

export interface DatasetValidationResult extends JSONValidationResult {
  nodeCount?: number
  edgeCount?: number
  missingReferences?: string[]
}

/**
 * Enhanced JSON parser that provides detailed error information
 */
export function parseJSONWithDetails(jsonString: string): JSONValidationResult {
  const errors: JSONValidationError[] = []
  const warnings: JSONValidationError[] = []
  
  try {
    // First, try to parse normally
    const parsedData = JSON.parse(jsonString)
    return {
      isValid: true,
      errors: [],
      warnings: [],
      parsedData
    }
  } catch (error) {
    // If parsing fails, analyze the error in detail
    const syntaxError = analyzeSyntaxError(error as SyntaxError, jsonString)
    errors.push(syntaxError)
    
    return {
      isValid: false,
      errors,
      warnings,
      parsedData: null
    }
  }
}

/**
 * Analyze syntax errors and provide detailed information
 */
function analyzeSyntaxError(error: SyntaxError, jsonString: string): JSONValidationError {
  const message = error.message
  const lines = jsonString.split('\n')
  
  // Extract position information from error message
  const positionMatch = message.match(/position (\d+)/i)
  const position = positionMatch ? parseInt(positionMatch[1]) : null
  
  // Calculate line and column from position
  let line = 1
  let column = 1
  let currentPos = 0
  
  if (position !== null) {
    for (let i = 0; i < jsonString.length && currentPos < position; i++) {
      if (jsonString[i] === '\n') {
        line++
        column = 1
      } else {
        column++
      }
      currentPos++
    }
  }
  
  // Analyze error type and provide suggestions
  const errorAnalysis = categorizeJSONError(message, jsonString, line, column)
  
  return {
    type: 'syntax',
    message: errorAnalysis.message,
    line,
    column,
    position: position || undefined,
    context: getErrorContext(lines, line),
    suggestion: errorAnalysis.suggestion,
    severity: 'error'
  }
}

/**
 * Categorize JSON errors and provide specific suggestions
 */
function categorizeJSONError(errorMessage: string, jsonString: string, line: number, column: number): {
  message: string
  suggestion: string
} {
  const lowerMessage = errorMessage.toLowerCase()
  
  // Missing comma
  if (lowerMessage.includes('expected') && lowerMessage.includes(',')) {
    return {
      message: 'Missing comma between object properties or array elements',
      suggestion: 'Add a comma (,) after the previous property or array element'
    }
  }
  
  // Trailing comma
  if (lowerMessage.includes('trailing comma') || 
      (lowerMessage.includes('unexpected') && lowerMessage.includes(','))) {
    return {
      message: 'Trailing comma found',
      suggestion: 'Remove the comma after the last property or array element'
    }
  }
  
  // Unclosed brackets/braces
  if (lowerMessage.includes('unexpected end') || lowerMessage.includes('unterminated')) {
    const openBraces = (jsonString.match(/\{/g) || []).length
    const closeBraces = (jsonString.match(/\}/g) || []).length
    const openBrackets = (jsonString.match(/\[/g) || []).length
    const closeBrackets = (jsonString.match(/\]/g) || []).length
    
    if (openBraces > closeBraces) {
      return {
        message: 'Missing closing brace',
        suggestion: `Add ${openBraces - closeBraces} closing brace(s) "}" to match opening braces`
      }
    }
    
    if (openBrackets > closeBrackets) {
      return {
        message: 'Missing closing bracket',
        suggestion: `Add ${openBrackets - closeBrackets} closing bracket(s) "]" to match opening brackets`
      }
    }
  }
  
  // Unquoted property names
  if (lowerMessage.includes('property name') || 
      (lowerMessage.includes('unexpected') && lowerMessage.includes('token'))) {
    return {
      message: 'Property name must be quoted',
      suggestion: 'Wrap property names in double quotes, e.g., "propertyName": "value"'
    }
  }
  
  // Invalid escape sequences
  if (lowerMessage.includes('escape') || lowerMessage.includes('\\')) {
    return {
      message: 'Invalid escape sequence',
      suggestion: 'Use valid escape sequences: \\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, or \\uXXXX'
    }
  }
  
  // Invalid Unicode
  if (lowerMessage.includes('unicode') || lowerMessage.includes('\\u')) {
    return {
      message: 'Invalid Unicode escape sequence',
      suggestion: 'Use valid Unicode format: \\uXXXX where XXXX is a 4-digit hexadecimal number'
    }
  }
  
  // Duplicate keys
  if (lowerMessage.includes('duplicate')) {
    return {
      message: 'Duplicate property key found',
      suggestion: 'Remove or rename duplicate property keys in the same object'
    }
  }
  
  // Generic unexpected token
  if (lowerMessage.includes('unexpected token')) {
    return {
      message: 'Unexpected character or token',
      suggestion: 'Check for missing quotes, commas, or invalid characters at this position'
    }
  }
  
  // Default case
  return {
    message: 'JSON syntax error',
    suggestion: 'Check the JSON syntax around this location for missing quotes, commas, or brackets'
  }
}

/**
 * Get context lines around the error
 */
function getErrorContext(lines: string[], errorLine: number, contextSize: number = 2): string {
  const startLine = Math.max(0, errorLine - contextSize - 1)
  const endLine = Math.min(lines.length, errorLine + contextSize)

  const contextLines = []
  for (let i = startLine; i < endLine; i++) {
    const lineNumber = i + 1
    const isErrorLine = lineNumber === errorLine
    const prefix = isErrorLine ? '>>> ' : '    '
    contextLines.push(`${prefix}${lineNumber}: ${lines[i]}`)
  }

  return contextLines.join('\n')
}

/**
 * Validate dataset structure after successful JSON parsing
 */
export function validateDatasetStructure(data: any): DatasetValidationResult {
  const errors: JSONValidationError[] = []
  const warnings: JSONValidationError[] = []

  // Check if data is an object
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push({
      type: 'structure',
      message: 'Dataset must be a JSON object',
      suggestion: 'Wrap your data in curly braces {} to create a valid JSON object',
      severity: 'error'
    })

    return {
      isValid: false,
      errors,
      warnings,
      parsedData: data
    }
  }

  // Check for required top-level properties
  if (!data.nodes) {
    errors.push({
      type: 'structure',
      message: 'Missing required "nodes" property',
      suggestion: 'Add a "nodes" array containing your node data: "nodes": [...]',
      severity: 'error'
    })
  } else if (!Array.isArray(data.nodes)) {
    errors.push({
      type: 'structure',
      message: 'Property "nodes" must be an array',
      suggestion: 'Change "nodes" to an array format: "nodes": [...]',
      severity: 'error'
    })
  }

  if (!data.edges) {
    errors.push({
      type: 'structure',
      message: 'Missing required "edges" property',
      suggestion: 'Add an "edges" array containing your edge data: "edges": [...]',
      severity: 'error'
    })
  } else if (!Array.isArray(data.edges)) {
    errors.push({
      type: 'structure',
      message: 'Property "edges" must be an array',
      suggestion: 'Change "edges" to an array format: "edges": [...]',
      severity: 'error'
    })
  }

  // If basic structure is invalid, return early
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      parsedData: data
    }
  }

  // Validate nodes structure
  const nodeValidation = validateNodes(data.nodes)
  errors.push(...nodeValidation.errors)
  warnings.push(...nodeValidation.warnings)

  // Validate edges structure
  const edgeValidation = validateEdges(data.edges)
  errors.push(...edgeValidation.errors)
  warnings.push(...edgeValidation.warnings)

  // Validate edge references
  const referenceValidation = validateEdgeReferences(data.nodes, data.edges)
  errors.push(...referenceValidation.errors)
  warnings.push(...referenceValidation.warnings)

  // Check for stored queries (optional but warn if missing)
  if (!data.storedQueries) {
    warnings.push({
      type: 'structure',
      message: 'No stored queries found',
      suggestion: 'Consider adding a "storedQueries" array with Cypher queries for enhanced functionality',
      severity: 'warning'
    })
  } else if (!Array.isArray(data.storedQueries)) {
    warnings.push({
      type: 'structure',
      message: 'Property "storedQueries" should be an array',
      suggestion: 'Change "storedQueries" to an array format: "storedQueries": [...]',
      severity: 'warning'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    parsedData: data,
    nodeCount: Array.isArray(data.nodes) ? data.nodes.length : 0,
    edgeCount: Array.isArray(data.edges) ? data.edges.length : 0,
    missingReferences: referenceValidation.missingReferences
  }
}

/**
 * Validate nodes array structure
 */
function validateNodes(nodes: any[]): { errors: JSONValidationError[], warnings: JSONValidationError[] } {
  const errors: JSONValidationError[] = []
  const warnings: JSONValidationError[] = []
  const seenUids = new Set<string>()

  if (nodes.length === 0) {
    warnings.push({
      type: 'structure',
      message: 'Nodes array is empty',
      suggestion: 'Add at least one node to create a meaningful dataset',
      severity: 'warning'
    })
    return { errors, warnings }
  }

  nodes.forEach((node, index) => {
    const nodeContext = `Node ${index + 1}`

    // Check if node is an object
    if (typeof node !== 'object' || node === null || Array.isArray(node)) {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Node must be an object`,
        suggestion: 'Each node should be a JSON object with properties like uid, type, showname',
        severity: 'error'
      })
      return
    }

    // Check required properties
    if (!node.uid) {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Missing required "uid" property`,
        suggestion: 'Add a unique identifier: "uid": "unique-id-here"',
        severity: 'error'
      })
    } else if (typeof node.uid !== 'string') {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Property "uid" must be a string`,
        suggestion: 'Change uid to a string value: "uid": "string-value"',
        severity: 'error'
      })
    } else if (seenUids.has(node.uid)) {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Duplicate uid "${node.uid}"`,
        suggestion: 'Each node must have a unique uid value',
        severity: 'error'
      })
    } else {
      seenUids.add(node.uid)
    }

    if (!node.type) {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Missing required "type" property`,
        suggestion: 'Add a node type: "type": "Server" (or Application, Database, etc.)',
        severity: 'error'
      })
    } else if (typeof node.type !== 'string') {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Property "type" must be a string`,
        suggestion: 'Change type to a string value: "type": "NodeType"',
        severity: 'error'
      })
    }

    if (!node.showname) {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Missing required "showname" property`,
        suggestion: 'Add a display name: "showname": "Display Name"',
        severity: 'error'
      })
    } else if (typeof node.showname !== 'string') {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Property "showname" must be a string`,
        suggestion: 'Change showname to a string value: "showname": "Display Name"',
        severity: 'error'
      })
    }

    // Check properties object
    if (!node.properties) {
      warnings.push({
        type: 'structure',
        message: `${nodeContext}: Missing "properties" object`,
        suggestion: 'Add a properties object: "properties": {} for additional node data',
        severity: 'warning'
      })
    } else if (typeof node.properties !== 'object' || Array.isArray(node.properties)) {
      errors.push({
        type: 'structure',
        message: `${nodeContext}: Property "properties" must be an object`,
        suggestion: 'Change properties to an object: "properties": {...}',
        severity: 'error'
      })
    }
  })

  return { errors, warnings }
}

/**
 * Validate edges array structure
 */
function validateEdges(edges: any[]): { errors: JSONValidationError[], warnings: JSONValidationError[] } {
  const errors: JSONValidationError[] = []
  const warnings: JSONValidationError[] = []

  if (edges.length === 0) {
    warnings.push({
      type: 'structure',
      message: 'Edges array is empty',
      suggestion: 'Add edges to connect your nodes and create relationships',
      severity: 'warning'
    })
    return { errors, warnings }
  }

  edges.forEach((edge, index) => {
    const edgeContext = `Edge ${index + 1}`

    // Check if edge is an object
    if (typeof edge !== 'object' || edge === null || Array.isArray(edge)) {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Edge must be an object`,
        suggestion: 'Each edge should be a JSON object with properties like from, to, type',
        severity: 'error'
      })
      return
    }

    // Check required properties
    if (!edge.from) {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Missing required "from" property`,
        suggestion: 'Add source node reference: "from": "source-node-uid"',
        severity: 'error'
      })
    } else if (typeof edge.from !== 'string') {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Property "from" must be a string`,
        suggestion: 'Change from to a string value: "from": "node-uid"',
        severity: 'error'
      })
    }

    if (!edge.to) {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Missing required "to" property`,
        suggestion: 'Add target node reference: "to": "target-node-uid"',
        severity: 'error'
      })
    } else if (typeof edge.to !== 'string') {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Property "to" must be a string`,
        suggestion: 'Change to to a string value: "to": "node-uid"',
        severity: 'error'
      })
    }

    if (!edge.type) {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Missing required "type" property`,
        suggestion: 'Add relationship type: "type": "CONNECTS_TO" (or OWNS, USES, etc.)',
        severity: 'error'
      })
    } else if (typeof edge.type !== 'string') {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Property "type" must be a string`,
        suggestion: 'Change type to a string value: "type": "RELATIONSHIP_TYPE"',
        severity: 'error'
      })
    }

    // Check properties object
    if (!edge.properties) {
      warnings.push({
        type: 'structure',
        message: `${edgeContext}: Missing "properties" object`,
        suggestion: 'Add a properties object: "properties": {} for additional edge data',
        severity: 'warning'
      })
    } else if (typeof edge.properties !== 'object' || Array.isArray(edge.properties)) {
      errors.push({
        type: 'structure',
        message: `${edgeContext}: Property "properties" must be an object`,
        suggestion: 'Change properties to an object: "properties": {...}',
        severity: 'error'
      })
    }
  })

  return { errors, warnings }
}

/**
 * Validate that all edge references point to existing nodes
 */
function validateEdgeReferences(nodes: any[], edges: any[]): {
  errors: JSONValidationError[],
  warnings: JSONValidationError[],
  missingReferences: string[]
} {
  const errors: JSONValidationError[] = []
  const warnings: JSONValidationError[] = []
  const missingReferences: string[] = []

  // Create set of valid node UIDs
  const nodeUids = new Set<string>()
  if (Array.isArray(nodes)) {
    nodes.forEach(node => {
      if (node && typeof node.uid === 'string') {
        nodeUids.add(node.uid)
      }
    })
  }

  if (Array.isArray(edges)) {
    edges.forEach((edge, index) => {
      if (edge && typeof edge === 'object') {
        const edgeContext = `Edge ${index + 1}`

        // Check 'from' reference
        if (typeof edge.from === 'string' && !nodeUids.has(edge.from)) {
          errors.push({
            type: 'reference',
            message: `${edgeContext}: References non-existent node "${edge.from}"`,
            suggestion: `Create a node with uid "${edge.from}" or change the "from" reference to an existing node`,
            severity: 'error'
          })
          missingReferences.push(edge.from)
        }

        // Check 'to' reference
        if (typeof edge.to === 'string' && !nodeUids.has(edge.to)) {
          errors.push({
            type: 'reference',
            message: `${edgeContext}: References non-existent node "${edge.to}"`,
            suggestion: `Create a node with uid "${edge.to}" or change the "to" reference to an existing node`,
            severity: 'error'
          })
          missingReferences.push(edge.to)
        }
      }
    })
  }

  return { errors, warnings, missingReferences: [...new Set(missingReferences)] }
}

/**
 * Complete validation function that combines JSON parsing and structure validation
 */
export function validateJSONDataset(jsonString: string): DatasetValidationResult {
  // First, validate JSON syntax
  const jsonResult = parseJSONWithDetails(jsonString)

  if (!jsonResult.isValid) {
    return {
      ...jsonResult,
      nodeCount: 0,
      edgeCount: 0,
      missingReferences: []
    }
  }

  // Then validate dataset structure
  return validateDatasetStructure(jsonResult.parsedData)
}
