/**
 * Enhanced Data Enhancement for Comprehensive Threat Path Analysis
 * Automatically adds realistic cybersecurity nodes and edges with advanced relationships
 */

import { ThreatPathNode, ThreatPathEdge, DataEnhancementConfig } from '../types/threatPath'

export interface EnhancedCybersecurityNode extends ThreatPathNode {
  category: 'Infrastructure' | 'Identity' | 'Data' | 'Application' | 'Network' | 'Security' | 'Threat' | 'Compliance'
  criticality: 'Critical' | 'High' | 'Medium' | 'Low'
  lastUpdated: string
  complianceRequirements?: string[]
  monitoringLevel: 'High' | 'Medium' | 'Low' | 'None'
  businessFunction?: string
  dataClassification?: 'Public' | 'Internal' | 'Confidential' | 'Restricted'
  backupStatus?: 'Current' | 'Outdated' | 'None'
  patchLevel?: 'Current' | 'Behind' | 'Critical'
  encryptionStatus?: 'Encrypted' | 'Partial' | 'None'
}

export interface EnhancedCybersecurityEdge extends ThreatPathEdge {
  category: 'Network' | 'Access' | 'Data Flow' | 'Trust' | 'Exploit' | 'Lateral Movement' | 'Compliance'
  protocol?: string
  port?: number
  encrypted: boolean
  monitored: boolean
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low'
  exploitMethods: string[]
  dataFlow?: 'Bidirectional' | 'Unidirectional' | 'None'
  bandwidth?: string
  latency?: string
  availability?: number // 0-100%
}

/**
 * Enhanced dataset enhancement with comprehensive cybersecurity modeling
 */
export function enhanceDatasetForThreatPaths(
  existingNodes: any[],
  existingEdges: any[],
  config: DataEnhancementConfig = {
    addVulnerabilities: true,
    addPrivileges: true,
    addNetworkSegments: true,
    addSecurityControls: true,
    addAssetValues: true,
    enhanceRelationships: true,
    addThreatIntelligence: true,
    simulateCompromise: false
  }
): { nodes: EnhancedCybersecurityNode[]; edges: EnhancedCybersecurityEdge[] } {
  
  let enhancedNodes: EnhancedCybersecurityNode[] = []
  let enhancedEdges: EnhancedCybersecurityEdge[] = []
  
  // Enhance existing nodes with comprehensive cybersecurity properties
  enhancedNodes = existingNodes.map(node => enhanceExistingNode(node, config))
  
  // Enhance existing edges
  enhancedEdges = existingEdges.map(edge => enhanceExistingEdge(edge, config))
  
  // Add comprehensive cybersecurity infrastructure
  if (config.addNetworkSegments) {
    const networkNodes = generateNetworkInfrastructure()
    enhancedNodes.push(...networkNodes)
    enhancedEdges.push(...generateNetworkConnections(networkNodes, enhancedNodes))
  }
  
  // Add identity and access management components
  if (config.addPrivileges) {
    const identityNodes = generateIdentityInfrastructure()
    enhancedNodes.push(...identityNodes)
    enhancedEdges.push(...generateIdentityConnections(identityNodes, enhancedNodes))
  }
  
  // Add vulnerability and threat landscape
  if (config.addVulnerabilities) {
    const threatNodes = generateThreatLandscape()
    enhancedNodes.push(...threatNodes)
    enhancedEdges.push(...generateThreatConnections(threatNodes, enhancedNodes))
  }
  
  // Add security controls and monitoring
  if (config.addSecurityControls) {
    const securityNodes = generateSecurityInfrastructure()
    enhancedNodes.push(...securityNodes)
    enhancedEdges.push(...generateSecurityConnections(securityNodes, enhancedNodes))
  }
  
  // Add data assets and classification
  if (config.addAssetValues) {
    const dataNodes = generateDataAssets()
    enhancedNodes.push(...dataNodes)
    enhancedEdges.push(...generateDataConnections(dataNodes, enhancedNodes))
  }
  
  // Add threat intelligence and external threats
  if (config.addThreatIntelligence) {
    const threatIntelNodes = generateThreatIntelligence()
    enhancedNodes.push(...threatIntelNodes)
    enhancedEdges.push(...generateThreatIntelConnections(threatIntelNodes, enhancedNodes))
  }
  
  // Enhance relationships with realistic attack paths
  if (config.enhanceRelationships) {
    enhancedEdges.push(...generateAdvancedRelationships(enhancedNodes))
  }
  
  // Simulate compromise scenarios
  if (config.simulateCompromise) {
    const compromiseData = simulateCompromiseScenarios(enhancedNodes, enhancedEdges)
    enhancedNodes = compromiseData.nodes
    enhancedEdges = compromiseData.edges
  }
  
  return { nodes: enhancedNodes, edges: enhancedEdges }
}

/**
 * Enhance existing node with comprehensive cybersecurity properties
 */
function enhanceExistingNode(node: any, config: DataEnhancementConfig): EnhancedCybersecurityNode {
  const enhanced: EnhancedCybersecurityNode = {
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
    securityControls: generateSecurityControls(node.type),
    lastSeen: new Date().toISOString(),
    compromiseIndicators: [],
    lastUpdated: new Date().toISOString(),
    monitoringLevel: determineMonitoringLevel(node.type),
    riskScore: calculateNodeRiskScore(node),
    businessFunction: determineBusinessFunction(node.type),
    dataClassification: determineDataClassification(node.type),
    backupStatus: determineBackupStatus(node.type),
    patchLevel: determinePatchLevel(node.type),
    encryptionStatus: determineEncryptionStatus(node.type)
  }
  
  // Add compliance requirements for regulated systems
  if (['Database', 'File Server', 'Domain Controller', 'Financial System'].includes(node.type)) {
    enhanced.complianceRequirements = determineComplianceRequirements(node.type)
  }
  
  return enhanced
}

/**
 * Enhance existing edge with comprehensive cybersecurity properties
 */
function enhanceExistingEdge(edge: any, config: DataEnhancementConfig): EnhancedCybersecurityEdge {
  return {
    from: edge.from,
    to: edge.to,
    type: edge.type || 'Connection',
    properties: { ...edge.properties },
    category: categorizeEdgeType(edge.type),
    encrypted: determineEncryption(edge.type),
    monitored: determineMonitoring(edge.type),
    riskLevel: calculateEdgeRiskLevel(edge),
    exploitMethods: generateExploitMethods(edge.type),
    prerequisites: generatePrerequisites(edge.type),
    difficulty: assignDifficulty(edge.type),
    mitreTechnique: assignMitreTechnique(edge.type),
    detectionMethods: generateDetectionMethods(edge.type),
    preventionMethods: generatePreventionMethods(edge.type),
    protocol: determineProtocol(edge.type),
    port: determinePort(edge.type),
    dataFlow: determineDataFlow(edge.type),
    bandwidth: determineBandwidth(edge.type),
    latency: determineLatency(edge.type),
    availability: determineAvailability(edge.type)
  }
}

/**
 * Generate comprehensive network infrastructure
 */
function generateNetworkInfrastructure(): EnhancedCybersecurityNode[] {
  const networkNodes = [
    // Core Network Infrastructure
    {
      uid: 'NET-CORE-ROUTER-001',
      showname: 'Core Network Router',
      type: 'Router',
      networkSegment: 'Core',
      businessFunction: 'Network Routing'
    },
    {
      uid: 'NET-CORE-SWITCH-001',
      showname: 'Core Network Switch',
      type: 'Switch',
      networkSegment: 'Core',
      businessFunction: 'Network Switching'
    },
    {
      uid: 'NET-FIREWALL-PERIMETER',
      showname: 'Perimeter Firewall',
      type: 'Firewall',
      networkSegment: 'DMZ',
      businessFunction: 'Network Security'
    },
    {
      uid: 'NET-FIREWALL-INTERNAL',
      showname: 'Internal Firewall',
      type: 'Firewall',
      networkSegment: 'Internal',
      businessFunction: 'Network Segmentation'
    },
    {
      uid: 'NET-VPN-GATEWAY',
      showname: 'VPN Gateway',
      type: 'VPN Gateway',
      networkSegment: 'DMZ',
      businessFunction: 'Remote Access'
    },
    {
      uid: 'NET-PROXY-WEB',
      showname: 'Web Proxy Server',
      type: 'Proxy Server',
      networkSegment: 'DMZ',
      businessFunction: 'Web Filtering'
    },
    {
      uid: 'NET-DNS-PRIMARY',
      showname: 'Primary DNS Server',
      type: 'DNS Server',
      networkSegment: 'Internal',
      businessFunction: 'Name Resolution'
    },
    {
      uid: 'NET-DHCP-SERVER',
      showname: 'DHCP Server',
      type: 'DHCP Server',
      networkSegment: 'Internal',
      businessFunction: 'IP Management'
    },
    // Wireless Infrastructure
    {
      uid: 'NET-WIFI-CONTROLLER',
      showname: 'Wireless Controller',
      type: 'Wireless Controller',
      networkSegment: 'Internal',
      businessFunction: 'Wireless Management'
    },
    {
      uid: 'NET-WIFI-AP-001',
      showname: 'Wireless Access Point 1',
      type: 'Access Point',
      networkSegment: 'Corporate',
      businessFunction: 'Wireless Access'
    },
    // Network Monitoring
    {
      uid: 'NET-MONITOR-SNMP',
      showname: 'Network Monitoring System',
      type: 'Network Monitor',
      networkSegment: 'Management',
      businessFunction: 'Network Monitoring'
    }
  ]
  
  return networkNodes.map(node => createEnhancedNode(node, 'Network'))
}

/**
 * Generate identity and access management infrastructure
 */
function generateIdentityInfrastructure(): EnhancedCybersecurityNode[] {
  const identityNodes = [
    // Domain Controllers
    {
      uid: 'ID-DC-PRIMARY',
      showname: 'Primary Domain Controller',
      type: 'Domain Controller',
      networkSegment: 'Internal',
      businessFunction: 'Identity Management'
    },
    {
      uid: 'ID-DC-SECONDARY',
      showname: 'Secondary Domain Controller',
      type: 'Domain Controller',
      networkSegment: 'Internal',
      businessFunction: 'Identity Backup'
    },
    // Privileged Accounts
    {
      uid: 'ID-ADMIN-DOMAIN',
      showname: 'Domain Administrator',
      type: 'User Account',
      networkSegment: 'Internal',
      businessFunction: 'Domain Administration'
    },
    {
      uid: 'ID-ADMIN-ENTERPRISE',
      showname: 'Enterprise Administrator',
      type: 'User Account',
      networkSegment: 'Internal',
      businessFunction: 'Enterprise Administration'
    },
    {
      uid: 'ID-SERVICE-SQL',
      showname: 'SQL Service Account',
      type: 'Service Account',
      networkSegment: 'Internal',
      businessFunction: 'Database Services'
    },
    {
      uid: 'ID-SERVICE-BACKUP',
      showname: 'Backup Service Account',
      type: 'Service Account',
      networkSegment: 'Internal',
      businessFunction: 'Backup Operations'
    },
    {
      uid: 'ID-SERVICE-EXCHANGE',
      showname: 'Exchange Service Account',
      type: 'Service Account',
      networkSegment: 'Internal',
      businessFunction: 'Email Services'
    },
    // Regular Users
    {
      uid: 'ID-USER-FINANCE-001',
      showname: 'Finance User Account',
      type: 'User Account',
      networkSegment: 'Corporate',
      businessFunction: 'Financial Operations'
    },
    {
      uid: 'ID-USER-HR-001',
      showname: 'HR User Account',
      type: 'User Account',
      networkSegment: 'Corporate',
      businessFunction: 'Human Resources'
    },
    {
      uid: 'ID-USER-IT-001',
      showname: 'IT User Account',
      type: 'User Account',
      networkSegment: 'Corporate',
      businessFunction: 'IT Operations'
    },
    // Identity Services
    {
      uid: 'ID-ADFS-SERVER',
      showname: 'ADFS Server',
      type: 'ADFS Server',
      networkSegment: 'DMZ',
      businessFunction: 'Federation Services'
    },
    {
      uid: 'ID-PKI-CA',
      showname: 'Certificate Authority',
      type: 'Certificate Authority',
      networkSegment: 'Internal',
      businessFunction: 'Certificate Management'
    }
  ]
  
  return identityNodes.map(node => createEnhancedNode(node, 'Identity'))
}

/**
 * Generate threat landscape including vulnerabilities and threat actors
 */
function generateThreatLandscape(): EnhancedCybersecurityNode[] {
  const threatNodes = [
    // External Threat Actors
    {
      uid: 'THREAT-APT-LAZARUS',
      showname: 'Lazarus Group (APT)',
      type: 'Threat Actor',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'THREAT-APT-COZY-BEAR',
      showname: 'Cozy Bear (APT29)',
      type: 'Threat Actor',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'THREAT-RANSOMWARE-CONTI',
      showname: 'Conti Ransomware Group',
      type: 'Threat Actor',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'THREAT-INSIDER-MALICIOUS',
      showname: 'Malicious Insider Threat',
      type: 'Threat Actor',
      networkSegment: 'Internal',
      businessFunction: 'Threat Intelligence'
    },
    // Critical Vulnerabilities
    {
      uid: 'VULN-CVE-2021-44228',
      showname: 'Log4Shell (CVE-2021-44228)',
      type: 'Vulnerability',
      networkSegment: 'Global',
      businessFunction: 'Vulnerability Management'
    },
    {
      uid: 'VULN-CVE-2020-1472',
      showname: 'Zerologon (CVE-2020-1472)',
      type: 'Vulnerability',
      networkSegment: 'Global',
      businessFunction: 'Vulnerability Management'
    },
    {
      uid: 'VULN-CVE-2021-34527',
      showname: 'PrintNightmare (CVE-2021-34527)',
      type: 'Vulnerability',
      networkSegment: 'Global',
      businessFunction: 'Vulnerability Management'
    },
    {
      uid: 'VULN-CVE-2019-0708',
      showname: 'BlueKeep (CVE-2019-0708)',
      type: 'Vulnerability',
      networkSegment: 'Global',
      businessFunction: 'Vulnerability Management'
    },
    // Attack Techniques
    {
      uid: 'ATTACK-PHISHING',
      showname: 'Phishing Campaign',
      type: 'Attack Technique',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'ATTACK-LATERAL-MOVEMENT',
      showname: 'Lateral Movement',
      type: 'Attack Technique',
      networkSegment: 'Internal',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'ATTACK-PRIVILEGE-ESCALATION',
      showname: 'Privilege Escalation',
      type: 'Attack Technique',
      networkSegment: 'Internal',
      businessFunction: 'Threat Intelligence'
    }
  ]
  
  return threatNodes.map(node => createEnhancedNode(node, 'Threat'))
}

/**
 * Generate security infrastructure and controls
 */
function generateSecurityInfrastructure(): EnhancedCybersecurityNode[] {
  const securityNodes = [
    // SIEM and Logging
    {
      uid: 'SEC-SIEM-SPLUNK',
      showname: 'Splunk SIEM Platform',
      type: 'SIEM',
      networkSegment: 'Security',
      businessFunction: 'Security Monitoring'
    },
    {
      uid: 'SEC-LOG-COLLECTOR',
      showname: 'Log Collector',
      type: 'Log Collector',
      networkSegment: 'Security',
      businessFunction: 'Log Management'
    },
    // Endpoint Security
    {
      uid: 'SEC-EDR-CROWDSTRIKE',
      showname: 'CrowdStrike Falcon EDR',
      type: 'EDR',
      networkSegment: 'Security',
      businessFunction: 'Endpoint Protection'
    },
    {
      uid: 'SEC-ANTIVIRUS-CENTRAL',
      showname: 'Antivirus Management Console',
      type: 'Antivirus',
      networkSegment: 'Security',
      businessFunction: 'Malware Protection'
    },
    // Network Security
    {
      uid: 'SEC-IDS-SNORT',
      showname: 'Snort IDS',
      type: 'IDS',
      networkSegment: 'Security',
      businessFunction: 'Intrusion Detection'
    },
    {
      uid: 'SEC-IPS-SURICATA',
      showname: 'Suricata IPS',
      type: 'IPS',
      networkSegment: 'Security',
      businessFunction: 'Intrusion Prevention'
    },
    {
      uid: 'SEC-WAF-CLOUDFLARE',
      showname: 'Web Application Firewall',
      type: 'WAF',
      networkSegment: 'DMZ',
      businessFunction: 'Web Protection'
    },
    // Vulnerability Management
    {
      uid: 'SEC-SCANNER-NESSUS',
      showname: 'Nessus Vulnerability Scanner',
      type: 'Vulnerability Scanner',
      networkSegment: 'Security',
      businessFunction: 'Vulnerability Assessment'
    },
    {
      uid: 'SEC-SCANNER-QUALYS',
      showname: 'Qualys VMDR',
      type: 'Vulnerability Scanner',
      networkSegment: 'Security',
      businessFunction: 'Vulnerability Management'
    },
    // Security Orchestration
    {
      uid: 'SEC-SOAR-PHANTOM',
      showname: 'Phantom SOAR Platform',
      type: 'SOAR',
      networkSegment: 'Security',
      businessFunction: 'Security Orchestration'
    },
    {
      uid: 'SEC-TIP-MISP',
      showname: 'MISP Threat Intelligence',
      type: 'Threat Intelligence',
      networkSegment: 'Security',
      businessFunction: 'Threat Intelligence'
    },
    // Backup and Recovery
    {
      uid: 'SEC-BACKUP-VEEAM',
      showname: 'Veeam Backup Server',
      type: 'Backup Server',
      networkSegment: 'Internal',
      businessFunction: 'Data Protection'
    }
  ]
  
  return securityNodes.map(node => createEnhancedNode(node, 'Security'))
}

/**
 * Generate data assets and repositories
 */
function generateDataAssets(): EnhancedCybersecurityNode[] {
  const dataNodes = [
    // Databases
    {
      uid: 'DATA-DB-CUSTOMER',
      showname: 'Customer Database',
      type: 'Database',
      networkSegment: 'Internal',
      businessFunction: 'Customer Management'
    },
    {
      uid: 'DATA-DB-FINANCIAL',
      showname: 'Financial Database',
      type: 'Database',
      networkSegment: 'Internal',
      businessFunction: 'Financial Management'
    },
    {
      uid: 'DATA-DB-HR',
      showname: 'HR Database',
      type: 'Database',
      networkSegment: 'Internal',
      businessFunction: 'Human Resources'
    },
    {
      uid: 'DATA-DB-INVENTORY',
      showname: 'Inventory Database',
      type: 'Database',
      networkSegment: 'Internal',
      businessFunction: 'Inventory Management'
    },
    // File Servers
    {
      uid: 'DATA-FS-SHARED',
      showname: 'Shared File Server',
      type: 'File Server',
      networkSegment: 'Internal',
      businessFunction: 'File Sharing'
    },
    {
      uid: 'DATA-FS-FINANCE',
      showname: 'Finance File Server',
      type: 'File Server',
      networkSegment: 'Internal',
      businessFunction: 'Financial Documents'
    },
    {
      uid: 'DATA-FS-HR',
      showname: 'HR File Server',
      type: 'File Server',
      networkSegment: 'Internal',
      businessFunction: 'HR Documents'
    },
    // Cloud Storage
    {
      uid: 'DATA-CLOUD-SHAREPOINT',
      showname: 'SharePoint Online',
      type: 'Cloud Storage',
      networkSegment: 'Cloud',
      businessFunction: 'Document Collaboration'
    },
    {
      uid: 'DATA-CLOUD-ONEDRIVE',
      showname: 'OneDrive for Business',
      type: 'Cloud Storage',
      networkSegment: 'Cloud',
      businessFunction: 'Personal Storage'
    },
    // Intellectual Property
    {
      uid: 'DATA-IP-REPOSITORY',
      showname: 'Intellectual Property Repository',
      type: 'Data Repository',
      networkSegment: 'Internal',
      businessFunction: 'IP Management'
    },
    {
      uid: 'DATA-SOURCE-CODE',
      showname: 'Source Code Repository',
      type: 'Code Repository',
      networkSegment: 'Internal',
      businessFunction: 'Software Development'
    }
  ]
  
  return dataNodes.map(node => createEnhancedNode(node, 'Data'))
}

/**
 * Generate threat intelligence sources and feeds
 */
function generateThreatIntelligence(): EnhancedCybersecurityNode[] {
  const threatIntelNodes = [
    // External Threat Feeds
    {
      uid: 'TI-FEED-MITRE',
      showname: 'MITRE ATT&CK Framework',
      type: 'Threat Intelligence Feed',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'TI-FEED-CISA',
      showname: 'CISA Threat Feed',
      type: 'Threat Intelligence Feed',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    {
      uid: 'TI-FEED-COMMERCIAL',
      showname: 'Commercial Threat Feed',
      type: 'Threat Intelligence Feed',
      networkSegment: 'External',
      businessFunction: 'Threat Intelligence'
    },
    // IOC Sources
    {
      uid: 'TI-IOC-MALWARE',
      showname: 'Malware IOC Database',
      type: 'IOC Database',
      networkSegment: 'Security',
      businessFunction: 'Threat Detection'
    },
    {
      uid: 'TI-IOC-NETWORK',
      showname: 'Network IOC Database',
      type: 'IOC Database',
      networkSegment: 'Security',
      businessFunction: 'Network Threat Detection'
    },
    // Threat Hunting
    {
      uid: 'TI-HUNT-PLATFORM',
      showname: 'Threat Hunting Platform',
      type: 'Threat Hunting',
      networkSegment: 'Security',
      businessFunction: 'Proactive Threat Detection'
    }
  ]
  
  return threatIntelNodes.map(node => createEnhancedNode(node, 'Threat'))
}

/**
 * Create enhanced node with comprehensive properties
 */
function createEnhancedNode(nodeData: any, category: string): EnhancedCybersecurityNode {
  const baseNode = {
    uid: nodeData.uid,
    type: nodeData.type,
    showname: nodeData.showname,
    properties: {
      business_function: nodeData.businessFunction,
      TC_ALARM: determineAlarmLevel(nodeData.type),
      TC_ANIMATION: determineAnimation(nodeData.type)
    },
    category: category as any,
    criticality: calculateNodeCriticality({ type: nodeData.type }),
    vulnerabilities: generateNodeVulnerabilities(nodeData.type),
    privileges: generateNodePrivileges(nodeData.type),
    networkSegment: nodeData.networkSegment,
    assetValue: calculateAssetValue(nodeData.type),
    securityControls: generateSecurityControls(nodeData.type),
    lastSeen: new Date().toISOString(),
    compromiseIndicators: [],
    lastUpdated: new Date().toISOString(),
    monitoringLevel: determineMonitoringLevel(nodeData.type),
    riskScore: calculateNodeRiskScore({ type: nodeData.type }),
    businessFunction: nodeData.businessFunction,
    dataClassification: determineDataClassification(nodeData.type),
    backupStatus: determineBackupStatus(nodeData.type),
    patchLevel: determinePatchLevel(nodeData.type),
    encryptionStatus: determineEncryptionStatus(nodeData.type)
  }
  
  // Add compliance requirements for regulated systems
  if (['Database', 'File Server', 'Domain Controller'].includes(nodeData.type)) {
    baseNode.properties.complianceRequirements = determineComplianceRequirements(nodeData.type)
  }
  
  return baseNode
}

// Network connection generators
function generateNetworkConnections(networkNodes: EnhancedCybersecurityNode[], allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // Core network topology
  const coreRouter = networkNodes.find(n => n.uid === 'NET-CORE-ROUTER-001')
  const coreSwitch = networkNodes.find(n => n.uid === 'NET-CORE-SWITCH-001')
  const perimeterFirewall = networkNodes.find(n => n.uid === 'NET-FIREWALL-PERIMETER')
  const internalFirewall = networkNodes.find(n => n.uid === 'NET-FIREWALL-INTERNAL')
  
  if (coreRouter && coreSwitch) {
    connections.push(createNetworkConnection(coreRouter.uid, coreSwitch.uid, 'Core Network Link'))
  }
  
  if (coreRouter && perimeterFirewall) {
    connections.push(createNetworkConnection(coreRouter.uid, perimeterFirewall.uid, 'Perimeter Connection'))
  }
  
  if (coreSwitch && internalFirewall) {
    connections.push(createNetworkConnection(coreSwitch.uid, internalFirewall.uid, 'Internal Network Link'))
  }
  
  // Connect servers to network infrastructure
  const servers = allNodes.filter(n => n.type === 'Server' || n.type === 'Database')
  servers.forEach(server => {
    if (coreSwitch) {
      connections.push(createNetworkConnection(coreSwitch.uid, server.uid, 'Server Network Connection'))
    }
  })
  
  return connections
}

function generateIdentityConnections(identityNodes: EnhancedCybersecurityNode[], allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // Domain controller relationships
  const primaryDC = identityNodes.find(n => n.uid === 'ID-DC-PRIMARY')
  const secondaryDC = identityNodes.find(n => n.uid === 'ID-DC-SECONDARY')
  
  if (primaryDC && secondaryDC) {
    connections.push(createTrustConnection(primaryDC.uid, secondaryDC.uid, 'Domain Controller Replication'))
  }
  
  // User account access relationships
  const domainAdmin = identityNodes.find(n => n.uid === 'ID-ADMIN-DOMAIN')
  const servers = allNodes.filter(n => n.type === 'Server' || n.type === 'Database')
  
  if (domainAdmin) {
    servers.slice(0, 5).forEach(server => {
      connections.push(createAccessConnection(domainAdmin.uid, server.uid, 'Administrative Access'))
    })
  }
  
  return connections
}

function generateThreatConnections(threatNodes: EnhancedCybersecurityNode[], allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // Threat actor targeting relationships
  const externalThreats = threatNodes.filter(n => n.networkSegment === 'External')
  const externalFacingSystems = allNodes.filter(n => 
    n.type === 'Web Server' || n.type === 'Email Server' || n.networkSegment === 'DMZ'
  )
  
  externalThreats.forEach(threat => {
    externalFacingSystems.slice(0, 3).forEach(system => {
      connections.push(createThreatConnection(threat.uid, system.uid, 'Targets'))
    })
  })
  
  // Vulnerability affects relationships
  const vulnerabilities = threatNodes.filter(n => n.type === 'Vulnerability')
  vulnerabilities.forEach(vuln => {
    const affectedSystems = determineAffectedSystems(vuln.uid, allNodes)
    affectedSystems.forEach(system => {
      connections.push(createVulnerabilityConnection(vuln.uid, system.uid, 'Affects'))
    })
  })
  
  return connections
}

function generateSecurityConnections(securityNodes: EnhancedCybersecurityNode[], allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // SIEM monitoring relationships
  const siem = securityNodes.find(n => n.type === 'SIEM')
  if (siem) {
    const monitoredSystems = allNodes.filter(n => 
      ['Server', 'Database', 'Domain Controller', 'Firewall'].includes(n.type)
    )
    monitoredSystems.slice(0, 10).forEach(system => {
      connections.push(createMonitoringConnection(siem.uid, system.uid, 'Monitors'))
    })
  }
  
  // EDR protection relationships
  const edr = securityNodes.find(n => n.type === 'EDR')
  if (edr) {
    const endpoints = allNodes.filter(n => n.type === 'Workstation' || n.type === 'Server')
    endpoints.slice(0, 8).forEach(endpoint => {
      connections.push(createProtectionConnection(edr.uid, endpoint.uid, 'Protects'))
    })
  }
  
  return connections
}

function generateDataConnections(dataNodes: EnhancedCybersecurityNode[], allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // Database access relationships
  const databases = dataNodes.filter(n => n.type === 'Database')
  const applications = allNodes.filter(n => n.type === 'Web Server' || n.type === 'Application Server')
  
  databases.forEach(db => {
    applications.slice(0, 2).forEach(app => {
      connections.push(createDataConnection(app.uid, db.uid, 'Accesses Data'))
    })
  })
  
  // File server access relationships
  const fileServers = dataNodes.filter(n => n.type === 'File Server')
  const users = allNodes.filter(n => n.type === 'User Account')
  
  fileServers.forEach(fs => {
    users.slice(0, 3).forEach(user => {
      connections.push(createDataConnection(user.uid, fs.uid, 'Accesses Files'))
    })
  })
  
  return connections
}

function generateThreatIntelConnections(threatIntelNodes: EnhancedCybersecurityNode[], allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // Threat intelligence feeds to security tools
  const threatFeeds = threatIntelNodes.filter(n => n.type === 'Threat Intelligence Feed')
  const securityTools = allNodes.filter(n => ['SIEM', 'SOAR', 'IDS', 'IPS'].includes(n.type))
  
  threatFeeds.forEach(feed => {
    securityTools.slice(0, 3).forEach(tool => {
      connections.push(createDataFlowConnection(feed.uid, tool.uid, 'Provides Intelligence'))
    })
  })
  
  return connections
}

function generateAdvancedRelationships(nodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityEdge[] {
  const connections: EnhancedCybersecurityEdge[] = []
  
  // Generate lateral movement paths
  const workstations = nodes.filter(n => n.type === 'Workstation')
  const servers = nodes.filter(n => n.type === 'Server')
  
  workstations.forEach(ws => {
    servers.slice(0, 2).forEach(server => {
      if (ws.networkSegment === server.networkSegment) {
        connections.push(createLateralMovementConnection(ws.uid, server.uid, 'Lateral Movement Path'))
      }
    })
  })
  
  // Generate privilege escalation paths
  const userAccounts = nodes.filter(n => n.type === 'User Account' && n.privileges?.includes('User'))
  const adminAccounts = nodes.filter(n => n.type === 'User Account' && n.privileges?.some(p => p.includes('Admin')))
  
  userAccounts.forEach(user => {
    adminAccounts.slice(0, 1).forEach(admin => {
      connections.push(createPrivilegeEscalationConnection(user.uid, admin.uid, 'Privilege Escalation Path'))
    })
  })
  
  return connections
}

function simulateCompromiseScenarios(
  nodes: EnhancedCybersecurityNode[], 
  edges: EnhancedCybersecurityEdge[]
): { nodes: EnhancedCybersecurityNode[]; edges: EnhancedCybersecurityEdge[] } {
  // Simulate some nodes as compromised for demonstration
  const compromisedNodes = nodes.map(node => {
    if (Math.random() < 0.1) { // 10% chance of compromise
      return {
        ...node,
        compromiseIndicators: ['Unusual network activity', 'Suspicious process execution'],
        properties: {
          ...node.properties,
          TC_ALARM: 'Alert',
          TC_ANIMATION: 'flash',
          compromise_status: 'Suspected'
        }
      }
    }
    return node
  })
  
  return { nodes: compromisedNodes, edges }
}

// Connection creation helpers
function createNetworkConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Network Connection',
    properties: { description },
    category: 'Network',
    encrypted: true,
    monitored: true,
    riskLevel: 'Low',
    exploitMethods: ['Network Sniffing', 'Man-in-the-Middle'],
    prerequisites: ['Network Access'],
    difficulty: 'Medium',
    protocol: 'TCP/IP',
    port: 443,
    dataFlow: 'Bidirectional',
    bandwidth: '1 Gbps',
    latency: '< 1ms',
    availability: 99.9
  }
}

function createTrustConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Trust Relationship',
    properties: { description },
    category: 'Trust',
    encrypted: true,
    monitored: true,
    riskLevel: 'Medium',
    exploitMethods: ['Kerberoasting', 'Golden Ticket'],
    prerequisites: ['Domain Access'],
    difficulty: 'High',
    protocol: 'Kerberos',
    dataFlow: 'Bidirectional',
    availability: 99.5
  }
}

function createAccessConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Access Relationship',
    properties: { description },
    category: 'Access',
    encrypted: true,
    monitored: true,
    riskLevel: 'High',
    exploitMethods: ['Credential Theft', 'Session Hijacking'],
    prerequisites: ['Valid Credentials'],
    difficulty: 'Medium',
    dataFlow: 'Unidirectional',
    availability: 99.0
  }
}

function createThreatConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Threat Relationship',
    properties: { description },
    category: 'Exploit',
    encrypted: false,
    monitored: true,
    riskLevel: 'Critical',
    exploitMethods: ['Network Exploitation', 'Social Engineering'],
    prerequisites: ['Internet Access'],
    difficulty: 'Medium',
    dataFlow: 'Unidirectional',
    availability: 95.0
  }
}

function createVulnerabilityConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Vulnerability Relationship',
    properties: { description },
    category: 'Exploit',
    encrypted: false,
    monitored: false,
    riskLevel: 'Critical',
    exploitMethods: ['Remote Code Execution', 'Privilege Escalation'],
    prerequisites: ['Network Access'],
    difficulty: 'Low',
    dataFlow: 'Unidirectional',
    availability: 90.0
  }
}

function createMonitoringConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Monitoring Relationship',
    properties: { description },
    category: 'Data Flow',
    encrypted: true,
    monitored: false,
    riskLevel: 'Low',
    exploitMethods: [],
    prerequisites: ['Agent Installation'],
    difficulty: 'High',
    dataFlow: 'Unidirectional',
    availability: 99.9
  }
}

function createProtectionConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Protection Relationship',
    properties: { description },
    category: 'Data Flow',
    encrypted: true,
    monitored: false,
    riskLevel: 'Low',
    exploitMethods: [],
    prerequisites: ['Agent Installation'],
    difficulty: 'High',
    dataFlow: 'Bidirectional',
    availability: 99.8
  }
}

function createDataConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Data Access',
    properties: { description },
    category: 'Data Flow',
    encrypted: true,
    monitored: true,
    riskLevel: 'Medium',
    exploitMethods: ['SQL Injection', 'Data Exfiltration'],
    prerequisites: ['Database Access'],
    difficulty: 'Medium',
    dataFlow: 'Bidirectional',
    availability: 99.5
  }
}

function createDataFlowConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Data Flow',
    properties: { description },
    category: 'Data Flow',
    encrypted: true,
    monitored: false,
    riskLevel: 'Low',
    exploitMethods: [],
    prerequisites: ['API Access'],
    difficulty: 'Medium',
    dataFlow: 'Unidirectional',
    availability: 99.0
  }
}

function createLateralMovementConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Lateral Movement',
    properties: { description },
    category: 'Lateral Movement',
    encrypted: false,
    monitored: false,
    riskLevel: 'High',
    exploitMethods: ['Remote Services', 'Credential Dumping'],
    prerequisites: ['Network Access'],
    difficulty: 'Medium',
    dataFlow: 'Unidirectional',
    availability: 85.0
  }
}

function createPrivilegeEscalationConnection(from: string, to: string, description: string): EnhancedCybersecurityEdge {
  return {
    from,
    to,
    type: 'Privilege Escalation',
    properties: { description },
    category: 'Exploit',
    encrypted: false,
    monitored: false,
    riskLevel: 'High',
    exploitMethods: ['Token Manipulation', 'Exploitation for Privilege Escalation'],
    prerequisites: ['Initial Access'],
    difficulty: 'Medium',
    dataFlow: 'Unidirectional',
    availability: 80.0
  }
}

// Helper functions (reusing and extending from previous implementation)
function categorizeNodeType(type: string): 'Infrastructure' | 'Identity' | 'Data' | 'Application' | 'Network' | 'Security' | 'Threat' | 'Compliance' {
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
    'Vulnerability': 'Security',
    'Compliance Framework': 'Compliance'
  }
  
  return categories[type as keyof typeof categories] || 'Infrastructure'
}

function categorizeEdgeType(type: string): 'Network' | 'Access' | 'Data Flow' | 'Trust' | 'Exploit' | 'Lateral Movement' | 'Compliance' {
  const categories = {
    'Connection': 'Network',
    'Network Connection': 'Network',
    'Access Relationship': 'Access',
    'Trust Relationship': 'Trust',
    'Monitoring Relationship': 'Data Flow',
    'Threat Relationship': 'Exploit',
    'Vulnerability Relationship': 'Exploit',
    'Lateral Movement': 'Lateral Movement',
    'Privilege Escalation': 'Exploit'
  }
  
  return categories[type as keyof typeof categories] || 'Network'
}

// Additional helper functions for enhanced properties
function determineAlarmLevel(type: string): string {
  const alarmLevels = {
    'Threat Actor': 'Alert',
    'Vulnerability': 'Alert',
    'Domain Controller': 'Warning',
    'Database': 'Warning',
    'SIEM': 'Success',
    'EDR': 'Success'
  }
  
  return alarmLevels[type as keyof typeof alarmLevels] || 'Info'
}

function determineAnimation(type: string): string {
  const animations = {
    'Threat Actor': 'pulse',
    'Vulnerability': 'flash',
    'Domain Controller': 'glow',
    'Database': 'glow'
  }
  
  return animations[type as keyof typeof animations] || 'none'
}

function determineBusinessFunction(type: string): string {
  const functions = {
    'Domain Controller': 'Identity Management',
    'Database': 'Data Storage',
    'Web Server': 'Web Services',
    'Email Server': 'Communication',
    'File Server': 'File Storage',
    'Firewall': 'Network Security',
    'SIEM': 'Security Monitoring'
  }
  
  return functions[type as keyof typeof functions] || 'General Operations'
}

function determineDataClassification(type: string): 'Public' | 'Internal' | 'Confidential' | 'Restricted' {
  const classifications = {
    'Database': 'Confidential',
    'File Server': 'Internal',
    'Domain Controller': 'Restricted',
    'Web Server': 'Public'
  }
  
  return classifications[type as keyof typeof classifications] || 'Internal'
}

function determineBackupStatus(type: string): 'Current' | 'Outdated' | 'None' {
  const critical = ['Database', 'Domain Controller', 'File Server']
  return critical.includes(type) ? 'Current' : 'Outdated'
}

function determinePatchLevel(type: string): 'Current' | 'Behind' | 'Critical' {
  // Simulate realistic patch levels
  const random = Math.random()
  if (random < 0.6) return 'Current'
  if (random < 0.9) return 'Behind'
  return 'Critical'
}

function determineEncryptionStatus(type: string): 'Encrypted' | 'Partial' | 'None' {
  const encrypted = ['Database', 'File Server', 'Domain Controller']
  const partial = ['Web Server', 'Email Server']
  
  if (encrypted.includes(type)) return 'Encrypted'
  if (partial.includes(type)) return 'Partial'
  return 'None'
}

function determineComplianceRequirements(type: string): string[] {
  const requirements = {
    'Database': ['SOX', 'PCI-DSS', 'GDPR'],
    'File Server': ['SOX', 'GDPR'],
    'Domain Controller': ['SOX', 'HIPAA'],
    'Financial System': ['SOX', 'PCI-DSS']
  }
  
  return requirements[type as keyof typeof requirements] || []
}

function determineAffectedSystems(vulnId: string, allNodes: EnhancedCybersecurityNode[]): EnhancedCybersecurityNode[] {
  if (vulnId.includes('Log4j')) {
    return allNodes.filter(n => ['Web Server', 'Application Server'].includes(n.type))
  }
  if (vulnId.includes('Zerologon')) {
    return allNodes.filter(n => n.type === 'Domain Controller')
  }
  if (vulnId.includes('BlueKeep')) {
    return allNodes.filter(n => ['Server', 'Workstation'].includes(n.type))
  }
  if (vulnId.includes('PrintNightmare')) {
    return allNodes.filter(n => ['Server', 'Workstation'].includes(n.type))
  }
  
  return []
}

// Reuse existing helper functions from previous implementation
function calculateNodeCriticality(node: any): 'Critical' | 'High' | 'Medium' | 'Low' {
  const criticalTypes = ['Domain Controller', 'Database', 'Financial System', 'Threat Actor']
  const highTypes = ['Server', 'File Server', 'Email Server', 'SIEM', 'EDR']
  const mediumTypes = ['Workstation', 'Router', 'Switch', 'Firewall']
  
  if (criticalTypes.includes(node.type)) return 'Critical'
  if (highTypes.includes(node.type)) return 'High'
  if (mediumTypes.includes(node.type)) return 'Medium'
  return 'Low'
}

function generateNodeVulnerabilities(type: string): string[] {
  const vulnerabilities = {
    'Server': ['Unpatched OS', 'Weak Passwords', 'Open Ports', 'Misconfiguration'],
    'Workstation': ['Malware', 'Phishing', 'USB Attacks', 'Outdated Software'],
    'Database': ['SQL Injection', 'Weak Authentication', 'Data Exposure', 'Privilege Escalation'],
    'Web Server': ['XSS', 'CSRF', 'Directory Traversal', 'Injection Attacks'],
    'Domain Controller': ['Kerberoasting', 'DCSync', 'Golden Ticket', 'Silver Ticket'],
    'Network Device': ['Default Credentials', 'Firmware Vulnerabilities', 'SNMP Exposure'],
    'Threat Actor': [],
    'Vulnerability': []
  }
  
  return vulnerabilities[type as keyof typeof vulnerabilities] || ['Configuration Weakness']
}

function generateNodePrivileges(type: string): string[] {
  const privileges = {
    'Domain Controller': ['Domain Admin', 'Enterprise Admin', 'System'],
    'Server': ['Local Admin', 'Service', 'System'],
    'Workstation': ['User', 'Local Admin'],
    'Database': ['Database Admin', 'Service', 'System'],
    'User Account': ['User'],
    'Service Account': ['Service', 'Network Service'],
    'Threat Actor': ['External'],
    'SIEM': ['Security Admin'],
    'EDR': ['System', 'Security Admin']
  }
  
  return privileges[type as keyof typeof privileges] || ['User']
}

function determineNetworkSegment(type: string): string {
  const segments = {
    'Web Server': 'DMZ',
    'Email Server': 'DMZ',
    'VPN Gateway': 'DMZ',
    'Firewall': 'DMZ',
    'Database': 'Internal',
    'Domain Controller': 'Internal',
    'File Server': 'Internal',
    'Workstation': 'Corporate',
    'Server': 'Internal',
    'SIEM': 'Security',
    'EDR': 'Security',
    'Threat Actor': 'External',
    'Router': 'Core',
    'Switch': 'Core'
  }
  
  return segments[type as keyof typeof segments] || 'Corporate'
}

function calculateAssetValue(type: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  const values = {
    'Domain Controller': 'Critical',
    'Database': 'Critical',
    'Threat Actor': 'Critical',
    'File Server': 'High',
    'Server': 'High',
    'Web Server': 'Medium',
    'Workstation': 'Low',
    'Network Device': 'Medium',
    'SIEM': 'High',
    'EDR': 'High'
  }
  
  return values[type as keyof typeof values] || 'Medium'
}

function generateSecurityControls(type: string): string[] {
  const controls = {
    'Domain Controller': ['Multi-Factor Authentication', 'Privileged Access Management', 'Audit Logging'],
    'Database': ['Database Activity Monitoring', 'Encryption at Rest', 'Access Controls'],
    'Server': ['Endpoint Protection', 'Patch Management', 'Configuration Management'],
    'Workstation': ['Endpoint Protection', 'Application Control', 'User Training'],
    'Web Server': ['Web Application Firewall', 'SSL/TLS', 'Input Validation'],
    'Network Device': ['Access Control Lists', 'SNMP Security', 'Firmware Updates']
  }
  
  return controls[type as keyof typeof controls] || ['Basic Security Controls']
}

function determineMonitoringLevel(type: string): 'High' | 'Medium' | 'Low' | 'None' {
  const levels = {
    'Domain Controller': 'High',
    'Database': 'High',
    'Threat Actor': 'High',
    'Server': 'Medium',
    'Workstation': 'Low',
    'Network Device': 'Medium',
    'SIEM': 'High',
    'EDR': 'High'
  }
  
  return levels[type as keyof typeof levels] || 'Low'
}

function calculateNodeRiskScore(node: any): number {
  let score = 5 // Base score
  
  // Adjust based on type
  const typeScores = {
    'Threat Actor': 10,
    'Vulnerability': 9,
    'Domain Controller': 9,
    'Database': 8,
    'Server': 6,
    'Workstation': 4,
    'SIEM': 3,
    'EDR': 3
  }
  
  score = typeScores[node.type as keyof typeof typeScores] || score
  
  // Add some randomness for realism
  score += (Math.random() - 0.5) * 2
  
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10))
}

function calculateEdgeRiskLevel(edge: any): 'Critical' | 'High' | 'Medium' | 'Low' {
  const riskTypes = {
    'Threat Relationship': 'Critical',
    'Vulnerability Relationship': 'Critical',
    'Lateral Movement': 'High',
    'Privilege Escalation': 'High',
    'Access Relationship': 'High',
    'Trust Relationship': 'Medium',
    'Network Connection': 'Low',
    'Monitoring Relationship': 'Low'
  }
  
  return riskTypes[edge.type as keyof typeof riskTypes] || 'Medium'
}

function generateExploitMethods(type: string): string[] {
  const methods = {
    'Network Connection': ['Network Sniffing', 'Man-in-the-Middle'],
    'Access Relationship': ['Credential Theft', 'Session Hijacking'],
    'Trust Relationship': ['Kerberoasting', 'Golden Ticket'],
    'Threat Relationship': ['Network Exploitation', 'Social Engineering'],
    'Vulnerability Relationship': ['Remote Code Execution', 'Privilege Escalation'],
    'Lateral Movement': ['Remote Services', 'Credential Dumping'],
    'Privilege Escalation': ['Token Manipulation', 'Exploitation for Privilege Escalation']
  }
  
  return methods[type as keyof typeof methods] || ['Network Attack']
}

function generatePrerequisites(type: string): string[] {
  const prerequisites = {
    'Network Connection': ['Network Access'],
    'Access Relationship': ['Valid Credentials'],
    'Trust Relationship': ['Domain Access'],
    'Threat Relationship': ['Internet Access'],
    'Vulnerability Relationship': ['Network Access'],
    'Lateral Movement': ['Initial Access'],
    'Privilege Escalation': ['User Access']
  }
  
  return prerequisites[type as keyof typeof prerequisites] || ['Network Access']
}

function assignDifficulty(type: string): 'Low' | 'Medium' | 'High' {
  const difficulties = {
    'Threat Relationship': 'Medium',
    'Vulnerability Relationship': 'Low',
    'Lateral Movement': 'Medium',
    'Privilege Escalation': 'Medium',
    'Access Relationship': 'Medium',
    'Trust Relationship': 'High',
    'Network Connection': 'Medium',
    'Monitoring Relationship': 'High'
  }
  
  return difficulties[type as keyof typeof difficulties] || 'Medium'
}

function assignMitreTechnique(type: string): string {
  const techniques = {
    'Threat Relationship': 'T1190 - Exploit Public-Facing Application',
    'Vulnerability Relationship': 'T1068 - Exploitation for Privilege Escalation',
    'Lateral Movement': 'T1021 - Remote Services',
    'Privilege Escalation': 'T1548 - Abuse Elevation Control Mechanism',
    'Access Relationship': 'T1078 - Valid Accounts',
    'Trust Relationship': 'T1550 - Use Alternate Authentication Material'
  }
  
  return techniques[type as keyof typeof techniques] || 'T1059 - Command and Scripting Interpreter'
}

function generateDetectionMethods(type: string): string[] {
  const methods = {
    'Threat Relationship': ['Network Monitoring', 'Threat Intelligence'],
    'Vulnerability Relationship': ['Vulnerability Scanning', 'Patch Management'],
    'Lateral Movement': ['Network Segmentation Monitoring', 'Behavioral Analysis'],
    'Privilege Escalation': ['Privilege Monitoring', 'Audit Logging'],
    'Access Relationship': ['Access Monitoring', 'Authentication Logging']
  }
  
  return methods[type as keyof typeof methods] || ['Security Monitoring']
}

function generatePreventionMethods(type: string): string[] {
  const methods = {
    'Threat Relationship': ['Firewall Rules', 'Intrusion Prevention'],
    'Vulnerability Relationship': ['Patch Management', 'Configuration Hardening'],
    'Lateral Movement': ['Network Segmentation', 'Zero Trust Architecture'],
    'Privilege Escalation': ['Least Privilege', 'Privileged Access Management'],
    'Access Relationship': ['Multi-Factor Authentication', 'Access Controls']
  }
  
  return methods[type as keyof typeof methods] || ['Security Controls']
}

function determineEncryption(type: string): boolean {
  const encryptedTypes = ['Trust Relationship', 'Access Relationship', 'Monitoring Relationship']
  return encryptedTypes.includes(type)
}

function determineMonitoring(type: string): boolean {
  const monitoredTypes = ['Network Connection', 'Access Relationship', 'Trust Relationship', 'Threat Relationship']
  return monitoredTypes.includes(type)
}

function determineProtocol(type: string): string {
  const protocols = {
    'Network Connection': 'TCP/IP',
    'Trust Relationship': 'Kerberos',
    'Access Relationship': 'LDAP',
    'Monitoring Relationship': 'HTTPS',
    'Threat Relationship': 'HTTP'
  }
  
  return protocols[type as keyof typeof protocols] || 'TCP'
}

function determinePort(type: string): number {
  const ports = {
    'Network Connection': 443,
    'Trust Relationship': 88,
    'Access Relationship': 389,
    'Monitoring Relationship': 443,
    'Threat Relationship': 80
  }
  
  return ports[type as keyof typeof ports] || 443
}

function determineDataFlow(type: string): 'Bidirectional' | 'Unidirectional' | 'None' {
  const flows = {
    'Network Connection': 'Bidirectional',
    'Trust Relationship': 'Bidirectional',
    'Access Relationship': 'Unidirectional',
    'Monitoring Relationship': 'Unidirectional',
    'Threat Relationship': 'Unidirectional'
  }
  
  return flows[type as keyof typeof flows] || 'Bidirectional'
}

function determineBandwidth(type: string): string {
  const bandwidths = {
    'Network Connection': '1 Gbps',
    'Trust Relationship': '100 Mbps',
    'Access Relationship': '10 Mbps',
    'Monitoring Relationship': '100 Mbps'
  }
  
  return bandwidths[type as keyof typeof bandwidths] || '100 Mbps'
}

function determineLatency(type: string): string {
  const latencies = {
    'Network Connection': '< 1ms',
    'Trust Relationship': '< 5ms',
    'Access Relationship': '< 10ms',
    'Monitoring Relationship': '< 50ms'
  }
  
  return latencies[type as keyof typeof latencies] || '< 10ms'
}

function determineAvailability(type: string): number {
  const availabilities = {
    'Network Connection': 99.9,
    'Trust Relationship': 99.5,
    'Access Relationship': 99.0,
    'Monitoring Relationship': 99.9,
    'Threat Relationship': 95.0
  }
  
  return availabilities[type as keyof typeof availabilities] || 99.0
}

