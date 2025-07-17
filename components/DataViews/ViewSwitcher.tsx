import React, { useMemo } from 'react'
import { Box, Select, HStack, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Import view components
import TableView from './TableView'
import TimelineView from './TimelineView'
import CardsView from './CardsView'
import DashboardView from './DashboardView'
import GeoMapView from './GeoMapView'

// Dynamic import for ExecutiveDashboard to prevent SSR hydration issues
const ExecutiveDashboard = dynamic(() => import('../ExecutiveDashboard'), {
  ssr: false,
  loading: () => (
    <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Text>Loading Executive Dashboard...</Text>
    </Box>
  )
})

// Dynamic import for SOC Executive Dashboard
const ExecutiveDashboardSOC = dynamic(() => import('../ExecutiveDashboardSOC'), {
  ssr: false,
  loading: () => (
    <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Text>Loading SOC Executive Dashboard...</Text>
    </Box>
  )
})

// Dynamic import for Threat Path Analysis View
const ThreatPathAnalysisView = dynamic(() => import('../ThreatPathAnalysisView'), {
  ssr: false,
  loading: () => (
    <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Text>Loading Threat Path Analysis...</Text>
    </Box>
  )
})

export type ViewType = 'executive' | 'soc-executive' | 'threat-analysis' | 'graph' | 'table' | 'timeline' | 'cards' | 'dashboard' | 'geomap'

interface ViewSwitcherProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
  // Graph component props
  GraphComponent?: React.ReactNode
}

const MotionBox = motion(Box)

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
  nodes,
  edges,
  selectedNodes,
  onNodeSelect,
  GraphComponent
}) => {
  const bgColor = useColorModeValue("white", "gray.800")

  // View options with Executive Dashboard as first option
  const viewOptions = [
    { value: 'executive', label: 'Executive Dashboard', icon: '📊' },
    { value: 'soc-executive', label: 'SOC Executive Dashboard', icon: '🛡️' },
    { value: 'threat-analysis', label: '⭐ Threat Path Analysis', icon: '🎯' },
    { value: 'graph', label: 'Topology View', icon: '🕸️' },
    { value: 'table', label: 'Table View', icon: '📋' },
    { value: 'timeline', label: 'Timeline View', icon: '⏰' },
    { value: 'cards', label: 'Cards View', icon: '🗂️' },
    { value: 'dashboard', label: 'Analytics Dashboard', icon: '📈' },
    { value: 'geomap', label: 'Geographic Map', icon: '🗺️' }
  ]

  // Memoize the rendered view to prevent unnecessary re-renders
  const renderedView = useMemo(() => {
    const commonProps = {
      nodes,
      edges,
      selectedNodes,
      onNodeSelect
    }

    console.log(`ViewSwitcher: Rendering view "${currentView}" with ${nodes.length} nodes and ${edges.length} edges`)

    switch (currentView) {
      case 'executive':
        return (
          <ExecutiveDashboard 
            graphData={{ nodes, edges }}
            isLoading={false}
          />
        )
      case 'soc-executive':
        return (
          <ExecutiveDashboardSOC 
            graphData={{ nodes, edges }}
            isLoading={false}
          />
        )
      case 'threat-analysis':
        return (
          <ThreatPathAnalysisView 
            nodes={nodes}
            edges={edges}
            onPathHighlight={(pathNodes) => {
              console.log('Highlighting path nodes:', pathNodes)
              // Highlight multiple nodes in the graph
              pathNodes.forEach(nodeId => onNodeSelect(nodeId))
            }}
            onNodeSelect={onNodeSelect}
            onGenerateNewPaths={() => {
              console.log('Generating new threat paths')
              // Trigger threat path regeneration
            }}
          />
        )
      case 'graph':
        return GraphComponent || <Box p={4}><Text>Graph view not available</Text></Box>
      case 'table':
        return <TableView {...commonProps} />
      case 'timeline':
        return <TimelineView {...commonProps} />
      case 'cards':
        return <CardsView {...commonProps} />
      case 'dashboard':
        return <DashboardView {...commonProps} />
      case 'geomap':
        return <GeoMapView {...commonProps} />
      default:
        return (
          <ExecutiveDashboard 
            graphData={{ nodes, edges }}
            isLoading={false}
          />
        )
    }
  }, [currentView, nodes, edges, selectedNodes, onNodeSelect, GraphComponent])

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* View Selector */}
      <HStack spacing={4} mb={4} align="center" flexShrink={0}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="40px">
          View:
        </Text>
        <Select
          value={currentView}
          onChange={(e) => onViewChange(e.target.value as ViewType)}
          size="sm"
          maxW="300px"
          bg={bgColor}
          borderRadius="md"
        >
          {viewOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </Select>
      </HStack>

      {/* View Content */}
      <Box
        flex="1"
        overflow={currentView === 'executive' || currentView === 'soc-executive' || currentView === 'threat-analysis' ? 'auto' : 'hidden'}
        position="relative"
        minHeight={0}
      >
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            height="100%"
          >
            {renderedView}
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default ViewSwitcher

