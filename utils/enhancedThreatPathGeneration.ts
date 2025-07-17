/**
 * Enhanced Automated Threat Path Generation Algorithms
 * Implements comprehensive cybersecurity attack scenario generation with advanced algorithms
 */

import { 
  ThreatPathScenario, 
  ThreatPathNode, 
  ThreatPathEdge,
  ThreatPathGenerationConfig 
} from '../types/threatPath'

export interface EnhancedThreatPath {
  id: string
  name: string
  description: string
  scenario: string
  path: string[] // Array of node UIDs
  pathDetails: Array<{
    nodeId: string
    nodeName: string
    action: string
    technique: string
    timeEstimate: string
    detectionProbability: number
  }>
  riskScore: number
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  likelihood: number
  impact: number
  mitreTactics: string[]
  mitreTechniques: string[]
  entryPoint: string
  targetAsset: string
  estimatedDwellTime: string
  detectionDifficulty: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard'
  timeline: Array<{
    stage: string
    description: string
    timeframe: string
    indicators: string[]
  }>
  prerequisites: string[]
  businessImpact: {
    confidentiality: 'None' | 'Low' | 'Medium' | 'High'
    integrity: 'None' | 'Low' | 'Medium' | 'High'
    availability: 'None' | 'Low' | 'Medium' | 'High'
    financialImpact: string
    reputationalImpact: string
  }
  createdAt: string
  status: 'Active' | 'Mitigated' | 'Accepted' | 'Under Review'
}

/**
 * Main function to generate comprehensive threat path scenarios
 */
export function generateAutomatedThreatPaths(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig = {}
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  
  // Algorithm 1: Shortest Path Algorithm - Find most direct attack routes
  const shortestPaths = generateShortestPathAttacks(nodes, edges, config)
  scenarios.push(...shortestPaths)
  
  // Algorithm 2: Breadth-First Search - Comprehensive attack enumeration
  const bfsPaths = generateBreadthFirstAttacks(nodes, edges, config)
  scenarios.push(...bfsPaths)
  
  // Algorithm 3: Privilege Escalation Paths - Focus on privilege escalation
  const privEscPaths = generatePrivilegeEscalationAttacks(nodes, edges, config)
  scenarios.push(...privEscPaths)
  
  // Algorithm 4: Lateral Movement Simulation - Network traversal patterns
  const lateralPaths = generateLateralMovementAttacks(nodes, edges, config)
  scenarios.push(...lateralPaths)
  
  // Algorithm 5: Multi-Vector Attack Paths - Complex attack scenarios
  const multiVectorPaths = generateMultiVectorAttacks(nodes, edges, config)
  scenarios.push(...multiVectorPaths)
  
  // Algorithm 6: Time-Based Attack Progression - Realistic attack timelines
  const timeBasedPaths = generateTimeBasedAttacks(nodes, edges, config)
  scenarios.push(...timeBasedPaths)
  
  // Filter and sort by risk score
  return scenarios
    .filter(scenario => scenario.riskScore >= (config.riskThreshold || 0))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, config.maxPathsPerScenario || 20)
}

/**
 * Algorithm 1: Shortest Path Algorithm
 * Finds the most direct attack routes using Dijkstra's algorithm
 */
function generateShortestPathAttacks(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  
  // Identify entry points
  const entryPoints = identifyEntryPoints(nodes, config)
  
  // Identify high-value targets
  const targets = identifyHighValueTargets(nodes, config)
  
  for (const entryPoint of entryPoints.slice(0, 5)) {
    for (const target of targets.slice(0, 5)) {
      const path = dijkstraShortestPath(nodes, edges, entryPoint.uid, target.uid)
      
      if (path && path.length > 1) {
        const scenario = createThreatPathScenario({
          id: `shortest-${entryPoint.uid}-${target.uid}`,
          name: `Direct Attack: ${entryPoint.showname} → ${target.showname}`,
          description: `Most direct attack path from ${entryPoint.showname} to ${target.showname}`,
          scenario: 'External Attacker - Direct Route',
          path,
          nodes,
          edges,
          attackType: 'Direct Attack',
          entryPoint: entryPoint.uid,
          targetAsset: target.uid,
          config
        })
        
        scenarios.push(scenario)
      }
    }
  }
  
  return scenarios
}

/**
 * Algorithm 2: Breadth-First Search
 * Enumerates all possible attack paths within hop limits
 */
function generateBreadthFirstAttacks(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  const entryPoints = identifyEntryPoints(nodes, config)
  const maxHops = config.maxPathLength || 6
  
  for (const entryPoint of entryPoints.slice(0, 3)) {
    const allPaths = breadthFirstSearchPaths(nodes, edges, entryPoint.uid, maxHops)
    
    // Filter paths that reach high-value targets
    const valuablePaths = allPaths.filter(path => {
      const lastNode = nodes.find(n => n.uid === path[path.length - 1])
      return lastNode && (
        lastNode.assetValue === 'Critical' ||
        lastNode.assetValue === 'High' ||
        lastNode.type === 'Database' ||
        lastNode.type === 'Domain Controller'
      )
    })
    
    for (const path of valuablePaths.slice(0, 8)) {
      const targetNode = nodes.find(n => n.uid === path[path.length - 1])!
      
      const scenario = createThreatPathScenario({
        id: `bfs-${entryPoint.uid}-${targetNode.uid}-${path.length}`,
        name: `Multi-Hop Attack: ${entryPoint.showname} → ${targetNode.showname}`,
        description: `${path.length - 1}-hop attack path through network infrastructure`,
        scenario: 'External Attacker - Network Traversal',
        path,
        nodes,
        edges,
        attackType: 'Multi-Hop Attack',
        entryPoint: entryPoint.uid,
        targetAsset: targetNode.uid,
        config
      })
      
      scenarios.push(scenario)
    }
  }
  
  return scenarios
}

/**
 * Algorithm 3: Privilege Escalation Paths
 * Focuses on paths that escalate from low to high privileges
 */
function generatePrivilegeEscalationAttacks(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  
  // Find low-privilege starting points
  const lowPrivNodes = nodes.filter(node => 
    node.privileges?.includes('User') ||
    node.type === 'Workstation' ||
    node.type === 'User Account' ||
    !node.privileges?.some(p => p.includes('Admin'))
  )
  
  // Find high-privilege targets
  const highPrivNodes = nodes.filter(node =>
    node.privileges?.includes('Admin') ||
    node.privileges?.includes('Domain Admin') ||
    node.privileges?.includes('System') ||
    node.type === 'Domain Controller' ||
    node.type === 'Server'
  )
  
  for (const lowPriv of lowPrivNodes.slice(0, 4)) {
    for (const highPriv of highPrivNodes.slice(0, 4)) {
      const path = findPrivilegeEscalationPath(nodes, edges, lowPriv.uid, highPriv.uid)
      
      if (path && path.length > 1) {
        const scenario = createThreatPathScenario({
          id: `privesc-${lowPriv.uid}-${highPriv.uid}`,
          name: `Privilege Escalation: ${lowPriv.showname} → ${highPriv.showname}`,
          description: `Escalation from user-level to administrative privileges`,
          scenario: 'Insider Threat - Privilege Escalation',
          path,
          nodes,
          edges,
          attackType: 'Privilege Escalation',
          entryPoint: lowPriv.uid,
          targetAsset: highPriv.uid,
          config
        })
        
        // Boost risk score for privilege escalation
        scenario.riskScore = Math.min(scenario.riskScore + 2, 10)
        scenario.severity = scenario.riskScore >= 8 ? 'Critical' : scenario.riskScore >= 6 ? 'High' : 'Medium'
        
        scenarios.push(scenario)
      }
    }
  }
  
  return scenarios
}

/**
 * Algorithm 4: Lateral Movement Simulation
 * Simulates how attackers move between network segments
 */
function generateLateralMovementAttacks(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  
  // Group nodes by network segment
  const segments = groupNodesByNetworkSegment(nodes)
  
  // Generate intra-segment movement
  for (const [segmentName, segmentNodes] of Object.entries(segments)) {
    if (segmentNodes.length > 2) {
      const intraPaths = generateIntraSegmentPaths(segmentNodes, edges)
      
      for (const path of intraPaths.slice(0, 3)) {
        const startNode = nodes.find(n => n.uid === path[0])!
        const endNode = nodes.find(n => n.uid === path[path.length - 1])!
        
        const scenario = createThreatPathScenario({
          id: `lateral-intra-${segmentName}-${path[0]}-${path[path.length - 1]}`,
          name: `Lateral Movement within ${segmentName}`,
          description: `Lateral movement from ${startNode.showname} to ${endNode.showname} within ${segmentName} segment`,
          scenario: 'External Attacker - Lateral Movement',
          path,
          nodes,
          edges,
          attackType: 'Lateral Movement',
          entryPoint: path[0],
          targetAsset: path[path.length - 1],
          config
        })
        
        scenarios.push(scenario)
      }
    }
  }
  
  // Generate cross-segment movement
  const segmentNames = Object.keys(segments)
  for (let i = 0; i < segmentNames.length - 1; i++) {
    for (let j = i + 1; j < segmentNames.length; j++) {
      const sourceSegment = segmentNames[i]
      const targetSegment = segmentNames[j]
      
      const crossPaths = generateCrossSegmentPaths(
        segments[sourceSegment],
        segments[targetSegment],
        edges
      )
      
      for (const path of crossPaths.slice(0, 2)) {
        const startNode = nodes.find(n => n.uid === path[0])!
        const endNode = nodes.find(n => n.uid === path[path.length - 1])!
        
        const scenario = createThreatPathScenario({
          id: `lateral-cross-${sourceSegment}-${targetSegment}-${path[0]}`,
          name: `Cross-Segment Attack: ${sourceSegment} → ${targetSegment}`,
          description: `Attack from ${sourceSegment} to ${targetSegment} segment`,
          scenario: 'External Attacker - Network Segmentation Bypass',
          path,
          nodes,
          edges,
          attackType: 'Cross-Segment Movement',
          entryPoint: path[0],
          targetAsset: path[path.length - 1],
          config
        })
        
        // Boost risk score for cross-segment attacks
        scenario.riskScore = Math.min(scenario.riskScore + 1.5, 10)
        
        scenarios.push(scenario)
      }
    }
  }
  
  return scenarios
}

/**
 * Algorithm 5: Multi-Vector Attack Paths
 * Combines multiple attack techniques in complex scenarios
 */
function generateMultiVectorAttacks(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  
  // Scenario 1: Phishing + Lateral Movement + Data Exfiltration
  const phishingTargets = nodes.filter(n => n.type === 'Workstation' || n.type === 'User Account')
  const dataTargets = nodes.filter(n => n.type === 'Database' || n.type === 'File Server')
  
  for (const phishTarget of phishingTargets.slice(0, 3)) {
    for (const dataTarget of dataTargets.slice(0, 3)) {
      const path = dijkstraShortestPath(nodes, edges, phishTarget.uid, dataTarget.uid)
      
      if (path && path.length > 2) {
        const scenario = createAdvancedThreatScenario({
          id: `multi-phish-${phishTarget.uid}-${dataTarget.uid}`,
          name: `Spear Phishing → Data Exfiltration`,
          description: `Multi-stage attack: spear phishing, lateral movement, and data exfiltration`,
          scenario: 'Advanced Persistent Threat - Multi-Vector',
          path,
          nodes,
          edges,
          attackType: 'Multi-Vector Attack',
          entryPoint: phishTarget.uid,
          targetAsset: dataTarget.uid,
          attackerProfile: {
            type: 'APT',
            sophistication: 'High',
            motivation: ['Espionage', 'Financial Gain'],
            capabilities: ['Social Engineering', 'Custom Malware', 'Zero-Day Exploits']
          },
          config
        })
        
        scenarios.push(scenario)
      }
    }
  }
  
  // Scenario 2: Supply Chain + Persistence + Privilege Escalation
  const supplyChainNodes = nodes.filter(n => 
    n.type === 'Software' || 
    n.showname.toLowerCase().includes('update') ||
    n.showname.toLowerCase().includes('vendor')
  )
  
  const criticalAssets = nodes.filter(n => n.assetValue === 'Critical')
  
  for (const supplyNode of supplyChainNodes.slice(0, 2)) {
    for (const criticalAsset of criticalAssets.slice(0, 3)) {
      const path = dijkstraShortestPath(nodes, edges, supplyNode.uid, criticalAsset.uid)
      
      if (path && path.length > 1) {
        const scenario = createAdvancedThreatScenario({
          id: `supply-chain-${supplyNode.uid}-${criticalAsset.uid}`,
          name: `Supply Chain Compromise → Critical Asset`,
          description: `Supply chain attack leading to critical asset compromise`,
          scenario: 'Nation-State Actor - Supply Chain',
          path,
          nodes,
          edges,
          attackType: 'Supply Chain Attack',
          entryPoint: supplyNode.uid,
          targetAsset: criticalAsset.uid,
          attackerProfile: {
            type: 'External',
            sophistication: 'Advanced',
            motivation: ['Espionage', 'Sabotage'],
            capabilities: ['Supply Chain Infiltration', 'Advanced Persistence', 'Steganography']
          },
          config
        })
        
        scenarios.push(scenario)
      }
    }
  }
  
  return scenarios
}

/**
 * Algorithm 6: Time-Based Attack Progression
 * Models realistic attack timelines and progression
 */
function generateTimeBasedAttacks(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  config: ThreatPathGenerationConfig
): ThreatPathScenario[] {
  const scenarios: ThreatPathScenario[] = []
  
  // Fast attacks (< 24 hours)
  const fastAttackPaths = findFastAttackPaths(nodes, edges)
  for (const path of fastAttackPaths.slice(0, 3)) {
    const startNode = nodes.find(n => n.uid === path[0])!
    const endNode = nodes.find(n => n.uid === path[path.length - 1])!
    
    const scenario = createThreatPathScenario({
      id: `fast-attack-${path[0]}-${path[path.length - 1]}`,
      name: `Rapid Attack: ${startNode.showname} → ${endNode.showname}`,
      description: `High-speed attack completed within hours`,
      scenario: 'Opportunistic Attacker - Rapid Exploitation',
      path,
      nodes,
      edges,
      attackType: 'Rapid Attack',
      entryPoint: path[0],
      targetAsset: path[path.length - 1],
      config
    })
    
    scenario.estimatedDwellTime = '< 24 hours'
    scenario.detectionDifficulty = 'Hard'
    
    scenarios.push(scenario)
  }
  
  // Slow and stealthy attacks (weeks to months)
  const stealthyPaths = findStealthyAttackPaths(nodes, edges)
  for (const path of stealthyPaths.slice(0, 3)) {
    const startNode = nodes.find(n => n.uid === path[0])!
    const endNode = nodes.find(n => n.uid === path[path.length - 1])!
    
    const scenario = createThreatPathScenario({
      id: `stealth-attack-${path[0]}-${path[path.length - 1]}`,
      name: `Stealth Campaign: ${startNode.showname} → ${endNode.showname}`,
      description: `Long-term stealthy attack with extended dwell time`,
      scenario: 'Advanced Persistent Threat - Long-Term Campaign',
      path,
      nodes,
      edges,
      attackType: 'Stealth Attack',
      entryPoint: path[0],
      targetAsset: path[path.length - 1],
      config
    })
    
    scenario.estimatedDwellTime = '3-12 months'
    scenario.detectionDifficulty = 'Very Hard'
    
    scenarios.push(scenario)
  }
  
  return scenarios
}

// Helper Functions

function identifyEntryPoints(nodes: ThreatPathNode[], config: ThreatPathGenerationConfig): ThreatPathNode[] {
  return nodes.filter(node => {
    // External-facing services
    if (node.type === 'Web Server' || node.type === 'Email Server' || node.type === 'VPN Gateway') {
      return true
    }
    
    // User endpoints for phishing
    if (config.includeExternalThreats && (node.type === 'Workstation' || node.type === 'User Account')) {
      return true
    }
    
    // Insider threat entry points
    if (config.includeInsiderThreats && node.privileges?.includes('User')) {
      return true
    }
    
    // Nodes with known vulnerabilities
    if (node.vulnerabilities && node.vulnerabilities.length > 0) {
      return true
    }
    
    return false
  })
}

function identifyHighValueTargets(nodes: ThreatPathNode[], config: ThreatPathGenerationConfig): ThreatPathNode[] {
  return nodes.filter(node => {
    // Critical assets
    if (node.assetValue === 'Critical' || node.assetValue === 'High') {
      return true
    }
    
    // Infrastructure targets
    if (node.type === 'Database' || node.type === 'Domain Controller' || node.type === 'File Server') {
      return true
    }
    
    // High-privilege accounts
    if (node.privileges?.some(p => p.includes('Admin'))) {
      return true
    }
    
    // Specific target assets
    if (config.targetSpecificAssets?.includes(node.uid)) {
      return true
    }
    
    return false
  })
}

function dijkstraShortestPath(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  start: string,
  target: string
): string[] | null {
  const distances: { [key: string]: number } = {}
  const previous: { [key: string]: string | null } = {}
  const unvisited = new Set<string>()
  
  // Initialize
  nodes.forEach(node => {
    distances[node.uid] = node.uid === start ? 0 : Infinity
    previous[node.uid] = null
    unvisited.add(node.uid)
  })
  
  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = Array.from(unvisited).reduce((min, node) => 
      distances[node] < distances[min] ? node : min
    )
    
    if (distances[current] === Infinity) break
    if (current === target) break
    
    unvisited.delete(current)
    
    // Check neighbors
    const neighbors = edges.filter(edge => edge.from === current)
    for (const edge of neighbors) {
      if (unvisited.has(edge.to)) {
        const weight = calculateEdgeWeight(edge)
        const alt = distances[current] + weight
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt
          previous[edge.to] = current
        }
      }
    }
  }
  
  // Reconstruct path
  if (distances[target] === Infinity) return null
  
  const path: string[] = []
  let current: string | null = target
  
  while (current !== null) {
    path.unshift(current)
    current = previous[current]
  }
  
  return path
}

function breadthFirstSearchPaths(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  start: string,
  maxHops: number
): string[][] {
  const paths: string[][] = []
  const queue: string[][] = [[start]]
  const visited = new Set<string>()
  
  while (queue.length > 0) {
    const currentPath = queue.shift()!
    const lastNode = currentPath[currentPath.length - 1]
    
    if (currentPath.length > maxHops) continue
    if (visited.has(lastNode)) continue
    
    visited.add(lastNode)
    paths.push([...currentPath])
    
    // Add neighbors
    const neighbors = edges.filter(edge => edge.from === lastNode)
    for (const edge of neighbors) {
      if (!currentPath.includes(edge.to)) {
        queue.push([...currentPath, edge.to])
      }
    }
  }
  
  return paths.filter(path => path.length > 1)
}

function findPrivilegeEscalationPath(
  nodes: ThreatPathNode[],
  edges: ThreatPathEdge[],
  start: string,
  target: string
): string[] | null {
  // Use Dijkstra but prioritize privilege escalation edges
  const privilegeEscalationEdges = edges.map(edge => ({
    ...edge,
    weight: edge.exploitMethod?.includes('Privilege') ? 0.5 : calculateEdgeWeight(edge)
  }))
  
  return dijkstraShortestPath(nodes, privilegeEscalationEdges, start, target)
}

function groupNodesByNetworkSegment(nodes: ThreatPathNode[]): { [segment: string]: ThreatPathNode[] } {
  const segments: { [segment: string]: ThreatPathNode[] } = {}
  
  nodes.forEach(node => {
    const segment = node.networkSegment || node.properties?.CLUSTER || 'Unknown'
    if (!segments[segment]) {
      segments[segment] = []
    }
    segments[segment].push(node)
  })
  
  return segments
}

function generateIntraSegmentPaths(segmentNodes: ThreatPathNode[], edges: ThreatPathEdge[]): string[][] {
  const paths: string[][] = []
  const segmentNodeIds = segmentNodes.map(n => n.uid)
  const segmentEdges = edges.filter(e => 
    segmentNodeIds.includes(e.from) && segmentNodeIds.includes(e.to)
  )
  
  for (let i = 0; i < segmentNodes.length - 1; i++) {
    for (let j = i + 1; j < segmentNodes.length; j++) {
      const path = dijkstraShortestPath(segmentNodes, segmentEdges, segmentNodes[i].uid, segmentNodes[j].uid)
      if (path && path.length > 1) {
        paths.push(path)
      }
    }
  }
  
  return paths
}

function generateCrossSegmentPaths(
  sourceNodes: ThreatPathNode[],
  targetNodes: ThreatPathNode[],
  edges: ThreatPathEdge[]
): string[][] {
  const paths: string[][] = []
  const allNodes = [...sourceNodes, ...targetNodes]
  
  for (const source of sourceNodes.slice(0, 2)) {
    for (const target of targetNodes.slice(0, 2)) {
      const path = dijkstraShortestPath(allNodes, edges, source.uid, target.uid)
      if (path && path.length > 1) {
        paths.push(path)
      }
    }
  }
  
  return paths
}

function findFastAttackPaths(nodes: ThreatPathNode[], edges: ThreatPathEdge[]): string[][] {
  // Find paths with low-difficulty edges and vulnerable nodes
  const fastPaths: string[][] = []
  const vulnerableNodes = nodes.filter(n => n.vulnerabilities && n.vulnerabilities.length > 0)
  const easyEdges = edges.filter(e => e.difficulty === 'Low')
  
  for (const vulnNode of vulnerableNodes.slice(0, 5)) {
    const reachableNodes = breadthFirstSearchPaths(nodes, easyEdges, vulnNode.uid, 3)
    fastPaths.push(...reachableNodes.filter(path => path.length <= 3))
  }
  
  return fastPaths
}

function findStealthyAttackPaths(nodes: ThreatPathNode[], edges: ThreatPathEdge[]): string[][] {
  // Find longer paths that avoid high-security nodes
  const stealthyPaths: string[][] = []
  const lowSecurityNodes = nodes.filter(n => 
    !n.securityControls || n.securityControls.length === 0
  )
  
  for (const startNode of lowSecurityNodes.slice(0, 3)) {
    const longPaths = breadthFirstSearchPaths(nodes, edges, startNode.uid, 6)
    stealthyPaths.push(...longPaths.filter(path => path.length >= 4))
  }
  
  return stealthyPaths
}

function calculateEdgeWeight(edge: ThreatPathEdge): number {
  const difficultyWeights = { Low: 1, Medium: 2, High: 3 }
  return difficultyWeights[edge.difficulty || 'Medium']
}

function createThreatPathScenario(params: {
  id: string
  name: string
  description: string
  scenario: string
  path: string[]
  nodes: ThreatPathNode[]
  edges: ThreatPathEdge[]
  attackType: string
  entryPoint: string
  targetAsset: string
  config: ThreatPathGenerationConfig
}): ThreatPathScenario {
  const { id, name, description, scenario, path, nodes, edges, attackType, entryPoint, targetAsset, config } = params
  
  const pathDetails = path.map((nodeId, index) => {
    const node = nodes.find(n => n.uid === nodeId)!
    return {
      nodeId,
      nodeName: node.showname,
      action: generateActionForNode(node, index, path.length),
      technique: generateMitreTechnique(node, index),
      timeEstimate: generateTimeEstimate(index, attackType),
      detectionProbability: calculateDetectionProbability(node, index)
    }
  })
  
  const riskScore = calculatePathRiskScore(path, nodes, edges)
  const severity = riskScore >= 8 ? 'Critical' : riskScore >= 6 ? 'High' : riskScore >= 4 ? 'Medium' : 'Low'
  
  return {
    id,
    name,
    description,
    scenario,
    attackerProfile: {
      type: scenario.includes('Insider') ? 'Insider' : 'External',
      sophistication: attackType.includes('Multi') ? 'High' : 'Medium',
      motivation: ['Financial Gain', 'Data Theft'],
      capabilities: ['Network Reconnaissance', 'Exploitation', 'Lateral Movement']
    },
    path,
    pathDetails,
    riskScore,
    severity,
    likelihood: calculateLikelihood(path, nodes, edges),
    impact: calculateImpact(targetAsset, nodes),
    mitreTactics: generateMitreTactics(path.length, attackType),
    mitreTechniques: pathDetails.map(pd => pd.technique),
    entryPoint,
    targetAsset,
    estimatedDwellTime: estimateDwellTime(path.length, attackType),
    detectionDifficulty: calculateDetectionDifficulty(path, nodes),
    timeline: generateAttackTimeline(pathDetails, attackType),
    prerequisites: generatePrerequisites(path, nodes, edges),
    businessImpact: calculateBusinessImpact(targetAsset, nodes),
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'Active'
  }
}

function createAdvancedThreatScenario(params: {
  id: string
  name: string
  description: string
  scenario: string
  path: string[]
  nodes: ThreatPathNode[]
  edges: ThreatPathEdge[]
  attackType: string
  entryPoint: string
  targetAsset: string
  attackerProfile: any
  config: ThreatPathGenerationConfig
}): ThreatPathScenario {
  const baseScenario = createThreatPathScenario(params)
  
  // Enhance with advanced attacker profile
  baseScenario.attackerProfile = params.attackerProfile
  
  // Boost risk score for advanced threats
  baseScenario.riskScore = Math.min(baseScenario.riskScore + 1, 10)
  baseScenario.severity = baseScenario.riskScore >= 8 ? 'Critical' : baseScenario.riskScore >= 6 ? 'High' : 'Medium'
  
  // Extended timeline for advanced threats
  baseScenario.estimatedDwellTime = '2-6 months'
  baseScenario.detectionDifficulty = 'Very Hard'
  
  return baseScenario
}

// Additional helper functions for scenario creation
function generateActionForNode(node: ThreatPathNode, index: number, pathLength: number): string {
  if (index === 0) return 'Initial Access'
  if (index === pathLength - 1) return 'Target Compromise'
  
  const actions = [
    'Lateral Movement',
    'Privilege Escalation',
    'Credential Harvesting',
    'System Enumeration',
    'Network Discovery'
  ]
  
  return actions[index % actions.length]
}

function generateMitreTechnique(node: ThreatPathNode, index: number): string {
  const techniques = [
    'T1190 - Exploit Public-Facing Application',
    'T1021 - Remote Services',
    'T1548 - Abuse Elevation Control Mechanism',
    'T1555 - Credentials from Password Stores',
    'T1018 - Remote System Discovery'
  ]
  
  return techniques[index % techniques.length]
}

function generateTimeEstimate(index: number, attackType: string): string {
  const baseTime = index === 0 ? '1-4 hours' : '2-8 hours'
  
  if (attackType.includes('Rapid')) return '15-60 minutes'
  if (attackType.includes('Stealth')) return '1-7 days'
  
  return baseTime
}

function calculateDetectionProbability(node: ThreatPathNode, index: number): number {
  let probability = 0.3 // Base 30% detection probability
  
  if (node.securityControls && node.securityControls.length > 0) {
    probability += 0.2 * node.securityControls.length
  }
  
  if (node.type === 'Domain Controller' || node.assetValue === 'Critical') {
    probability += 0.3
  }
  
  return Math.min(probability, 0.9) // Max 90% detection probability
}

function calculatePathRiskScore(path: string[], nodes: ThreatPathNode[], edges: ThreatPathEdge[]): number {
  let score = 5 // Base score
  
  // Path length factor (shorter paths are riskier)
  score += Math.max(5 - path.length, 0)
  
  // Node risk factors
  const avgNodeRisk = path.reduce((sum, nodeId) => {
    const node = nodes.find(n => n.uid === nodeId)
    return sum + (node?.riskScore || 5)
  }, 0) / path.length
  
  score += avgNodeRisk / 2
  
  // Target asset value
  const targetNode = nodes.find(n => n.uid === path[path.length - 1])
  if (targetNode?.assetValue === 'Critical') score += 2
  if (targetNode?.assetValue === 'High') score += 1
  
  return Math.min(Math.round(score * 10) / 10, 10)
}

function calculateLikelihood(path: string[], nodes: ThreatPathNode[], edges: ThreatPathEdge[]): number {
  // Calculate based on vulnerabilities, security controls, and path complexity
  let likelihood = 0.5 // Base 50%
  
  const vulnerableNodes = path.filter(nodeId => {
    const node = nodes.find(n => n.uid === nodeId)
    return node?.vulnerabilities && node.vulnerabilities.length > 0
  })
  
  likelihood += (vulnerableNodes.length / path.length) * 0.3
  
  return Math.min(likelihood, 0.95)
}

function calculateImpact(targetAssetId: string, nodes: ThreatPathNode[]): number {
  const targetNode = nodes.find(n => n.uid === targetAssetId)
  
  if (!targetNode) return 5
  
  const assetValueScores = { Critical: 10, High: 8, Medium: 6, Low: 4 }
  return assetValueScores[targetNode.assetValue || 'Medium']
}

function generateMitreTactics(pathLength: number, attackType: string): string[] {
  const tactics = ['Initial Access']
  
  if (pathLength > 2) tactics.push('Lateral Movement')
  if (attackType.includes('Privilege')) tactics.push('Privilege Escalation')
  if (pathLength > 3) tactics.push('Persistence')
  if (attackType.includes('Data') || attackType.includes('Exfiltration')) tactics.push('Exfiltration')
  
  return tactics
}

function estimateDwellTime(pathLength: number, attackType: string): string {
  if (attackType.includes('Rapid')) return '< 24 hours'
  if (attackType.includes('Stealth')) return '3-12 months'
  if (pathLength <= 2) return '1-7 days'
  if (pathLength <= 4) return '1-4 weeks'
  return '1-3 months'
}

function calculateDetectionDifficulty(path: string[], nodes: ThreatPathNode[]): 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' {
  const avgSecurityControls = path.reduce((sum, nodeId) => {
    const node = nodes.find(n => n.uid === nodeId)
    return sum + (node?.securityControls?.length || 0)
  }, 0) / path.length
  
  if (avgSecurityControls >= 3) return 'Very Easy'
  if (avgSecurityControls >= 2) return 'Easy'
  if (avgSecurityControls >= 1) return 'Medium'
  if (path.length <= 3) return 'Hard'
  return 'Very Hard'
}

function generateAttackTimeline(pathDetails: any[], attackType: string): any[] {
  return [
    {
      stage: 'Initial Compromise',
      description: pathDetails[0]?.action || 'Initial access gained',
      timeframe: '0-4 hours',
      indicators: ['Unusual login activity', 'New process execution']
    },
    {
      stage: 'Lateral Movement',
      description: 'Moving through network infrastructure',
      timeframe: '4-24 hours',
      indicators: ['Network scanning', 'Credential dumping', 'Remote connections']
    },
    {
      stage: 'Target Compromise',
      description: pathDetails[pathDetails.length - 1]?.action || 'Target asset compromised',
      timeframe: '1-7 days',
      indicators: ['Data access', 'Privilege escalation', 'Persistence mechanisms']
    }
  ]
}

function generatePrerequisites(path: string[], nodes: ThreatPathNode[], edges: ThreatPathEdge[]): string[] {
  const prerequisites = ['Network connectivity']
  
  const hasVulnerableNodes = path.some(nodeId => {
    const node = nodes.find(n => n.uid === nodeId)
    return node?.vulnerabilities && node.vulnerabilities.length > 0
  })
  
  if (hasVulnerableNodes) prerequisites.push('Unpatched vulnerabilities')
  
  const hasUserNodes = path.some(nodeId => {
    const node = nodes.find(n => n.uid === nodeId)
    return node?.type === 'User Account' || node?.type === 'Workstation'
  })
  
  if (hasUserNodes) prerequisites.push('User interaction or social engineering')
  
  return prerequisites
}

function calculateBusinessImpact(targetAssetId: string, nodes: ThreatPathNode[]): any {
  const targetNode = nodes.find(n => n.uid === targetAssetId)
  
  if (!targetNode) {
    return {
      confidentiality: 'Medium',
      integrity: 'Medium',
      availability: 'Medium',
      financialImpact: '$10,000 - $100,000',
      reputationalImpact: 'Moderate damage to reputation'
    }
  }
  
  if (targetNode.assetValue === 'Critical') {
    return {
      confidentiality: 'High',
      integrity: 'High',
      availability: 'High',
      financialImpact: '$1,000,000+',
      reputationalImpact: 'Severe damage to reputation and customer trust'
    }
  }
  
  if (targetNode.assetValue === 'High') {
    return {
      confidentiality: 'High',
      integrity: 'Medium',
      availability: 'Medium',
      financialImpact: '$100,000 - $1,000,000',
      reputationalImpact: 'Significant damage to reputation'
    }
  }
  
  return {
    confidentiality: 'Medium',
    integrity: 'Low',
    availability: 'Low',
    financialImpact: '$10,000 - $100,000',
    reputationalImpact: 'Minor damage to reputation'
  }
}

