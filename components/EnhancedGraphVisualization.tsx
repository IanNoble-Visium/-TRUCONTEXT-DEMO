import React, { useState, useCallback, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import GraphVisualization from './GraphVisualization'
import { ViewSwitcher, ViewType } from './DataViews'

interface EnhancedGraphVisualizationProps {
  refreshTrigger: number
  onGraphDataLoad?: (data: { nodes: any[], edges: any[] }) => void
  isFullscreen?: boolean
}

const EnhancedGraphVisualization: React.FC<EnhancedGraphVisualizationProps> = ({
  refreshTrigger,
  onGraphDataLoad,
  isFullscreen = false
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('graph')
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])

  // Handle data load from graph
  const handleDataLoad = useCallback((data: { nodes: any[], edges: any[] }) => {
    console.log('EnhancedGraphVisualization: Received data from GraphVisualization:', data)
    setGraphData(data)
    // Pass data up to parent component
    if (onGraphDataLoad) {
      onGraphDataLoad(data)
    }
  }, [onGraphDataLoad])

  // Handle selected nodes change from graph
  const handleSelectedNodesChange = useCallback((nodes: string[]) => {
    setSelectedNodes(nodes)
  }, [])

  // Handle view change
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view)
  }, [])

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId)
      } else {
        return [...prev, nodeId]
      }
    })
  }, [])

  // Enhanced GraphVisualization that exposes data and selection state
  // Fixed: Remove selectedNodes and handleSelectedNodesChange from dependencies to prevent infinite re-renders
  const enhancedGraphComponent = useMemo(() => (
    <GraphVisualizationWrapper
      refreshTrigger={refreshTrigger}
      onDataLoad={handleDataLoad}
      selectedNodes={selectedNodes}
      onSelectedNodesChange={handleSelectedNodesChange}
      isFullscreen={isFullscreen}
    />
  ), [refreshTrigger, handleDataLoad, isFullscreen])

  // Debug current state
  console.log('EnhancedGraphVisualization: Current state:', {
    currentView,
    graphDataExists: !!graphData,
    nodeCount: graphData?.nodes?.length || 0,
    edgeCount: graphData?.edges?.length || 0,
    selectedNodesCount: selectedNodes.length
  })

  return (
    <Box height="100%">
      <ViewSwitcher
        currentView={currentView}
        onViewChange={handleViewChange}
        nodes={graphData?.nodes || []}
        edges={graphData?.edges || []}
        selectedNodes={selectedNodes}
        onNodeSelect={handleNodeSelect}
        GraphComponent={enhancedGraphComponent}
      />
    </Box>
  )
}

// Wrapper component that enhances the original GraphVisualization with data exposure
interface GraphVisualizationWrapperProps {
  refreshTrigger: number
  onDataLoad: (data: { nodes: any[], edges: any[] }) => void
  selectedNodes: string[]
  onSelectedNodesChange: (nodes: string[]) => void
  isFullscreen?: boolean
}

const GraphVisualizationWrapper: React.FC<GraphVisualizationWrapperProps> = ({
  refreshTrigger,
  onDataLoad,
  selectedNodes,
  onSelectedNodesChange,
  isFullscreen = false
}) => {
  console.log('GraphVisualizationWrapper: Rendering with refreshTrigger:', refreshTrigger)
  return (
    <GraphVisualization
      refreshTrigger={refreshTrigger}
      onDataLoad={onDataLoad}
      onSelectedNodesChange={onSelectedNodesChange}
      externalSelectedNodes={selectedNodes}
      isFullscreen={isFullscreen}
    />
  )
}

export default EnhancedGraphVisualization 