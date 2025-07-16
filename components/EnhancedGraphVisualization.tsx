import React, { useState, useCallback, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import GraphVisualization from './GraphVisualization'
import { ViewSwitcher, ViewType } from './DataViews'

interface EnhancedGraphVisualizationProps {
  refreshTrigger: number
  onGraphDataLoad?: (data: { nodes: any[], edges: any[] }) => void
  onViewChange?: (view: ViewType) => void
  isFullscreen?: boolean
}

const EnhancedGraphVisualization: React.FC<EnhancedGraphVisualizationProps> = ({
  refreshTrigger,
  onGraphDataLoad,
  onViewChange,
  isFullscreen = false
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('executive')
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load data independently of view - this ensures Executive Dashboard gets data on initial load
  const loadInitialData = useCallback(async () => {
    if (dataLoaded) return // Prevent duplicate loading

    try {
      console.log('EnhancedGraphVisualization: Loading initial data for Executive Dashboard')
      const response = await fetch('/api/graph')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.nodes || !data.edges) {
        throw new Error('Invalid graph data format')
      }

      // Transform data for views (similar to GraphVisualization transformation)
      const simpleNodes = data.nodes.map((node: any) => ({
        uid: node.data.id,
        id: node.data.id,
        showname: node.data.label || node.data.id,
        type: node.data.type,
        timestamp: node.data.timestamp,
        properties: node.data.properties || {},
        // Preserve TC_ properties from main data object
        ...Object.fromEntries(
          Object.entries(node.data).filter(([key]) => key.startsWith('TC_'))
        )
      }))

      const simpleEdges = data.edges.map((edge: any) => ({
        from: edge.data.source,
        to: edge.data.target,
        type: edge.data.type,
        timestamp: edge.data.timestamp,
        properties: edge.data.properties || {},
        // Preserve TC_ properties from main data object
        ...Object.fromEntries(
          Object.entries(edge.data).filter(([key]) => key.startsWith('TC_'))
        )
      }))

      console.log('EnhancedGraphVisualization: Initial data loaded:', {
        nodeCount: simpleNodes.length,
        edgeCount: simpleEdges.length,
        sampleNode: simpleNodes[0],
        tcPropertiesFound: simpleNodes.filter((n: any) => Object.keys(n).some(k => k.startsWith('TC_'))).length
      })

      setGraphData({ nodes: simpleNodes, edges: simpleEdges })
      setDataLoaded(true)
    } catch (error) {
      console.error('EnhancedGraphVisualization: Failed to load initial data:', error)
    }
  }, [dataLoaded])

  // Load data on mount and when refreshTrigger changes
  React.useEffect(() => {
    loadInitialData()
  }, [refreshTrigger, loadInitialData])

  // Handle data load from graph (when graph view is active)
  const handleDataLoad = useCallback((data: { nodes: any[], edges: any[] }) => {
    console.log('EnhancedGraphVisualization: Received data from GraphVisualization:', data)

    // Only update if data has actually changed to prevent infinite loops
    setGraphData(prevData => {
      if (!prevData ||
          prevData.nodes.length !== data.nodes.length ||
          prevData.edges.length !== data.edges.length) {
        return data
      }
      return prevData
    })
  }, [])

  // Handle passing data to parent component outside of render
  const lastDataRef = React.useRef<{ nodes: any[], edges: any[] } | null>(null)

  React.useEffect(() => {
    if (graphData && onGraphDataLoad) {
      // Only call parent callback if data has actually changed
      const hasChanged = !lastDataRef.current ||
        lastDataRef.current.nodes.length !== graphData.nodes.length ||
        lastDataRef.current.edges.length !== graphData.edges.length

      if (hasChanged) {
        lastDataRef.current = graphData
        onGraphDataLoad(graphData)
      }
    }
  }, [graphData, onGraphDataLoad])

  // Handle selected nodes change from graph
  const handleSelectedNodesChange = useCallback((nodes: string[]) => {
    setSelectedNodes(nodes)
  }, [])

  // Handle view change
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view)
    // Notify parent component of view change
    if (onViewChange) {
      onViewChange(view)
    }
  }, [onViewChange])

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
  // Create a stable component that only recreates when refreshTrigger changes
  const enhancedGraphComponent = useMemo(() => (
    <GraphVisualizationWrapper
      refreshTrigger={refreshTrigger}
      onDataLoad={handleDataLoad}
      selectedNodes={selectedNodes}
      onSelectedNodesChange={handleSelectedNodesChange}
      isFullscreen={isFullscreen}
    />
  ), [refreshTrigger, isFullscreen]) // Only depend on refreshTrigger and isFullscreen

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