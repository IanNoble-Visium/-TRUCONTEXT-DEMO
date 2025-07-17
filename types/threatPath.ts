/**
 * Enhanced Threat Path Analysis Data Types
 * Comprehensive data structures for Attack Path Analysis (APA)
 */

// Core threat path interfaces
export interface ThreatPathNode {
  uid: string
  type: string
  showname: string
  properties: Record<string, any>
  riskScore?: number
  vulnerabilities?: string[]
  privileges?: string[]
  networkSegment?: string
  assetValue?: 'Critical' | 'High' | 'Medium' | 'Low'
  securityControls?: string[]
  lastSeen?: string
  compromiseIndicators?: string[]
}

export interface ThreatPathEdge {
  from: string
  to: string
  type: string
  properties: Record<string, any>
  exploitMethod?: string
  difficulty?: 'Low' | 'Medium' | 'High'
  prerequisites?: string[]
  mitreTechnique?: string
  detectionMethods?: string[]
  preventionMethods?: string[]
}

// Enhanced threat path scenario
export interface ThreatPathScenario {
  id: string
  name: string
  description: string
  scenario: string
  attackerProfile: {
    type: 'External' | 'Insider' | 'APT' | 'Ransomware' | 'Script Kiddie'
    sophistication: 'Low' | 'Medium' | 'High' | 'Advanced'
    motivation: string[]
    capabilities: string[]
  }
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
  lastUpdated: string
  status: 'Active' | 'Mitigated' | 'Accepted' | 'Under Review'
}

// SOC Response Actions
export interface SOCAction {
  id: string
  threatPathId: string
  type: 'Containment' | 'Investigation' | 'Remediation' | 'Preventive'
  category: string
  name: string
  description: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Failed'
  assignedTo?: string
  assignedTeam?: string
  estimatedTime: string
  actualTime?: string
  dependencies?: string[]
  prerequisites?: string[]
  automationAvailable: boolean
  playbook?: string
  tools?: string[]
  evidence?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  verifiedAt?: string
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: string
}

// Containment Actions
export interface ContainmentAction extends SOCAction {
  type: 'Containment'
  containmentMethod: 'Isolation' | 'Blocking' | 'Disabling' | 'Segmentation'
  affectedSystems: string[]
  networkChanges?: string[]
  accessChanges?: string[]
  rollbackPlan: string
}

// Investigation Actions
export interface InvestigationAction extends SOCAction {
  type: 'Investigation'
  investigationType: 'Forensic' | 'Behavioral' | 'Network' | 'Malware' | 'Timeline'
  evidenceCollected: string[]
  analysisTools: string[]
  findings?: string[]
  iocs?: string[] // Indicators of Compromise
  ttps?: string[] // Tactics, Techniques, and Procedures
  attribution?: string
  confidence: 'Low' | 'Medium' | 'High'
}

// Remediation Actions
export interface RemediationAction extends SOCAction {
  type: 'Remediation'
  remediationType: 'Patching' | 'Configuration' | 'Cleanup' | 'Restoration'
  vulnerabilitiesAddressed: string[]
  systemsAffected: string[]
  configurationChanges?: string[]
  patchesApplied?: string[]
  backupRequired: boolean
  testingRequired: boolean
  rollbackPlan: string
}

// Preventive Actions
export interface PreventiveAction extends SOCAction {
  type: 'Preventive'
  preventionType: 'Detection Rule' | 'Policy Update' | 'Training' | 'Architecture'
  detectionRules?: string[]
  policyChanges?: string[]
  trainingModules?: string[]
  architecturalChanges?: string[]
  effectiveness?: number
  falsePositiveRate?: number
}

// Root Cause Analysis
export interface RootCauseAnalysis {
  id: string
  threatPathId: string
  primaryCause: string
  contributingFactors: Array<{
    category: 'Technical' | 'Process' | 'Human' | 'Environmental'
    factor: string
    impact: 'High' | 'Medium' | 'Low'
    description: string
  }>
  whyAnalysis: Array<{
    level: number
    question: string
    answer: string
    evidence: string[]
  }>
  fishboneDiagram: {
    categories: Array<{
      name: string
      causes: string[]
    }>
  }
  timeline: Array<{
    timestamp: string
    event: string
    impact: string
    preventable: boolean
  }>
  recommendations: Array<{
    type: 'Immediate' | 'Short-term' | 'Long-term'
    action: string
    owner: string
    timeline: string
    priority: 'Critical' | 'High' | 'Medium' | 'Low'
  }>
  lessonsLearned: string[]
  createdAt: string
  createdBy: string
  reviewedBy?: string[]
  approvedBy?: string
  status: 'Draft' | 'Under Review' | 'Approved' | 'Implemented'
}

// Action Tracking and Workflow
export interface ActionWorkflow {
  id: string
  threatPathId: string
  name: string
  description: string
  type: 'Manual' | 'Automated' | 'Semi-Automated'
  actions: SOCAction[]
  dependencies: Array<{
    actionId: string
    dependsOn: string[]
    type: 'Sequential' | 'Parallel' | 'Conditional'
  }>
  approvals: Array<{
    actionId: string
    requiredApprovers: string[]
    approvalCriteria: string
  }>
  notifications: Array<{
    trigger: 'Start' | 'Complete' | 'Error' | 'Approval Required'
    recipients: string[]
    method: 'Email' | 'Slack' | 'SMS' | 'Dashboard'
  }>
  sla: {
    responseTime: string
    resolutionTime: string
    escalationTime: string
  }
  metrics: {
    totalActions: number
    completedActions: number
    failedActions: number
    averageCompletionTime: string
    slaCompliance: number
  }
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Failed' | 'Cancelled'
  createdAt: string
  startedAt?: string
  completedAt?: string
  createdBy: string
}

// Threat Path Analytics
export interface ThreatPathAnalytics {
  totalPaths: number
  activePaths: number
  mitigatedPaths: number
  averageRiskScore: number
  riskDistribution: {
    critical: number
    high: number
    medium: number
    low: number
  }
  coverageMetrics: {
    nodesInvolved: number
    edgesInvolved: number
    networkSegments: string[]
    assetTypes: string[]
  }
  timeMetrics: {
    averageDetectionTime: string
    averageResponseTime: string
    averageResolutionTime: string
  }
  actionMetrics: {
    totalActions: number
    completedActions: number
    automatedActions: number
    manualActions: number
    averageActionTime: string
  }
  trends: Array<{
    date: string
    newPaths: number
    resolvedPaths: number
    averageRiskScore: number
  }>
  topAttackVectors: Array<{
    vector: string
    frequency: number
    averageRiskScore: number
  }>
  topTargetAssets: Array<{
    asset: string
    frequency: number
    averageRiskScore: number
  }>
}

// Configuration interfaces
export interface ThreatPathGenerationConfig {
  scenarioType?: 'external_attack' | 'insider_threat' | 'apt_campaign' | 'ransomware' | 'data_breach' | 'supply_chain'
  maxPathsPerScenario?: number
  maxPathLength?: number
  minPathLength?: number
  includeExternalThreats?: boolean
  includeInsiderThreats?: boolean
  includeLateralMovement?: boolean
  includePrivilegeEscalation?: boolean
  includeDataExfiltration?: boolean
  targetSpecificAssets?: string[]
  excludeAssets?: string[]
  riskThreshold?: number
  timeConstraints?: string
  attackerCapabilities?: string[]
}

export interface DataEnhancementConfig {
  addVulnerabilities?: boolean
  addPrivileges?: boolean
  addNetworkSegments?: boolean
  addSecurityControls?: boolean
  addAssetValues?: boolean
  enhanceRelationships?: boolean
  addThreatIntelligence?: boolean
  simulateCompromise?: boolean
}

// API Response interfaces
export interface ThreatPathAnalysisResponse {
  success: boolean
  threatPaths: ThreatPathScenario[]
  analytics: ThreatPathAnalytics
  recommendations: string[]
  enhancedData?: {
    nodes: ThreatPathNode[]
    edges: ThreatPathEdge[]
  }
  error?: string
}

export interface SOCActionResponse {
  success: boolean
  action: SOCAction
  workflow?: ActionWorkflow
  notifications?: string[]
  error?: string
}

export interface RootCauseAnalysisResponse {
  success: boolean
  analysis: RootCauseAnalysis
  recommendations: string[]
  error?: string
}

