/**
 * API endpoint for automated threat path generation
 * Generates realistic cybersecurity attack scenarios
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { 
  generateMockThreatScenarios,
  ThreatScenario 
} from '../../../utils/automatedThreatPathGeneration'
import { 
  enhanceDatasetForThreatPaths,
  DataEnhancementConfig 
} from '../../../utils/threatPathDataEnhancement'

interface GenerationRequest {
  nodes: any[]
  edges: any[]
  enhancementConfig?: Partial<DataEnhancementConfig>
  scenarioType?: 'external_attack' | 'insider_threat' | 'apt_campaign' | 'ransomware' | 'data_breach' | 'supply_chain'
  targetAssets?: string[]
  attackerProfile?: string
  complexity?: 'low' | 'medium' | 'high'
  maxPaths?: number
}

interface GenerationResponse {
  success: boolean
  threatPaths: ThreatScenario[]
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
  res: NextApiResponse<GenerationResponse>
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
      enhancementConfig = {},
      scenarioType = 'external_attack',
      targetAssets = [],
      maxPaths = 10
    }: GenerationRequest = req.body

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
    const defaultConfig: DataEnhancementConfig = {
      addExternalThreats: true,
      addVulnerabilities: true,
      addPrivilegedAccounts: true,
      addNetworkDevices: true,
      addSecurityControls: true,
      addComplianceNodes: false,
      enhanceExistingNodes: true,
      generateRealisticConnections: true
    }
    const finalConfig = { ...defaultConfig, ...enhancementConfig }
    const enhancedData = enhanceDatasetForThreatPaths(nodes, edges, finalConfig)
    
    // Generate threat scenarios using mock data
    const threatScenarios = generateMockThreatScenarios(enhancedData.nodes, enhancedData.edges)

    // Calculate analytics
    const allPaths = threatScenarios.flatMap(s => s.paths)
    const totalRiskScore = allPaths.reduce((sum, path) => sum + (path.riskScore || 0), 0)
    const averageRiskScore = allPaths.length > 0 ? totalRiskScore / allPaths.length : 0

    // Calculate average path length
    const totalPathLength = allPaths.reduce((sum, path) => sum + (path.nodes?.length || 0), 0)
    const averageLength = allPaths.length > 0 ? totalPathLength / allPaths.length : 0

    const analytics = {
      totalPaths: threatScenarios.length,
      averageLength: averageLength,
      activePaths: threatScenarios.filter(s => s.paths.some(p => p.severity === 'Critical' || p.severity === 'High')).length,
      mitigatedPaths: 0, // Mock value for demo
      averageRiskScore: averageRiskScore,
      riskDistribution: {
        critical: threatScenarios.filter(s => s.paths.some(p => p.severity === 'Critical')).length,
        high: threatScenarios.filter(s => s.paths.some(p => p.severity === 'High')).length,
        medium: threatScenarios.filter(s => s.paths.some(p => p.severity === 'Medium')).length,
        low: threatScenarios.filter(s => s.paths.some(p => p.severity === 'Low')).length
      },
      coverageMetrics: {
        nodesInvolved: enhancedData.nodes.length,
        edgesInvolved: enhancedData.edges.length,
        networkSegments: [...new Set(enhancedData.nodes.map(n => n.properties?.networkSegment).filter(Boolean))],
        assetTypes: [...new Set(enhancedData.nodes.map(n => n.type).filter(Boolean))]
      },
      timeMetrics: {
        averageDetectionTime: '8.5 minutes',
        averageResponseTime: '15.2 minutes',
        averageResolutionTime: '45.8 minutes'
      },
      actionMetrics: {
        totalActions: 0,
        completedActions: 0,
        automatedActions: 0,
        manualActions: 0,
        averageActionTime: '12.3 minutes'
      },
      trends: [],
      topAttackVectors: [],
      topTargetAssets: []
    }
    
    // Return successful response
    return res.status(200).json({
      success: true,
      threatPaths: threatScenarios,
      enhancedData: {
        nodes: enhancedData.nodes,
        edges: enhancedData.edges
      },
      analytics,
      recommendations: analytics.recommendations
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
