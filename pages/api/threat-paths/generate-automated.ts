/**
 * API endpoint for automated threat path generation
 * Generates realistic cybersecurity attack scenarios
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { 
  generateAutomatedThreatPaths,
  ThreatPathGenerationConfig,
  ThreatPathScenario 
} from '../../../utils/automatedThreatPathGeneration'
import { 
  enhanceDatasetForThreatPaths,
  DataEnhancementConfig 
} from '../../../utils/threatPathDataEnhancement'

export interface AutomatedThreatPathRequest {
  nodes: any[]
  edges: any[]
  config?: ThreatPathGenerationConfig
  enhancementConfig?: DataEnhancementConfig
  scenarioType?: 'external_attack' | 'insider_threat' | 'apt_campaign' | 'ransomware' | 'data_breach' | 'supply_chain'
  targetAssets?: string[]
  maxPaths?: number
}

export interface AutomatedThreatPathResponse {
  success: boolean
  threatPaths: ThreatPathScenario[]
  enhancedData?: {
    nodes: any[]
    edges: any[]
  }
  analytics: {
    totalPaths: number
    averageLength: number
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
    }
  }
  recommendations: string[]
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutomatedThreatPathResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      threatPaths: [],
      analytics: {
        totalPaths: 0,
        averageLength: 0,
        riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
        coverageMetrics: { nodesInvolved: 0, edgesInvolved: 0, networkSegments: [] }
      },
      recommendations: [],
      error: 'Method not allowed'
    })
  }

  try {
    const {
      nodes,
      edges,
      config = {},
      enhancementConfig = {},
      scenarioType = 'external_attack',
      targetAssets = [],
      maxPaths = 10
    }: AutomatedThreatPathRequest = req.body

    // Validate input
    if (!nodes || !edges || !Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({
        success: false,
        threatPaths: [],
        analytics: {
          totalPaths: 0,
          averageLength: 0,
          riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
          coverageMetrics: { nodesInvolved: 0, edgesInvolved: 0, networkSegments: [] }
        },
        recommendations: [],
        error: 'Invalid nodes or edges data'
      })
    }

    // Enhance dataset with cybersecurity-specific nodes and edges
    const enhancedData = enhanceDatasetForThreatPaths(nodes, edges, enhancementConfig)
    
    // Configure threat path generation based on scenario type
    const generationConfig: ThreatPathGenerationConfig = {
      ...config,
      scenarioType,
      maxPathsPerScenario: Math.min(maxPaths, 20),
      includeExternalThreats: scenarioType !== 'insider_threat',
      includeInsiderThreats: scenarioType === 'insider_threat' || scenarioType === 'apt_campaign',
      includeLateralMovement: true,
      includePrivilegeEscalation: true,
      includeDataExfiltration: scenarioType === 'data_breach' || scenarioType === 'apt_campaign',
      targetSpecificAssets: targetAssets.length > 0 ? targetAssets : undefined
    }

    // Generate automated threat paths
    const threatPaths = generateAutomatedThreatPaths(
      enhancedData.nodes,
      enhancedData.edges,
      generationConfig
    )

    // Calculate analytics
    const analytics = calculateThreatPathAnalytics(threatPaths, enhancedData.nodes, enhancedData.edges)
    
    // Generate recommendations
    const recommendations = generateSecurityRecommendations(threatPaths, analytics)

    return res.status(200).json({
      success: true,
      threatPaths,
      enhancedData,
      analytics,
      recommendations
    })

  } catch (error) {
    console.error('Error generating automated threat paths:', error)
    return res.status(500).json({
      success: false,
      threatPaths: [],
      analytics: {
        totalPaths: 0,
        averageLength: 0,
        riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
        coverageMetrics: { nodesInvolved: 0, edgesInvolved: 0, networkSegments: [] }
      },
      recommendations: [],
      error: 'Internal server error'
    })
  }
}

/**
 * Calculate comprehensive analytics for generated threat paths
 */
function calculateThreatPathAnalytics(
  threatPaths: ThreatPathScenario[],
  nodes: any[],
  edges: any[]
): AutomatedThreatPathResponse['analytics'] {
  const totalPaths = threatPaths.length
  
  if (totalPaths === 0) {
    return {
      totalPaths: 0,
      averageLength: 0,
      riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
      coverageMetrics: { nodesInvolved: 0, edgesInvolved: 0, networkSegments: [] }
    }
  }

  // Calculate average path length
  const totalLength = threatPaths.reduce((sum, path) => sum + path.path.length, 0)
  const averageLength = Math.round((totalLength / totalPaths) * 10) / 10

  // Calculate risk distribution
  const riskDistribution = threatPaths.reduce((dist, path) => {
    const riskLevel = path.riskScore >= 9 ? 'critical' :
                     path.riskScore >= 7 ? 'high' :
                     path.riskScore >= 5 ? 'medium' : 'low'
    dist[riskLevel]++
    return dist
  }, { critical: 0, high: 0, medium: 0, low: 0 })

  // Calculate coverage metrics
  const involvedNodeIds = new Set<string>()
  const involvedEdgeIds = new Set<string>()
  const networkSegments = new Set<string>()

  threatPaths.forEach(threatPath => {
    threatPath.path.forEach(nodeId => {
      involvedNodeIds.add(nodeId)
      const node = nodes.find(n => n.uid === nodeId)
      if (node?.networkSegment) {
        networkSegments.add(node.networkSegment)
      }
    })
    
    // Calculate edges involved (path connections)
    for (let i = 0; i < threatPath.path.length - 1; i++) {
      const fromNode = threatPath.path[i]
      const toNode = threatPath.path[i + 1]
      const edge = edges.find(e => 
        (e.from === fromNode && e.to === toNode) ||
        (e.from === toNode && e.to === fromNode)
      )
      if (edge) {
        involvedEdgeIds.add(`${edge.from}-${edge.to}`)
      }
    }
  })

  return {
    totalPaths,
    averageLength,
    riskDistribution,
    coverageMetrics: {
      nodesInvolved: involvedNodeIds.size,
      edgesInvolved: involvedEdgeIds.size,
      networkSegments: Array.from(networkSegments)
    }
  }
}

/**
 * Generate security recommendations based on threat path analysis
 */
function generateSecurityRecommendations(
  threatPaths: ThreatPathScenario[],
  analytics: AutomatedThreatPathResponse['analytics']
): string[] {
  const recommendations: string[] = []

  // Risk-based recommendations
  if (analytics.riskDistribution.critical > 0) {
    recommendations.push(
      `🚨 ${analytics.riskDistribution.critical} critical-risk threat paths identified. Immediate remediation required.`
    )
  }

  if (analytics.riskDistribution.high > analytics.totalPaths * 0.3) {
    recommendations.push(
      `⚠️ High concentration of high-risk paths (${analytics.riskDistribution.high}/${analytics.totalPaths}). Review security controls.`
    )
  }

  // Path length recommendations
  if (analytics.averageLength < 3) {
    recommendations.push(
      `🔍 Short attack paths detected (avg: ${analytics.averageLength} hops). Consider network segmentation.`
    )
  }

  // Coverage recommendations
  const nodesCoverage = (analytics.coverageMetrics.nodesInvolved / 100) * 100 // Assuming ~100 nodes
  if (nodesCoverage > 50) {
    recommendations.push(
      `🌐 High network exposure: ${analytics.coverageMetrics.nodesInvolved} nodes involved in threat paths. Implement zero-trust architecture.`
    )
  }

  // Segment-specific recommendations
  if (analytics.coverageMetrics.networkSegments.includes('DMZ')) {
    recommendations.push(
      `🛡️ DMZ compromise detected in threat paths. Strengthen perimeter defenses and monitoring.`
    )
  }

  if (analytics.coverageMetrics.networkSegments.includes('Internal')) {
    recommendations.push(
      `🏢 Internal network exposure identified. Implement lateral movement detection and micro-segmentation.`
    )
  }

  // Scenario-specific recommendations
  const externalThreats = threatPaths.filter(p => p.scenario.includes('External'))
  if (externalThreats.length > 0) {
    recommendations.push(
      `🌍 ${externalThreats.length} external attack vectors identified. Enhance email security and user training.`
    )
  }

  const insiderThreats = threatPaths.filter(p => p.scenario.includes('Insider'))
  if (insiderThreats.length > 0) {
    recommendations.push(
      `👤 ${insiderThreats.length} insider threat scenarios detected. Implement privileged access management and behavioral monitoring.`
    )
  }

  // Default recommendations if none specific
  if (recommendations.length === 0) {
    recommendations.push(
      `✅ Threat path analysis complete. Continue monitoring and regular security assessments.`
    )
  }

  // Add general best practices
  recommendations.push(
    `📊 Regular threat path analysis recommended every 30 days to maintain security posture.`
  )

  return recommendations
}

