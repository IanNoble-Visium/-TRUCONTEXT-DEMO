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

export type ViewType = 'executive' | 'graph' | 'table' | 'timeline' | 'cards' | 'dashboard' | 'geomap'

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
            onViewChange={onViewChange}
          />
        )
      case 'table':
        return <TableView {...commonProps} />
      case 'timeline':
        return <TimelineView {...commonProps} />
      case 'cards':
        return <CardsView {...commonProps} />
      case 'dashboard':
        return <DashboardView nodes={nodes} edges={edges} selectedNodes={selectedNodes} />
      case 'geomap':
        console.log('ViewSwitcher: Rendering GeoMapView with props:', commonProps)
        return <GeoMapView {...commonProps} />
      case 'graph':
      default:
        return GraphComponent
    }
  }, [currentView, nodes, edges, selectedNodes, onNodeSelect, GraphComponent, onViewChange])

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* View Selector */}
      <Box p={3} borderBottom="1px solid" borderColor="gray.200" bg={bgColor}>
        <HStack spacing={4} align="center">
          <Text fontSize="sm" fontWeight="medium" color="gray.600" minWidth="fit-content">
            View:
          </Text>
          <Select
            value={currentView}
            onChange={(e) => {
              const newView = e.target.value as ViewType
              console.log(`ViewSwitcher: Changing view from "${currentView}" to "${newView}"`)
              onViewChange(newView)
            }}
            size="sm"
            width="200px"
            bg={bgColor}
          >
            {viewOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </Select>
          <Text fontSize="xs" color="gray.500">
            {nodes.length} nodes, {edges.length} edges
            {selectedNodes.length > 0 && ` • ${selectedNodes.length} selected`}
          </Text>
        </HStack>
      </Box>

      {/* View Content */}
      <Box
        flex="1"
        position="relative"
        overflow={currentView === 'executive' ? 'auto' : 'hidden'}
      >
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            height={currentView === 'executive' ? 'auto' : '100%'}
            width="100%"
            position={currentView === 'executive' ? 'relative' : 'absolute'}
            top={currentView === 'executive' ? 'auto' : 0}
            left={currentView === 'executive' ? 'auto' : 0}
            minHeight={currentView === 'executive' ? '100%' : 'auto'}
          >
            {renderedView}
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default ViewSwitcher 