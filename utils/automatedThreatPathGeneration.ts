/**
 * Automated Threat Path Generation Algorithms
 * Implements sophisticated cybersecurity attack scenario generation
 */

export interface ThreatNode {
  uid: string
  type: string
  showname: string
  properties: Record<string, any>
  riskScore?: number
  vulnerabilities?: string[]
  privileges?: string[]
  networkSegment?: string
}

export interface ThreatEdge {
  from: string
  to: string
  type: string
  properties: Record<string, any>
  exploitMethod?: string
  difficulty?: 'Low' | 'Medium' | 'High'
  prerequisites?: string[]
}

export interface ThreatPath {
  id: string
  name: string
  description: string
  nodes: string[]
  edges: Array<{ from: string; to: string }>
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  attackType: string
  estimatedTime: string
  mitreTactics: string[]
  riskScore: number
}

export interface ThreatScenario {
  id: string
  name: string
  description: string
  attackerProfile: string
  entryPoints: string[]
  targets: string[]
  paths: ThreatPath[]
  timeline: Array<{
    stage: string
    description: string
    duration: string
    techniques: string[]
  }>
}

/**
 * Shortest Path Algorithm for direct attack routes
 */
export function generateShortestAttackPaths(
  nodes: ThreatNode[],
  edges: ThreatEdge[],
  startNodes: string[],
  targetNodes: string[]
): ThreatPath[] {
  const paths: ThreatPath[] = []
  
  for (const start of startNodes) {
    for (const target of targetNodes) {
      const path = findShortestPath(nodes, edges, start, target)
      if (path) {
        paths.push({
          id: `shortest-${start}-${target}`,
          name: `Direct Attack: ${getNodeName(nodes, start)} → ${getNodeName(nodes, target)}`,
          description: `Most direct attack path from ${getNodeName(nodes, start)} to ${getNodeName(nodes, target)}`,
          nodes: path.nodes,
          edges: path.edges,
          severity: calculatePathSeverity(nodes, path.nodes),
          attackType: 'Direct Attack',
          estimatedTime: estimateAttackTime(path.nodes.length),
          mitreTactics: ['Initial Access', 'Lateral Movement', 'Exfiltration'],
          riskScore: calculateRiskScore(nodes, edges, path.nodes, path.edges)
        })
      }
    }
  }
  
  return paths
}

/**
 * Breadth-First Search for comprehensive attack enumeration
 */
export function generateBreadthFirstAttackPaths(
  nodes: ThreatNode[],
  edges: ThreatEdge[],
  startNodes: string[],
  maxHops: number = 5
): ThreatPath[] {
  const paths: ThreatPath[] = []
  
  for (const start of startNodes) {
    const discoveredPaths = breadthFirstSearch(nodes, edges, start, maxHops)
    
    discoveredPaths.forEach((path, index) => {
      if (path.nodes.length > 1) {
        const targetNode = path.nodes[path.nodes.length - 1]
        paths.push({
          id: `bfs-${start}-${targetNode}-${index}`,
          name: `Attack Route ${index + 1}: ${getNodeName(nodes, start)} → ${getNodeName(nodes, targetNode)}`,
          description: `Alternative attack path with ${path.nodes.length - 1} hops`,
          nodes: path.nodes,
          edges: path.edges,
          severity: calculatePathSeverity(nodes, path.nodes),
          attackType: 'Multi-hop Attack',
          estimatedTime: estimateAttackTime(path.nodes.length),
          mitreTactics: generateMitreTactics(path.nodes.length),
          riskScore: calculateRiskScore(nodes, edges, path.nodes, path.edges)
        })
      }
    })
  }
  
  return paths.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10) // Top 10 paths
}

/**
 * Privilege Escalation Path Detection
 */
export function generatePrivilegeEscalationPaths(
  nodes: ThreatNode[],
  edges: ThreatEdge[]
): ThreatPath[] {
  const paths: ThreatPath[] = []
  
  // Find low-privilege entry points
  const lowPrivilegeNodes = nodes.filter(node => 
    node.privileges?.includes('User') || 
    node.type === 'Workstation' ||
    node.type === 'User Account'
  )
  
  // Find high-value targets
  const highValueTargets = nodes.filter(node =>
    node.privileges?.includes('Admin') ||
    node.privileges?.includes('Domain Admin') ||
    node.type === 'Domain Controller' ||
    node.type === 'Server' ||
    node.riskScore && node.riskScore > 8
  )
  
  for (const lowPriv of lowPrivilegeNodes) {
    for (const highValue of highValueTargets) {
      const path = findPrivilegeEscalationPath(nodes, edges, lowPriv.uid, highValue.uid)
      if (path) {
        paths.push({
          id: `privesc-${lowPriv.uid}-${highValue.uid}`,
          name: `Privilege Escalation: ${lowPriv.showname} → ${highValue.showname}`,
          description: `Escalation from ${lowPriv.privileges?.[0] || 'User'} to ${highValue.privileges?.[0] || 'Admin'} privileges`,
          nodes: path.nodes,
          edges: path.edges,
          severity: 'High' as const,
          attackType: 'Privilege Escalation',
          estimatedTime: estimateAttackTime(path.nodes.length, 'privilege_escalation'),
          mitreTactics: ['Initial Access', 'Privilege Escalation', 'Persistence'],
          riskScore: calculateRiskScore(nodes, edges, path.nodes, path.edges) + 2 // Bonus for privilege escalation
        })
      }
    }
  }
  
  return paths.sort((a, b) => b.riskScore - a.riskScore).slice(0, 8)
}

/**
 * Lateral Movement Simulation
 */
export function generateLateralMovementPaths(
  nodes: ThreatNode[],
  edges: ThreatEdge[]
): ThreatPath[] {
  const paths: ThreatPath[] = []
  
  // Group nodes by network segment
  const segments = groupNodesBySegment(nodes)
  
  for (const [segmentName, segmentNodes] of Object.entries(segments)) {
    if (segmentNodes.length > 1) {
      // Generate lateral movement within segment
      const intraSegmentPaths = generateIntraSegmentMovement(segmentNodes, edges)
      paths.push(...intraSegmentPaths)
    }
    
    // Generate cross-segment movement
    for (const [otherSegment, otherNodes] of Object.entries(segments)) {
      if (segmentName !== otherSegment) {
        const crossSegmentPaths = generateCrossSegmentMovement(
          segmentNodes, 
          otherNodes, 
          edges,
          segmentName,
          otherSegment
        )
        paths.push(...crossSegmentPaths)
      }
    }
  }
  
  return paths.sort((a, b) => b.riskScore - a.riskScore).slice(0, 12)
}

/**
 * Mock Scenario Generation
 */
export function generateMockThreatScenarios(
  nodes: ThreatNode[],
  edges: ThreatEdge[]
): ThreatScenario[] {
  const scenarios: ThreatScenario[] = []
  
  // External Attacker Scenarios
  scenarios.push(generateExternalAttackerScenario(nodes, edges))
  scenarios.push(generatePhishingScenario(nodes, edges))
  scenarios.push(generateVulnerabilityExploitationScenario(nodes, edges))
  
  // Insider Threat Scenarios
  scenarios.push(generateMaliciousInsiderScenario(nodes, edges))
  scenarios.push(generateCompromisedCredentialsScenario(nodes, edges))
  
  // Advanced Persistent Threat Scenarios
  scenarios.push(generateAPTScenario(nodes, edges))
  scenarios.push(generateSupplyChainScenario(nodes, edges))
  
  return scenarios
}

// Helper Functions

function findShortestPath(
  nodes: ThreatNode[],
  edges: ThreatEdge[],
  start: string,
  target: string
): { nodes: string[]; edges: Array<{ from: string; to: string }> } | null {
  // Dijkstra's algorithm implementation for shortest path
  const distances: { [key: string]: number } = {}
  const previous: { [key: string]: string | null } = {}
  const unvisited = new Set<string>()
  
  // Initialize distances
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
        const alt = distances[current] + getEdgeWeight(edge)
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt
          previous[edge.to] = current
        }
      }
    }
  }
  
  // Reconstruct path
  if (distances[target] === Infinity) return null
  
  const pathNodes: string[] = []
  const pathEdges: Array<{ from: string; to: string }> = []
  let current: string | null = target
  
  while (current !== null) {
    pathNodes.unshift(current)
    const previousNode: string | null = previous[current]
    if (previousNode !== null) {
      pathEdges.unshift({ from: previousNode, to: current })
    }
    current = previousNode
  }
  
  return { nodes: pathNodes, edges: pathEdges }
}

function breadthFirstSearch(
  nodes: ThreatNode[],
  edges: ThreatEdge[],
  start: string,
  maxHops: number
): Array<{ nodes: string[]; edges: Array<{ from: string; to: string }> }> {
  const paths: Array<{ nodes: string[]; edges: Array<{ from: string; to: string }> }> = []
  const queue: Array<{ path: string[]; edges: Array<{ from: string; to: string }> }> = [
    { path: [start], edges: [] }
  ]
  const visited = new Set<string>()
  
  while (queue.length > 0) {
    const current = queue.shift()!
    const lastNode = current.path[current.path.length - 1]
    
    if (current.path.length > maxHops) continue
    if (visited.has(lastNode)) continue
    
    visited.add(lastNode)
    paths.push({ nodes: [...current.path], edges: [...current.edges] })
    
    // Add neighbors to queue
    const neighbors = edges.filter(edge => edge.from === lastNode)
    for (const edge of neighbors) {
      if (!current.path.includes(edge.to)) {
        queue.push({
          path: [...current.path, edge.to],
          edges: [...current.edges, { from: edge.from, to: edge.to }]
        })
      }
    }
  }
  
  return paths
}

function findPrivilegeEscalationPath(
  nodes: ThreatNode[],
  edges: ThreatEdge[],
  start: string,
  target: string
): { nodes: string[]; edges: Array<{ from: string; to: string }> } | null {
  // Similar to shortest path but prioritizes privilege escalation edges
  return findShortestPath(nodes, edges, start, target)
}

function groupNodesBySegment(nodes: ThreatNode[]): { [segment: string]: ThreatNode[] } {
  const segments: { [segment: string]: ThreatNode[] } = {}
  
  nodes.forEach(node => {
    const segment = node.networkSegment || node.properties?.CLUSTER || 'Unknown'
    if (!segments[segment]) {
      segments[segment] = []
    }
    segments[segment].push(node)
  })
  
  return segments
}

function generateIntraSegmentMovement(
  segmentNodes: ThreatNode[],
  edges: ThreatEdge[]
): ThreatPath[] {
  const paths: ThreatPath[] = []
  
  for (let i = 0; i < segmentNodes.length - 1; i++) {
    for (let j = i + 1; j < segmentNodes.length; j++) {
      const path = findShortestPath(
        segmentNodes,
        edges.filter(e => 
          segmentNodes.some(n => n.uid === e.from) && 
          segmentNodes.some(n => n.uid === e.to)
        ),
        segmentNodes[i].uid,
        segmentNodes[j].uid
      )
      
      if (path) {
        paths.push({
          id: `lateral-intra-${segmentNodes[i].uid}-${segmentNodes[j].uid}`,
          name: `Lateral Movement: ${segmentNodes[i].showname} → ${segmentNodes[j].showname}`,
          description: `Lateral movement within ${segmentNodes[i].networkSegment || 'network segment'}`,
          nodes: path.nodes,
          edges: path.edges,
          severity: 'Medium' as const,
          attackType: 'Lateral Movement',
          estimatedTime: estimateAttackTime(path.nodes.length, 'lateral_movement'),
          mitreTactics: ['Lateral Movement', 'Discovery'],
          riskScore: calculateRiskScore(segmentNodes, edges, path.nodes, path.edges)
        })
      }
    }
  }
  
  return paths
}

function generateCrossSegmentMovement(
  sourceNodes: ThreatNode[],
  targetNodes: ThreatNode[],
  edges: ThreatEdge[],
  sourceSegment: string,
  targetSegment: string
): ThreatPath[] {
  const paths: ThreatPath[] = []
  
  for (const source of sourceNodes.slice(0, 3)) { // Limit to prevent explosion
    for (const target of targetNodes.slice(0, 3)) {
      const allNodes = [...sourceNodes, ...targetNodes]
      const path = findShortestPath(allNodes, edges, source.uid, target.uid)
      
      if (path) {
        paths.push({
          id: `lateral-cross-${source.uid}-${target.uid}`,
          name: `Cross-Segment Attack: ${sourceSegment} → ${targetSegment}`,
          description: `Attack from ${sourceSegment} to ${targetSegment} segment`,
          nodes: path.nodes,
          edges: path.edges,
          severity: 'High' as const,
          attackType: 'Cross-Segment Movement',
          estimatedTime: estimateAttackTime(path.nodes.length, 'cross_segment'),
          mitreTactics: ['Lateral Movement', 'Discovery', 'Collection'],
          riskScore: calculateRiskScore(allNodes, edges, path.nodes, path.edges) + 1.5
        })
      }
    }
  }
  
  return paths
}

function generateExternalAttackerScenario(
  nodes: ThreatNode[],
  edges: ThreatEdge[]
): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.type === 'Web Server' || 
    node.type === 'Email Server' ||
    node.type === 'VPN Gateway' ||
    node.showname.toLowerCase().includes('external')
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'Database' ||
    node.type === 'Domain Controller' ||
    node.riskScore && node.riskScore > 8
  ).map(n => n.uid)
  
  const paths = generateShortestAttackPaths(nodes, edges, entryPoints, targets)
  
  return {
    id: 'external-attacker-001',
    name: 'External Attacker - Web Application Exploitation',
    description: 'External threat actor exploiting web application vulnerabilities to gain initial access and move laterally to high-value targets',
    attackerProfile: 'External Cybercriminal Group',
    entryPoints,
    targets,
    paths: paths.slice(0, 5),
    timeline: [
      {
        stage: 'Reconnaissance',
        description: 'Scanning for vulnerabilities and gathering intelligence',
        duration: '2-7 days',
        techniques: ['T1595 - Active Scanning', 'T1590 - Gather Victim Network Information']
      },
      {
        stage: 'Initial Access',
        description: 'Exploiting web application vulnerability',
        duration: '1-3 hours',
        techniques: ['T1190 - Exploit Public-Facing Application']
      },
      {
        stage: 'Persistence',
        description: 'Establishing persistent access mechanisms',
        duration: '30 minutes - 2 hours',
        techniques: ['T1505 - Server Software Component', 'T1053 - Scheduled Task/Job']
      },
      {
        stage: 'Lateral Movement',
        description: 'Moving through the network to reach high-value targets',
        duration: '2-8 hours',
        techniques: ['T1021 - Remote Services', 'T1550 - Use Alternate Authentication Material']
      }
    ]
  }
}

function generatePhishingScenario(nodes: ThreatNode[], edges: ThreatEdge[]): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.type === 'Workstation' || 
    node.type === 'User Account'
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'File Server' ||
    node.type === 'Email Server' ||
    node.showname.toLowerCase().includes('sensitive')
  ).map(n => n.uid)
  
  const paths = generateShortestAttackPaths(nodes, edges, entryPoints, targets)
  
  return {
    id: 'phishing-001',
    name: 'Spear Phishing Campaign',
    description: 'Targeted phishing attack against employees to steal credentials and access sensitive data',
    attackerProfile: 'Advanced Persistent Threat (APT)',
    entryPoints,
    targets,
    paths: paths.slice(0, 4),
    timeline: [
      {
        stage: 'Target Selection',
        description: 'Identifying high-value employees through social media reconnaissance',
        duration: '1-2 weeks',
        techniques: ['T1589 - Gather Victim Identity Information']
      },
      {
        stage: 'Phishing Delivery',
        description: 'Sending convincing phishing emails with malicious attachments',
        duration: '1-3 days',
        techniques: ['T1566.001 - Spearphishing Attachment']
      },
      {
        stage: 'Credential Harvesting',
        description: 'Capturing user credentials through fake login pages',
        duration: '1-6 hours',
        techniques: ['T1056 - Input Capture', 'T1555 - Credentials from Password Stores']
      },
      {
        stage: 'Data Exfiltration',
        description: 'Accessing and exfiltrating sensitive company data',
        duration: '2-12 hours',
        techniques: ['T1041 - Exfiltration Over C2 Channel']
      }
    ]
  }
}

function generateVulnerabilityExploitationScenario(nodes: ThreatNode[], edges: ThreatEdge[]): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.vulnerabilities && node.vulnerabilities.length > 0
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'Database' ||
    node.type === 'Domain Controller'
  ).map(n => n.uid)
  
  const paths = generateShortestAttackPaths(nodes, edges, entryPoints, targets)
  
  return {
    id: 'vuln-exploit-001',
    name: 'Unpatched Vulnerability Exploitation',
    description: 'Exploitation of known vulnerabilities in unpatched systems to gain unauthorized access',
    attackerProfile: 'Opportunistic Attacker',
    entryPoints,
    targets,
    paths: paths.slice(0, 3),
    timeline: [
      {
        stage: 'Vulnerability Discovery',
        description: 'Automated scanning for known vulnerabilities',
        duration: '1-4 hours',
        techniques: ['T1595.002 - Vulnerability Scanning']
      },
      {
        stage: 'Exploit Development',
        description: 'Adapting existing exploits for target environment',
        duration: '2-24 hours',
        techniques: ['T1203 - Exploitation for Client Execution']
      },
      {
        stage: 'System Compromise',
        description: 'Successfully exploiting vulnerability to gain system access',
        duration: '15 minutes - 2 hours',
        techniques: ['T1068 - Exploitation for Privilege Escalation']
      }
    ]
  }
}

function generateMaliciousInsiderScenario(nodes: ThreatNode[], edges: ThreatEdge[]): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.type === 'User Account' ||
    (node.privileges && node.privileges.includes('User'))
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'File Server' ||
    node.type === 'Database' ||
    node.showname.toLowerCase().includes('financial')
  ).map(n => n.uid)
  
  const paths = generatePrivilegeEscalationPaths(nodes, edges)
  
  return {
    id: 'insider-threat-001',
    name: 'Malicious Insider - Data Theft',
    description: 'Disgruntled employee with legitimate access attempting to steal sensitive company data',
    attackerProfile: 'Malicious Insider',
    entryPoints,
    targets,
    paths: paths.slice(0, 4),
    timeline: [
      {
        stage: 'Access Abuse',
        description: 'Using legitimate credentials to access unauthorized data',
        duration: '1-7 days',
        techniques: ['T1078 - Valid Accounts']
      },
      {
        stage: 'Privilege Escalation',
        description: 'Attempting to gain higher-level access through various means',
        duration: '2-14 days',
        techniques: ['T1548 - Abuse Elevation Control Mechanism']
      },
      {
        stage: 'Data Collection',
        description: 'Systematically collecting sensitive information',
        duration: '1-30 days',
        techniques: ['T1005 - Data from Local System', 'T1039 - Data from Network Shared Drive']
      }
    ]
  }
}

function generateCompromisedCredentialsScenario(nodes: ThreatNode[], edges: ThreatEdge[]): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.type === 'User Account' ||
    node.type === 'Service Account'
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'Domain Controller' ||
    node.privileges?.includes('Admin')
  ).map(n => n.uid)
  
  const paths = generatePrivilegeEscalationPaths(nodes, edges)
  
  return {
    id: 'compromised-creds-001',
    name: 'Compromised Credentials Attack',
    description: 'Attack using stolen or compromised user credentials to access systems and escalate privileges',
    attackerProfile: 'External Threat Actor',
    entryPoints,
    targets,
    paths: paths.slice(0, 3),
    timeline: [
      {
        stage: 'Credential Acquisition',
        description: 'Obtaining credentials through various means',
        duration: '1-7 days',
        techniques: ['T1110 - Brute Force', 'T1555 - Credentials from Password Stores']
      },
      {
        stage: 'Initial Access',
        description: 'Using compromised credentials to gain initial system access',
        duration: '1-4 hours',
        techniques: ['T1078 - Valid Accounts']
      },
      {
        stage: 'Privilege Escalation',
        description: 'Escalating privileges to gain administrative access',
        duration: '2-8 hours',
        techniques: ['T1134 - Access Token Manipulation']
      }
    ]
  }
}

function generateAPTScenario(nodes: ThreatNode[], edges: ThreatEdge[]): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.type === 'Web Server' ||
    node.type === 'Email Server' ||
    node.type === 'Workstation'
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'Database' ||
    node.type === 'Domain Controller' ||
    node.showname.toLowerCase().includes('intellectual')
  ).map(n => n.uid)
  
  const paths = generateBreadthFirstAttackPaths(nodes, edges, entryPoints, 6)
  
  return {
    id: 'apt-001',
    name: 'Advanced Persistent Threat Campaign',
    description: 'Sophisticated multi-stage attack by nation-state actors targeting intellectual property and sensitive data',
    attackerProfile: 'Nation-State APT Group',
    entryPoints,
    targets,
    paths: paths.slice(0, 6),
    timeline: [
      {
        stage: 'Reconnaissance',
        description: 'Extensive intelligence gathering and target profiling',
        duration: '2-12 weeks',
        techniques: ['T1595 - Active Scanning', 'T1589 - Gather Victim Identity Information']
      },
      {
        stage: 'Initial Compromise',
        description: 'Gaining initial foothold through spear phishing or watering hole attacks',
        duration: '1-4 weeks',
        techniques: ['T1566 - Phishing', 'T1189 - Drive-by Compromise']
      },
      {
        stage: 'Establish Persistence',
        description: 'Installing backdoors and maintaining long-term access',
        duration: '1-2 weeks',
        techniques: ['T1547 - Boot or Logon Autostart Execution', 'T1505 - Server Software Component']
      },
      {
        stage: 'Lateral Movement',
        description: 'Moving through the network to reach high-value targets',
        duration: '2-8 weeks',
        techniques: ['T1021 - Remote Services', 'T1550 - Use Alternate Authentication Material']
      },
      {
        stage: 'Data Exfiltration',
        description: 'Systematically stealing intellectual property and sensitive data',
        duration: '4-24 weeks',
        techniques: ['T1041 - Exfiltration Over C2 Channel', 'T1567 - Exfiltration Over Web Service']
      }
    ]
  }
}

function generateSupplyChainScenario(nodes: ThreatNode[], edges: ThreatEdge[]): ThreatScenario {
  const entryPoints = nodes.filter(node => 
    node.type === 'Software' ||
    node.type === 'Update Server' ||
    node.showname.toLowerCase().includes('vendor')
  ).map(n => n.uid)
  
  const targets = nodes.filter(node =>
    node.type === 'Server' ||
    node.type === 'Workstation'
  ).map(n => n.uid)
  
  const paths = generateBreadthFirstAttackPaths(nodes, edges, entryPoints, 4)
  
  return {
    id: 'supply-chain-001',
    name: 'Supply Chain Compromise',
    description: 'Attack through compromised software updates or third-party vendors to access target networks',
    attackerProfile: 'Advanced Threat Actor',
    entryPoints,
    targets,
    paths: paths.slice(0, 4),
    timeline: [
      {
        stage: 'Vendor Compromise',
        description: 'Compromising trusted third-party software vendor',
        duration: '4-16 weeks',
        techniques: ['T1195 - Supply Chain Compromise']
      },
      {
        stage: 'Malicious Update',
        description: 'Injecting malicious code into legitimate software updates',
        duration: '2-8 weeks',
        techniques: ['T1195.002 - Compromise Software Supply Chain']
      },
      {
        stage: 'Mass Distribution',
        description: 'Distributing compromised software to target organizations',
        duration: '1-4 weeks',
        techniques: ['T1189 - Drive-by Compromise']
      },
      {
        stage: 'Target Activation',
        description: 'Activating malicious payloads in target environments',
        duration: '1-12 weeks',
        techniques: ['T1053 - Scheduled Task/Job', 'T1547 - Boot or Logon Autostart Execution']
      }
    ]
  }
}

// Utility Functions

function getNodeName(nodes: ThreatNode[], uid: string): string {
  const node = nodes.find(n => n.uid === uid)
  return node ? node.showname : uid
}

function getEdgeWeight(edge: ThreatEdge): number {
  const difficultyWeights = { Low: 1, Medium: 2, High: 3 }
  return difficultyWeights[edge.difficulty || 'Medium']
}

function calculatePathSeverity(nodes: ThreatNode[], pathNodes: string[]): 'Critical' | 'High' | 'Medium' | 'Low' {
  const avgRiskScore = pathNodes.reduce((sum, nodeId) => {
    const node = nodes.find(n => n.uid === nodeId)
    return sum + (node?.riskScore || 5)
  }, 0) / pathNodes.length
  
  if (avgRiskScore >= 8) return 'Critical'
  if (avgRiskScore >= 6) return 'High'
  if (avgRiskScore >= 4) return 'Medium'
  return 'Low'
}

function estimateAttackTime(pathLength: number, attackType?: string): string {
  const baseTime = pathLength * 2 // 2 hours per hop base
  
  const multipliers = {
    privilege_escalation: 1.5,
    lateral_movement: 1.2,
    cross_segment: 2.0
  }
  
  const multiplier = attackType ? multipliers[attackType as keyof typeof multipliers] || 1 : 1
  const totalHours = Math.round(baseTime * multiplier)
  
  if (totalHours < 1) return '< 1 hour'
  if (totalHours < 24) return `${totalHours} hours`
  const days = Math.round(totalHours / 24)
  return `${days} day${days > 1 ? 's' : ''}`
}

function generateMitreTactics(pathLength: number): string[] {
  const baseTactics = ['Initial Access']
  
  if (pathLength > 2) baseTactics.push('Lateral Movement')
  if (pathLength > 3) baseTactics.push('Privilege Escalation')
  if (pathLength > 4) baseTactics.push('Persistence')
  
  baseTactics.push('Exfiltration')
  
  return baseTactics
}

function calculateRiskScore(
  nodes: ThreatNode[],
  edges: ThreatEdge[],
  pathNodes: string[],
  pathEdges: Array<{ from: string; to: string }>
): number {
  // Base score from path length (shorter paths are riskier)
  let score = Math.max(10 - pathNodes.length, 1)
  
  // Add node risk scores
  const nodeRiskSum = pathNodes.reduce((sum, nodeId) => {
    const node = nodes.find(n => n.uid === nodeId)
    return sum + (node?.riskScore || 5)
  }, 0)
  score += nodeRiskSum / pathNodes.length
  
  // Add edge difficulty (easier paths are riskier)
  const edgeDifficultySum = pathEdges.reduce((sum, pathEdge) => {
    const edge = edges.find(e => e.from === pathEdge.from && e.to === pathEdge.to)
    const difficultyScores = { Low: 3, Medium: 2, High: 1 }
    return sum + difficultyScores[edge?.difficulty || 'Medium']
  }, 0)
  score += edgeDifficultySum / Math.max(pathEdges.length, 1)
  
  return Math.min(Math.round(score * 10) / 10, 10) // Round to 1 decimal, max 10
}

