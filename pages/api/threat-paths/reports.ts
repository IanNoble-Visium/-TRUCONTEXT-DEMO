import { NextApiRequest, NextApiResponse } from 'next'
import { ThreatPathScenario, SOCAction, WorkflowExecution, RootCauseAnalysis } from '../../../types/threatPath'

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
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
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
  businessImpact: 'high'
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
      recommendations: [
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
      recommendations: [
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
      recommendations: [
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
    severity: 'critical',
    likelihood: 'medium',
    impact: 'high',
    riskScore: 8.5,
    path: ['external-attacker', 'phishing-email', 'user-workstation', 'domain-controller', 'file-server'],
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
    mitigations: [],
    createdAt: new Date().toISOString()
  }
}

function getMockActions(threatPathId: string): SOCAction[] {
  return [
    {
      id: 'action-1',
      threatPathId,
      type: 'containment',
      title: 'Isolate Affected Systems',
      description: 'Quarantine compromised workstations',
      status: 'completed',
      priority: 'critical',
      assignedTo: 'Sarah Chen',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3000000).toISOString(),
      estimatedDuration: '30 minutes',
      targetNodes: ['workstation-001', 'workstation-002'],
      targetIPs: [],
      targetDomains: [],
      targetAccounts: [],
      notes: 'Successfully isolated affected systems',
      approvalRequired: false,
      automatedExecution: true
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
    whyAnalysis: [
      {
        level: 0,
        question: 'Why did the attack succeed?',
        answer: 'Phishing email bypassed security controls',
        evidence: ['email-logs', 'security-tool-alerts'],
        relatedFactors: []
      }
    ],
    contributingFactors: [],
    timeline: [],
    recommendations: [],
    createdAt: new Date().toISOString(),
    status: 'completed'
  }
}

