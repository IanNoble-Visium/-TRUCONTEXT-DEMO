/**
 * Utility functions for managing threat path identifiers in TC_THREAT_PATH properties
 */

/**
 * Parse a comma-separated threat path string into an array
 * @param threatPathString - Comma-separated threat path identifiers
 * @returns Array of unique threat path identifiers
 */
export function parseThreatPaths(threatPathString: string): string[] {
  if (!threatPathString || typeof threatPathString !== 'string') {
    return []
  }
  
  return threatPathString
    .split(',')
    .map(path => path.trim())
    .filter(path => path.length > 0)
    .filter((path, index, array) => array.indexOf(path) === index) // Remove duplicates
}

/**
 * Convert an array of threat path identifiers to a comma-separated string
 * @param threatPaths - Array of threat path identifiers
 * @returns Comma-separated string
 */
export function serializeThreatPaths(threatPaths: string[]): string {
  if (!Array.isArray(threatPaths)) {
    return ''
  }
  
  return threatPaths
    .filter(path => path && typeof path === 'string' && path.trim().length > 0)
    .map(path => path.trim())
    .filter((path, index, array) => array.indexOf(path) === index) // Remove duplicates
    .join(',')
}

/**
 * Add a threat path identifier to an existing threat path string
 * @param existingPaths - Current comma-separated threat path string
 * @param newPath - New threat path identifier to add
 * @returns Updated comma-separated threat path string
 */
export function addThreatPath(existingPaths: string, newPath: string): string {
  if (!newPath || typeof newPath !== 'string' || newPath.trim().length === 0) {
    return existingPaths || ''
  }
  
  const currentPaths = parseThreatPaths(existingPaths || '')
  const trimmedNewPath = newPath.trim()
  
  // Check if path already exists (case-insensitive)
  const pathExists = currentPaths.some(path => 
    path.toLowerCase() === trimmedNewPath.toLowerCase()
  )
  
  if (!pathExists) {
    currentPaths.push(trimmedNewPath)
  }
  
  return serializeThreatPaths(currentPaths)
}

/**
 * Remove a threat path identifier from an existing threat path string
 * @param existingPaths - Current comma-separated threat path string
 * @param pathToRemove - Threat path identifier to remove
 * @returns Updated comma-separated threat path string
 */
export function removeThreatPath(existingPaths: string, pathToRemove: string): string {
  if (!pathToRemove || typeof pathToRemove !== 'string') {
    return existingPaths || ''
  }
  
  const currentPaths = parseThreatPaths(existingPaths || '')
  const trimmedPathToRemove = pathToRemove.trim()
  
  // Remove path (case-insensitive)
  const filteredPaths = currentPaths.filter(path => 
    path.toLowerCase() !== trimmedPathToRemove.toLowerCase()
  )
  
  return serializeThreatPaths(filteredPaths)
}

/**
 * Check if a threat path identifier exists in a threat path string
 * @param threatPaths - Comma-separated threat path string
 * @param pathToCheck - Threat path identifier to check
 * @returns True if the path exists
 */
export function hasThreatPath(threatPaths: string, pathToCheck: string): boolean {
  if (!pathToCheck || typeof pathToCheck !== 'string') {
    return false
  }
  
  const currentPaths = parseThreatPaths(threatPaths || '')
  const trimmedPathToCheck = pathToCheck.trim()
  
  return currentPaths.some(path => 
    path.toLowerCase() === trimmedPathToCheck.toLowerCase()
  )
}

/**
 * Get all unique threat path identifiers from an array of elements
 * @param elements - Array of nodes or edges with properties
 * @returns Array of unique threat path identifiers
 */
export function getAllThreatPaths(elements: Array<{ properties?: Record<string, any> }>): string[] {
  const allPaths: string[] = []
  
  elements.forEach(element => {
    if (element.properties && element.properties.TC_THREAT_PATH) {
      const paths = parseThreatPaths(element.properties.TC_THREAT_PATH)
      allPaths.push(...paths)
    }
  })
  
  // Remove duplicates and sort
  return [...new Set(allPaths)].sort()
}

/**
 * Clear all threat paths from an element's properties
 * @param properties - Element properties object
 * @returns Updated properties object without TC_THREAT_PATH
 */
export function clearThreatPaths(properties: Record<string, any>): Record<string, any> {
  const updatedProperties = { ...properties }
  delete updatedProperties.TC_THREAT_PATH
  return updatedProperties
}

/**
 * Validate a threat path identifier format
 * @param threatPath - Threat path identifier to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateThreatPath(threatPath: string): { isValid: boolean; error?: string } {
  if (!threatPath || typeof threatPath !== 'string') {
    return { isValid: false, error: 'Threat path must be a non-empty string' }
  }
  
  const trimmed = threatPath.trim()
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Threat path cannot be empty' }
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Threat path must be 100 characters or less' }
  }
  
  // Check for invalid characters (commas are not allowed in individual paths)
  if (trimmed.includes(',')) {
    return { isValid: false, error: 'Individual threat paths cannot contain commas' }
  }
  
  // Recommended format: THREAT-description or similar
  const recommendedPattern = /^[A-Z0-9_-]+$/i
  if (!recommendedPattern.test(trimmed)) {
    return { 
      isValid: true, // Still valid, just not recommended
      error: 'Recommended format: THREAT-description (alphanumeric, hyphens, underscores only)'
    }
  }
  
  return { isValid: true }
}
