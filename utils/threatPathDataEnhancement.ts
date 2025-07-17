/**
 * Data Enhancement for Threat Path Analysis
 * Automatically adds realistic cybersecurity nodes and edges to support threat path scenarios
 */

import { ThreatNode, ThreatEdge } from './automatedThreatPathGeneration'

export interface CybersecurityNode extends ThreatNode {
  category: 'Infrastructure' | 'Identity' | 'Data' | 'Application' | 'Network' | 'Security' | 'Threat'
  criticality: 'Critical' | 'High' | 'Medium' | 'Low'
  vulnerabilities: string[]
  privileges: string[]
  networkSegment: string
  assetValue: number
  lastUpdated: string
  complianceRequirements?: string[]
  monitoringLevel: 'High' | 'Medium' | 'Low' | 'None'
}

export interface CybersecurityEdge extends ThreatEdge {
  category: 'Network' | 'Access' | 'Data Flow' | 'Trust' | 'Exploit' | 'Lateral Movement'
  protocol?: string
  port?: number
  encrypted: boolean
  monitored: boolean
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low'
  exploitMethods: string[]
  prerequisites: string[]
}

export interface DataEnhancementConfig {
  addExternalThreats: boolean
  addVulnerabilities: boolean
  addPrivilegedAccounts: boolean
  addNetworkDevices: boolean
  addSecurityControls: boolean
  addComplianceNodes: boolean
  enhanceExistingNodes: boolean
  generateRealisticConnections: boolean
}

/**
 * Enhance existing dataset with cybersecurity-specific nodes and edges
 */
export function enhanceDatasetForThreatPaths(
  existingNodes: any[],
  existingEdges: any[],
  config: DataEnhancementConfig = {
    addExternalThreats: true,
    addVulnerabilities: true,
    addPrivilegedAccounts: true,
    addNetworkDevices: true,
    addSecurityControls: true,
    addComplianceNodes: true,
    enhanceExistingNodes: true,
    generateRealisticConnections: true
  }
): { nodes: CybersecurityNode[]; edges: CybersecurityEdge[] } {
  
  let enhancedNodes: CybersecurityNode[] = []
  let enhancedEdges: CybersecurityEdge[] = []
  
  // Convert and enhance existing nodes
  if (config.enhanceExistingNodes) {
    enhancedNodes = existingNodes.map(node => enhanceExistingNode(node))
  } else {
    enhancedNodes = existingNodes as CybersecurityNode[]
  }
  
  // Convert existing edges
  enhancedEdges = existingEdges.map(edge => enhanceExistingEdge(edge))
  
  // Add external threat actors
  if (config.addExternalThreats) {
    const threatActors = generateThreatActors()
    enhancedNodes.push(...threatActors)
    enhancedEdges.push(...generateThreatActorConnections(threatActors, enhancedNodes))
  }
  
  // Add vulnerability nodes
  if (config.addVulnerabilities) {
    const vulnerabilities = generateVulnerabilityNodes()
    enhancedNodes.push(...vulnerabilities)
    enhancedEdges.push(...generateVulnerabilityConnections(vulnerabilities, enhancedNodes))
  }
  
  // Add privileged accounts
  if (config.addPrivilegedAccounts) {
    const privilegedAccounts = generatePrivilegedAccounts()
    enhancedNodes.push(...privilegedAccounts)
    enhancedEdges.push(...generatePrivilegedAccountConnections(privilegedAccounts, enhancedNodes))
  }
  
  // Add network devices
  if (config.addNetworkDevices) {
    const networkDevices = generateNetworkDevices()
    enhancedNodes.push(...networkDevices)
    enhancedEdges.push(...generateNetworkDeviceConnections(networkDevices, enhancedNodes))
  }
  
  // Add security controls
  if (config.addSecurityControls) {
    const securityControls = generateSecurityControls()
    enhancedNodes.push(...securityControls)
    enhancedEdges.push(...generateSecurityControlConnections(securityControls, enhancedNodes))
  }
  
  // Add compliance nodes
  if (config.addComplianceNodes) {
    const complianceNodes = generateComplianceNodes()
    enhancedNodes.push(...complianceNodes)
    enhancedEdges.push(...generateComplianceConnections(complianceNodes, enhancedNodes))
  }
  
  // Generate realistic connections
  if (config.generateRealisticConnections) {
    enhancedEdges.push(...generateRealisticConnections(enhancedNodes))
  }
  
  return { nodes: enhancedNodes, edges: enhancedEdges }
}

/**
 * Enhance existing node with cybersecurity properties
 */
function enhanceExistingNode(node: any): CybersecurityNode {
  const enhanced: CybersecurityNode = {
    uid: node.uid,
    type: node.type,
    showname: node.showname,
    properties: { ...node.properties },
    category: categorizeNodeType(node.type),
    criticality: calculateNodeCriticality(node),
    vulnerabilities: generateNodeVulnerabilities(node.type),
    privileges: generateNodePrivileges(node.type),
    networkSegment: node.properties?.CLUSTER || determineNetworkSegment(node.type),
    assetValue: calculateAssetValue(node.type),
    lastUpdated: new Date().toISOString(),
    monitoringLevel: determineMonitoringLevel(node.type),
    riskScore: calculateNodeRiskScore(node)
  }
  
  // Add compliance requirements for certain node types
  if (['Database', 'File Server', 'Domain Controller'].includes(node.type)) {
    enhanced.complianceRequirements = ['SOX', 'PCI-DSS', 'GDPR']
  }
  
  return enhanced
}

/**
 * Enhance existing edge with cybersecurity properties
 */
function enhanceExistingEdge(edge: any): CybersecurityEdge {
  return {
    from: edge.from,
    to: edge.to,
    type: edge.type || 'Connection',
    properties: { ...edge.properties },
    category: categorizeEdgeType(edge.type),
    encrypted: Math.random() > 0.3, // 70% encrypted
    monitored: Math.random() > 0.4, // 60% monitored
    riskLevel: calculateEdgeRiskLevel(edge),
    exploitMethods: generateExploitMethods(edge.type),
    prerequisites: generatePrerequisites(edge.type),
    difficulty: assignDifficulty(edge.type)
  }
}

/**
 * Generate external threat actor nodes
 */
function generateThreatActors(): CybersecurityNode[] {
  const threatActors = [
    {
      uid: 'THREATACTOR-APT29',
      showname: 'APT29 (Cozy Bear)',
      type: 'Threat Actor',
      description: 'Russian state-sponsored APT group',
      sophistication: 'Advanced',
      motivation: 'Espionage'
    },
    {
      uid: 'THREATACTOR-LAZARUS',
      showname: 'Lazarus Group',
      type: 'Threat Actor',
      description: 'North Korean state-sponsored group',
      sophistication: 'Advanced',
      motivation: 'Financial, Espionage'
    },
    {
      uid: 'THREATACTOR-CARBANAK',
      showname: 'Carbanak',
      type: 'Threat Actor',
      description: 'Financially motivated cybercriminal group',
      sophistication: 'Intermediate',
      motivation: 'Financial'
    },
    {
      uid: 'THREATACTOR-INSIDER',
      showname: 'Malicious Insider',
      type: 'Threat Actor',
      description: 'Disgruntled employee with legitimate access',
      sophistication: 'Basic',
      motivation: 'Revenge, Financial'
    },
    {
      uid: 'THREATACTOR-SCRIPT-KIDDIE',
      showname: 'Script Kiddie',
      type: 'Threat Actor',
      description: 'Low-skill attacker using existing tools',
      sophistication: 'Basic',
      motivation: 'Recognition'
    }
  ]
  
  return threatActors.map(actor => ({
    uid: actor.uid,
    type: actor.type,
    showname: actor.showname,
    properties: {
      description: actor.description,
      sophistication: actor.sophistication,
      motivation: actor.motivation,
      TC_THREAT_PATH: 'External-Threat',
      TC_ALARM: 'Alert',
      TC_ANIMATION: 'pulse'
    },
    category: 'Threat' as const,
    criticality: 'Critical' as const,
    vulnerabilities: [],
    privileges: ['External'],
    networkSegment: 'External',
    assetValue: 0,
    lastUpdated: new Date().toISOString(),
    monitoringLevel: 'High' as const,
    riskScore: 9.5
  }))
}

/**
 * Generate vulnerability nodes
 */
function generateVulnerabilityNodes(): CybersecurityNode[] {
  const vulnerabilities = [
    {
      uid: 'CVE-2021-44228',
      showname: 'Log4Shell (CVE-2021-44228)',
      type: 'Vulnerability',
      severity: 'Critical',
      cvss: 10.0,
      description: 'Remote code execution in Log4j'
    },
    {
      uid: 'CVE-2020-1472',
      showname: 'Zerologon (CVE-2020-1472)',
      type: 'Vulnerability',
      severity: 'Critical',
      cvss: 10.0,
      description: 'Privilege escalation in Windows Netlogon'
    },
    {
      uid: 'CVE-2019-0708',
      showname: 'BlueKeep (CVE-2019-0708)',
      type: 'Vulnerability',
      severity: 'Critical',
      cvss: 9.8,
      description: 'Remote code execution in Windows RDP'
    },
    {
      uid: 'CVE-2021-34527',
      showname: 'PrintNightmare (CVE-2021-34527)',
      type: 'Vulnerability',
      severity: 'High',
      cvss: 8.8,
      description: 'Privilege escalation in Windows Print Spooler'
    },
    {
      uid: 'CVE-2020-0796',
      showname: 'SMBGhost (CVE-2020-0796)',
      type: 'Vulnerability',
      severity: 'High',
      cvss: 8.1,
      description: 'Remote code execution in Windows SMBv3'
    }
  ]
  
  return vulnerabilities.map(vuln => ({
    uid: vuln.uid,
    type: vuln.type,
    showname: vuln.showname,
    properties: {
      severity: vuln.severity,
      cvss_score: vuln.cvss,
      description: vuln.description,
      TC_ALARM: vuln.severity === 'Critical' ? 'Alert' : 'Warning',
      TC_ANIMATION: 'flash'
    },
    category: 'Security' as const,
    criticality: vuln.severity as 'Critical' | 'High',
    vulnerabilities: [vuln.uid],
    privileges: [],
    networkSegment: 'Global',
    assetValue: 0,
    lastUpdated: new Date().toISOString(),
    monitoringLevel: 'High' as const,
    riskScore: vuln.cvss
  }))
}

/**
 * Generate privileged account nodes
 */
function generatePrivilegedAccounts(): CybersecurityNode[] {
  const accounts = [
    {
      uid: 'ADMIN-DOMAIN-001',
      showname: 'Domain Administrator',
      type: 'User Account',
      privileges: ['Domain Admin', 'Enterprise Admin'],
      department: 'IT'
    },
    {
      uid: 'ADMIN-LOCAL-001',
      showname: 'Local Administrator',
      type: 'User Account',
      privileges: ['Local Admin'],
      department: 'IT'
    },
    {
      uid: 'SERVICE-SQL-001',
      showname: 'SQL Service Account',
      type: 'Service Account',
      privileges: ['Service', 'Database Admin'],
      department: 'Database'
    },
    {
      uid: 'SERVICE-BACKUP-001',
      showname: 'Backup Service Account',
      type: 'Service Account',
      privileges: ['Service', 'Backup Operator'],
      department: 'Operations'
    },
    {
      uid: 'ADMIN-SECURITY-001',
      showname: 'Security Administrator',
      type: 'User Account',
      privileges: ['Security Admin', 'Audit Admin'],
      department: 'Security'
    }
  ]
  
  return accounts.map(account => ({
    uid: account.uid,
    type: account.type,
    showname: account.showname,
    properties: {
      department: account.department,
      account_type: account.type,
      TC_ALARM: 'Warning',
      TC_ANIMATION: 'glow'
    },
    category: 'Identity' as const,
    criticality: 'High' as const,
    vulnerabilities: ['Credential Theft', 'Password Attack'],
    privileges: account.privileges,
    networkSegment: 'Corporate',
    assetValue: 8,
    lastUpdated: new Date().toISOString(),
    monitoringLevel: 'High' as const,
    riskScore: 8.5
  }))
}

/**
 * Generate network device nodes
 */
function generateNetworkDevices(): CybersecurityNode[] {
  const devices = [
    {
      uid: 'FIREWALL-PERIMETER-001',
      showname: 'Perimeter Firewall',
      type: 'Firewall',
      location: 'DMZ'
    },
    {
      uid: 'ROUTER-CORE-001',
      showname: 'Core Router',
      type: 'Router',
      location: 'Data Center'
    },
    {
      uid: 'SWITCH-ACCESS-001',
      showname: 'Access Switch',
      type: 'Switch',
      location: 'Office Floor 1'
    },
    {
      uid: 'VPN-GATEWAY-001',
      showname: 'VPN Gateway',
      type: 'VPN Gateway',
      location: 'DMZ'
    },
    {
      uid: 'PROXY-WEB-001',
      showname: 'Web Proxy',
      type: 'Proxy Server',
      location: 'DMZ'
    }
  ]
  
  return devices.map(device => ({
    uid: device.uid,
    type: device.type,
    showname: device.showname,
    properties: {
      location: device.location,
      device_type: device.type,
      TC_ALARM: 'Info',
      TC_ANIMATION: 'none'
    },
    category: 'Network' as const,
    criticality: 'High' as const,
    vulnerabilities: ['Configuration Weakness', 'Firmware Vulnerability'],
    privileges: ['Network Admin'],
    networkSegment: device.location === 'DMZ' ? 'DMZ' : 'Infrastructure',
    assetValue: 7,
    lastUpdated: new Date().toISOString(),
    monitoringLevel: 'High' as const,
    riskScore: 6.5
  }))
}

/**
 * Generate security control nodes
 */
function generateSecurityControls(): CybersecurityNode[] {
  const controls = [
    {
      uid: 'SIEM-SPLUNK-001',
      showname: 'Splunk SIEM',
      type: 'SIEM',
      vendor: 'Splunk'
    },
    {
      uid: 'EDR-CROWDSTRIKE-001',
      showname: 'CrowdStrike Falcon',
      type: 'EDR',
      vendor: 'CrowdStrike'
    },
    {
      uid: 'IDS-SNORT-001',
      showname: 'Snort IDS',
      type: 'IDS',
      vendor: 'Cisco'
    },
    {
      uid: 'SCANNER-NESSUS-001',
      showname: 'Nessus Vulnerability Scanner',
      type: 'Vulnerability Scanner',
      vendor: 'Tenable'
    },
    {
      uid: 'SOAR-PHANTOM-001',
      showname: 'Phantom SOAR',
      type: 'SOAR',
      vendor: 'Splunk'
    }
  ]
  
  return controls.map(control => ({
    uid: control.uid,
    type: control.type,
    showname: control.showname,
    properties: {
      vendor: control.vendor,
      control_type: control.type,
      TC_ALARM: 'Success',
      TC_ANIMATION: 'none'
    },
    category: 'Security' as const,
    criticality: 'Medium' as const,
    vulnerabilities: ['Configuration Error', 'Software Vulnerability'],
    privileges: ['Security Admin'],
    networkSegment: 'Security',
    assetValue: 6,
    lastUpdated: new Date().toISOString(),
    monitoringLevel: 'Medium' as const,
    riskScore: 4.0
  }))
}

/**
 * Generate compliance nodes
 */
function generateComplianceNodes(): CybersecurityNode[] {
  const compliance = [
    {
      uid: 'COMPLIANCE-PCI-DSS',
      showname: 'PCI-DSS Compliance',
      type: 'Compliance Framework',
      standard: 'PCI-DSS'
    },
    {
      uid: 'COMPLIANCE-SOX',
      showname: 'SOX Compliance',
      type: 'Compliance Framework',
      standard: 'SOX'
    },
    {
      uid: 'COMPLIANCE-GDPR',
      showname: 'GDPR Compliance',
      type: 'Compliance Framework',
      standard: 'GDPR'
    },
    {
      uid: 'COMPLIANCE-HIPAA',
      showname: 'HIPAA Compliance',
      type: 'Compliance Framework',
      standard: 'HIPAA'
    }
  ]
  
  return compliance.map(comp => ({
    uid: comp.uid,
    type: comp.type,
    showname: comp.showname,
    properties: {
      standard: comp.standard,
      compliance_type: comp.type,
      TC_ALARM: 'Info',
      TC_ANIMATION: 'none'
    },
    category: 'Data' as const,
    criticality: 'Medium' as const,
    vulnerabilities: [],
    privileges: [],
    networkSegment: 'Compliance',
    assetValue: 5,
    lastUpdated: new Date().toISOString(),
    monitoringLevel: 'Medium' as const,
    riskScore: 3.0
  }))
}

/**
 * Generate connections between threat actors and infrastructure
 */
function generateThreatActorConnections(
  threatActors: CybersecurityNode[],
  allNodes: CybersecurityNode[]
): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  // Find external-facing nodes
  const externalNodes = allNodes.filter(node => 
    ['Web Server', 'Email Server', 'VPN Gateway', 'Firewall'].includes(node.type) ||
    node.networkSegment === 'DMZ'
  )
  
  threatActors.forEach(actor => {
    externalNodes.slice(0, 3).forEach(target => {
      connections.push({
        from: actor.uid,
        to: target.uid,
        type: 'Targets',
        properties: {
          attack_vector: 'External',
          TC_THREAT_PATH: 'External-Attack',
          TC_ALARM: 'Alert'
        },
        category: 'Exploit' as const,
        encrypted: false,
        monitored: true,
        riskLevel: 'Critical' as const,
        exploitMethods: ['Network Exploitation', 'Social Engineering'],
        prerequisites: ['Internet Access'],
        difficulty: 'Medium' as const
      })
    })
  })
  
  return connections
}

/**
 * Generate connections between vulnerabilities and affected systems
 */
function generateVulnerabilityConnections(
  vulnerabilities: CybersecurityNode[],
  allNodes: CybersecurityNode[]
): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  vulnerabilities.forEach(vuln => {
    // Find nodes that could be affected by this vulnerability
    const affectedNodes = allNodes.filter(node => {
      if (vuln.uid.includes('Log4j')) return ['Web Server', 'Application Server'].includes(node.type)
      if (vuln.uid.includes('Zerologon')) return ['Domain Controller'].includes(node.type)
      if (vuln.uid.includes('BlueKeep')) return ['Server', 'Workstation'].includes(node.type)
      if (vuln.uid.includes('PrintNightmare')) return ['Server', 'Workstation'].includes(node.type)
      if (vuln.uid.includes('SMBGhost')) return ['Server', 'File Server'].includes(node.type)
      return false
    })
    
    affectedNodes.slice(0, 2).forEach(node => {
      connections.push({
        from: vuln.uid,
        to: node.uid,
        type: 'Affects',
        properties: {
          vulnerability_type: 'Software Vulnerability',
          TC_ALARM: 'Alert'
        },
        category: 'Exploit' as const,
        encrypted: false,
        monitored: false,
        riskLevel: 'Critical' as const,
        exploitMethods: ['Remote Code Execution', 'Privilege Escalation'],
        prerequisites: ['Network Access'],
        difficulty: 'Low' as const
      })
    })
  })
  
  return connections
}

/**
 * Generate connections for privileged accounts
 */
function generatePrivilegedAccountConnections(
  privilegedAccounts: CybersecurityNode[],
  allNodes: CybersecurityNode[]
): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  privilegedAccounts.forEach(account => {
    // Find systems this account has access to
    const accessibleSystems = allNodes.filter(node => {
      if (account.privileges.includes('Domain Admin')) {
        return ['Domain Controller', 'Server', 'Workstation'].includes(node.type)
      }
      if (account.privileges.includes('Database Admin')) {
        return ['Database', 'Data Store'].includes(node.type)
      }
      if (account.privileges.includes('Local Admin')) {
        return ['Server', 'Workstation'].includes(node.type)
      }
      return false
    })
    
    accessibleSystems.slice(0, 4).forEach(system => {
      connections.push({
        from: account.uid,
        to: system.uid,
        type: 'Has Access To',
        properties: {
          access_type: 'Administrative',
          TC_ALARM: 'Warning'
        },
        category: 'Access' as const,
        encrypted: true,
        monitored: true,
        riskLevel: 'High' as const,
        exploitMethods: ['Credential Theft', 'Session Hijacking'],
        prerequisites: ['Valid Credentials'],
        difficulty: 'Medium' as const
      })
    })
  })
  
  return connections
}

/**
 * Generate connections for network devices
 */
function generateNetworkDeviceConnections(
  networkDevices: CybersecurityNode[],
  allNodes: CybersecurityNode[]
): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  networkDevices.forEach(device => {
    // Find systems this device connects to
    const connectedSystems = allNodes.filter(node => {
      if (device.type === 'Firewall') {
        return ['Web Server', 'Router'].includes(node.type)
      }
      if (device.type === 'Router') {
        return ['Server', 'Switch'].includes(node.type)
      }
      if (device.type === 'Switch') {
        return ['Workstation', 'Server'].includes(node.type)
      }
      return false
    })
    
    connectedSystems.slice(0, 3).forEach(system => {
      connections.push({
        from: device.uid,
        to: system.uid,
        type: 'Network Connection',
        properties: {
          connection_type: 'Network',
          TC_ALARM: 'None'
        },
        category: 'Network' as const,
        protocol: 'TCP/IP',
        encrypted: device.type === 'VPN Gateway',
        monitored: true,
        riskLevel: 'Medium' as const,
        exploitMethods: ['Network Sniffing', 'Man-in-the-Middle'],
        prerequisites: ['Network Access'],
        difficulty: 'Medium' as const
      })
    })
  })
  
  return connections
}

/**
 * Generate connections for security controls
 */
function generateSecurityControlConnections(
  securityControls: CybersecurityNode[],
  allNodes: CybersecurityNode[]
): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  securityControls.forEach(control => {
    // Find systems this control monitors
    const monitoredSystems = allNodes.filter(node => {
      if (control.type === 'SIEM') {
        return ['Server', 'Workstation', 'Network Device'].includes(node.category)
      }
      if (control.type === 'EDR') {
        return ['Workstation', 'Server'].includes(node.type)
      }
      if (control.type === 'IDS') {
        return node.category === 'Network'
      }
      return false
    })
    
    monitoredSystems.slice(0, 5).forEach(system => {
      connections.push({
        from: control.uid,
        to: system.uid,
        type: 'Monitors',
        properties: {
          monitoring_type: 'Security',
          TC_ALARM: 'Success'
        },
        category: 'Data Flow' as const,
        encrypted: true,
        monitored: false,
        riskLevel: 'Low' as const,
        exploitMethods: [],
        prerequisites: ['Agent Installation'],
        difficulty: 'High' as const
      })
    })
  })
  
  return connections
}

/**
 * Generate connections for compliance frameworks
 */
function generateComplianceConnections(
  complianceNodes: CybersecurityNode[],
  allNodes: CybersecurityNode[]
): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  complianceNodes.forEach(compliance => {
    // Find systems that must comply with this framework
    const compliantSystems = allNodes.filter(node => {
      if (compliance.uid.includes('PCI-DSS')) {
        return ['Database', 'Web Server', 'Payment System'].includes(node.type)
      }
      if (compliance.uid.includes('SOX')) {
        return ['Database', 'Financial System'].includes(node.type)
      }
      if (compliance.uid.includes('GDPR')) {
        return ['Database', 'CRM', 'User Data'].includes(node.type)
      }
      return false
    })
    
    compliantSystems.slice(0, 3).forEach(system => {
      connections.push({
        from: system.uid,
        to: compliance.uid,
        type: 'Must Comply With',
        properties: {
          compliance_type: 'Regulatory',
          TC_ALARM: 'Info'
        },
        category: 'Trust' as const,
        encrypted: false,
        monitored: true,
        riskLevel: 'Medium' as const,
        exploitMethods: [],
        prerequisites: ['Compliance Assessment'],
        difficulty: 'High' as const
      })
    })
  })
  
  return connections
}

/**
 * Generate realistic connections between existing nodes
 */
function generateRealisticConnections(nodes: CybersecurityNode[]): CybersecurityEdge[] {
  const connections: CybersecurityEdge[] = []
  
  // Generate trust relationships
  const domainControllers = nodes.filter(n => n.type === 'Domain Controller')
  const servers = nodes.filter(n => n.type === 'Server')
  const workstations = nodes.filter(n => n.type === 'Workstation')
  
  // Domain controllers trust relationships
  domainControllers.forEach(dc => {
    servers.slice(0, 3).forEach(server => {
      connections.push({
        from: dc.uid,
        to: server.uid,
        type: 'Trusts',
        properties: { trust_type: 'Domain Trust' },
        category: 'Trust' as const,
        encrypted: true,
        monitored: true,
        riskLevel: 'Medium' as const,
        exploitMethods: ['Kerberoasting', 'Golden Ticket'],
        prerequisites: ['Domain Access'],
        difficulty: 'Medium' as const
      })
    })
  })
  
  // Server to workstation connections
  servers.forEach(server => {
    workstations.slice(0, 2).forEach(workstation => {
      connections.push({
        from: workstation.uid,
        to: server.uid,
        type: 'Accesses',
        properties: { access_type: 'Service Access' },
        category: 'Access' as const,
        encrypted: true,
        monitored: false,
        riskLevel: 'Low' as const,
        exploitMethods: ['Credential Theft', 'Session Hijacking'],
        prerequisites: ['Network Access'],
        difficulty: 'Medium' as const
      })
    })
  })
  
  return connections
}

// Helper Functions

function categorizeNodeType(type: string): 'Infrastructure' | 'Identity' | 'Data' | 'Application' | 'Network' | 'Security' | 'Threat' {
  const categories = {
    'Server': 'Infrastructure',
    'Workstation': 'Infrastructure',
    'Database': 'Data',
    'File Server': 'Data',
    'Web Server': 'Application',
    'Email Server': 'Application',
    'User Account': 'Identity',
    'Service Account': 'Identity',
    'Domain Controller': 'Identity',
    'Router': 'Network',
    'Switch': 'Network',
    'Firewall': 'Network',
    'SIEM': 'Security',
    'EDR': 'Security',
    'Threat Actor': 'Threat',
    'Vulnerability': 'Security'
  }
  
  return categories[type as keyof typeof categories] || 'Infrastructure'
}

function categorizeEdgeType(type: string): 'Network' | 'Access' | 'Data Flow' | 'Trust' | 'Exploit' | 'Lateral Movement' {
  const categories = {
    'Connection': 'Network',
    'Accesses': 'Access',
    'Trusts': 'Trust',
    'Monitors': 'Data Flow',
    'Targets': 'Exploit',
    'Affects': 'Exploit',
    'Has Access To': 'Access'
  }
  
  return categories[type as keyof typeof categories] || 'Network'
}

function calculateNodeCriticality(node: any): 'Critical' | 'High' | 'Medium' | 'Low' {
  const criticalTypes = ['Domain Controller', 'Database', 'Financial System']
  const highTypes = ['Server', 'File Server', 'Email Server']
  const mediumTypes = ['Workstation', 'Network Device']
  
  if (criticalTypes.includes(node.type)) return 'Critical'
  if (highTypes.includes(node.type)) return 'High'
  if (mediumTypes.includes(node.type)) return 'Medium'
  return 'Low'
}

function generateNodeVulnerabilities(type: string): string[] {
  const vulnerabilities = {
    'Server': ['Unpatched OS', 'Weak Passwords', 'Open Ports'],
    'Workstation': ['Malware', 'Phishing', 'USB Attacks'],
    'Database': ['SQL Injection', 'Weak Authentication', 'Data Exposure'],
    'Web Server': ['XSS', 'CSRF', 'Directory Traversal'],
    'Network Device': ['Default Credentials', 'Firmware Vulnerabilities']
  }
  
  return vulnerabilities[type as keyof typeof vulnerabilities] || ['Configuration Weakness']
}

function generateNodePrivileges(type: string): string[] {
  const privileges = {
    'Domain Controller': ['Domain Admin', 'Enterprise Admin'],
    'Server': ['Local Admin', 'Service'],
    'Workstation': ['User', 'Local Admin'],
    'Database': ['Database Admin', 'Service'],
    'User Account': ['User'],
    'Service Account': ['Service']
  }
  
  return privileges[type as keyof typeof privileges] || ['User']
}

function determineNetworkSegment(type: string): string {
  const segments = {
    'Web Server': 'DMZ',
    'Email Server': 'DMZ',
    'Database': 'Internal',
    'Domain Controller': 'Internal',
    'Workstation': 'Corporate',
    'Server': 'Internal'
  }
  
  return segments[type as keyof typeof segments] || 'Corporate'
}

function calculateAssetValue(type: string): number {
  const values = {
    'Domain Controller': 10,
    'Database': 9,
    'File Server': 8,
    'Server': 7,
    'Web Server': 6,
    'Workstation': 4,
    'Network Device': 6
  }
  
  return values[type as keyof typeof values] || 5
}

function determineMonitoringLevel(type: string): 'High' | 'Medium' | 'Low' | 'None' {
  const levels = {
    'Domain Controller': 'High',
    'Database': 'High',
    'Server': 'Medium',
    'Workstation': 'Low',
    'Network Device': 'Medium'
  }
  
  return levels[type as keyof typeof levels] || 'Low'
}

function calculateNodeRiskScore(node: any): number {
  let score = 5 // Base score
  
  // Adjust based on type
  const typeScores = {
    'Domain Controller': 9,
    'Database': 8,
    'Server': 6,
    'Workstation': 4
  }
  
  score = typeScores[node.type as keyof typeof typeScores] || score
  
  // Add randomness for realism
  score += (Math.random() - 0.5) * 2
  
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10))
}

function calculateEdgeRiskLevel(edge: any): 'Critical' | 'High' | 'Medium' | 'Low' {
  // Simple risk calculation based on edge type
  const riskTypes = {
    'Targets': 'Critical',
    'Affects': 'Critical',
    'Has Access To': 'High',
    'Trusts': 'Medium',
    'Connection': 'Low'
  }
  
  return riskTypes[edge.type as keyof typeof riskTypes] || 'Medium'
}

function generateExploitMethods(type: string): string[] {
  const methods = {
    'Connection': ['Network Sniffing', 'Man-in-the-Middle'],
    'Accesses': ['Credential Theft', 'Session Hijacking'],
    'Trusts': ['Kerberoasting', 'Golden Ticket'],
    'Targets': ['Network Exploitation', 'Social Engineering']
  }
  
  return methods[type as keyof typeof methods] || ['Network Attack']
}

function generatePrerequisites(type: string): string[] {
  const prerequisites = {
    'Connection': ['Network Access'],
    'Accesses': ['Valid Credentials'],
    'Trusts': ['Domain Access'],
    'Targets': ['Internet Access']
  }
  
  return prerequisites[type as keyof typeof prerequisites] || ['Network Access']
}

function assignDifficulty(type: string): 'Low' | 'Medium' | 'High' {
  const difficulties = {
    'Targets': 'Medium',
    'Affects': 'Low',
    'Has Access To': 'Medium',
    'Trusts': 'High',
    'Connection': 'Medium'
  }
  
  return difficulties[type as keyof typeof difficulties] || 'Medium'
}

