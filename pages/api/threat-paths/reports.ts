import { NextApiRequest, NextApiResponse } from 'next'
import { ThreatPathScenario, SOCAction, RootCauseAnalysis } from '../../../types/threatPath'

// Define WorkflowExecution locally since it's not exported from types
interface WorkflowExecution {
  id: string
  name: string
  status: 'Pending' | 'Running' | 'Completed' | 'Failed'
  steps: any[]
  startedAt?: string
  completedAt?: string
}

interface ThreatPathReport {
  id: string
  threatPathId: string
  reportType: 'executive_summary' | 'technical_analysis' | 'compliance_audit' | 'lessons_learned' | 'metrics_dashboard'
  title: string
  generatedAt: string
  generatedBy: string
  status: 'generating' | 'completed' | 'failed'
  sections: ReportSection[]
  metadata: {
    threatPath: ThreatPathScenario
    actions: SOCAction[]
    workflows: WorkflowExecution[]
    rootCauseAnalysis?: RootCauseAnalysis
    metrics: ThreatPathMetrics
  }
}

interface ReportSection {
  id: string
  title: string
  content: string
  charts?: ChartData[]
  tables?: TableData[]
  recommendations?: string[]
  details?: string[]
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'timeline' | 'heatmap'
  title: string
  data: any[]
  config?: any
}

interface TableData {
  title: string
  headers: string[]
  rows: string[][]
}

interface ThreatPathMetrics {
  detectionTime: number // minutes
  responseTime: number // minutes
  containmentTime: number // minutes
  recoveryTime: number // minutes
  totalActions: number
  automatedActions: number
  manualActions: number
  successRate: number // percentage
  riskReduction: number // percentage
  costImpact: number // dollars
  affectedSystems: number
  compromisedAccounts: number
  dataExfiltrated: number // GB
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical'
}

// Mock data for demo
const mockMetrics: ThreatPathMetrics = {
  detectionTime: 45,
  responseTime: 15,
  containmentTime: 120,
  recoveryTime: 480,
  totalActions: 12,
  automatedActions: 8,
  manualActions: 4,
  successRate: 91.7,
  riskReduction: 85,
  costImpact: 125000,
  affectedSystems: 23,
  compromisedAccounts: 5,
  dataExfiltrated: 2.3,
  businessImpact: 'High'
}

const mockReports: ThreatPathReport[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        return handleGetReports(req, res)
      case 'POST':
        return handleGenerateReport(req, res)
      case 'DELETE':
        return handleDeleteReport(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Reports API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleGetReports(req: NextApiRequest, res: NextApiResponse) {
  const { threatPathId, reportType, status } = req.query

  let filteredReports = [...mockReports]

  // Apply filters
  if (threatPathId) {
    filteredReports = filteredReports.filter(report => report.threatPathId === threatPathId)
  }
  if (reportType) {
    filteredReports = filteredReports.filter(report => report.reportType === reportType)
  }
  if (status) {
    filteredReports = filteredReports.filter(report => report.status === status)
  }

  // Sort by generation date (newest first)
  filteredReports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())

  return res.status(200).json({
    success: true,
    data: {
      reports: filteredReports,
      metrics: mockMetrics,
      summary: {
        total: filteredReports.length,
        completed: filteredReports.filter(r => r.status === 'completed').length,
        generating: filteredReports.filter(r => r.status === 'generating').length,
        failed: filteredReports.filter(r => r.status === 'failed').length
      }
    }
  })
}

async function handleGenerateReport(req: NextApiRequest, res: NextApiResponse) {
  const { threatPathId, reportType, title, generatedBy } = req.body

  if (!threatPathId || !reportType) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['threatPathId', 'reportType']
    })
  }

  const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const newReport: ThreatPathReport = {
    id: reportId,
    threatPathId,
    reportType,
    title: title || getDefaultReportTitle(reportType),
    generatedAt: new Date().toISOString(),
    generatedBy: generatedBy || 'System',
    status: 'generating',
    sections: [],
    metadata: {
      threatPath: getMockThreatPath(threatPathId),
      actions: getMockActions(threatPathId),
      workflows: getMockWorkflows(threatPathId),
      rootCauseAnalysis: getMockRootCauseAnalysis(threatPathId),
      metrics: mockMetrics
    }
  }

  mockReports.push(newReport)

  // Simulate report generation
  setTimeout(async () => {
    try {
      const generatedSections = await generateReportSections(reportType, newReport.metadata)
      
      const reportIndex = mockReports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        mockReports[reportIndex] = {
          ...mockReports[reportIndex],
          status: 'completed',
          sections: generatedSections
        }
      }
    } catch (error) {
      const reportIndex = mockReports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        mockReports[reportIndex].status = 'failed'
      }
    }
  }, 3000) // 3-second generation time

  return res.status(201).json({
    success: true,
    data: newReport,
    message: 'Report generation started'
  })
}

async function handleDeleteReport(req: NextApiRequest, res: NextApiResponse) {
  const { reportId } = req.query

  const reportIndex = mockReports.findIndex(report => report.id === reportId)
  if (reportIndex === -1) {
    return res.status(404).json({
      error: 'Report not found',
      reportId
    })
  }

  const deletedReport = mockReports.splice(reportIndex, 1)[0]

  return res.status(200).json({
    success: true,
    data: deletedReport,
    message: 'Report deleted successfully'
  })
}

function getDefaultReportTitle(reportType: string): string {
  const titles = {
    executive_summary: 'Executive Summary Report',
    technical_analysis: 'Technical Analysis Report',
    compliance_audit: 'Compliance Audit Report',
    lessons_learned: 'Lessons Learned Report',
    metrics_dashboard: 'Metrics Dashboard Report'
  }
  return titles[reportType as keyof typeof titles] || 'Threat Path Report'
}

async function generateReportSections(reportType: string, metadata: ThreatPathReport['metadata']): Promise<ReportSection[]> {
  switch (reportType) {
    case 'executive_summary':
      return generateExecutiveSummary(metadata)
    case 'technical_analysis':
      return generateTechnicalAnalysis(metadata)
    case 'compliance_audit':
      return generateComplianceAudit(metadata)
    case 'lessons_learned':
      return generateLessonsLearned(metadata)
    case 'metrics_dashboard':
      return generateMetricsDashboard(metadata)
    default:
      throw new Error('Unknown report type')
  }
}

function generateExecutiveSummary(metadata: ThreatPathReport['metadata']): ReportSection[] {
  return [
    {
      id: 'exec-overview',
      title: 'Executive Overview',
      content: `This report provides an executive summary of the threat path analysis for "${metadata.threatPath.name}". The incident was detected within ${metadata.metrics.detectionTime} minutes and contained within ${metadata.metrics.containmentTime} minutes, resulting in a ${metadata.metrics.riskReduction}% risk reduction.`,
      charts: [
        {
          type: 'pie',
          title: 'Response Actions Distribution',
          data: [
            { name: 'Automated', value: metadata.metrics.automatedActions },
            { name: 'Manual', value: metadata.metrics.manualActions }
          ]
        }
      ]
    },
    {
      id: 'exec-impact',
      title: 'Business Impact Assessment',
      content: `The incident had a ${metadata.metrics.businessImpact} business impact, affecting ${metadata.metrics.affectedSystems} systems and ${metadata.metrics.compromisedAccounts} user accounts. Estimated cost impact: $${metadata.metrics.costImpact.toLocaleString()}.`,
      tables: [
        {
          title: 'Key Metrics',
          headers: ['Metric', 'Value', 'Target', 'Status'],
          rows: [
            ['Detection Time', `${metadata.metrics.detectionTime} min`, '< 60 min', '✅ Met'],
            ['Response Time', `${metadata.metrics.responseTime} min`, '< 30 min', '✅ Met'],
            ['Containment Time', `${metadata.metrics.containmentTime} min`, '< 240 min', '✅ Met'],
            ['Success Rate', `${metadata.metrics.successRate}%`, '> 90%', '✅ Met']
          ]
        }
      ]
    },
    {
      id: 'exec-recommendations',
      title: 'Strategic Recommendations',
      content: 'Based on the analysis, the following strategic recommendations are proposed to strengthen our security posture.',
      recommendations: [
        'Increase automated response capabilities to reduce manual intervention',
        'Enhance threat detection algorithms to reduce detection time',
        'Implement additional network segmentation to limit lateral movement',
        'Strengthen user awareness training to prevent social engineering attacks'
      ]
    }
  ]
}

function generateTechnicalAnalysis(metadata: ThreatPathReport['metadata']): ReportSection[] {
  return [
    {
      id: 'tech-attack-path',
      title: 'Attack Path Analysis',
      content: `Detailed technical analysis of the attack path "${metadata.threatPath.name}" showing ${metadata.threatPath.path.length} steps in the attack chain.`,
      charts: [
        {
          type: 'timeline',
          title: 'Attack Timeline',
          data: metadata.threatPath.timeline.map(stage => ({
            time: stage.timeframe,
            event: stage.description,
            indicators: stage.indicators
          }))
        }
      ]
    },
    {
      id: 'tech-indicators',
      title: 'Indicators of Compromise (IOCs)',
      content: 'Technical indicators identified during the threat path analysis.',
      tables: [
        {
          title: 'IOCs Identified',
          headers: ['Type', 'Value', 'Confidence', 'Source'],
          rows: [
            ['IP Address', '192.168.1.100', 'High', 'Network Logs'],
            ['File Hash', 'a1b2c3d4e5f6...', 'Medium', 'Endpoint Detection'],
            ['Domain', 'malicious.example.com', 'High', 'DNS Logs'],
            ['User Account', 'compromised.user', 'High', 'Authentication Logs']
          ]
        }
      ]
    },
    {
      id: 'tech-mitigations',
      title: 'Technical Mitigations',
      content: 'Technical controls and mitigations implemented during the response.',
      details: [
        'Implemented network segmentation rules to isolate affected subnets',
        'Deployed additional endpoint detection rules for similar attack patterns',
        'Updated firewall rules to block identified malicious IP addresses',
        'Enhanced logging and monitoring for privilege escalation attempts'
      ]
    }
  ]
}

function generateComplianceAudit(metadata: ThreatPathReport['metadata']): ReportSection[] {
  return [
    {
      id: 'compliance-overview',
      title: 'Compliance Overview',
      content: 'Assessment of incident response activities against regulatory requirements and industry standards.',
      charts: [
        {
          type: 'bar',
          title: 'Compliance Score by Framework',
          data: [
            { framework: 'NIST CSF', score: 85 },
            { framework: 'ISO 27001', score: 78 },
            { framework: 'SOC 2', score: 92 },
            { framework: 'GDPR', score: 88 }
          ]
        }
      ]
    },
    {
      id: 'compliance-requirements',
      title: 'Regulatory Requirements',
      content: 'Analysis of compliance with specific regulatory requirements.',
      tables: [
        {
          title: 'Compliance Checklist',
          headers: ['Requirement', 'Status', 'Evidence', 'Notes'],
          rows: [
            ['Incident Notification (72h)', '✅ Met', 'Notification sent at T+45min', 'GDPR Article 33'],
            ['Evidence Preservation', '✅ Met', 'Forensic images captured', 'SOX Section 404'],
            ['Access Review', '⚠️ Partial', 'Review in progress', 'SOC 2 CC6.1'],
            ['Documentation', '✅ Met', 'Complete audit trail', 'ISO 27035']
          ]
        }
      ]
    }
  ]
}

function generateLessonsLearned(metadata: ThreatPathReport['metadata']): ReportSection[] {
  return [
    {
      id: 'lessons-what-worked',
      title: 'What Worked Well',
      content: 'Analysis of successful aspects of the incident response.',
      details: [
        'Automated containment actions executed within target timeframes',
        'Cross-team collaboration was effective and well-coordinated',
        'Threat intelligence integration provided valuable context',
        'Communication channels remained clear throughout the incident'
      ]
    },
    {
      id: 'lessons-improvements',
      title: 'Areas for Improvement',
      content: 'Identified opportunities to enhance future incident response.',
      details: [
        'Reduce manual steps in the investigation workflow',
        'Improve integration between security tools for better visibility',
        'Enhance training for junior analysts on advanced threat techniques',
        'Develop more granular network segmentation capabilities'
      ]
    },
    {
      id: 'lessons-action-items',
      title: 'Action Items',
      content: 'Specific action items to implement based on lessons learned.',
      tables: [
        {
          title: 'Improvement Actions',
          headers: ['Action', 'Owner', 'Priority', 'Target Date'],
          rows: [
            ['Automate user account lockdown', 'SOC Team', 'High', '2024-02-15'],
            ['Update incident response playbook', 'IR Team', 'Medium', '2024-02-28'],
            ['Enhance SIEM correlation rules', 'Security Engineering', 'High', '2024-02-10'],
            ['Conduct tabletop exercise', 'CISO Office', 'Low', '2024-03-15']
          ]
        }
      ]
    }
  ]
}

function generateMetricsDashboard(metadata: ThreatPathReport['metadata']): ReportSection[] {
  return [
    {
      id: 'metrics-kpis',
      title: 'Key Performance Indicators',
      content: 'Critical metrics for threat path analysis and response effectiveness.',
      charts: [
        {
          type: 'line',
          title: 'Response Time Trends',
          data: [
            { date: '2024-01-01', detection: 60, response: 25, containment: 180 },
            { date: '2024-01-15', detection: 45, response: 20, containment: 150 },
            { date: '2024-01-30', detection: 35, response: 15, containment: 120 }
          ]
        }
      ]
    },
    {
      id: 'metrics-efficiency',
      title: 'Operational Efficiency',
      content: 'Metrics showing the efficiency of automated vs manual responses.',
      charts: [
        {
          type: 'heatmap',
          title: 'Action Success Rate by Type',
          data: [
            { action: 'Containment', automated: 95, manual: 85 },
            { action: 'Investigation', automated: 88, manual: 92 },
            { action: 'Remediation', automated: 90, manual: 78 },
            { action: 'Prevention', automated: 85, manual: 88 }
          ]
        }
      ]
    }
  ]
}

// Mock data generators
function getMockThreatPath(threatPathId: string): ThreatPathScenario {
  return {
    id: threatPathId,
    name: 'Advanced Persistent Threat Campaign',
    description: 'Multi-stage APT campaign targeting financial data',
    scenario: 'External threat actor conducts spear-phishing campaign to gain initial access, then moves laterally through the network to access sensitive financial data.',
    attackerProfile: {
      type: 'APT',
      sophistication: 'Advanced',
      motivation: ['Financial Gain', 'Data Theft', 'Espionage'],
      capabilities: ['Social Engineering', 'Custom Malware', 'Living off the Land', 'Persistence Mechanisms']
    },
    path: ['external-attacker', 'phishing-email', 'user-workstation', 'domain-controller', 'file-server'],
    pathDetails: [
      {
        nodeId: 'external-attacker',
        nodeName: 'External Threat Actor',
        action: 'Initial reconnaissance and target selection',
        technique: 'T1589 - Gather Victim Identity Information',
        timeEstimate: '1-2 weeks',
        detectionProbability: 0.1
      },
      {
        nodeId: 'phishing-email',
        nodeName: 'Spear Phishing Email',
        action: 'Deliver malicious payload via email',
        technique: 'T1566.001 - Spearphishing Attachment',
        timeEstimate: '1 day',
        detectionProbability: 0.3
      },
      {
        nodeId: 'user-workstation',
        nodeName: 'User Workstation',
        action: 'Execute malware and establish persistence',
        technique: 'T1053.005 - Scheduled Task/Job',
        timeEstimate: '30 minutes',
        detectionProbability: 0.5
      },
      {
        nodeId: 'domain-controller',
        nodeName: 'Domain Controller',
        action: 'Privilege escalation and credential harvesting',
        technique: 'T1003.001 - LSASS Memory',
        timeEstimate: '2 hours',
        detectionProbability: 0.7
      },
      {
        nodeId: 'file-server',
        nodeName: 'File Server',
        action: 'Access and exfiltrate sensitive data',
        technique: 'T1041 - Exfiltration Over C2 Channel',
        timeEstimate: '4 hours',
        detectionProbability: 0.8
      }
    ],
    riskScore: 8.5,
    severity: 'Critical',
    likelihood: 0.6,
    impact: 0.8,
    mitreTactics: ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Credential Access', 'Lateral Movement', 'Collection', 'Exfiltration'],
    mitreTechniques: ['T1566.001', 'T1053.005', 'T1003.001', 'T1041', 'T1589'],
    entryPoint: 'Email Gateway',
    targetAsset: 'Financial Database Server',
    estimatedDwellTime: '2-4 weeks',
    detectionDifficulty: 'Hard',
    timeline: [
      {
        stage: 'Initial Access',
        timeframe: 'T+0 minutes',
        description: 'Phishing email delivered to target user',
        indicators: ['suspicious-email.eml', 'malicious-attachment.pdf']
      },
      {
        stage: 'Execution',
        timeframe: 'T+15 minutes',
        description: 'Malware executed on user workstation',
        indicators: ['process-creation', 'network-connection']
      },
      {
        stage: 'Privilege Escalation',
        timeframe: 'T+45 minutes',
        description: 'Local privilege escalation achieved',
        indicators: ['privilege-escalation', 'credential-dumping']
      }
    ],
    prerequisites: ['Valid email addresses', 'Unpatched systems', 'Insufficient email security'],
    businessImpact: {
      confidentiality: 'High',
      integrity: 'Medium',
      availability: 'Low',
      financialImpact: 'Potential loss of $2.5M in customer data breach penalties',
      reputationalImpact: 'Severe damage to brand reputation and customer trust'
    },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'Active'
  }
}

function getMockActions(threatPathId: string): SOCAction[] {
  return [
    {
      id: 'action-1',
      threatPathId,
      type: 'Containment',
      category: 'Network Security',
      name: 'Isolate Affected Systems',
      description: 'Quarantine compromised workstations',
      status: 'Completed',
      priority: 'Critical',
      assignedTo: 'Sarah Chen',
      assignedTeam: 'SOC Team Alpha',
      estimatedTime: '30 minutes',
      actualTime: '25 minutes',
      dependencies: [],
      prerequisites: ['Network access', 'Admin privileges'],
      automationAvailable: true,
      playbook: 'Containment-Playbook-001',
      tools: ['Network Segmentation Tool', 'Endpoint Management'],
      evidence: ['network-logs', 'endpoint-telemetry'],
      notes: 'Successfully isolated affected systems',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3000000).toISOString(),
      completedAt: new Date(Date.now() - 3000000).toISOString(),
      approvalRequired: false,
      approvedBy: 'John Smith',
      approvedAt: new Date(Date.now() - 3500000).toISOString()
    }
  ]
}

function getMockWorkflows(threatPathId: string): WorkflowExecution[] {
  return []
}

function getMockRootCauseAnalysis(threatPathId: string): RootCauseAnalysis {
  return {
    id: 'rca-1',
    threatPathId,
    primaryCause: 'Insufficient email security controls',
    contributingFactors: [
      {
        category: 'Technical',
        factor: 'Outdated email security filters',
        impact: 'High',
        description: 'Email security system failed to detect sophisticated phishing attempt'
      },
      {
        category: 'Process',
        factor: 'Lack of security awareness training',
        impact: 'Medium',
        description: 'Users not adequately trained to identify phishing attempts'
      }
    ],
    whyAnalysis: [
      {
        level: 0,
        question: 'Why did the attack succeed?',
        answer: 'Phishing email bypassed security controls',
        evidence: ['email-logs', 'security-tool-alerts']
      },
      {
        level: 1,
        question: 'Why did the phishing email bypass security controls?',
        answer: 'Email security filters were not updated with latest threat signatures',
        evidence: ['filter-configuration', 'threat-intelligence-feeds']
      }
    ],
    fishboneDiagram: {
      categories: [
        {
          name: 'Technology',
          causes: ['Outdated email filters', 'Insufficient endpoint protection', 'Lack of email sandboxing']
        },
        {
          name: 'Process',
          causes: ['No regular security training', 'Inadequate incident response procedures', 'Poor patch management']
        },
        {
          name: 'People',
          causes: ['Lack of security awareness', 'Insufficient training', 'Human error']
        }
      ]
    },
    timeline: [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        event: 'Phishing email sent to target user',
        impact: 'Initial compromise vector established',
        preventable: true
      },
      {
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        event: 'User clicked malicious link',
        impact: 'Malware downloaded to workstation',
        preventable: true
      }
    ],
    recommendations: [
      {
        type: 'Immediate',
        action: 'Update email security filters with latest threat signatures',
        owner: 'IT Security Team',
        timeline: '24 hours',
        priority: 'Critical'
      },
      {
        type: 'Short-term',
        action: 'Implement mandatory security awareness training',
        owner: 'HR and Security Teams',
        timeline: '2 weeks',
        priority: 'High'
      }
    ],
    lessonsLearned: [
      'Email security controls require regular updates',
      'User training is critical for preventing social engineering attacks',
      'Multi-layered security approach is essential'
    ],
    createdAt: new Date().toISOString(),
    createdBy: 'Security Analyst',
    status: 'Approved'
  }
}

