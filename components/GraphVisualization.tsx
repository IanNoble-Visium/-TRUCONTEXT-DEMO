import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Box, Alert, AlertIcon, Spinner, Text, VStack, HStack,
  Select, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, Input, FormControl,
  FormLabel, useToast, Collapse, IconButton, Wrap, WrapItem,
  Badge, Menu, MenuButton, MenuList, MenuItem, Divider,
  Tooltip, useDisclosure, useColorModeValue, Portal, List,
  ListItem, UnorderedList, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon, Checkbox,
  Switch, SimpleGrid
} from '@chakra-ui/react'
import {
  ChevronDownIcon, ChevronUpIcon, SettingsIcon,
  ArrowUpIcon, ArrowDownIcon, ViewIcon, ViewOffIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import cytoscape, { Core, NodeSingular, Collection } from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'
// @ts-ignore
import { NodeTooltip, EdgeTooltip } from './GraphTooltip'
import PropertiesPanel from './PropertiesPanel'
import { BackgroundVideo, VideoControls } from './BackgroundVideo'
import { TCAnimationEngine } from './TCAnimationEngine'
import { parseThreatPaths, getAllThreatPaths, addThreatPath } from '../utils/threatPathUtils'
import ThreatPathDialog from './ThreatPathDialog'

// Import TC_PROPERTIES for property mapping
const TC_PROPERTIES = [
  { key: 'TC_SIZE', cytoscapeProperty: 'width' },
  { key: 'TC_WIDTH', cytoscapeProperty: 'width' },
  { key: 'TC_COLOR', cytoscapeProperty: 'background-color' },
  { key: 'TC_OPACITY', cytoscapeProperty: 'opacity' },
  { key: 'TC_CURVE', cytoscapeProperty: 'curve-style' },
  { key: 'TC_LINE', cytoscapeProperty: 'line-style' },
  { key: 'TC_TEXT_COLOR', cytoscapeProperty: 'text-outline-color' },
  { key: 'TC_ANIMATION', cytoscapeProperty: 'animation' },
  { key: 'TC_ALARM', cytoscapeProperty: 'border-color' },
  { key: 'TC_THREAT_PATH', cytoscapeProperty: 'threat-path' }
]

// TC_ALARM severity levels with visual styling
export const TC_ALARM_LEVELS = {
  'Alert': {
    color: '#dc3545',
    bgColor: '#f8d7da',
    borderWidth: 4,
    label: 'Alert'
  },
  'Warning': {
    color: '#fd7e14',
    bgColor: '#fff3cd',
    borderWidth: 3,
    label: 'Warning'
  },
  'Success': {
    color: '#198754',
    bgColor: '#d1e7dd',
    borderWidth: 2,
    label: 'Success'
  },
  'Info': {
    color: '#0dcaf0',
    bgColor: '#d1ecf1',
    borderWidth: 2,
    label: 'Info'
  },
  'None': {
    color: '#6c757d',
    bgColor: 'transparent',
    borderWidth: 2,
    label: 'None'
  }
}
import { createRoot } from 'react-dom/client'
import { useGesture } from '@use-gesture/react'
import { motion } from 'framer-motion'

// Register cytoscape-cola extension
cytoscape.use(cola)

interface GraphVisualizationProps {
  refreshTrigger: number
  onDataLoad?: (data: { nodes: any[], edges: any[] }) => void
  onSelectedNodesChange?: (nodes: string[]) => void
  externalSelectedNodes?: string[]
  isFullscreen?: boolean
}

// Layout configuration with human-readable labels and descriptions
interface LayoutOption {
  value: string
  label: string
  description: string
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    value: 'grid',
    label: 'Grid Layout',
    description: 'Arranges nodes in a regular, square grid. Simple and useful for quickly displaying all nodes.'
  },
  {
    value: 'random',
    label: 'Random Layout',
    description: 'Places nodes at random positions within the viewport. Useful for initial, unstructured views.'
  },
  {
    value: 'circle',
    label: 'Circle Layout',
    description: 'Positions nodes evenly spaced around a circle, highlighting groups or cycles.'
  },
  {
    value: 'concentric',
    label: 'Concentric Layout',
    description: 'Arranges nodes in concentric circles based on node properties (e.g., degree), often used to show hierarchies or importance.'
  },
  {
    value: 'breadthfirst',
    label: 'Hierarchical (Breadth-First) Layout',
    description: 'Creates hierarchical layers from a root node. Select a single node first to use as root, or the system will auto-select the most connected node.'
  },
  {
    value: 'hierarchical-tree',
    label: 'Multi-Level Hierarchical Tree',
    description: 'Creates a true multi-level tree hierarchy with proper vertical layering and horizontal spacing. Select a root node or the system will auto-select one.'
  },
  {
    value: 'cose',
    label: 'Force-Directed (CoSE) Layout',
    description: 'Uses a physics simulation to position nodes, where edges act like springs and nodes repel each other; good for organic, visually balanced layouts.'
  },
  {
    value: 'preset',
    label: 'Preset Layout',
    description: 'Uses manually specified node positions from the data, allowing for custom or saved layouts.'
  }
]

// Enhanced Layout Selector Component with Tooltips
interface LayoutSelectorProps {
  currentLayout: string
  onLayoutChange: (layoutName: string) => void
  size?: 'sm' | 'md'
  width?: string
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  size = 'sm',
  width = '280px' // Increased from 180px to accommodate longer layout names
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  const currentLayoutOption = LAYOUT_OPTIONS.find(option => option.value === currentLayout)

  return (
    <Menu>
      <Tooltip
        label={currentLayoutOption?.description || 'Select a layout algorithm'}
        placement="bottom"
        hasArrow
        openDelay={500}
      >
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          size={size}
          width={width}
          minWidth={width} // Ensure minimum width is maintained
          variant="outline"
          textAlign="left"
          justifyContent="space-between"
          fontWeight="normal"
          whiteSpace="nowrap" // Prevent text wrapping in button
          overflow="hidden" // Hide overflow
          textOverflow="ellipsis" // Show ellipsis for very long text
        >
          {currentLayoutOption?.label || 'Select Layout'}
        </MenuButton>
      </Tooltip>
      <MenuList
        minW={{ base: "280px", md: "320px" }} // Responsive minimum width
        maxW={{ base: "90vw", md: "500px" }} // Responsive maximum width
        zIndex={1500}
        maxH="400px" // Add max height to prevent very tall dropdowns
        overflowY="auto" // Allow scrolling if needed
      >
        {LAYOUT_OPTIONS.map((option) => (
          <Tooltip
            key={option.value}
            label={option.description}
            placement="left"
            hasArrow
            openDelay={300}
          >
            <MenuItem
              onClick={() => onLayoutChange(option.value)}
              bg={currentLayout === option.value ? hoverBg : 'transparent'}
              fontWeight={currentLayout === option.value ? 'semibold' : 'normal'}
              _hover={{ bg: hoverBg }}
              minH="60px" // Ensure adequate height for two-line content
              py={3} // Add vertical padding
            >
              <VStack align="start" spacing={1} w="100%">
                <Text fontSize="sm" fontWeight="medium" whiteSpace="normal">
                  {option.label}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={3} whiteSpace="normal">
                  {option.description}
                </Text>
              </VStack>
            </MenuItem>
          </Tooltip>
        ))}
      </MenuList>
    </Menu>
  )
}

// Enhanced Group interface
interface GroupData {
  id: string
  name: string
  members: string[]
  expanded: boolean
  originalEdges: any[]
  metaEdges: any[]
  type: 'auto' | 'manual'
  sourceType?: string
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  refreshTrigger,
  onDataLoad,
  onSelectedNodesChange,
  externalSelectedNodes,
  isFullscreen = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const animationEngineRef = useRef<TCAnimationEngine | null>(null)
  const groupedNodesRef = useRef<{ [nodeId: string]: any }>({});
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [containerReady, setContainerReady] = useState(false)
  const [nodeCount, setNodeCount] = useState(0)
  const [edgeCount, setEdgeCount] = useState(0)
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null)
  const [originalGraphData, setOriginalGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [groups, setGroups] = useState<{ [key: string]: GroupData }>({})
  const [currentLayout, setCurrentLayout] = useState('cose')
  const [nodeTypes, setNodeTypes] = useState<string[]>([])
  const [showControls, setShowControls] = useState(false)
  const [showGroupPanel, setShowGroupPanel] = useState(false)
  const [tooltipData, setTooltipData] = useState<{
    type: 'node' | 'edge' | null
    data: any
    position: { x: number; y: number }
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    nodeId: string | null
    position: { x: number; y: number }
  }>({
    isOpen: false,
    nodeId: null,
    position: { x: 0, y: 0 }
  })
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)
  const [layoutRunning, setLayoutRunning] = useState(false)
  const [groupOperationRunning, setGroupOperationRunning] = useState(false)
  const { isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose } = useDisclosure()
  const { isOpen: isAlarmFilterOpen, onOpen: onAlarmFilterOpen, onClose: onAlarmFilterClose } = useDisclosure()
  const [alarmFilters, setAlarmFilters] = useState<{[key: string]: boolean}>({
    'Alert': true,
    'Warning': true,
    'Success': true,
    'Info': true,
    'None': true
  })

  // Threat path filtering state
  const { isOpen: isThreatPathFilterOpen, onOpen: onThreatPathFilterOpen, onClose: onThreatPathFilterClose } = useDisclosure()
  const [threatPathFilters, setThreatPathFilters] = useState<{[key: string]: boolean}>({})
  const [availableThreatPaths, setAvailableThreatPaths] = useState<string[]>([])
  const [threatPathFilterMode, setThreatPathFilterMode] = useState<'show' | 'hide'>('show')

  // Threat path creation state
  const { isOpen: isThreatPathDialogOpen, onOpen: onThreatPathDialogOpen, onClose: onThreatPathDialogClose } = useDisclosure()
  const toast = useToast()
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const centerFitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [controlsHeight, setControlsHeight] = useState(80)

  // Properties panel state
  const [propertiesPanel, setPropertiesPanel] = useState<{
    isOpen: boolean
    selectedElement: {
      type: 'node' | 'edge'
      data: any
    } | null
  }>({
    isOpen: false,
    selectedElement: null
  })

  // Add debounce ref for property changes to prevent loops
  const propertyChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPropertyChangeRef = useRef<{ elementId: string, properties: Record<string, any> } | null>(null)

  // Background video state
  const [videoSettings, setVideoSettings] = useState({
    isEnabled: false,
    selectedVideo: 'neural_data_flow',
    opacity: 20,
    controlsExpanded: false // Start collapsed for cleaner interface
  })

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const controlsBg = useColorModeValue("white", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.600")
  const contextMenuBg = useColorModeValue('white', 'gray.700')

  // Optimized tooltip position update function
  const updateTooltipPosition = useCallback((mouseX: number, mouseY: number) => {
    setTooltipData(prev => prev ? {
      ...prev,
      position: { x: mouseX, y: mouseY }
    } : null)
  }, [])

  // Clear tooltip with delay to prevent flickering
  const clearTooltipWithDelay = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipData(null)
    }, 150) // Small delay to prevent flickering
  }, [])

  // Clear tooltip immediately (for mouseover events)
  const clearTooltipTimeout = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
  }, [])



  // Handle context menu close
  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, nodeId: null, position: { x: 0, y: 0 } })
  }, [])

  // Handle properties panel
  const openPropertiesPanel = useCallback((type: 'node' | 'edge', data: any) => {
    setPropertiesPanel({
      isOpen: true,
      selectedElement: { type, data }
    })
  }, [])

  const closePropertiesPanel = useCallback(() => {
    setPropertiesPanel({
      isOpen: false,
      selectedElement: null
    })
  }, [])

  // Handle background video controls
  const toggleVideo = useCallback((enabled: boolean) => {
    setVideoSettings(prev => ({ ...prev, isEnabled: enabled }))
  }, [])

  const changeVideo = useCallback((video: string) => {
    setVideoSettings(prev => ({ ...prev, selectedVideo: video }))
  }, [])

  const changeOpacity = useCallback((opacity: number) => {
    setVideoSettings(prev => ({ ...prev, opacity }))
  }, [])

  // Handle property changes from PropertiesPanel
  const handlePropertyChange = useCallback((elementType: 'node' | 'edge', elementId: string, properties: Record<string, any>) => {
    if (!cyRef.current) {
      console.warn('Cytoscape instance not available for property change')
      return
    }

    // Debounce rapid property changes to prevent loops
    const changeKey = `${elementType}-${elementId}`
    const propertiesString = JSON.stringify(properties)

    // Check if this is the same change as the last one
    if (lastPropertyChangeRef.current &&
        lastPropertyChangeRef.current.elementId === changeKey &&
        JSON.stringify(lastPropertyChangeRef.current.properties) === propertiesString) {
      console.log('Skipping duplicate property change for', elementId)
      return
    }

    // Clear any pending timeout
    if (propertyChangeTimeoutRef.current) {
      clearTimeout(propertyChangeTimeoutRef.current)
    }

    // Store this change
    lastPropertyChangeRef.current = { elementId: changeKey, properties }

    try {
      const cy = cyRef.current

      // Validate Cytoscape instance state
      if (!cy || cy.destroyed()) {
        console.warn('Cytoscape instance is destroyed, cannot update properties')
        return
      }

      // Find the element in Cytoscape with better error handling
      const element = elementType === 'node'
        ? cy.getElementById(elementId)
        : cy.edges().filter(`[id = "${elementId}"]`).first()

      if (!element || element.length === 0) {
        console.warn(`Element ${elementId} not found in graph`)
        return
      }

      // Validate element state
      if (element.removed()) {
        console.warn(`Element ${elementId} has been removed from graph`)
        return
      }

      // Use batch operations to prevent internal state corruption
      cy.startBatch()

      try {
        // Update the element's data
        const currentData = element.data()
        const updatedData = {
          ...currentData,
          properties: properties
        }

        // Apply the updated data
        element.data(updatedData)

        // Apply TC_ properties to Cytoscape styling and animations
        const tcStyles: any = {}
        let animationType: string | null = null

        Object.entries(properties).forEach(([key, value]) => {
          if (key.startsWith('TC_')) {
            const tcProperty = TC_PROPERTIES.find(p => p.key === key)
            if (tcProperty && value !== undefined && value !== null) {
              // Handle animation separately
              if (key === 'TC_ANIMATION') {
                animationType = value
                return
              }

              // Handle TC_ALARM with special styling
              if (key === 'TC_ALARM') {
                const alarmConfig = TC_ALARM_LEVELS[value as keyof typeof TC_ALARM_LEVELS]
                if (alarmConfig && elementType === 'node') {
                  tcStyles['border-color'] = alarmConfig.color
                  tcStyles['border-width'] = alarmConfig.borderWidth
                  if (alarmConfig.bgColor !== 'transparent') {
                    tcStyles['background-color'] = alarmConfig.bgColor
                  }
                  // Add alarm indicator class for additional styling
                  element.addClass(`alarm-${value.toLowerCase()}`)
                  // Remove other alarm classes
                  Object.keys(TC_ALARM_LEVELS).forEach(level => {
                    if (level !== value) {
                      element.removeClass(`alarm-${level.toLowerCase()}`)
                    }
                  })
                }
                return
              }

              // Map TC property to Cytoscape property
              if (tcProperty.cytoscapeProperty === 'background-color' && elementType === 'edge') {
                tcStyles['line-color'] = value
              } else if (tcProperty.cytoscapeProperty === 'background-color' && elementType === 'node') {
                tcStyles['background-color'] = value
              } else if (tcProperty.cytoscapeProperty === 'width') {
                if (elementType === 'node') {
                  tcStyles['width'] = value
                  tcStyles['height'] = value
                } else {
                  tcStyles['width'] = value
                }
              } else {
                tcStyles[tcProperty.cytoscapeProperty] = value
              }
            }
          }
        })

        // Apply the styling within the batch
        if (Object.keys(tcStyles).length > 0) {
          console.log(`Applying TC styles to ${elementType} ${elementId}:`, tcStyles)
          element.style(tcStyles)
        }

        // End batch operation before handling animations
        cy.endBatch()

        // Handle animations outside of batch to prevent conflicts
        if (animationEngineRef.current) {
          try {
            if (animationType && animationType !== 'none') {
              animationEngineRef.current.startAnimation(elementId, {
                type: animationType as any,
                duration: 1000,
                intensity: 0.3,
                speed: 1000
              })
            } else {
              // Stop any existing animation
              animationEngineRef.current.stopAnimation(elementId)
            }
          } catch (animError) {
            console.error('Error handling animation:', animError)
          }
        }

      // Update the graph data state to keep it in sync
      setGraphData(prevData => {
        if (!prevData) return prevData

        if (elementType === 'node') {
          const updatedNodes = prevData.nodes.map(node => {
            if (node.data.id === elementId) {
              return {
                ...node,
                data: updatedData
              }
            }
            return node
          })
          return { ...prevData, nodes: updatedNodes }
        } else {
          const updatedEdges = prevData.edges.map(edge => {
            if (edge.data.id === elementId) {
              return {
                ...edge,
                data: updatedData
              }
            }
            return edge
          })
          return { ...prevData, edges: updatedEdges }
        }
      })

      // Update the properties panel with debouncing to prevent loops
      propertyChangeTimeoutRef.current = setTimeout(() => {
        setPropertiesPanel(prev => {
          if (prev.selectedElement &&
              prev.selectedElement.type === elementType &&
              (prev.selectedElement.data.id === elementId || prev.selectedElement.data.uid === elementId)) {
            // Only update if the properties have actually changed to prevent loops
            const currentProps = prev.selectedElement.data.properties || {}
            const hasChanges = Object.keys(properties).some(key => currentProps[key] !== properties[key])

            if (hasChanges) {
              console.log(`Updating properties panel for ${elementType} ${elementId}`)
              return {
                ...prev,
                selectedElement: {
                  ...prev.selectedElement,
                  data: updatedData
                }
              }
            }
          }
          return prev
        })
      }, 50) // 50ms debounce

        console.log(`Updated ${elementType} ${elementId} properties:`, properties)

      } catch (batchError) {
        // Ensure batch is ended even if there's an error
        try {
          cy.endBatch()
        } catch (endBatchError) {
          console.error('Error ending batch operation:', endBatchError)
        }
        throw batchError
      }

    } catch (error) {
      console.error('Error updating element properties:', error)

      // Provide user feedback for critical errors
      if (error instanceof Error && error.message && error.message.includes('notify')) {
        console.error('Critical Cytoscape state error detected. This may require a graph refresh.')
      }
    }
  }, [])

  // Apply all TC properties to elements when graph is loaded
  const applyTCPropertiesToGraph = useCallback(() => {
    if (!cyRef.current || !animationEngineRef.current) return

    cyRef.current.elements().forEach(element => {
      const data = element.data()
      const properties = data.properties || {}

      // Apply TC styling properties
      const tcStyles: any = {}
      let animationType: string | null = null

      Object.entries(properties).forEach(([key, value]) => {
        if (key.startsWith('TC_')) {
          const tcProperty = TC_PROPERTIES.find(p => p.key === key)
          if (tcProperty && value !== undefined && value !== null) {
            if (key === 'TC_ANIMATION') {
              animationType = value
              return
            }

            // Handle TC_ALARM with special styling
            if (key === 'TC_ALARM') {
              const alarmConfig = TC_ALARM_LEVELS[value as keyof typeof TC_ALARM_LEVELS]
              if (alarmConfig && element.isNode()) {
                tcStyles['border-color'] = alarmConfig.color
                tcStyles['border-width'] = alarmConfig.borderWidth
                if (alarmConfig.bgColor !== 'transparent') {
                  tcStyles['background-color'] = alarmConfig.bgColor
                }
                // Add alarm indicator class for additional styling
                element.addClass(`alarm-${value.toLowerCase()}`)
                // Remove other alarm classes
                Object.keys(TC_ALARM_LEVELS).forEach(level => {
                  if (level !== value) {
                    element.removeClass(`alarm-${level.toLowerCase()}`)
                  }
                })
              }
              return
            }

            const isNode = element.isNode()
            if (tcProperty.cytoscapeProperty === 'background-color' && !isNode) {
              tcStyles['line-color'] = value
            } else if (tcProperty.cytoscapeProperty === 'background-color' && isNode) {
              tcStyles['background-color'] = value
            } else if (tcProperty.cytoscapeProperty === 'width') {
              if (isNode) {
                tcStyles['width'] = value
                tcStyles['height'] = value
              } else {
                tcStyles['width'] = value
              }
            } else {
              tcStyles[tcProperty.cytoscapeProperty] = value
            }
          }
        }
      })

      // Apply styling
      if (Object.keys(tcStyles).length > 0) {
        element.style(tcStyles)
      }

      // Apply animation
      if (animationType && animationType !== 'none' && animationEngineRef.current) {
        animationEngineRef.current.startAnimation(data.id, {
          type: animationType as any,
          duration: 1000,
          intensity: 0.3,
          speed: 1000
        })
      }
    })
  }, [])

  const toggleVideoControls = useCallback(() => {
    setVideoSettings(prev => ({ ...prev, controlsExpanded: !prev.controlsExpanded }))
  }, [])

  // Add keyboard support and global click handler for closing context menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (propertiesPanel.isOpen) {
          closePropertiesPanel()
        } else if (contextMenu.isOpen) {
          closeContextMenu()
        }
      }
    }

    const handleGlobalClick = (event: MouseEvent) => {
      if (contextMenu.isOpen) {
        // Check if click is outside the context menu
        const target = event.target as Element
        const contextMenuElement = document.querySelector('[data-context-menu]')
        if (contextMenuElement && !contextMenuElement.contains(target)) {
          closeContextMenu()
        }
      }
    }

    // Global context menu prevention for the graph area
    const handleGlobalContextMenu = (event: MouseEvent) => {
      const target = event.target as Element
      const graphContainer = document.querySelector('[data-graph-container]')

      if (graphContainer && graphContainer.contains(target)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return false
      }
    }

    if (contextMenu.isOpen || propertiesPanel.isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleGlobalClick, true)
    }

    // Always prevent context menu in graph area
    document.addEventListener('contextmenu', handleGlobalContextMenu, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleGlobalClick, true)
      document.removeEventListener('contextmenu', handleGlobalContextMenu, true)
    }
  }, [contextMenu.isOpen, propertiesPanel.isOpen, closeContextMenu, closePropertiesPanel])

  // Mobile and touch detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkMobile()
    checkTouch()
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-collapse controls on mobile for better space usage
  useEffect(() => {
    if (isMobile) {
      setShowControls(false)
    }
  }, [isMobile])

  // Sync external selected nodes - avoid infinite loop by not including selectedNodes in deps
  useEffect(() => {
    if (externalSelectedNodes && JSON.stringify(externalSelectedNodes) !== JSON.stringify(selectedNodes)) {
      setSelectedNodes(externalSelectedNodes)
    }
  }, [externalSelectedNodes])

  // Notify parent of selection changes - use useRef to avoid infinite loops
  const onSelectedNodesChangeRef = useRef(onSelectedNodesChange)
  onSelectedNodesChangeRef.current = onSelectedNodesChange

  useEffect(() => {
    if (onSelectedNodesChangeRef.current) {
      onSelectedNodesChangeRef.current(selectedNodes)
    }
  }, [selectedNodes])

  // Simplified container ready check - runs after data is loaded
  useEffect(() => {
    if (!loading && !error && graphData && !containerReady) {
      console.log('Data loaded, checking container availability...')

      const checkContainer = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          console.log('Container check:', {
            width: rect.width,
            height: rect.height,
            hasElement: !!containerRef.current
          })

          // More lenient check - just need the element to exist and have some dimensions
          if (rect.width > 0 && rect.height > 0) {
            console.log('Container is ready for Cytoscape initialization')
            setContainerReady(true)
            return true
          }
        }
        return false
      }

      // Try immediately first
      if (checkContainer()) {
        return
      }

      // If not ready, check periodically with shorter intervals
      const interval = setInterval(() => {
        if (checkContainer()) {
          clearInterval(interval)
        }
      }, 50) // Check every 50ms for faster response

      // Force ready after 1 second if still not ready
      const timeout = setTimeout(() => {
        clearInterval(interval)
        console.warn('Container check timeout - forcing ready state')
        setContainerReady(true)
      }, 1000) // Reduced timeout to 1 second

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [loading, error, graphData, containerReady])

  // Cache for icon existence checks in GraphVisualization
  const graphIconExistsCache = new Map<string, boolean>()

  // Helper function to check if an icon file exists
  const checkGraphIconExists = async (iconPath: string): Promise<boolean> => {
    if (graphIconExistsCache.has(iconPath)) {
      return graphIconExistsCache.get(iconPath)!
    }

    try {
      const response = await fetch(iconPath, { method: 'HEAD' })
      const exists = response.ok
      graphIconExistsCache.set(iconPath, exists)
      return exists
    } catch (error) {
      console.warn(`Failed to check icon existence: ${iconPath}`, error instanceof Error ? error.message : String(error))
      graphIconExistsCache.set(iconPath, false)
      return false
    }
  }

  // Dynamic icon path resolution with fallback for GraphVisualization
  const getNodeIconPath = async (nodeType: string): Promise<string> => {
    if (!nodeType) return '/icons-svg/unknown.svg'

    // Convert type to lowercase for filename matching
    const filename = nodeType.toLowerCase()
    const primaryPath = `/icons-svg/${filename}.svg`

    // Check if the primary icon exists
    const exists = await checkGraphIconExists(primaryPath)
    if (exists) {
      console.log(`✓ Graph: Found icon for ${nodeType}: ${primaryPath}`)
      return primaryPath
    }

    // Fallback mappings for common variations
    const fallbackMappings: { [key: string]: string } = {
      'threatactor': 'actor',
      'workstation': 'client',
    }

    const fallbackType = fallbackMappings[filename]
    if (fallbackType) {
      const fallbackPath = `/icons-svg/${fallbackType}.svg`
      const fallbackExists = await checkGraphIconExists(fallbackPath)
      if (fallbackExists) {
        console.log(`✓ Graph: Using fallback icon for ${nodeType}: ${fallbackPath}`)
        return fallbackPath
      }
    }

    console.warn(`⚠ Graph: No icon found for ${nodeType}, using unknown.svg`)
    return '/icons-svg/unknown.svg'
  }

  // Enhanced helper to create meta-edges for groups
  const createMetaEdges = (groupId: string, memberIds: string[]): any[] => {
    if (!cyRef.current) return []

    const metaEdges: any[] = []
    const externalConnections = new Map<string, { count: number, types: Set<string> }>()

    memberIds.forEach(memberId => {
      // Find all edges connected to this member
      const connectedEdges = cyRef.current!.edges(`[source = "${memberId}"], [target = "${memberId}"]`)
      
      connectedEdges.forEach(edge => {
        const source = edge.source().id()
        const target = edge.target().id()
        const edgeType = edge.data('type') || 'CONNECTED'
        
        // Find the external node (not in the group)
        const externalNode = memberIds.includes(source) ? target : source
        
        if (!memberIds.includes(externalNode)) {
          // This is an external connection
          if (!externalConnections.has(externalNode)) {
            externalConnections.set(externalNode, { count: 0, types: new Set() })
          }
          const connection = externalConnections.get(externalNode)!
          connection.count++
          connection.types.add(edgeType)
        }
      })
    })

    // Create meta-edges
    externalConnections.forEach((connection, externalNodeId) => {
      const metaEdgeId = `meta-${groupId}-${externalNodeId}`
      const edgeTypesArray: string[] = []
      connection.types.forEach((type: string) => edgeTypesArray.push(type))
      const edgeTypes = edgeTypesArray.join(', ')
      const label = connection.count > 1 ? `${connection.count} connections` : edgeTypes

      metaEdges.push({
        group: 'edges',
        data: {
          id: metaEdgeId,
          source: groupId,
          target: externalNodeId,
          type: 'META',
          label: label,
          connectionCount: connection.count,
          connectionTypes: edgeTypesArray,
          style: 'dashed'
        }
      })
    })

    return metaEdges
  }

  // Store original edges for restoration
  const storeOriginalEdges = (memberIds: string[]): any[] => {
    if (!cyRef.current) return []

    const originalEdges: any[] = []
    const storedEdgeIds = new Set<string>() // Track stored edge IDs to prevent duplicates

    memberIds.forEach(memberId => {
      const connectedEdges = cyRef.current!.edges(`[source = "${memberId}"], [target = "${memberId}"]`)
      connectedEdges.forEach(edge => {
        const edgeId = edge.id()
        // Only store each edge once, even if it connects two nodes being grouped
        if (!storedEdgeIds.has(edgeId)) {
          storedEdgeIds.add(edgeId)
          originalEdges.push({
            group: 'edges',
            data: edge.data()
          })
          console.log(`📦 Storing original edge: ${edgeId} (${edge.source().id()} → ${edge.target().id()}) - Source type: ${edge.source().data('type')}, Target type: ${edge.target().data('type')}`)
        }
      })
    })

    console.log(`Stored ${originalEdges.length} unique original edges for ${memberIds.length} nodes`)
    return originalEdges
  }

  // Group expansion/collapse functionality
  const toggleGroupExpansion = (groupId: string) => {
    if (!cyRef.current || !groups[groupId]) return

    const groupData = groups[groupId]
    const isExpanded = groupData.expanded

    if (isExpanded) {
      // Collapse the group
      groupData.members.forEach(nodeId => {
        const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
        if (node.length > 0) {
          node.style('display', 'none')
        }
      })

      // Remove original edges and add meta-edges
      cyRef.current.remove(cyRef.current.edges(`[source], [target]`).filter(edge => {
        const source = edge.source().id()
        const target = edge.target().id()
        return groupData.members.includes(source) || groupData.members.includes(target)
      }))
      cyRef.current.add(groupData.metaEdges)

      toast({
        title: 'Group Collapsed',
        description: `${groupData.name} has been collapsed`,
        status: 'info',
        duration: 2000,
        isClosable: true
      })
    } else {
      // Expand the group
      groupData.members.forEach(nodeId => {
        const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
        if (node.length > 0) {
          node.style('display', 'element')
        }
      })

      // Remove meta-edges and restore original edges
      cyRef.current.remove(cyRef.current.edges('[type = "META"]'))
      cyRef.current.add(groupData.originalEdges)

      toast({
        title: 'Group Expanded',
        description: `${groupData.name} has been expanded`,
        status: 'info',
        duration: 2000,
        isClosable: true
      })
    }

    // Update group data
    setGroups(prev => ({
      ...prev,
      [groupId]: {
        ...groupData,
        expanded: !isExpanded
      }
    }))

    // Re-run layout
    setTimeout(() => runLayout(currentLayout), 100)
    
    // Note: Users can now manually use Center & Fit or Reset View to reposition
  }

  // Preload icon existence checks
  const preloadIconChecks = async (nodes: any[]) => {
    console.log(`Debug: Received ${nodes.length} nodes for preloading`)
    console.log(`Debug: Sample node structure:`, nodes[0])

    // Extract types from Cytoscape node format: { data: { type: "NodeType" } }
    const extractTypes = (nodes: any[]) => {
      const types = []
      for (const node of nodes) {
        // For Cytoscape format, the type is in node.data.type
        const type = node.data?.type || node.type || node.properties?.type || node.nodeType
        if (type) {
          types.push(type)
          console.log(`Debug: Found type "${type}" for node ${node.data?.id || node.id}`)
        } else {
          console.warn(`Debug: No type found for node:`, node)
        }
      }
      return types
    }

    const allTypes = extractTypes(nodes)
    const uniqueTypes = Array.from(new Set(allTypes))
    console.log(`Debug: Extracted types:`, allTypes)
    console.log(`Preloading icon checks for types:`, uniqueTypes)

    for (const type of uniqueTypes) {
      await getNodeIconPath(type)
    }

    console.log(`✓ Icon checks completed for ${uniqueTypes.length} types`)
  }

  const initializeCytoscape = async (processedNodes: any[], processedEdges: any[]) => {
    // Preload icon existence checks
    await preloadIconChecks(processedNodes)
    if (!containerRef.current) {
      console.log('Container ref not available')
      return false
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    console.log('Container dimensions:', {
      width: containerRect.width,
      height: containerRect.height,
      element: containerRef.current
    })

    if (containerRect.width === 0 || containerRect.height === 0) {
      console.log('Container has no dimensions, retrying...')
      return false
    }

    // Clean up any existing instance and running operations
    if (cyRef.current) {
      console.log('Cleaning up existing Cytoscape instance')
      try {
        // Stop any running layouts
        cyRef.current.elements().stop()
        // Remove all event listeners
        cyRef.current.removeAllListeners()
        // Destroy the instance
        cyRef.current.destroy()
      } catch (error) {
        console.warn('Error during cleanup:', error)
      }
      cyRef.current = null
    }

    // Reset layout running state
    setLayoutRunning(false)

    const elements = [...processedNodes, ...processedEdges]
    console.log('Initializing Cytoscape with elements:', elements)
    console.log('Sample node:', elements.find(e => e.group === 'nodes'))
    console.log('Sample edge:', elements.find(e => e.group === 'edges'))

    try {
      // Ensure the container has proper z-index for video layering
      if (containerRef.current) {
        containerRef.current.style.position = 'relative'
        containerRef.current.style.zIndex = '1'
      }

      const cy = cytoscape({
        container: containerRef.current,
        elements: elements,
        
        // Mobile-optimized settings
        wheelSensitivity: isMobile ? 0.1 : 0.5,
        minZoom: 0.1,
        maxZoom: 3,
        zoomingEnabled: true,
        userZoomingEnabled: true,
        panningEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: !isMobile,
        selectionType: isMobile ? 'single' : 'additive',
        touchTapThreshold: 8,
        desktopTapThreshold: 4,
        autolock: false,
        autoungrabify: false,
        autounselectify: false,

        style: [
          {
            selector: 'node',
            style: {
              'background-image': (ele: any) => {
                // Get the node type from Cytoscape element data
                const nodeData = ele.data()
                const type = nodeData?.type

                if (!type || typeof type !== 'string') {
                  console.warn(`No type found for node ${nodeData?.id}:`, nodeData)
                  return '/icons-svg/unknown.svg'
                }

                // Convert to lowercase for case-insensitive matching
                const filename = String(type).toLowerCase()
                const primaryPath = `/icons-svg/${filename}.svg`

                // Check cache first
                if (graphIconExistsCache.has(primaryPath) && graphIconExistsCache.get(primaryPath)) {
                  return primaryPath
                }

                // Check fallback mappings for common variations
                const fallbackMappings: { [key: string]: string } = {
                  'threatactor': 'actor',
                  'workstation': 'client',
                }

                const fallbackType = fallbackMappings[filename]
                if (fallbackType) {
                  const fallbackPath = `/icons-svg/${fallbackType}.svg`
                  if (graphIconExistsCache.has(fallbackPath) && graphIconExistsCache.get(fallbackPath)) {
                    return fallbackPath
                  }
                }

                // Default to unknown.svg
                return '/icons-svg/unknown.svg'
              },
              'background-fit': 'cover',
              'background-color': 'white',
              'border-width': 2,
              'border-color': (ele: any) => {
                const type = ele.data('type')
                switch (type) {
                  case 'Server': return '#003087'
                  case 'Application': return '#0066cc'
                  case 'Database': return '#004080'
                  case 'User': return '#0080ff'
                  case 'Vulnerability': return '#cc0000'
                  case 'ThreatActor': return '#cc0000'
                  case 'Firewall': return '#00cc00'
                  case 'Router': return '#ff6600'
                  case 'Switch': return '#ff9900'
                  case 'Workstation': return '#6600cc'
                  case 'Client': return '#0099cc'
                  case 'Entity': return '#666666'
                  case 'Group': return '#ffcc00'
                  default: return '#666666'
                }
              },
              'label': 'data(label)',
              'width': (ele: any) => ele.data('type') === 'Group' ? 100 : 60,
              'height': (ele: any) => ele.data('type') === 'Group' ? 100 : 60,
              'color': '#333333',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': (ele: any) => ele.data('type') === 'Group' ? '12px' : '10px',
              'font-weight': 'bold',
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'text-margin-y': 8,
              'text-background-color': 'rgba(255, 255, 255, 0.9)',
              'text-background-opacity': 1,
              'text-background-padding': '3px',
              'text-border-width': 1,
              'text-border-color': '#cccccc',
              'text-border-opacity': 0.8,
              'transition-property': 'border-width, border-color, background-color',
              'transition-duration': 200
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#0080ff',
              'background-color': '#e6f3ff'
            }
          },
          {
            selector: 'node.hierarchy-root',
            style: {
              'border-width': 5,
              'border-color': '#ff6600',
              'background-color': '#fff0e6',
              'border-style': 'double'
            }
          },
          {
            selector: 'node[type = "Group"]',
            style: {
              'border-width': 3,
              'border-style': 'dashed',
              'border-color': '#ffcc00',
              'background-color': '#fff9e6',
              'shape': 'round-rectangle',
              'text-valign': 'center',
              'text-halign': 'center',
              'overlay-opacity': 0.1,
              'overlay-color': '#ffcc00'
            }
          },
          // Expanded group visual style
          {
            selector: 'node[type = "Group"][expanded]',
            style: {
              'border-color': '#ff9900',
              'background-color': '#ffe6cc'
            }
          },
          // TC_ALARM visual styles
          {
            selector: 'node.alarm-alert',
            style: {
              'border-color': '#dc3545',
              'border-width': 4,
              'background-color': '#f8d7da'
            }
          },
          {
            selector: 'node.alarm-warning',
            style: {
              'border-color': '#fd7e14',
              'border-width': 3,
              'background-color': '#fff3cd'
            }
          },
          {
            selector: 'node.alarm-success',
            style: {
              'border-color': '#198754',
              'border-width': 2,
              'background-color': '#d1e7dd'
            }
          },
          {
            selector: 'node.alarm-info',
            style: {
              'border-color': '#0dcaf0',
              'border-width': 2,
              'background-color': '#d1ecf1'
            }
          },
          {
            selector: 'node.alarm-none',
            style: {
              'border-color': '#6c757d',
              'border-width': 2
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#999999',
              'target-arrow-color': '#999999',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'control-point-step-size': 40,
              'arrow-scale': 1.2,
              'label': 'data(type)',
              'font-size': '8px',
              'text-background-color': 'rgba(255, 255, 255, 0.8)',
              'text-background-opacity': 1,
              'text-background-padding': '2px',
              'color': '#666666',
              'text-rotation': 'autorotate',
              'transition-property': 'line-color, target-arrow-color, width',
              'transition-duration': 200
            }
          },
          // Meta-edge style for group connections
          {
            selector: 'edge[type = "META"]',
            style: {
              'width': 3,
              'line-color': '#ff9900',
              'target-arrow-color': '#ff9900',
              'line-style': 'dashed',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '9px',
              'font-weight': 'bold',
              'text-background-color': 'rgba(255, 153, 0, 0.1)',
              'color': '#cc6600'
            }
          },
          {
            selector: 'edge:selected',
            style: {
              'width': 4,
              'line-color': '#0080ff',
              'target-arrow-color': '#0080ff'
            }
          }
        ],

        layout: {
          name: sanitizeLayoutName(currentLayout === 'hierarchical-tree' ? 'grid' : currentLayout),
          fit: true,
          padding: 30
        } as any
      })

      // Enhanced event handlers for robust selection
      cy.on('tap', 'node', (event) => {
        const node = event.target
        const nodeId = node.id()
        const isGroupNode = node.data('type') === 'Group'
        
        event.stopPropagation()

        if (isGroupNode) {
          // Handle group expand/collapse
          toggleGroupExpansion(nodeId)
        } else {
          // Handle regular node selection
          if (event.originalEvent?.ctrlKey || event.originalEvent?.metaKey || isMobile) {
            // Multi-select mode
            const isSelected = selectedNodes.includes(nodeId)
            if (isSelected) {
              setSelectedNodes(prev => prev.filter(id => id !== nodeId))
              node.unselect()
            } else {
              setSelectedNodes(prev => [...prev, nodeId])
              node.select()
            }
          } else {
            // Single select mode
            cy.nodes().unselect()
            setSelectedNodes([nodeId])
            node.select()
          }

          // Open properties panel for the clicked node
          openPropertiesPanel('node', node.data())
        }
      })

      // Enhanced event handlers for edges
      cy.on('tap', 'edge', (event) => {
        const edge = event.target
        event.stopPropagation()

        // Open properties panel for the clicked edge
        openPropertiesPanel('edge', edge.data())
      })

      // Clear selection on background tap
      cy.on('tap', (event) => {
        if (event.target === cy) {
          cy.nodes().unselect()
          setSelectedNodes([])
          closePropertiesPanel()
        }
      })

      // Enhanced hover tooltips
      cy.on('mouseover', 'node', (event) => {
        const node = event.target
        const mouseEvent = event.originalEvent
        
        // Clear any pending timeout
        clearTooltipTimeout()
        
        // Get the container's bounding rect to calculate proper positioning
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect || !mouseEvent) return
        
        const mouseX = mouseEvent.pageX
        const mouseY = mouseEvent.pageY
        
        setTooltipData({
          type: 'node',
          data: node.data(),
          position: { x: mouseX, y: mouseY }
        })
      })

      cy.on('mouseout', 'node', () => {
        clearTooltipWithDelay()
      })

      cy.on('mouseover', 'edge', (event) => {
        const edge = event.target
        const mouseEvent = event.originalEvent
        
        // Clear any pending timeout
        clearTooltipTimeout()
        
        // Get the container's bounding rect to calculate proper positioning
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect || !mouseEvent) return
        
        const mouseX = mouseEvent.pageX
        const mouseY = mouseEvent.pageY
        
        setTooltipData({
          type: 'edge',
          data: edge.data(),
          position: { x: mouseX, y: mouseY }
        })
      })

      cy.on('mouseout', 'edge', () => {
        clearTooltipWithDelay()
      })

      // Add mousemove events to keep tooltips following the mouse cursor
      cy.on('mousemove', 'node', (event) => {
        if (!tooltipData || tooltipData.type !== 'node') return
        
        const mouseEvent = event.originalEvent
        if (!mouseEvent) return
        
        const mouseX = mouseEvent.pageX
        const mouseY = mouseEvent.pageY
        
        updateTooltipPosition(mouseX, mouseY)
      })

      cy.on('mousemove', 'edge', (event) => {
        if (!tooltipData || tooltipData.type !== 'edge') return

        const mouseEvent = event.originalEvent
        if (!mouseEvent) return

        const mouseX = mouseEvent.pageX
        const mouseY = mouseEvent.pageY

        updateTooltipPosition(mouseX, mouseY)
      })

      // Right-click context menu for nodes
      cy.on('cxttap', 'node', (event) => {
        const node = event.target
        const nodeId = node.id()
        const isGroupNode = node.data('type') === 'Group'
        const mouseEvent = event.originalEvent

        // Comprehensive event prevention
        event.stopPropagation()
        event.stopImmediatePropagation()

        // Prevent default browser context menu with multiple approaches
        if (mouseEvent) {
          mouseEvent.preventDefault()
          mouseEvent.stopPropagation()
          mouseEvent.stopImmediatePropagation()

          // Additional prevention for stubborn browsers
          if (mouseEvent.type === 'contextmenu') {
            mouseEvent.returnValue = false
          }
        }

        // Don't show context menu for group nodes
        if (isGroupNode) {
          // Still prevent default menu even for group nodes
          return false
        }

        // Get mouse position for context menu
        if (mouseEvent) {
          const mouseX = mouseEvent.pageX || mouseEvent.clientX
          const mouseY = mouseEvent.pageY || mouseEvent.clientY

          // Close any existing context menu first
          setContextMenu({ isOpen: false, nodeId: null, position: { x: 0, y: 0 } })

          // Small delay to ensure clean state transition
          setTimeout(() => {
            setContextMenu({
              isOpen: true,
              nodeId: nodeId,
              position: { x: mouseX, y: mouseY }
            })
          }, 10)

          // Hide tooltip when context menu opens
          setTooltipData(null)
        }

        return false
      })

      // Close context menu on background click or right-click
      cy.on('cxttap', (event) => {
        if (event.target === cy) {
          closeContextMenu()
        }
      })

      cy.on('tap', (event) => {
        if (event.target === cy) {
          closeContextMenu()
        }
      })

      // Comprehensive context menu prevention
      const container = cy.container()
      if (container) {
        const preventContextMenu = (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }

        const preventContextMenuCapture = (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }

        // Add listeners for both capture and bubble phases
        container.addEventListener('contextmenu', preventContextMenu, false)
        container.addEventListener('contextmenu', preventContextMenuCapture, true)

        // Also prevent on the parent container to be extra sure
        const parentContainer = container.parentElement
        if (parentContainer) {
          parentContainer.addEventListener('contextmenu', preventContextMenu, false)
          parentContainer.addEventListener('contextmenu', preventContextMenuCapture, true)
        }

        // Store the cleanup function
        const cleanup = () => {
          container.removeEventListener('contextmenu', preventContextMenu, false)
          container.removeEventListener('contextmenu', preventContextMenuCapture, true)
          if (parentContainer) {
            parentContainer.removeEventListener('contextmenu', preventContextMenu, false)
            parentContainer.removeEventListener('contextmenu', preventContextMenuCapture, true)
          }
        }

        // Add cleanup to cytoscape instance for later removal
        cy.data('contextMenuCleanup', cleanup)
      }

      cyRef.current = cy

      // Initialize animation engine
      if (animationEngineRef.current) {
        animationEngineRef.current.destroy()
      }
      animationEngineRef.current = new TCAnimationEngine(cy)

      console.log('Cytoscape instance created successfully:', cy)
      console.log('Graph elements count:', cy.elements().length)
      console.log('Nodes count:', cy.nodes().length)
      console.log('Edges count:', cy.edges().length)

      setLoading(false)
      
      // Run initial layout
      setTimeout(() => {
        console.log('Starting layout with:', currentLayout)
        runLayout(currentLayout)
        setNodeCount(cy.nodes().length)
        setEdgeCount(cy.edges().length)

        // Apply TC properties after layout
        setTimeout(() => {
          applyTCPropertiesToGraph()
        }, 500)

        console.log('Layout and counts set')
      }, 100)

      return true
    } catch (error) {
      console.error('Error initializing Cytoscape:', error)
      setError('Failed to initialize graph visualization')
      setLoading(false)
      return false
    }
  }

  // Load graph data from API
  const loadGraphData = async () => {
    console.log('GraphVisualization: loadGraphData called')
    try {
      setLoading(true)
      setError(null)
      // Don't reset containerReady - let it stay true if already set

      console.log('GraphVisualization: Fetching data from /api/graph')
      const response = await fetch('/api/graph')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.nodes || !data.edges) {
        throw new Error('Invalid graph data format')
      }

      console.log('Loaded graph data:', data)
      
      // Store original data for reference
      setOriginalGraphData(data)
      setGraphData(data)
      
      // Expose data to parent component
      if (onDataLoad) {
        console.log('GraphVisualization: Calling onDataLoad callback with data transformation')
        // Transform cytoscape format to simple format for other views
        const simpleNodes = data.nodes.map((node: any) => ({
          uid: node.data.id,
          type: node.data.type,
          showname: node.data.label,
          timestamp: node.data.timestamp, // Preserve timestamp as direct property
          latitude: node.data.latitude, // Preserve latitude as direct property
          longitude: node.data.longitude, // Preserve longitude as direct property
          color: node.data.color, // Preserve color as direct property
          properties: node.data.properties || {},
          icon: node.data.icon
        }))
        const simpleEdges = data.edges.map((edge: any) => ({
          from: edge.data.source,
          to: edge.data.target,
          type: edge.data.type,
          timestamp: edge.data.timestamp, // Preserve timestamp as direct property
          properties: edge.data.properties || {}
        }))
        console.log('GraphVisualization: Transformed data for other views:', {
          nodeCount: simpleNodes.length,
          edgeCount: simpleEdges.length,
          sampleNode: simpleNodes[0],
          sampleEdge: simpleEdges[0]
        })
        onDataLoad({ nodes: simpleNodes, edges: simpleEdges })
      } else {
        console.log('GraphVisualization: No onDataLoad callback provided')
      }
      
      // Extract unique node types
      const typeMap: { [key: string]: boolean } = {}
      data.nodes.forEach((node: any) => {
        if (node.data.type) {
          typeMap[node.data.type] = true
        }
      })
      const types = Object.keys(typeMap)
      setNodeTypes(types)
      
      setNodeCount(data.nodes.length)
      setEdgeCount(data.edges.length)
      
      // Important: Set loading to false after successful data load
      setLoading(false)
      
    } catch (error) {
      console.error('Error loading graph data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load graph data')
      setLoading(false)
    }
  }

  // Custom hierarchical tree layout algorithm
  const createHierarchicalTreeLayout = (cy: Core, rootNodeId: string) => {
    console.log('Creating hierarchical tree layout with root:', rootNodeId)

    // Debug: Log graph structure
    const graphNodes = cy.nodes().filter(n => n.data('type') !== 'Group')
    const allEdges = cy.edges()
    console.log('Graph structure:', {
      totalNodes: graphNodes.length,
      totalEdges: allEdges.length,
      nodeIds: graphNodes.map(n => n.id()),
      edges: allEdges.map(e => ({ id: e.id(), source: e.source().id(), target: e.target().id() }))
    })

    // Build hierarchy levels using BFS
    const visited = new Set<string>()
    const levels: string[][] = []
    const queue: { nodeId: string, level: number }[] = [{ nodeId: rootNodeId, level: 0 }]

    visited.add(rootNodeId)

    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!

      // Initialize level array if needed
      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(nodeId)

      console.log(`Processing node ${nodeId} at level ${level}`)

      // Find connected nodes that haven't been visited
      const node = cy.nodes(`[id = "${nodeId}"]`)
      if (node.length > 0) {
        // Get all connected edges for this node
        const connectedEdges = node.connectedEdges()
        console.log(`Node ${nodeId} has ${connectedEdges.length} connected edges`)

        // Debug: Log edge details
        connectedEdges.forEach((edge, index) => {
          console.log(`  Edge ${index}: ${edge.id()}, source: ${edge.source().id()}, target: ${edge.target().id()}, type: ${edge.data('type')}`)
        })

        // Get neighbors through edges (both incoming and outgoing)
        const neighbors = new Set<string>()
        connectedEdges.forEach(edge => {
          const sourceId = edge.source().id()
          const targetId = edge.target().id()

          console.log(`  Checking edge: ${sourceId} -> ${targetId}`)

          // Add the other node (not the current one)
          if (sourceId === nodeId && targetId !== nodeId) {
            const targetNode = cy.nodes(`[id = "${targetId}"]`)
            console.log(`    Found outgoing neighbor: ${targetId}, exists: ${targetNode.length > 0}, type: ${targetNode.data('type')}`)
            if (targetNode.length > 0 && targetNode.data('type') !== 'Group') {
              neighbors.add(targetId)
              console.log(`    Added neighbor: ${targetId}`)
            }
          } else if (targetId === nodeId && sourceId !== nodeId) {
            const sourceNode = cy.nodes(`[id = "${sourceId}"]`)
            console.log(`    Found incoming neighbor: ${sourceId}, exists: ${sourceNode.length > 0}, type: ${sourceNode.data('type')}`)
            if (sourceNode.length > 0 && sourceNode.data('type') !== 'Group') {
              neighbors.add(sourceId)
              console.log(`    Added neighbor: ${sourceId}`)
            }
          }
        })

        console.log(`Node ${nodeId} has ${neighbors.size} valid neighbors:`, Array.from(neighbors))

        neighbors.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            console.log(`Adding neighbor ${neighborId} to level ${level + 1}`)
            visited.add(neighborId)
            queue.push({ nodeId: neighborId, level: level + 1 })
          } else {
            console.log(`Neighbor ${neighborId} already visited, skipping`)
          }
        })
      } else {
        console.log(`Node ${nodeId} not found in graph`)
      }
    }

    console.log('Hierarchy levels built:', levels.map((level, i) => `Level ${i}: ${level.length} nodes`))

    // Calculate positions
    const container = cy.container()
    const containerWidth = container ? container.clientWidth : 800
    const containerHeight = container ? container.clientHeight : 600

    const levelHeight = Math.max(120, containerHeight / Math.max(levels.length, 3))
    const positions: { [nodeId: string]: { x: number, y: number } } = {}

    levels.forEach((levelNodes, levelIndex) => {
      const y = levelIndex * levelHeight + 100 // Start from top with padding
      const levelWidth = containerWidth - 100 // Leave padding on sides
      const nodeSpacing = levelNodes.length > 1 ? levelWidth / (levelNodes.length - 1) : 0

      levelNodes.forEach((nodeId, nodeIndex) => {
        let x: number
        if (levelNodes.length === 1) {
          x = containerWidth / 2 // Center single nodes
        } else {
          x = 50 + (nodeIndex * nodeSpacing) // Distribute across width
        }

        positions[nodeId] = { x, y }
      })
    })

    // Handle any unconnected nodes (place them at the bottom)
    const allNodes = cy.nodes().filter(n => n.data('type') !== 'Group')
    const unconnectedNodes = allNodes.filter(node => !visited.has(node.id()))

    if (unconnectedNodes.length > 0) {
      const bottomY = levels.length * levelHeight + 150
      const bottomWidth = containerWidth - 100
      const bottomSpacing = unconnectedNodes.length > 1 ? bottomWidth / (unconnectedNodes.length - 1) : 0

      unconnectedNodes.forEach((node, index) => {
        let x: number
        if (unconnectedNodes.length === 1) {
          x = containerWidth / 2
        } else {
          x = 50 + (index * bottomSpacing)
        }
        positions[node.id()] = { x, y: bottomY }
      })
    }

    console.log('Calculated positions for', Object.keys(positions).length, 'nodes')
    return positions
  }

  // Safety function to ensure we never pass 'hierarchical-tree' directly to Cytoscape
  const sanitizeLayoutName = (layoutName: string): string => {
    if (layoutName === 'hierarchical-tree') {
      console.warn('Attempted to use hierarchical-tree layout directly, converting to grid')
      return 'grid'
    }
    return layoutName
  }

  // Safety function to sanitize layout config objects
  const sanitizeLayoutConfig = (config: any): any => {
    if (!config) return config

    const sanitizedConfig = { ...config }
    if (sanitizedConfig.name === 'hierarchical-tree') {
      console.warn('Layout config contains hierarchical-tree name, converting to grid')
      sanitizedConfig.name = 'grid'
    }

    return sanitizedConfig
  }

  // Helper function to determine the best root node for hierarchical layouts
  const determineRootNode = (cy: Core, explicitRootId?: string): string | undefined => {
    // If an explicit root is provided, use it (highest priority)
    if (explicitRootId) {
      const explicitNode = cy.nodes(`[id = "${explicitRootId}"]`)
      if (explicitNode.length > 0 && explicitNode.data('type') !== 'Group') {
        console.log('Using explicit root node:', explicitRootId)
        return explicitRootId
      }
    }

    // If exactly one node is selected, use it as root
    if (selectedNodes.length === 1) {
      const selectedNodeId = selectedNodes[0]
      const selectedNode = cy.nodes(`[id = "${selectedNodeId}"]`)
      if (selectedNode.length > 0 && selectedNode.data('type') !== 'Group') {
        console.log('Using selected node as root:', selectedNodeId)
        return selectedNodeId
      }
    }

    // Auto-select root based on node characteristics
    const visibleNodes = cy.nodes(':visible').filter(node => node.data('type') !== 'Group')
    if (visibleNodes.length === 0) return undefined

    // Strategy 1: Node with highest degree (most connections)
    let bestNode = visibleNodes[0]
    let maxDegree = bestNode.degree(false) // false = count all edges (undirected)

    visibleNodes.forEach(node => {
      const degree = node.degree(false) // false = count all edges (undirected)
      if (degree > maxDegree) {
        maxDegree = degree
        bestNode = node
      }
    })

    const rootId = bestNode.id()
    console.log('Auto-selected root node:', rootId, 'with degree:', maxDegree)
    return rootId
  }

  // Enhanced layout with smooth transitions
  const runLayout = (layoutName?: string) => {
    if (!cyRef.current) {
      console.log('No cytoscape instance available for layout')
      return
    }

    if (layoutRunning) {
      console.log('Layout already running, skipping...')
      return
    }

    const cy = cyRef.current
    const activeLayout = layoutName || currentLayout
    console.log('Running layout:', activeLayout, 'on', cy.nodes().length, 'nodes')

    // Safety check to prevent passing 'hierarchical-tree' directly to Cytoscape
    if (activeLayout === 'hierarchical-tree') {
      console.log('Detected hierarchical-tree layout, applying special handling')
    }
    
    setLayoutRunning(true)
    
    // Store current group state before layout
    const visibleNodes = cy.nodes(':visible')
    const hiddenNodes = cy.nodes(':hidden')
    console.log('Preserving group state:', {
      totalNodes: cy.nodes().length,
      visibleNodes: visibleNodes.length,
      hiddenNodes: hiddenNodes.length,
      activeGroups: Object.keys(groups).length
    })
    
    // Layout configurations optimized for different types
    const layoutConfigs: { [key: string]: any } = {
      grid: {
        name: 'grid',
        rows: Math.ceil(Math.sqrt(visibleNodes.length)),
        cols: Math.ceil(Math.sqrt(visibleNodes.length)),
        padding: 30,
        spacingFactor: 1.2,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      random: {
        name: 'random',
        fit: true,
        padding: 30,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      circle: {
        name: 'circle',
        // Calculate radius dynamically based on container and node count
        radius: (() => {
          const container = cy.container()
          if (container && container.clientWidth > 0) {
            const containerWidth = container.clientWidth
            const containerHeight = container.clientHeight
            const minDimension = Math.min(containerWidth, containerHeight)
            const calculatedRadius = Math.max(100, Math.min(300, minDimension / 4))
            console.log('Circle layout radius calculation:', {
              containerWidth,
              containerHeight,
              minDimension,
              calculatedRadius,
              nodeCount: visibleNodes.length
            })
            return calculatedRadius
          }
          // Fallback radius based on number of nodes
          const fallbackRadius = Math.max(100, Math.min(300, visibleNodes.length * 15))
          console.log('Circle layout using fallback radius:', fallbackRadius, 'for', visibleNodes.length, 'nodes')
          return fallbackRadius
        })(),
        fit: true,
        padding: 30,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      concentric: {
        name: 'concentric',
        concentric: (node: any) => node.degree(false), // false = count all edges (undirected)
        levelWidth: () => 2,
        padding: 30,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      breadthfirst: {
        name: 'breadthfirst',
        directed: false,
        roots: (() => {
          if (activeLayout === 'breadthfirst') {
            const rootNodeId = determineRootNode(cy)
            if (rootNodeId) {
              // Return the actual node collection, not just the ID
              return cy.nodes(`[id = "${rootNodeId}"]`)
            }
          }
          return undefined
        })(),
        padding: 30,
        spacingFactor: 1.75,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      'hierarchical-tree': {
        // This will be handled specially in the config selection logic above
        name: 'grid',
        fit: true,
        padding: 50,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      cose: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      preset: {
        name: 'preset',
        positions: undefined, // Will use node positions from data
        fit: true,
        padding: 30,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      }
    }

    let config = layoutConfigs[activeLayout] || layoutConfigs.grid

    // Additional safety check: ensure config.name is never 'hierarchical-tree'
    if (config && config.name === 'hierarchical-tree') {
      console.warn('Layout config has hierarchical-tree name, converting to grid')
      config = { ...config, name: 'grid' }
    }

    // Special handling for hierarchical-tree layout
    if (activeLayout === 'hierarchical-tree') {
      const rootNodeId = determineRootNode(cy)
      if (rootNodeId) {
        const positions = createHierarchicalTreeLayout(cy, rootNodeId)
        config = {
          name: 'preset',
          positions: positions,
          fit: true,
          padding: 50,
          animate: true,
          animationDuration: 500,
          animationEasing: 'ease-out'
        }
      } else {
        // Fallback to grid if no root found
        config = layoutConfigs.grid
      }
    }

    console.log('Using layout config for', activeLayout + ':', config)

    // Final safety check before applying layout
    if (config && config.name) {
      config.name = sanitizeLayoutName(config.name)
    }

    // Enhanced debugging for circle layout
    if (activeLayout === 'circle') {
      const container = cy.container()
      console.log('Circle layout debugging:', {
        containerExists: !!container,
        containerWidth: container?.clientWidth,
        containerHeight: container?.clientHeight,
        calculatedRadius: config.radius,
        visibleNodesCount: visibleNodes.length
      })
    }

    // Simplified layout without nested animations to prevent infinite loops
    console.log('Starting layout with group preservation')
    
    try {
      // Run layout only on visible nodes (preserves groups) with safety check
      const safeConfig = sanitizeLayoutConfig(config)
      const layout = visibleNodes.layout(safeConfig)
      
      // Use one-time event listeners to avoid multiple callbacks and cleanup properly
      layout.one('layoutstop', () => {
        console.log(`${activeLayout} layout completed successfully, restoring group state`)

        // Special handling for hierarchical layouts - highlight root node
        if ((activeLayout === 'breadthfirst' && config.roots && config.roots.length > 0) ||
            (activeLayout === 'hierarchical-tree')) {
          let rootNode: any = null
          let rootNodeId: string = ''

          if (activeLayout === 'breadthfirst' && config.roots) {
            rootNode = config.roots
            rootNodeId = rootNode.id()
          } else if (activeLayout === 'hierarchical-tree') {
            rootNodeId = determineRootNode(cy) || ''
            if (rootNodeId) {
              rootNode = cy.nodes(`[id = "${rootNodeId}"]`)
            }
          }

          if (rootNode && rootNode.length > 0) {
            // Temporarily highlight the root node
            rootNode.style({
              'border-width': '4px',
              'border-color': '#3182ce',
              'border-style': 'solid'
            })

            // Remove highlight after 3 seconds
            setTimeout(() => {
              if (rootNode.length > 0) {
                rootNode.style({
                  'border-width': '2px',
                  'border-color': '#e2e8f0',
                  'border-style': 'solid'
                })
              }
            }, 3000)

            console.log('Highlighted root node:', rootNodeId)
          }
        }

        // Verify layout results for debugging
        if (activeLayout === 'circle') {
          const nodePositions = visibleNodes.map(node => ({
            id: node.id(),
            position: node.position()
          }))
          console.log('Circle layout node positions:', nodePositions.slice(0, 3)) // Log first 3 positions
        }

        try {
          // Ensure group visibility state is maintained after layout
          // Use groupedNodesRef.current instead of groups state to avoid stale state issues
          const currentGroupedNodes = groupedNodesRef.current
          console.log('🔍 Layout preservation - groupedNodesRef contains:', Object.keys(currentGroupedNodes).length, 'grouped nodes')
          console.log('🔍 Layout preservation - grouped node IDs:', Object.keys(currentGroupedNodes))

          Object.entries(currentGroupedNodes).forEach(([nodeId, groupInfo]) => {
            if (groupInfo && !groupInfo.expanded) {
              const node = cy.nodes(`[id = "${nodeId}"]`)
              if (node.length > 0 && node.style('display') !== 'none') {
                console.log(`❌ Layout preservation hiding grouped node ${nodeId} (group: ${groupInfo.groupId})`)
                node.style('display', 'none')
              }
            }
          })

          console.log('Group state preserved successfully')

        } catch (error) {
          console.error('Error preserving group state:', error)
        } finally {
          setLayoutRunning(false)
        }
      })
      
      layout.one('layouterror', (error: any) => {
        console.error(`${activeLayout} layout error:`, error)
        console.error('Layout config that failed:', config)
        setLayoutRunning(false)
      })
      
      layout.run()
    } catch (error) {
      console.error('Error starting layout:', error)
      setLayoutRunning(false)
    }
  }

  // Change layout with smooth transition
  const changeLayout = (layoutName: string) => {
    console.log('changeLayout called with:', layoutName)

    if (layoutRunning) {
      console.log('Layout currently running, deferring layout change...')
      setTimeout(() => changeLayout(layoutName), 100)
      return
    }

    console.log('Setting current layout to:', layoutName)
    setCurrentLayout(layoutName)

    setTimeout(() => {
      console.log('About to run layout:', layoutName)
      runLayout(layoutName)

      // Get human-readable layout name for toast
      const layoutOption = LAYOUT_OPTIONS.find(option => option.value === layoutName)
      const displayName = layoutOption?.label || layoutName

      // Special handling for hierarchical layouts
      if (layoutName === 'breadthfirst' || layoutName === 'hierarchical-tree') {
        let description = `Switched to ${displayName}`

        if (selectedNodes.length === 1) {
          description += ` using selected node as root`
        } else {
          description += ` using auto-selected root node`
        }

        toast({
          title: 'Hierarchical Layout Applied',
          description: description,
          status: 'info',
          duration: 3000,
          isClosable: true
        })
      } else {
        toast({
          title: 'Layout Changed',
          description: `Switched to ${displayName}`,
          status: 'info',
          duration: 2000,
          isClosable: true
        })
      }

      // Note: Users can now manually use Center & Fit or Reset View to apply layout and reposition
    }, 100)
  }

  // Handle setting a node as hierarchy root
  const setNodeAsHierarchyRoot = useCallback((nodeId: string) => {
    if (!cyRef.current) {
      console.error('No cytoscape instance available for setNodeAsHierarchyRoot')
      return
    }

    console.log('Setting node as hierarchy root:', nodeId)

    const cy = cyRef.current
    const node = cy.nodes(`[id = "${nodeId}"]`)

    if (node.length === 0) {
      console.error('Node not found:', nodeId)
      toast({
        title: 'Error',
        description: `Node "${nodeId}" not found`,
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    // Get node data for display name
    const nodeData = node.data()
    const nodeName = nodeData?.showname || nodeData?.name || nodeId
    console.log('Node data for hierarchy root:', { nodeId, nodeName, nodeData })

    // Clear all selections and select the new root node
    cy.nodes().unselect()
    setSelectedNodes([nodeId])
    node.select()

    // Close context menu immediately
    setContextMenu({ isOpen: false, nodeId: null, position: { x: 0, y: 0 } })

    // Switch to hierarchical tree layout if not already
    setCurrentLayout('hierarchical-tree')

    // Force immediate layout refresh with the new root
    setTimeout(() => {
      console.log('Running hierarchical tree layout with new root:', nodeId)

      // Create the hierarchical layout with the specific root
      const positions = createHierarchicalTreeLayout(cy, nodeId)

      const layoutConfig = {
        name: 'preset',
        positions: positions,
        fit: true,
        padding: 50,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      }

      const layout = cy.layout(sanitizeLayoutConfig(layoutConfig))

      layout.one('layoutstop', () => {
        console.log('Hierarchy root layout completed for node:', nodeId)

        // Highlight the root node
        cy.nodes().removeClass('hierarchy-root')
        node.addClass('hierarchy-root')

        // Center and fit the graph
        setTimeout(() => {
          cy.fit(cy.elements(), 60)
          cy.center()

          toast({
            title: 'Hierarchy Root Set',
            description: `Set "${nodeName}" as hierarchy root and refreshed Multi-Level Hierarchical Tree layout`,
            status: 'success',
            duration: 3000,
            isClosable: true
          })
        }, 100)
      })

      layout.run()
    }, 50)
  }, [toast, createHierarchicalTreeLayout])

  // Center and fit the graph to screen with layout application and visibility reset
  const centerAndFitGraph = useCallback(() => {
    if (!cyRef.current) return
    
    // Clear any pending center/fit operations to prevent rapid fire calls
    if (centerFitTimeoutRef.current) {
      clearTimeout(centerFitTimeoutRef.current)
    }
    
    centerFitTimeoutRef.current = setTimeout(() => {
      if (!cyRef.current) return
      
      try {
        console.log('Centering and fitting graph with layout application...')
        
        // First, ensure ALL nodes and edges are visible (unhide any hidden ones)
        cyRef.current.elements().style('display', 'element')
        
        // Apply the current layout to reorganize the graph
        console.log('Applying current layout:', currentLayout)
        let layoutConfig: any

        if (currentLayout === 'hierarchical-tree') {
          // Handle custom hierarchical tree layout
          const rootNodeId = determineRootNode(cyRef.current)
          if (rootNodeId) {
            const positions = createHierarchicalTreeLayout(cyRef.current, rootNodeId)
            layoutConfig = {
              name: 'preset',
              positions: positions,
              fit: true,
              padding: 50,
              animate: false
            }
          } else {
            // Fallback to grid if no root found
            layoutConfig = {
              name: 'grid',
              fit: true,
              padding: 50,
              animate: false
            }
          }
        } else {
          layoutConfig = {
            name: sanitizeLayoutName(currentLayout === 'hierarchical-tree' ? 'grid' : currentLayout),
            fit: true,
            padding: 50,
            animate: false
          }
        }

        layoutConfig.stop = () => {
            // After layout completes, do the fitting
            setTimeout(() => {
              if (!cyRef.current) return

              console.log('Layout completed, now fitting to view...')

              // Get all elements (should all be visible now)
              const allElements = cyRef.current.elements()
              console.log('Elements to fit:', {
                nodes: cyRef.current.nodes().length,
                edges: cyRef.current.edges().length,
                total: allElements.length
              })

              // Reset zoom and pan first
              cyRef.current.zoom(1)
              cyRef.current.pan({ x: 0, y: 0 })

              // Get container dimensions for zoom calculation
              const container = cyRef.current.container()
              if (container) {
                const containerRect = container.getBoundingClientRect()
                const nodeCount = cyRef.current.nodes().length

                console.log('Container bounds check:', {
                  containerWidth: containerRect.width,
                  containerHeight: containerRect.height,
                  viewportWidth: window.innerWidth,
                  viewportHeight: window.innerHeight,
                  nodeCount: nodeCount
                })

                // Ensure container is actually visible in viewport
                const containerTop = containerRect.top
                const containerBottom = containerRect.bottom
                const viewportHeight = window.innerHeight

                if (containerBottom > viewportHeight) {
                  console.warn('Container extends beyond viewport:', {
                    containerBottom,
                    viewportHeight,
                    overflow: containerBottom - viewportHeight
                  })
                }

                // Calculate zoom based on visible container area only
                const effectiveHeight = Math.min(containerRect.height, viewportHeight - containerTop - 20)
                const effectiveWidth = containerRect.width

                // Calculate a conservative zoom based on effective dimensions
                const baseZoom = Math.min(
                  effectiveWidth / (nodeCount * 120),   // More conservative width calculation
                  effectiveHeight / (nodeCount * 120),  // More conservative height calculation
                  1.0 // Lower maximum zoom
                )

                const finalZoom = Math.max(0.3, Math.min(1.0, baseZoom))
                console.log('Setting calculated zoom:', finalZoom, 'based on effective dimensions:', {
                  effectiveWidth,
                  effectiveHeight,
                  nodeCount
                })
                cyRef.current.zoom(finalZoom)
              }

              // Fit with conservative padding to visible area
              cyRef.current.fit(allElements, 60)

              // Center the graph
              cyRef.current.center()

              const finalZoom = cyRef.current.zoom()
              console.log('Graph centered and fitted. Final zoom level:', finalZoom)

              // Get human-readable layout name for toast
              const layoutOption = LAYOUT_OPTIONS.find(option => option.value === currentLayout)
              const displayName = layoutOption?.label || currentLayout

              toast({
                title: 'Graph Centered',
                description: `Applied ${displayName} and fitted ${cyRef.current.nodes().length} nodes (zoom: ${finalZoom.toFixed(2)}x)`,
                status: 'success',
                duration: 2000,
                isClosable: true
              })
            }, 100)
          }

        // Run the layout with safety check
        cyRef.current.layout(sanitizeLayoutConfig(layoutConfig)).run()
        
      } catch (error) {
        console.error('Error in centerAndFitGraph:', error)
        toast({
          title: 'Center & Fit Error',
          description: 'Failed to center and fit the graph',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    }, 200) // 200ms debounce delay
  }, [currentLayout])

  // Emergency reset view function that applies layout and ensures all nodes are visible
  const resetView = useCallback(() => {
    if (!cyRef.current) return

    try {
      console.log('Emergency view reset with layout application...')
      
      // Show all elements that might be hidden
      cyRef.current.elements().style('display', 'element')
      
      // Reset any groups to show individual nodes
      if (Object.keys(groups).length > 0) {
        console.log('Resetting groups to show all individual nodes...')
        
        // Remove all group nodes
        Object.keys(groups).forEach(groupId => {
          const groupNode = cyRef.current!.nodes(`[id = "${groupId}"]`)
          if (groupNode.length > 0) {
            groupNode.remove()
          }
        })
        
        // Remove all meta-edges
        cyRef.current.remove(cyRef.current.edges('[type = "META"]'))
        
        // Restore all original edges
        Object.values(groups).forEach(groupData => {
          if (groupData.originalEdges.length > 0) {
            try {
              console.log('Restoring original edges for reset, group:', groupData.id, 'Edges:', groupData.originalEdges.length)
              cyRef.current!.add(groupData.originalEdges)
            } catch (error) {
              console.error('Error restoring original edges during reset for group:', groupData.id, error)
            }
          }
        })
        
        // Clear groups state
        setGroups({})
      }
      
      // Apply the current layout
      console.log('Applying layout for reset:', currentLayout)
      let layoutConfig: any

      if (currentLayout === 'hierarchical-tree') {
        // Handle custom hierarchical tree layout
        const rootNodeId = determineRootNode(cyRef.current)
        if (rootNodeId) {
          const positions = createHierarchicalTreeLayout(cyRef.current, rootNodeId)
          layoutConfig = {
            name: 'preset',
            positions: positions,
            fit: true,
            padding: 100,
            animate: false
          }
        } else {
          // Fallback to grid if no root found
          layoutConfig = {
            name: 'grid',
            fit: true,
            padding: 100,
            animate: false
          }
        }
      } else {
        layoutConfig = {
          name: sanitizeLayoutName(currentLayout === 'hierarchical-tree' ? 'grid' : currentLayout),
          fit: true,
          padding: 100,
          animate: false
        }
      }

      layoutConfig.stop = () => {
          // After layout, ensure proper fitting with viewport constraints
          setTimeout(() => {
            if (!cyRef.current) return

            const container = cyRef.current.container()
            if (container) {
              const containerRect = container.getBoundingClientRect()
              const viewportHeight = window.innerHeight
              const containerTop = containerRect.top

              console.log('Reset view container check:', {
                containerHeight: containerRect.height,
                viewportHeight,
                containerTop,
                containerBottom: containerRect.bottom,
                isFullyVisible: containerRect.bottom <= viewportHeight
              })

              // Calculate effective viewing area
              const effectiveHeight = Math.min(containerRect.height, viewportHeight - containerTop - 20)

              // Reset zoom and pan first
              cyRef.current.zoom(1)
              cyRef.current.pan({ x: 0, y: 0 })

              // Apply conservative zoom based on effective area
              const nodeCount = cyRef.current.nodes().length
              const conservativeZoom = Math.min(
                containerRect.width / (nodeCount * 150),
                effectiveHeight / (nodeCount * 150),
                0.8 // Very conservative maximum
              )

              const finalZoom = Math.max(0.3, conservativeZoom)
              cyRef.current.zoom(finalZoom)

              // Fit to visible area with generous padding
              cyRef.current.fit(cyRef.current.elements(), 80)
              cyRef.current.center()

              console.log('Reset complete. Final zoom:', finalZoom, 'Effective height:', effectiveHeight)
            } else {
              // Fallback without container info
              cyRef.current.zoom(0.6)
              cyRef.current.center()
              cyRef.current.fit(cyRef.current.elements(), 100)
            }

            // Get human-readable layout name for toast
            const layoutOption = LAYOUT_OPTIONS.find(option => option.value === currentLayout)
            const displayName = layoutOption?.label || currentLayout

            toast({
              title: 'View Reset Complete',
              description: `Applied ${displayName} and reset view for ${cyRef.current.nodes().length} nodes`,
              status: 'info',
              duration: 2000,
              isClosable: true
            })
          }, 100)
        }
      
      // Apply layout with safety check
      cyRef.current.layout(sanitizeLayoutConfig(layoutConfig)).run()
      
    } catch (error) {
      console.error('Error in resetView:', error)
      toast({
        title: 'Reset View Error',
        description: 'Failed to reset the view',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }, [currentLayout, groups])

  // Helper function to get node count by type
  const getNodeCountByType = (type: string): number => {
    if (!cyRef.current) return 0
    return cyRef.current.nodes().filter(node => 
      node.data('type') === type && node.data('type') !== 'Group'
    ).length
  }

  // Enhanced group by node type with meta-edges
  const groupByNodeType = () => {
    if (!cyRef.current || !graphData) return

    const typeGroups: { [key: string]: string[] } = {}
    
    // Collect nodes by type (excluding existing groups)
    cyRef.current.nodes().forEach(node => {
      const type = node.data('type')
      if (type !== 'Group') {
        if (!typeGroups[type]) typeGroups[type] = []
        typeGroups[type].push(node.data('id'))
      }
    })

    // Create group nodes with meta-edges
    const newGroups = { ...groups }
    let groupsCreated = 0

    Object.keys(typeGroups).forEach(type => {
      const nodeIds = typeGroups[type]
      
      if (nodeIds.length > 1) {
        const groupId = `group-${type}-${Date.now()}`
        
        // Store original edges before grouping
        const originalEdges = storeOriginalEdges(nodeIds)
        
        // Add group node
        cyRef.current!.add({
          group: 'nodes',
          data: { 
            id: groupId, 
            label: `${type} (${nodeIds.length})`, 
            type: 'Group',
            expanded: false
          }
        })

        // Hide grouped nodes
        nodeIds.forEach(nodeId => {
          const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
          if (node.length > 0) {
            node.style('display', 'none')
          }
        })

        // Remove original edges between grouped nodes and external nodes to avoid duplication
        console.log(`Removing original edges for ${nodeIds.length} nodes being grouped into ${groupId}`)
        const edgesToRemove = new Set<string>() // Track edges to remove to avoid duplicates

        nodeIds.forEach(nodeId => {
          const connectedEdges = cyRef.current!.edges(`[source = "${nodeId}"], [target = "${nodeId}"]`)
          connectedEdges.forEach(edge => {
            const edgeId = edge.id()
            if (!edgesToRemove.has(edgeId)) {
              edgesToRemove.add(edgeId)
              console.log(`Marking edge for removal: ${edgeId} (${edge.source().id()} → ${edge.target().id()})`)
            }
          })
        })

        if (edgesToRemove.size > 0) {
          const edgeSelector = Array.from(edgesToRemove).map(id => `[id = "${id}"]`).join(', ')
          const edgesToRemoveElements = cyRef.current!.edges(edgeSelector)
          console.log(`Removing ${edgesToRemoveElements.length} unique edges from graph`)
          cyRef.current!.remove(edgesToRemoveElements)
        }
        
        // Create meta-edges with validation
        const metaEdges = createMetaEdges(groupId, nodeIds)
        if (metaEdges.length > 0) {
          cyRef.current!.add(metaEdges)
        }

        newGroups[groupId] = {
          id: groupId,
          name: `${type} (${nodeIds.length})`,
          members: nodeIds,
          expanded: false,
          originalEdges: originalEdges,
          metaEdges: metaEdges,
          type: 'auto',
          sourceType: type
        }
        
        groupsCreated++
      }
    })

    setGroups(newGroups)
    runLayout(currentLayout)

    toast({
      title: 'Grouped by Type',
      description: `Created ${groupsCreated} type-based groups with preserved relationships`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    
    // Note: Users can now manually use Center & Fit or Reset View to reposition
  }

  // Group nodes by a specific type (with toggle functionality)
  const groupBySpecificType = (targetType: string) => {
    if (!cyRef.current || !graphData || groupOperationRunning) {
      console.log('Skipping groupBySpecificType - operation already running or invalid state')
      return
    }

    // Prevent rapid successive operations
    setGroupOperationRunning(true)
    
    try {
      // Check if a group for this type already exists
      const existingGroupEntry = Object.entries(groups).find(([, group]) => group.sourceType === targetType)
      
      if (existingGroupEntry) {
        // Ungroup the existing group
        const [groupId, groupData] = existingGroupEntry
        
        console.log(`🔄 Ungrouping type group: ${targetType} (${groupData.members.length} members)`)
        
        // Step 1: Remove meta-edges for this group FIRST
        const metaEdges = cyRef.current.edges(`[source = "${groupId}"], [target = "${groupId}"]`)
        console.log(`🗑️ Removing ${metaEdges.length} meta-edges for group ${groupId}`)
        if (metaEdges.length > 0) {
          cyRef.current.remove(metaEdges)
        }

        // Step 2: Restore original edges BEFORE making nodes visible
        if (groupData.originalEdges.length > 0) {
          try {
            console.log('🔗 Restoring original edges for type group:', targetType, 'Total stored:', groupData.originalEdges.length)
            
            // Get current edge IDs to prevent duplicates
            const existingEdgeIds = new Set(cyRef.current.edges().map(edge => edge.id()))
            
            // Validate and filter edges to restore
            const edgesToRestore = groupData.originalEdges.filter(edge => {
              const edgeId = edge.data.id
              const sourceId = edge.data.source
              const targetId = edge.data.target

              // Skip if edge already exists
              if (existingEdgeIds.has(edgeId)) {
                console.log(`⚠️ Edge ${edgeId} already exists, skipping`)
                return false
              }

              // Verify both nodes exist (don't check visibility yet)
              const sourceNode = cyRef.current!.nodes(`[id = "${sourceId}"]`)
              const targetNode = cyRef.current!.nodes(`[id = "${targetId}"]`)

              if (sourceNode.length === 0 || targetNode.length === 0) {
                console.warn(`❌ Missing node for edge ${edgeId}: source=${sourceNode.length > 0}, target=${targetNode.length > 0}`)
                return false
              }

              return true
            })

            if (edgesToRestore.length > 0) {
              console.log(`🔗 Adding ${edgesToRestore.length} original edges back to graph`)
              cyRef.current.add(edgesToRestore)
              console.log(`✅ Successfully restored ${edgesToRestore.length} original edges for type group`)
            } else {
              console.log('ℹ️ No edges needed restoration for type group')
            }
          } catch (error) {
            console.error('❌ Error restoring original edges for type group:', targetType, error)
          }
        }

        // Step 3: Remove the group node
        const groupNode = cyRef.current.nodes(`[id = "${groupId}"]`)
        if (groupNode.length > 0) {
          groupNode.remove()
          console.log(`🗑️ Removed group node: ${groupId}`)
        }

        // Step 4: Make all grouped nodes visible with comprehensive restoration
        groupData.members.forEach(nodeId => {
          const groupedNode = cyRef.current!.nodes(`[id = "${nodeId}"]`)
          if (groupedNode.length > 0) {
            // Reset all visibility properties
            groupedNode.removeStyle()
            groupedNode.style({
              'display': 'element',
              'visibility': 'visible',
              'opacity': 1
            })
            // Remove any grouping classes
            groupedNode.removeClass('grouped hidden')
            console.log(`✅ Fully restored visibility for node: ${nodeId}`)
          } else {
            console.warn(`❌ Node ${nodeId} not found during ungrouping`)
          }
        })

        // Step 5: Clean up groupedNodesRef for all members of this group
        if (groupData && groupData.members) {
          console.log('🧹 Cleaning up groupedNodesRef for group:', groupId, 'with members:', groupData.members)
          groupData.members.forEach(memberId => {
            if (groupedNodesRef.current[memberId]) {
              console.log(`🧹 Removing group data from groupedNodesRef for member: ${memberId}`)
              delete groupedNodesRef.current[memberId]
            }
          })
        }

        // Step 6: Update groups state
        setGroups(prev => {
          const newGroups = { ...prev }
          delete newGroups[groupId]
          return newGroups
        })

        // Step 7: Force immediate layout refresh with a longer delay to ensure state is updated
        setTimeout(() => {
          console.log(`🔄 Running layout refresh after ungrouping ${targetType}`)
          if (cyRef.current) {
            // Ensure all elements are visible and properly positioned
            cyRef.current.elements().style('display', 'element')
            runLayout(currentLayout)
            
            // Additional fit and center after layout
            setTimeout(() => {
              if (cyRef.current) {
                cyRef.current.fit(cyRef.current.elements(), 50)
                cyRef.current.center()
                console.log(`✅ Completed ungrouping and layout refresh for ${targetType}`)
              }
            }, 500)
          }
        }, 200)

        toast({
          title: 'Group Removed',
          description: `Ungrouped ${groupData.members.length} "${targetType}" nodes and restored connections`,
          status: 'success',
          duration: 3000,
          isClosable: true
        })
        
        return
      }
    } catch (error) {
      console.error('❌ Error during ungrouping operation:', error)
      toast({
        title: 'Ungrouping Error',
        description: 'Failed to ungroup nodes. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      // Always reset the operation flag
      setTimeout(() => {
        setGroupOperationRunning(false)
      }, 500)
    }

    // Original grouping logic for when no group exists
    const nodeIds: string[] = []
    
    // Collect nodes of the specific type (excluding existing groups)
    cyRef.current.nodes().forEach(node => {
      const type = node.data('type')
      if (type === targetType && type !== 'Group') {
        nodeIds.push(node.data('id'))
      }
    })

    if (nodeIds.length < 2) {
      toast({
        title: 'Cannot Group',
        description: `Need at least 2 nodes of type "${targetType}" to create a group`,
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }

    const groupId = `group-${targetType}-${Date.now()}`
    
    // Store original edges before grouping
    const originalEdges = storeOriginalEdges(nodeIds)
    
    // Add group node
    cyRef.current.add({
      group: 'nodes',
      data: { 
        id: groupId, 
        label: `${targetType} (${nodeIds.length})`, 
        type: 'Group',
        expanded: false
      }
    })

    // Verify the group node was created successfully
    const groupNode = cyRef.current.nodes(`[id = "${groupId}"]`)
    if (groupNode.length === 0) {
      console.error('Failed to create group node:', groupId)
      toast({
        title: 'Group Creation Failed',
        description: 'Failed to create group node',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    // Hide grouped nodes
    nodeIds.forEach(nodeId => {
      const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
      if (node.length > 0) {
        node.style('display', 'none')
      }
    })

    // Create meta-edges with validation
    const metaEdges = createMetaEdges(groupId, nodeIds)
    
    // Add meta-edges with error handling
    if (metaEdges.length > 0) {
      try {
        console.log('Adding meta-edges for group:', groupId, 'Edges:', metaEdges)
        
        // Validate that all referenced nodes exist before adding edges
        const validMetaEdges = metaEdges.filter(edge => {
          const sourceExists = cyRef.current!.nodes(`[id = "${edge.data.source}"]`).length > 0
          const targetExists = cyRef.current!.nodes(`[id = "${edge.data.target}"]`).length > 0
          
          if (!sourceExists) {
            console.warn('Source node does not exist for edge:', edge.data.id, 'Source:', edge.data.source)
          }
          if (!targetExists) {
            console.warn('Target node does not exist for edge:', edge.data.id, 'Target:', edge.data.target)
          }
          
          return sourceExists && targetExists
        })
        
        if (validMetaEdges.length > 0) {
          cyRef.current.add(validMetaEdges)
          console.log('Successfully added', validMetaEdges.length, 'meta-edges')
        } else {
          console.warn('No valid meta-edges to add for group:', groupId)
        }
      } catch (error) {
        console.error('Error adding meta-edges:', error)
        // Continue without meta-edges rather than failing completely
      }
    }

    setGroups(prev => ({
      ...prev,
      [groupId]: {
        id: groupId,
        name: `${targetType} (${nodeIds.length})`,
        members: nodeIds,
        expanded: false,
        originalEdges: originalEdges,
        metaEdges: metaEdges,
        type: 'auto',
        sourceType: targetType
      }
    }))

    runLayout(currentLayout)

    toast({
      title: 'Group Created',
      description: `Created group for ${nodeIds.length} "${targetType}" nodes`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    
    // Note: Users can now manually use Center & Fit or Reset View to reposition
  }

  // Enhanced custom group creation
  const createCustomGroup = () => {
    if (!cyRef.current || selectedNodes.length < 2) return

    const groupId = `group-custom-${Date.now()}`
    const customGroupName = groupName || `Custom Group (${selectedNodes.length})`
    
    // Store original edges before grouping
    const originalEdges = storeOriginalEdges(selectedNodes)
    
    // Add group node
    cyRef.current.add({
      group: 'nodes',
      data: { 
        id: groupId, 
        label: customGroupName, 
        type: 'Group',
        expanded: false
      }
    })

    // Verify the group node was created successfully
    const groupNode = cyRef.current.nodes(`[id = "${groupId}"]`)
    if (groupNode.length === 0) {
      console.error('Failed to create custom group node:', groupId)
      toast({
        title: 'Group Creation Failed',
        description: 'Failed to create custom group node',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }

    // Hide selected nodes
    selectedNodes.forEach(nodeId => {
      const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
      if (node.length > 0) {
        node.style('display', 'none')
        node.removeClass('selected')
      }
    })

    // Remove original edges between grouped nodes and external nodes to avoid duplication
    console.log(`Removing original edges for ${selectedNodes.length} nodes being grouped into custom group ${groupId}`)
    const edgesToRemove = new Set<string>() // Track edges to remove to avoid duplicates

    selectedNodes.forEach(nodeId => {
      const connectedEdges = cyRef.current!.edges(`[source = "${nodeId}"], [target = "${nodeId}"]`)
      connectedEdges.forEach(edge => {
        const edgeId = edge.id()
        if (!edgesToRemove.has(edgeId)) {
          edgesToRemove.add(edgeId)
          console.log(`Marking edge for removal: ${edgeId} (${edge.source().id()} → ${edge.target().id()})`)
        }
      })
    })

    if (edgesToRemove.size > 0) {
      const edgeSelector = Array.from(edgesToRemove).map(id => `[id = "${id}"]`).join(', ')
      const edgesToRemoveElements = cyRef.current!.edges(edgeSelector)
      console.log(`Removing ${edgesToRemoveElements.length} unique edges from graph`)
      cyRef.current!.remove(edgesToRemoveElements)
    }
    
    // Create and add meta-edges with validation
    const metaEdges = createMetaEdges(groupId, selectedNodes)
    if (metaEdges.length > 0) {
      try {
        console.log('Adding meta-edges for custom group:', groupId, 'Edges:', metaEdges)
        
        // Validate that all referenced nodes exist before adding edges
        const validMetaEdges = metaEdges.filter(edge => {
          const sourceExists = cyRef.current!.nodes(`[id = "${edge.data.source}"]`).length > 0
          const targetExists = cyRef.current!.nodes(`[id = "${edge.data.target}"]`).length > 0
          
          if (!sourceExists) {
            console.warn('Source node does not exist for custom edge:', edge.data.id, 'Source:', edge.data.source)
          }
          if (!targetExists) {
            console.warn('Target node does not exist for custom edge:', edge.data.id, 'Target:', edge.data.target)
          }
          
          return sourceExists && targetExists
        })
        
        if (validMetaEdges.length > 0) {
          cyRef.current!.add(validMetaEdges)
          console.log('Successfully added', validMetaEdges.length, 'custom meta-edges')
        } else {
          console.warn('No valid meta-edges to add for custom group:', groupId)
        }
      } catch (error) {
        console.error('Error adding custom meta-edges:', error)
        // Continue without meta-edges rather than failing completely
      }
    }

    setGroups(prev => ({ 
      ...prev, 
      [groupId]: {
        id: groupId,
        name: customGroupName,
        members: selectedNodes,
        expanded: false,
        originalEdges: originalEdges,
        metaEdges: metaEdges,
        type: 'manual',
        sourceType: undefined
      } 
    }))
    
    setSelectedNodes([])
    setGroupName('')
    onGroupModalClose()

    runLayout(currentLayout)

    toast({
      title: 'Custom Group Created',
      description: `Created "${customGroupName}" with ${selectedNodes.length} nodes and preserved relationships`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    
    // Note: Users can now manually use Center & Fit or Reset View to reposition
  }

  // Enhanced ungroup functionality
  const ungroupSelected = () => {
    if (!cyRef.current || selectedNodes.length === 0) return

    let ungroupedCount = 0
    
    selectedNodes.forEach(nodeId => {
      const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
      if (node.length > 0 && node.data('type') === 'Group') {
        const groupData = groups[nodeId]
        
        if (groupData) {
          console.log('Ungrouping group:', nodeId, 'with', groupData.members.length, 'members')
          
          // Show all nodes in the group with comprehensive visibility restoration
          console.log('🔍 Restoring visibility for members:', groupData.members)
          groupData.members.forEach(id => {
            const groupedNode = cyRef.current!.nodes(`[id = "${id}"]`)
            if (groupedNode.length > 0) {
              console.log(`📍 Before restoration - Node ${id}:`, {
                display: groupedNode.style('display'),
                visibility: groupedNode.style('visibility'),
                opacity: groupedNode.style('opacity'),
                position: groupedNode.position()
              })

              // Comprehensive visibility restoration
              groupedNode.removeStyle() // Clear all custom styles first
              groupedNode.style({
                'display': 'element',
                'visibility': 'visible',
                'opacity': 1
              })

              console.log(`✅ After restoration - Node ${id}:`, {
                display: groupedNode.style('display'),
                visibility: groupedNode.style('visibility'),
                opacity: groupedNode.style('opacity'),
                position: groupedNode.position()
              })
            } else {
              console.error(`❌ Node ${id} not found in Cytoscape instance!`)
            }
          })

          // Remove ONLY meta-edges for this specific group
          const groupMetaEdges = cyRef.current!.edges(`[source = "${nodeId}"], [target = "${nodeId}"]`)
          console.log('Removing meta-edges for group:', nodeId, 'Count:', groupMetaEdges.length)
          cyRef.current!.remove(groupMetaEdges)
          
          // Restore original edges for this specific group
          if (groupData.originalEdges.length > 0) {
            try {
              console.log('Restoring original edges for group:', nodeId, 'Total stored edges:', groupData.originalEdges.length)

              // Get current edge IDs to check for duplicates
              const existingEdgeIds = new Set(cyRef.current!.edges().map(edge => edge.id()))
              console.log('Current edges in graph:', existingEdgeIds.size)

              // Filter and validate edges to restore
              const edgesToRestore = groupData.originalEdges.filter(edge => {
                const edgeId = edge.data.id
                const sourceId = edge.data.source
                const targetId = edge.data.target

                // Check if edge already exists
                if (existingEdgeIds.has(edgeId)) {
                  console.log(`Edge ${edgeId} already exists, skipping`)
                  return false
                }

                // Check if both source and target nodes exist
                const sourceNode = cyRef.current!.nodes(`[id = "${sourceId}"]`)
                const targetNode = cyRef.current!.nodes(`[id = "${targetId}"]`)

                if (sourceNode.length === 0) {
                  console.warn(`❌ Source node ${sourceId} not found for edge ${edgeId}`)
                  return false
                }
                if (targetNode.length === 0) {
                  console.warn(`❌ Target node ${targetId} not found for edge ${edgeId}`)
                  return false
                }

                // Check if nodes are visible (not hidden by other groups)
                const sourceVisible = sourceNode.style('display') !== 'none'
                const targetVisible = targetNode.style('display') !== 'none'

                if (!sourceVisible) {
                  console.warn(`❌ Source node ${sourceId} is hidden (display: ${sourceNode.style('display')}) for edge ${edgeId}`)
                  return false
                }
                if (!targetVisible) {
                  console.warn(`❌ Target node ${targetId} is hidden (display: ${targetNode.style('display')}) for edge ${edgeId}`)
                  return false
                }

                console.log(`✅ Edge ${edgeId} (${sourceId} → ${targetId}) ready for restoration`)
                return true
              })

              if (edgesToRestore.length > 0) {
                cyRef.current!.add(edgesToRestore)
                console.log(`Successfully restored ${edgesToRestore.length} original edges for group ${nodeId}`)

                // Verify restoration
                const newEdgeCount = cyRef.current!.edges().length
                console.log(`Graph now has ${newEdgeCount} total edges`)
              } else {
                console.log('No edges needed restoration for group:', nodeId)
              }
            } catch (error) {
              console.error('Error restoring original edges for group:', nodeId, error)
            }
          } else {
            console.log('No original edges stored for group:', nodeId)
          }

          // Remove the group node
          node.remove()
          
          ungroupedCount++
        }
      }
    })

    // Update groups state
    setGroups(prev => {
      const newGroups = { ...prev }
      selectedNodes.forEach(nodeId => {
        if (newGroups[nodeId]) {
          delete newGroups[nodeId]
        }
      })
      return newGroups
    })

    // CRITICAL: Also update the groupedNodesRef to prevent layout from re-hiding nodes
    // We need to clean up the member nodes, not the group node itself
    selectedNodes.forEach(nodeId => {
      const groupData = groups[nodeId]
      if (groupData && groupData.members) {
        console.log('Cleaning up groupedNodesRef for group:', nodeId, 'with members:', groupData.members)
        groupData.members.forEach(memberId => {
          if (groupedNodesRef.current[memberId]) {
            console.log('Removing group data from groupedNodesRef for member:', memberId)
            delete groupedNodesRef.current[memberId]
          }
        })
      }
    })

    setSelectedNodes([])

    // CRITICAL: Force Cytoscape to refresh and re-render all elements
    if (cyRef.current) {
      console.log('🔄 Forcing Cytoscape viewport refresh...')

      // Force a complete re-render of the graph
      cyRef.current.forceRender()

      // Ensure all elements are properly rendered
      cyRef.current.elements().forEach(ele => {
        if (ele.isNode() && ele.style('display') === 'element') {
          console.log(`🔍 Node ${ele.id()} visibility check:`, {
            display: ele.style('display'),
            visibility: ele.style('visibility'),
            opacity: ele.style('opacity'),
            rendered: ele.rendered()
          })
        }
      })

      // Force viewport update
      setTimeout(() => {
        if (cyRef.current) {
          cyRef.current.fit()
          cyRef.current.center()
          console.log('✅ Viewport refresh completed')
        }
      }, 100)
    }

    // Force a re-render to update the Available Types display
    setTimeout(() => {
      runLayout(currentLayout)
    }, 200)

    if (ungroupedCount > 0) {
      toast({
        title: 'Groups Ungrouped',
        description: `Ungrouped ${ungroupedCount} group(s) and restored original relationships`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      
      // Note: Users can now manually use Center & Fit or Reset View to reposition
    }
  }

  // Apply alarm filters to show/hide nodes based on alarm status
  const applyAlarmFilters = useCallback(() => {
    if (!cyRef.current) return

    cyRef.current.nodes().forEach(node => {
      const properties = node.data('properties') || {}
      const alarmLevel = properties['TC_ALARM'] || 'None'

      if (alarmFilters[alarmLevel]) {
        node.style('display', 'element')
      } else {
        node.style('display', 'none')
      }
    })

    // Update toast with filter status
    const activeFilters = Object.entries(alarmFilters)
      .filter(([_, active]) => active)
      .map(([level, _]) => level)

    toast({
      title: 'Alarm Filters Applied',
      description: `Showing nodes with: ${activeFilters.join(', ')}`,
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }, [alarmFilters, toast])

  // Preset alarm filter functions
  const showOnlyAlerts = () => {
    setAlarmFilters({
      'Alert': true,
      'Warning': false,
      'Success': false,
      'Info': false,
      'None': false
    })
  }

  const showAlertsAndWarnings = () => {
    setAlarmFilters({
      'Alert': true,
      'Warning': true,
      'Success': false,
      'Info': false,
      'None': false
    })
  }

  const hideSuccessAndInfo = () => {
    setAlarmFilters({
      'Alert': true,
      'Warning': true,
      'Success': false,
      'Info': false,
      'None': true
    })
  }

  const showAllAlarms = () => {
    setAlarmFilters({
      'Alert': true,
      'Warning': true,
      'Success': true,
      'Info': true,
      'None': true
    })
  }

  // Apply alarm filters when they change
  useEffect(() => {
    if (cyRef.current && containerReady) {
      applyAlarmFilters()
    }
  }, [alarmFilters, applyAlarmFilters, containerReady])

  // Threat Path Filtering Functions
  const updateAvailableThreatPaths = useCallback(() => {
    if (!cyRef.current) return

    const allElements = [...cyRef.current.nodes().map(n => ({ properties: n.data('properties') || {} })),
                        ...cyRef.current.edges().map(e => ({ properties: e.data('properties') || {} }))]

    const threatPaths = getAllThreatPaths(allElements)
    setAvailableThreatPaths(threatPaths)

    // Initialize filters for new threat paths
    setThreatPathFilters(prev => {
      const newFilters = { ...prev }
      threatPaths.forEach(path => {
        if (!(path in newFilters)) {
          newFilters[path] = true // Default to showing all threat paths
        }
      })
      return newFilters
    })
  }, [])

  const applyThreatPathFilters = useCallback(() => {
    if (!cyRef.current) return

    const activeFilters = Object.entries(threatPathFilters)
      .filter(([_, active]) => active)
      .map(([path, _]) => path)

    // Handle case when no filters are active
    if (activeFilters.length === 0) {
      if (threatPathFilterMode === 'show') {
        // If no filters are active in show mode, show all elements
        cyRef.current.elements().style('display', 'element')
      } else {
        // If no filters are active in hide mode, show all elements
        cyRef.current.elements().style('display', 'element')
      }
      return
    }

    cyRef.current.elements().forEach(element => {
      const properties = element.data('properties') || {}
      const threatPaths = parseThreatPaths(properties['TC_THREAT_PATH'] || '')

      // Check if element has any matching threat paths
      const hasMatchingPath = threatPaths.some(path => activeFilters.includes(path))

      if (threatPathFilterMode === 'show') {
        // Show mode: ONLY show elements that have at least one matching threat path
        // Hide all elements that don't have matching threat paths (including those with no threat paths)
        element.style('display', hasMatchingPath ? 'element' : 'none')
      } else {
        // Hide mode: hide elements that have at least one matching threat path
        // Show elements that don't have matching threat paths (including those with no threat paths)
        element.style('display', hasMatchingPath ? 'none' : 'element')
      }
    })

    // Update toast with filter status
    const modeText = threatPathFilterMode === 'show' ? 'Showing' : 'Hiding'
    toast({
      title: 'Threat Path Filters Applied',
      description: `${modeText} elements with: ${activeFilters.join(', ') || 'none'}`,
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }, [threatPathFilters, threatPathFilterMode, toast])

  const clearAllThreatPathFilters = () => {
    setThreatPathFilters({})
    if (cyRef.current) {
      cyRef.current.elements().style('display', 'element')
    }
  }

  const clearAllThreatPaths = useCallback(() => {
    if (!cyRef.current) return

    let elementsModified = 0

    // Clear threat paths from all nodes and edges
    cyRef.current.elements().forEach(element => {
      const properties = element.data('properties') || {}
      if (properties['TC_THREAT_PATH']) {
        const updatedProperties = { ...properties }
        delete updatedProperties['TC_THREAT_PATH']
        element.data('properties', updatedProperties)
        elementsModified++
      }
    })

    // Update available threat paths
    setAvailableThreatPaths([])
    setThreatPathFilters({})

    // Show success message
    toast({
      title: 'Threat Paths Cleared',
      description: `Removed threat paths from ${elementsModified} elements`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })

    // Trigger property change callback if available
    if (handlePropertyChange && typeof handlePropertyChange === 'function' && elementsModified > 0) {
      // Note: This is a bulk operation, so we'll need to handle it differently
      // For now, we'll just update the graph state
      console.log(`Cleared threat paths from ${elementsModified} elements`)
    }
  }, [toast, handlePropertyChange])

  const handleThreatPathCreated = useCallback(async (threatPathData: {
    threatPathName: string
    startNodeUid: string
    endNodeUid: string
    alarmLevel: string
    animation: string
    pathNodes: string[]
    pathEdges: Array<{ from: string; to: string }>
  }) => {
    if (!cyRef.current) return

    try {
      // Apply threat path to Neo4j database
      const response = await fetch('/api/threat-paths/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(threatPathData)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to apply threat path')
      }

      // Update local graph elements
      threatPathData.pathNodes.forEach(nodeUid => {
        const node = cyRef.current!.nodes(`[id = "${nodeUid}"]`)
        if (node.length > 0) {
          const properties = node.data('properties') || {}
          const updatedThreatPath = addThreatPath(properties['TC_THREAT_PATH'] || '', threatPathData.threatPathName)

          const updatedProperties = {
            ...properties,
            TC_THREAT_PATH: updatedThreatPath,
            TC_ALARM: threatPathData.alarmLevel,
            TC_ANIMATION: threatPathData.animation
          }

          node.data('properties', updatedProperties)
        }
      })

      threatPathData.pathEdges.forEach(edge => {
        const edgeElement = cyRef.current!.edges(`[source = "${edge.from}"][target = "${edge.to}"]`)
        if (edgeElement.length > 0) {
          const properties = edgeElement.data('properties') || {}
          const updatedThreatPath = addThreatPath(properties['TC_THREAT_PATH'] || '', threatPathData.threatPathName)

          const updatedProperties = {
            ...properties,
            TC_THREAT_PATH: updatedThreatPath,
            TC_ALARM: threatPathData.alarmLevel,
            TC_ANIMATION: threatPathData.animation
          }

          edgeElement.data('properties', updatedProperties)
        }
      })

      // Update available threat paths
      updateAvailableThreatPaths()

      // Apply TC properties to update visual styling
      setTimeout(() => {
        applyTCPropertiesToGraph()
      }, 100)

      toast({
        title: 'Threat Path Created',
        description: `Successfully created threat path "${threatPathData.threatPathName}" with ${result.data.elementsUpdated} elements`,
        status: 'success',
        duration: 5000,
        isClosable: true
      })
    } catch (error) {
      console.error('Error creating threat path:', error)
      toast({
        title: 'Error Creating Threat Path',
        description: 'Failed to create threat path. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }, [toast, updateAvailableThreatPaths, applyTCPropertiesToGraph])

  const selectAllThreatPaths = () => {
    const allSelected = availableThreatPaths.reduce((acc, path) => {
      acc[path] = true
      return acc
    }, {} as {[key: string]: boolean})
    setThreatPathFilters(allSelected)
  }

  const deselectAllThreatPaths = () => {
    const allDeselected = availableThreatPaths.reduce((acc, path) => {
      acc[path] = false
      return acc
    }, {} as {[key: string]: boolean})
    setThreatPathFilters(allDeselected)
  }

  // Update available threat paths when graph data changes
  useEffect(() => {
    if (cyRef.current && containerReady) {
      updateAvailableThreatPaths()
    }
  }, [updateAvailableThreatPaths, containerReady])

  // Apply threat path filters when they change
  useEffect(() => {
    if (cyRef.current && containerReady && availableThreatPaths.length > 0) {
      applyThreatPathFilters()
    }
  }, [threatPathFilters, threatPathFilterMode, applyThreatPathFilters, containerReady, availableThreatPaths])

  // Enhanced reset groups functionality
  const resetGroups = () => {
    if (!cyRef.current) return

    // Remove all group nodes and show all hidden nodes
    Object.keys(groups).forEach(groupId => {
      const groupNode = cyRef.current!.nodes(`[id = "${groupId}"]`)
      if (groupNode.length > 0) {
        groupNode.remove()
      }

      const groupData = groups[groupId]
      groupData.members.forEach(nodeId => {
        const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
        if (node.length > 0) {
          node.style('display', 'element')
          node.removeClass('selected')
        }
      })
    })

    // Remove all meta-edges
    cyRef.current.remove(cyRef.current.edges('[type = "META"]'))

    // Restore all original edges
    Object.values(groups).forEach(groupData => {
      if (groupData.originalEdges.length > 0) {
        try {
          console.log('Restoring original edges for reset, group:', groupData.id, 'Edges:', groupData.originalEdges.length)
          cyRef.current!.add(groupData.originalEdges)
        } catch (error) {
          console.error('Error restoring original edges during reset for group:', groupData.id, error)
        }
      }
    })

    setGroups({})
    setSelectedNodes([])
    
    // Force a re-render to update the Available Types display
    setTimeout(() => {
      runLayout(currentLayout)
    }, 50)

    toast({
      title: 'Groups Reset',
      description: 'All groups have been removed and relationships restored',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
    
    // Note: Users can now manually use Center & Fit or Reset View to reposition
  }

  // Simplified Cytoscape initialization when container and data are ready
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0 && containerReady && containerRef.current) {
      console.log('Initializing Cytoscape with ready container and data...')

      // Simple initialization with minimal retry logic
      const initializeGraph = async () => {
        try {
          // Double-check container is still available and has dimensions
          const rect = containerRef.current?.getBoundingClientRect()
          if (!containerRef.current || !rect || rect.width === 0 || rect.height === 0) {
            console.warn('Container not ready during initialization, retrying in 100ms...')
            setTimeout(initializeGraph, 100)
            return
          }

          console.log('Container verified, proceeding with Cytoscape initialization')
          const success = await initializeCytoscape(graphData.nodes, graphData.edges)

          if (!success) {
            console.warn('Cytoscape initialization failed, retrying once...')
            setTimeout(async () => {
              await initializeCytoscape(graphData.nodes, graphData.edges)
            }, 200)
          }
        } catch (error) {
          console.error('Error during Cytoscape initialization:', error)
          setError('Failed to initialize graph visualization')
          setLoading(false)
        }
      }

      // Start initialization immediately
      initializeGraph()
    }
  }, [graphData, containerReady])

  useEffect(() => {
    console.log('GraphVisualization: useEffect triggered with refreshTrigger:', refreshTrigger)
    loadGraphData()

    return () => {
      console.log('Component unmounting, cleaning up...')
      setLayoutRunning(false)
      if (cyRef.current) {
        try {
          // Clean up context menu event listener
          const cleanup = cyRef.current.data('contextMenuCleanup')
          if (cleanup && typeof cleanup === 'function') {
            cleanup()
          }

          // Stop any running operations
          cyRef.current.elements().stop()
          cyRef.current.removeAllListeners()
          cyRef.current.destroy()
        } catch (error) {
          console.warn('Error during unmount cleanup:', error)
        }
        cyRef.current = null
      }

      // Clean up animation engine
      if (animationEngineRef.current) {
        animationEngineRef.current.destroy()
        animationEngineRef.current = null
      }
    }
  }, [refreshTrigger])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      if (centerFitTimeoutRef.current) {
        clearTimeout(centerFitTimeoutRef.current)
      }
    }
  }, [])

  // Monitor controls height to adjust graph container size
  useEffect(() => {
    const updateControlsHeight = () => {
      if (controlsRef.current) {
        const height = controlsRef.current.getBoundingClientRect().height
        setControlsHeight(height + 10) // Add 10px margin
      }
    }

    // Update height on initial load and when controls change
    updateControlsHeight()
    
    // Set up ResizeObserver to monitor controls height changes
    const resizeObserver = new ResizeObserver(updateControlsHeight)
    if (controlsRef.current) {
      resizeObserver.observe(controlsRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [showControls, showGroupPanel, groups])

  useEffect(() => {
    // Only run layout if groups or layout changes (after grouping/ungrouping)
    runLayout(currentLayout)
  }, [groups, currentLayout])

  // Render loading state
  if (loading) {
    return (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="visium.500" />
          <Text color={textColor}>Loading graph data...</Text>
        </VStack>
      </Box>
    )
  }

  // Render error state
  if (error) {
    return (
      <Alert status="error" borderRadius="lg" height="100%">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Failed to load graph</Text>
          <Text fontSize="sm">{error}</Text>
        </Box>
      </Alert>
    )
  }

  return (
    <Box height="100%">
      {/* Graph Controls - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <Box ref={controlsRef} bg={controlsBg} borderBottom="1px solid" borderColor={borderColor} p={isMobile ? 2 : 3}>
        <VStack spacing={2} align="stretch">
          {/* Primary controls */}
          <HStack justify="space-between" align="center">
            <HStack spacing={isMobile ? 2 : 3}>
              <LayoutSelector
                currentLayout={currentLayout}
                onLayoutChange={changeLayout}
                size={isMobile ? "md" : "sm"}
                width={isMobile ? "250px" : "280px"}
              />

              <Tooltip label="Toggle grouping controls">
                <IconButton
                  icon={showControls ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  aria-label="Toggle controls"
                  size={isMobile ? "md" : "sm"}
                  variant="outline"
                  onClick={() => setShowControls(!showControls)}
                />
              </Tooltip>

              <Tooltip label="Group management panel">
                <IconButton
                  icon={showGroupPanel ? <ViewOffIcon /> : <ViewIcon />}
                  aria-label="Toggle group panel"
                  size={isMobile ? "md" : "sm"}
                  variant="outline"
                  onClick={() => setShowGroupPanel(!showGroupPanel)}
                  isDisabled={Object.keys(groups).length === 0}
                />
              </Tooltip>

              <Tooltip label="Apply current layout and center all nodes">
                <IconButton
                  icon={<RepeatIcon />}
                  aria-label="Center and fit graph"
                  size={isMobile ? "md" : "sm"}
                  variant="outline"
                  onClick={centerAndFitGraph}
                  isDisabled={nodeCount === 0}
                />
              </Tooltip>

              <Tooltip label="Reset view and unhide all nodes">
                <IconButton
                  icon={<SettingsIcon />}
                  aria-label="Reset view"
                  size={isMobile ? "md" : "sm"}
                  variant="outline"
                  colorScheme="orange"
                  onClick={resetView}
                  isDisabled={nodeCount === 0}
                />
              </Tooltip>

              {/* Mobile-specific quick actions */}
              {isMobile && nodeCount > 0 && (
                <IconButton
                  icon={<RepeatIcon />}
                  aria-label="Fit graph"
                  size="md"
                  variant="outline"
                  onClick={centerAndFitGraph}
                />
              )}
            </HStack>

            {selectedNodes.length > 0 && (
              <Badge 
                colorScheme="blue" 
                fontSize={isMobile ? "sm" : "xs"}
                px={isMobile ? 3 : 2}
                py={isMobile ? 1 : 0}
              >
                {selectedNodes.length} selected
              </Badge>
            )}
          </HStack>

          {/* Mobile zoom controls */}
          {isMobile && nodeCount > 0 && (
            <HStack justify="center" spacing={4}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (cyRef.current) {
                    const zoom = cyRef.current.zoom()
                    cyRef.current.zoom(Math.max(0.1, zoom - 0.2))
                  }
                }}
              >
                Zoom Out
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={centerAndFitGraph}
              >
                Fit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (cyRef.current) {
                    const zoom = cyRef.current.zoom()
                    cyRef.current.zoom(Math.min(3, zoom + 0.2))
                  }
                }}
              >
                Zoom In
              </Button>
            </HStack>
          )}

          {/* Video Controls - now available on mobile with collapsible interface */}
          <VideoControls
            isEnabled={videoSettings.isEnabled}
            onToggle={toggleVideo}
            selectedVideo={videoSettings.selectedVideo}
            onVideoChange={changeVideo}
            opacity={videoSettings.opacity}
            onOpacityChange={changeOpacity}
            isExpanded={videoSettings.controlsExpanded}
            onToggleExpanded={toggleVideoControls}
          />
        </VStack>

        <Collapse in={showControls} animateOpacity>
          <Box pt={3}>
            <Wrap spacing={isMobile ? 3 : 2}>
              <WrapItem>
                <Button 
                  size={isMobile ? "md" : "sm"}
                  colorScheme="blue" 
                  onClick={groupByNodeType}
                  isDisabled={nodeTypes.length <= 1}
                >
                  Group by Type
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size={isMobile ? "md" : "sm"}
                  colorScheme="teal" 
                  onClick={onGroupModalOpen}
                  isDisabled={selectedNodes.length < 2}
                >
                  Group Selected ({selectedNodes.length})
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size={isMobile ? "md" : "sm"}
                  colorScheme="orange" 
                  onClick={ungroupSelected}
                  isDisabled={selectedNodes.length === 0}
                >
                  Ungroup
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size={isMobile ? "md" : "sm"}
                  colorScheme="purple"
                  variant="outline"
                  onClick={onAlarmFilterOpen}
                  isDisabled={nodeCount === 0}
                >
                  Alarm Filters
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size={isMobile ? "md" : "sm"}
                  colorScheme="blue"
                  variant="outline"
                  onClick={onThreatPathDialogOpen}
                  isDisabled={nodeCount === 0}
                >
                  Create Threat Path
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size={isMobile ? "md" : "sm"}
                  colorScheme="orange"
                  variant="outline"
                  onClick={onThreatPathFilterOpen}
                  isDisabled={nodeCount === 0 || availableThreatPaths.length === 0}
                >
                  Threat Paths ({availableThreatPaths.length})
                </Button>
              </WrapItem>
              {availableThreatPaths.length > 0 && (
                <WrapItem>
                  <Button
                    size={isMobile ? "md" : "sm"}
                    colorScheme="red"
                    variant="outline"
                    onClick={clearAllThreatPaths}
                    isDisabled={nodeCount === 0}
                  >
                    Clear All Threat Paths
                  </Button>
                </WrapItem>
              )}
              <WrapItem>
                <Button
                  size={isMobile ? "md" : "sm"}
                  variant="outline"
                  onClick={resetGroups}
                  isDisabled={Object.keys(groups).length === 0}
                >
                  Reset Groups
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size={isMobile ? "md" : "sm"}
                  colorScheme="gray" 
                  variant="outline"
                  onClick={centerAndFitGraph}
                  isDisabled={nodeCount === 0}
                >
                  Apply Layout & Center
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size={isMobile ? "md" : "sm"}
                  colorScheme="orange" 
                  variant="outline"
                  onClick={resetView}
                  isDisabled={nodeCount === 0}
                >
                  Reset & Show All
                </Button>
              </WrapItem>
            </Wrap>
            
            {nodeTypes.length > 0 && (
              <Box mt={3}>
                <HStack spacing={2} mb={2} align="center">
                  <Text fontSize="xs" color={textColor}>Available Types:</Text>
                  <Badge colorScheme="green" size="xs" variant="outline">
                    Click to group/ungroup
                  </Badge>
                </HStack>
                <Wrap spacing={isMobile ? 2 : 1}>
                  {nodeTypes.map(type => {
                    // Check if this type already has a group
                    const hasExistingGroup = Object.values(groups).some(group => group.sourceType === type)
                    
                    // Count nodes of this type
                    const nodeCount = getNodeCountByType(type)
                    const canGroup = nodeCount >= 2 && !hasExistingGroup
                    
                    return (
                      <WrapItem key={type}>
                        <Tooltip 
                          label={
                            hasExistingGroup 
                              ? `Click to ungroup ${type} nodes` 
                              : nodeCount < 2 
                                ? `Need at least 2 ${type} nodes to group` 
                                : `Click to group ${nodeCount} ${type} nodes`
                          }
                          placement="top"
                          hasArrow
                        >
                          <Button
                            size={isMobile ? "sm" : "xs"}
                            variant={hasExistingGroup ? "solid" : "outline"}
                            colorScheme={hasExistingGroup ? "orange" : canGroup ? "green" : "gray"}
                            isDisabled={!canGroup && !hasExistingGroup}
                            onClick={() => groupBySpecificType(type)}
                            px={isMobile ? 3 : 2}
                            py={isMobile ? 1 : 0}
                            height={isMobile ? "auto" : "24px"}
                            fontSize={isMobile ? "sm" : "xs"}
                            cursor={canGroup || hasExistingGroup ? "pointer" : "not-allowed"}
                            _hover={canGroup || hasExistingGroup ? { 
                              transform: "scale(1.05)",
                              shadow: "md",
                              colorScheme: hasExistingGroup ? "red" : "blue"
                            } : {}}
                            _active={canGroup || hasExistingGroup ? {
                              transform: "scale(0.95)"
                            } : {}}
                            transition="all 0.2s"
                            borderWidth={canGroup || hasExistingGroup ? "2px" : "1px"}
                          >
                            {type} ({nodeCount})
                            {hasExistingGroup && " 🔄"}
                            {canGroup && !hasExistingGroup && " 👆"}
                          </Button>
                        </Tooltip>
                      </WrapItem>
                    )
                  })}
                </Wrap>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Enhanced Group Management Panel */}
        <Collapse in={showGroupPanel} animateOpacity>
          <Box mt={3} p={3} bg={hoverBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                Group Management ({Object.keys(groups).length} groups)
              </Text>
              <IconButton
                size="xs"
                icon={<ChevronUpIcon />}
                aria-label="Close panel"
                variant="ghost"
                onClick={() => setShowGroupPanel(false)}
              />
            </HStack>
            
            {Object.keys(groups).length > 0 ? (
              <Accordion allowToggle size="sm">
                {Object.entries(groups).map(([groupId, groupData]) => (
                  <AccordionItem key={groupId} border="none">
                    <AccordionButton px={2} py={1}>
                      <Box flex="1" textAlign="left">
                        <HStack spacing={2}>
                          <Badge 
                            colorScheme={groupData.type === 'auto' ? 'blue' : 'green'} 
                            size="sm"
                          >
                            {groupData.type === 'auto' ? 'Auto' : 'Manual'}
                          </Badge>
                          <Text fontSize="sm" fontWeight="medium">
                            {groupData.name}
                          </Text>
                          <Badge variant="outline" size="sm">
                            {groupData.members.length} nodes
                          </Badge>
                          {groupData.expanded && (
                            <Badge colorScheme="orange" size="sm">
                              Expanded
                            </Badge>
                          )}
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={2} px={2}>
                      <VStack spacing={2} align="stretch">
                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            colorScheme={groupData.expanded ? "orange" : "blue"}
                            leftIcon={groupData.expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            onClick={() => toggleGroupExpansion(groupId)}
                          >
                            {groupData.expanded ? 'Collapse' : 'Expand'}
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => {
                              setSelectedNodes([groupId])
                              ungroupSelected()
                            }}
                          >
                            Delete Group
                          </Button>
                        </HStack>
                        
                        <Box>
                          <Text fontSize="xs" color={textColor} mb={1}>Members:</Text>
                          <Text fontSize="xs" color={textColor}>
                            {groupData.members.join(', ')}
                          </Text>
                        </Box>
                        
                        {groupData.metaEdges.length > 0 && (
                          <Box>
                            <Text fontSize="xs" color={textColor} mb={1}>
                              External Connections: {groupData.metaEdges.length}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Text fontSize="sm" color={textColor} textAlign="center" py={2}>
                No groups created yet. Use &quot;Group by Type&quot; or select nodes and &quot;Group Selected&quot;.
              </Text>
            )}
          </Box>
        </Collapse>
      </Box>
      )}

      {/* Graph Container */}
      <Box
        ref={containerRef}
        height={isFullscreen ? "100%" : `calc(100vh - ${controlsHeight + 140}px)`} // Full height in fullscreen
        maxHeight={isFullscreen ? "100%" : `calc(100vh - ${controlsHeight + 140}px)`} // Full height in fullscreen
        minHeight="300px" // Reduced minimum height
        width="100%"
        bg={bgColor}
        position="relative"
        overflow="hidden" // Ensure content doesn't extend beyond container
        data-graph-container
      >
        {/* Background Video */}
        <BackgroundVideo
          isEnabled={videoSettings.isEnabled}
          onToggle={toggleVideo}
          selectedVideo={videoSettings.selectedVideo}
          opacity={videoSettings.opacity}
        />
        {nodeCount === 0 && edgeCount === 0 && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            color={textColor}
          >
            <Text fontSize="lg" fontWeight="medium">No Data to Display</Text>
            <Text fontSize="sm">Upload a JSON dataset to see the graph visualization</Text>
          </Box>
        )}
        {nodeCount > 0 && (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg={controlsBg}
            px={3}
            py={1}
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            fontSize="xs"
            color={textColor}
            zIndex={10}
          >
            {nodeCount} nodes, {edgeCount} edges
            {Object.keys(groups).length > 0 && (
              <Text>{Object.keys(groups).length} groups</Text>
            )}
          </Box>
        )}
      </Box>

      {/* Custom Group Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={onGroupModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Custom Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={textColor}>
                Creating a group with {selectedNodes.length} selected nodes
              </Text>
              <FormControl>
                <FormLabel>Group Name</FormLabel>
                <Input 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)} 
                  placeholder={`Custom Group (${selectedNodes.length})`}
                />
              </FormControl>
              <Box>
                <Text fontSize="xs" color={textColor} mb={2}>Selected Nodes:</Text>
                <Text fontSize="xs" color={textColor}>
                  {selectedNodes.join(', ')}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={createCustomGroup}>
              Create Group
            </Button>
            <Button variant="ghost" onClick={onGroupModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alarm Filter Modal */}
      <Modal isOpen={isAlarmFilterOpen} onClose={onAlarmFilterClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alarm Status Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Text fontSize="sm" color={textColor}>
                Show or hide nodes based on their alarm status. Only nodes with selected alarm levels will be visible.
              </Text>

              {/* Individual Alarm Level Toggles */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={3}>Alarm Levels</Text>
                <SimpleGrid columns={2} spacing={4}>
                  {Object.entries(TC_ALARM_LEVELS).map(([level, config]) => (
                    <FormControl key={level} display="flex" alignItems="center">
                      <Switch
                        id={`alarm-${level}`}
                        isChecked={alarmFilters[level]}
                        onChange={(e) => setAlarmFilters(prev => ({
                          ...prev,
                          [level]: e.target.checked
                        }))}
                        colorScheme={level === 'Alert' ? 'red' : level === 'Warning' ? 'orange' : level === 'Success' ? 'green' : level === 'Info' ? 'blue' : 'gray'}
                      />
                      <FormLabel htmlFor={`alarm-${level}`} ml={3} mb={0}>
                        <HStack>
                          <Box
                            w={3}
                            h={3}
                            borderRadius="full"
                            bg={config.color}
                            border="1px solid"
                            borderColor={config.color}
                          />
                          <Text>{config.label}</Text>
                        </HStack>
                      </FormLabel>
                    </FormControl>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Preset Filter Buttons */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={3}>Quick Presets</Text>
                <Wrap spacing={2}>
                  <WrapItem>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={showOnlyAlerts}>
                      Show Only Alerts
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button size="sm" colorScheme="orange" variant="outline" onClick={showAlertsAndWarnings}>
                      Alerts & Warnings
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button size="sm" colorScheme="gray" variant="outline" onClick={hideSuccessAndInfo}>
                      Hide Success & Info
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button size="sm" colorScheme="green" variant="outline" onClick={showAllAlarms}>
                      Show All
                    </Button>
                  </WrapItem>
                </Wrap>
              </Box>

              {/* Current Filter Status */}
              <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Current Filter Status:</Text>
                <Text fontSize="xs" color={textColor}>
                  Showing: {Object.entries(alarmFilters)
                    .filter(([_, active]) => active)
                    .map(([level, _]) => level)
                    .join(', ') || 'None'}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => {
              applyAlarmFilters()
              onAlarmFilterClose()
            }}>
              Apply Filters
            </Button>
            <Button variant="ghost" onClick={onAlarmFilterClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Threat Path Filter Modal */}
      <Modal isOpen={isThreatPathFilterOpen} onClose={onThreatPathFilterClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Threat Path Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Text fontSize="sm" color={textColor}>
                Filter graph elements based on their threat path identifiers.
                Elements can belong to multiple threat paths simultaneously.
              </Text>

              {/* Filter Mode Selection */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={3}>Filter Mode</Text>
                <HStack spacing={4}>
                  <Button
                    size="sm"
                    colorScheme={threatPathFilterMode === 'show' ? 'blue' : 'gray'}
                    variant={threatPathFilterMode === 'show' ? 'solid' : 'outline'}
                    onClick={() => setThreatPathFilterMode('show')}
                  >
                    Show Selected
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={threatPathFilterMode === 'hide' ? 'red' : 'gray'}
                    variant={threatPathFilterMode === 'hide' ? 'solid' : 'outline'}
                    onClick={() => setThreatPathFilterMode('hide')}
                  >
                    Hide Selected
                  </Button>
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {threatPathFilterMode === 'show'
                    ? 'Show only elements with selected threat paths'
                    : 'Hide elements with selected threat paths'}
                </Text>
              </Box>

              {/* Available Threat Paths */}
              {availableThreatPaths.length > 0 ? (
                <Box>
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="md" fontWeight="bold">
                      Available Threat Paths ({availableThreatPaths.length})
                    </Text>
                    <HStack spacing={2}>
                      <Button size="xs" variant="ghost" onClick={selectAllThreatPaths}>
                        Select All
                      </Button>
                      <Button size="xs" variant="ghost" onClick={deselectAllThreatPaths}>
                        Clear All
                      </Button>
                    </HStack>
                  </HStack>

                  <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                    {availableThreatPaths.map(threatPath => (
                      <FormControl key={threatPath} display="flex" alignItems="center">
                        <Checkbox
                          isChecked={threatPathFilters[threatPath] || false}
                          onChange={(e) => setThreatPathFilters(prev => ({
                            ...prev,
                            [threatPath]: e.target.checked
                          }))}
                          colorScheme="orange"
                        >
                          <Text fontSize="sm" fontFamily="mono">
                            {threatPath}
                          </Text>
                        </Checkbox>
                      </FormControl>
                    ))}
                  </VStack>
                </Box>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm">
                      No threat paths found in the current dataset.
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Create threat paths using the threat path creation tool.
                    </Text>
                  </Box>
                </Alert>
              )}

              {/* Current Filter Status */}
              <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Current Filter Status:</Text>
                <Text fontSize="xs" color={textColor}>
                  {threatPathFilterMode === 'show' ? 'Showing' : 'Hiding'}: {
                    Object.entries(threatPathFilters)
                      .filter(([_, active]) => active)
                      .map(([path, _]) => path)
                      .join(', ') || 'None'
                  }
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" mr={3} onClick={() => {
              applyThreatPathFilters()
              onThreatPathFilterClose()
            }}>
              Apply Filters
            </Button>
            <Button variant="ghost" mr={3} onClick={clearAllThreatPathFilters}>
              Clear Filters
            </Button>
            <Button variant="ghost" onClick={onThreatPathFilterClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Threat Path Creation Dialog */}
      <ThreatPathDialog
        isOpen={isThreatPathDialogOpen}
        onClose={onThreatPathDialogClose}
        onThreatPathCreated={handleThreatPathCreated}
      />

      {/* Interactive Tooltip */}
      {tooltipData && (
        <Portal>
          <Box
            position="fixed"
            top={Math.max(10, Math.min(window.innerHeight - 200, tooltipData.position.y - 10))}
            left={Math.max(10, Math.min(window.innerWidth - 300, tooltipData.position.x + 15))}
            zIndex={9999}
            pointerEvents="none"
          >
            {tooltipData.type === 'node' ? (
              <NodeTooltip node={tooltipData.data} />
            ) : (
              <EdgeTooltip edge={tooltipData.data} />
            )}
          </Box>
        </Portal>
      )}

      {/* Context Menu */}
      {contextMenu.isOpen && contextMenu.nodeId && (
        <Portal>
          {/* Invisible overlay to capture clicks outside the menu */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={99998}
            onClick={closeContextMenu}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              closeContextMenu()
            }}
          />
          <Box
            position="fixed"
            top={Math.max(10, Math.min(window.innerHeight - 100, contextMenu.position.y))}
            left={Math.max(10, Math.min(window.innerWidth - 250, contextMenu.position.x))}
            zIndex={99999}
            data-context-menu
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Menu isOpen={true} onClose={closeContextMenu}>
              <MenuList
                minW="200px"
                bg={contextMenuBg}
                border="1px solid"
                borderColor={borderColor}
                boxShadow="lg"
              >
                <MenuItem
                  icon={<RepeatIcon />}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Context menu clicked for node:', contextMenu.nodeId)
                    setNodeAsHierarchyRoot(contextMenu.nodeId!)
                  }}
                  _hover={{ bg: hoverBg }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      Set as Hierarchy Root
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Use this node as root for Multi-Level Hierarchical Tree layout
                    </Text>
                  </VStack>
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Portal>
      )}

      {/* Properties Panel */}
      <PropertiesPanel
        isOpen={propertiesPanel.isOpen}
        onClose={closePropertiesPanel}
        selectedElement={propertiesPanel.selectedElement}
        onPropertyChange={handlePropertyChange}
      />
    </Box>
  )
}

export default GraphVisualization
