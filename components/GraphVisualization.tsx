import React, { useEffect, useRef, useState, useCallback } from 'react'
import { 
  Box, Alert, AlertIcon, Spinner, Text, VStack, HStack, 
  Select, Button, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter, Input, FormControl, 
  FormLabel, useToast, Collapse, IconButton, Wrap, WrapItem,
  Badge, Menu, MenuButton, MenuList, MenuItem, Divider,
  Tooltip, useDisclosure, useColorModeValue, Portal, List,
  ListItem, UnorderedList, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react'
import { 
  ChevronDownIcon, ChevronUpIcon, SettingsIcon, 
  ArrowUpIcon, ArrowDownIcon, ViewIcon, ViewOffIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import cytoscape, { Core, NodeSingular, Collection } from 'cytoscape'
// @ts-ignore
import { NodeTooltip, EdgeTooltip } from './GraphTooltip'
import { createRoot } from 'react-dom/client'
import { useGesture } from '@use-gesture/react'
import { motion } from 'framer-motion'

interface GraphVisualizationProps {
  refreshTrigger: number
  onDataLoad?: (data: { nodes: any[], edges: any[] }) => void
  onSelectedNodesChange?: (nodes: string[]) => void
  externalSelectedNodes?: string[]
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
  externalSelectedNodes 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
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
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)
  const [layoutRunning, setLayoutRunning] = useState(false)
  const { isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose } = useDisclosure()
  const toast = useToast()
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const centerFitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [controlsHeight, setControlsHeight] = useState(80)

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const controlsBg = useColorModeValue("white", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.600")

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

  // Sync external selected nodes
  useEffect(() => {
    if (externalSelectedNodes && JSON.stringify(externalSelectedNodes) !== JSON.stringify(selectedNodes)) {
      setSelectedNodes(externalSelectedNodes)
    }
  }, [externalSelectedNodes])

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectedNodesChange) {
      onSelectedNodesChange(selectedNodes)
    }
  }, [selectedNodes])

  // Periodically check for container availability after loading completes
  useEffect(() => {
    if (!loading && !error && !containerReady) {
      const checkContainer = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          console.log('Checking container periodically:', { rect })
          if (rect.width > 0 && rect.height > 0) {
            setContainerReady(true)
          }
        }
      }
      
      // Check immediately and then periodically
      checkContainer()
      const interval = setInterval(checkContainer, 100)
      
      // Clean up after 2 seconds if container still not ready
      const timeout = setTimeout(() => {
        clearInterval(interval)
        if (!containerReady) {
          console.warn('Container check timeout - forcing ready state')
          setContainerReady(true)
        }
      }, 2000)
      
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [loading, error, containerReady])

  // Monitor container ref availability and set ready state (only check once initially)
  useEffect(() => {
    if (containerRef.current && !containerReady) {
      console.log('Container ref is now available:', {
        element: containerRef.current,
        rect: containerRef.current.getBoundingClientRect()
      })
      setContainerReady(true)
    }
  }, []) // Run only once on mount

  // Helper function to get node icon path with fallback (now using SVG)
  const getNodeIconPath = (nodeType: string) => {
    if (!nodeType) return '/icons-svg/unknown.svg'
    
    // Convert type to lowercase for filename matching
    const filename = nodeType.toLowerCase()
    
    // List of available icons (now SVG format)
    const availableIcons = [
      'server', 'application', 'database', 'user', 'threatactor', 
      'firewall', 'router', 'switch', 'workstation', 'client', 'entity'
    ]
    
    if (availableIcons.includes(filename)) {
      return `/icons-svg/${filename}.svg`
    }
    
    // Fallback to unknown.svg for any missing icons
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
      const edgeTypes = Array.from(connection.types).join(', ')
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
          connectionTypes: Array.from(connection.types),
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
    memberIds.forEach(memberId => {
      const connectedEdges = cyRef.current!.edges(`[source = "${memberId}"], [target = "${memberId}"]`)
      connectedEdges.forEach(edge => {
        originalEdges.push({
          group: 'edges',
          data: edge.data()
        })
      })
    })

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
    setTimeout(() => runLayout(), 100)
    
    // Note: Users can now manually use Center & Fit or Reset View to reposition
  }

  const initializeCytoscape = (processedNodes: any[], processedEdges: any[]) => {
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
                const type = ele.data('type')
                return getNodeIconPath(type)
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
          name: currentLayout,
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
        }
      })

      // Clear selection on background tap
      cy.on('tap', (event) => {
        if (event.target === cy) {
          cy.nodes().unselect()
          setSelectedNodes([])
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

      cyRef.current = cy
      console.log('Cytoscape instance created successfully:', cy)
      console.log('Graph elements count:', cy.elements().length)
      console.log('Nodes count:', cy.nodes().length)
      console.log('Edges count:', cy.edges().length)
      
      setLoading(false)
      
      // Run initial layout
      setTimeout(() => {
        console.log('Starting layout with:', currentLayout)
        runLayout()
        setNodeCount(cy.nodes().length)
        setEdgeCount(cy.edges().length)
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
    try {
      setLoading(true)
      setError(null)
      setContainerReady(false) // Reset container ready state

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
        // Transform cytoscape format to simple format for other views
        const simpleNodes = data.nodes.map((node: any) => ({
          uid: node.data.id,
          type: node.data.type,
          showname: node.data.label,
          properties: node.data.properties || {},
          icon: node.data.icon
        }))
        const simpleEdges = data.edges.map((edge: any) => ({
          from: edge.data.source,
          to: edge.data.target,
          type: edge.data.type,
          properties: edge.data.properties || {}
        }))
        onDataLoad({ nodes: simpleNodes, edges: simpleEdges })
      }
      
      // Extract unique node types
      const types = Array.from(new Set(data.nodes.map((node: any) => node.data.type).filter(Boolean))) as string[]
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

  // Enhanced layout with smooth transitions
  const runLayout = () => {
    if (!cyRef.current) {
      console.log('No cytoscape instance available for layout')
      return
    }

    if (layoutRunning) {
      console.log('Layout already running, skipping...')
      return
    }

    const cy = cyRef.current
    console.log('Running layout:', currentLayout, 'on', cy.nodes().length, 'nodes')
    
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
      circle: {
        name: 'circle',
        radius: Math.min(400, cy.container()?.clientWidth ? cy.container()!.clientWidth / 3 : 300),
        padding: 30,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      concentric: {
        name: 'concentric',
        concentric: (node: any) => node.degree(),
        levelWidth: () => 2,
        padding: 30,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      },
      breadthfirst: {
        name: 'breadthfirst',
        directed: false,
        roots: undefined,
        padding: 30,
        spacingFactor: 1.75,
        animate: true,
        animationDuration: 500,
        animationEasing: 'ease-out'
      }
    }

    const config = layoutConfigs[currentLayout] || layoutConfigs.grid
    console.log('Using layout config:', config)
    
    // Simplified layout without nested animations to prevent infinite loops
    console.log('Starting layout with group preservation')
    
    try {
      // Run layout only on visible nodes (preserves groups)
      const layout = visibleNodes.layout(config)
      
      // Use one-time event listeners to avoid multiple callbacks and cleanup properly
      layout.one('layoutstop', () => {
        console.log('Layout completed, restoring group state')
        
        try {
          // Ensure group visibility state is maintained after layout
          Object.entries(groups).forEach(([groupId, groupData]) => {
            if (!groupData.expanded) {
              // Ensure grouped nodes remain hidden
              groupData.members.forEach(nodeId => {
                const node = cy.nodes(`[id = "${nodeId}"]`)
                if (node.length > 0 && node.style('display') !== 'none') {
                  node.style('display', 'none')
                }
              })
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
        console.error('Layout error:', error)
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
    if (layoutRunning) {
      console.log('Layout currently running, deferring layout change...')
      setTimeout(() => changeLayout(layoutName), 100)
      return
    }

    setCurrentLayout(layoutName)
    
    setTimeout(() => {
      runLayout()
      
      toast({
        title: 'Layout Changed',
        description: `Switched to ${layoutName} layout`,
        status: 'info',
        duration: 2000,
        isClosable: true
      })
      
      // Note: Users can now manually use Center & Fit or Reset View to apply layout and reposition
    }, 100)
  }

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
        const layoutConfig = {
          name: currentLayout,
          fit: true,
          padding: 50,
          animate: false, // No animation for immediate positioning
          stop: () => {
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
              
              toast({
                title: 'Graph Centered',
                description: `Applied ${currentLayout} layout and fitted ${cyRef.current.nodes().length} nodes (zoom: ${finalZoom.toFixed(2)}x)`,
                status: 'success',
                duration: 2000,
                isClosable: true
              })
            }, 100)
          }
        }
        
        // Run the layout
        cyRef.current.layout(layoutConfig).run()
        
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
      const layoutConfig = {
        name: currentLayout,
        fit: true,
        padding: 100,
        animate: false,
        stop: () => {
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
            
            toast({
              title: 'View Reset Complete',
              description: `Applied ${currentLayout} layout and reset view for ${cyRef.current.nodes().length} nodes`,
              status: 'info',
              duration: 2000,
              isClosable: true
            })
          }, 100)
        }
      }
      
      cyRef.current.layout(layoutConfig).run()
      
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
        nodeIds.forEach(nodeId => {
          const connectedEdges = cyRef.current!.edges(`[source = "${nodeId}"], [target = "${nodeId}"]`)
          if (connectedEdges.length > 0) {
            console.log('Removing', connectedEdges.length, 'original edges connected to node:', nodeId)
            cyRef.current!.remove(connectedEdges)
          }
        })
        
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
    runLayout()

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
    if (!cyRef.current || !graphData) return

    // Check if a group for this type already exists
    const existingGroupEntry = Object.entries(groups).find(([, group]) => group.sourceType === targetType)
    
    if (existingGroupEntry) {
      // Ungroup the existing group
      const [groupId, groupData] = existingGroupEntry
      
      // Show all nodes in the group
      groupData.members.forEach(nodeId => {
        const groupedNode = cyRef.current!.nodes(`[id = "${nodeId}"]`)
        if (groupedNode.length > 0) {
          groupedNode.style('display', 'element')
        }
      })

      // Remove meta-edges for this group
      cyRef.current.remove(cyRef.current.edges(`[source = "${groupId}"], [target = "${groupId}"]`))
      
      // Restore original edges for this group
      if (groupData.originalEdges.length > 0) {
        try {
          console.log('Restoring original edges for type group:', targetType, 'Edges:', groupData.originalEdges.length)
          
          // Filter out any edges that might already exist to prevent duplicates
          const existingEdgeIds = new Set(cyRef.current.edges().map(edge => edge.id()))
          const edgesToRestore = groupData.originalEdges.filter(edge => !existingEdgeIds.has(edge.data.id))
          
          if (edgesToRestore.length > 0) {
            cyRef.current.add(edgesToRestore)
            console.log('Successfully restored', edgesToRestore.length, 'original edges for type group')
          } else {
            console.log('All original edges already exist for type group, no restoration needed')
          }
        } catch (error) {
          console.error('Error restoring original edges for type group:', targetType, error)
        }
      }

      // Remove the group node
      const groupNode = cyRef.current.nodes(`[id = "${groupId}"]`)
      if (groupNode.length > 0) {
        groupNode.remove()
      }

      // Update groups state
      setGroups(prev => {
        const newGroups = { ...prev }
        delete newGroups[groupId]
        return newGroups
      })

      runLayout()

      toast({
        title: 'Group Removed',
        description: `Ungrouped ${groupData.members.length} "${targetType}" nodes`,
        status: 'info',
        duration: 3000,
        isClosable: true
      })
      
      // Note: Users can now manually use Center & Fit or Reset View to reposition
      
      return
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

    runLayout()

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
    selectedNodes.forEach(nodeId => {
      const connectedEdges = cyRef.current!.edges(`[source = "${nodeId}"], [target = "${nodeId}"]`)
      if (connectedEdges.length > 0) {
        console.log('Removing', connectedEdges.length, 'original edges connected to custom node:', nodeId)
        cyRef.current!.remove(connectedEdges)
      }
    })
    
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
    
    runLayout()

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
          
          // Show all nodes in the group
          groupData.members.forEach(id => {
            const groupedNode = cyRef.current!.nodes(`[id = "${id}"]`)
            if (groupedNode.length > 0) {
              groupedNode.style('display', 'element')
            }
          })

          // Remove ONLY meta-edges for this specific group
          const groupMetaEdges = cyRef.current!.edges(`[source = "${nodeId}"], [target = "${nodeId}"]`)
          console.log('Removing meta-edges for group:', nodeId, 'Count:', groupMetaEdges.length)
          cyRef.current!.remove(groupMetaEdges)
          
          // Restore original edges for this specific group
          if (groupData.originalEdges.length > 0) {
            try {
              console.log('Restoring original edges for group:', nodeId, 'Edges:', groupData.originalEdges.length)
              
              // Filter out any edges that might already exist to prevent duplicates
              const existingEdgeIds = new Set(cyRef.current!.edges().map(edge => edge.id()))
              const edgesToRestore = groupData.originalEdges.filter(edge => !existingEdgeIds.has(edge.data.id))
              
              if (edgesToRestore.length > 0) {
                cyRef.current!.add(edgesToRestore)
                console.log('Successfully restored', edgesToRestore.length, 'original edges')
              } else {
                console.log('All original edges already exist, no restoration needed')
              }
            } catch (error) {
              console.error('Error restoring original edges for group:', nodeId, error)
            }
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

    setSelectedNodes([])
    
    // Force a re-render to update the Available Types display
    setTimeout(() => {
      runLayout()
    }, 50)

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
      runLayout()
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

  // Separate effect for initializing Cytoscape when container is ready
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0 && containerReady) {
      console.log('Attempting to initialize Cytoscape...')
      
      // Add a longer delay and more robust checking
      const initializeWithRetry = (attempt = 1, maxAttempts = 5) => {
        if (!containerRef.current) {
          console.log(`Container ref not available (attempt ${attempt}/${maxAttempts})`)
          if (attempt < maxAttempts) {
            setTimeout(() => initializeWithRetry(attempt + 1, maxAttempts), 200 * attempt)
          } else {
            console.error('Failed to initialize after maximum attempts')
            setError('Failed to initialize graph container')
            setLoading(false)
          }
          return
        }

        const containerRect = containerRef.current.getBoundingClientRect()
        if (containerRect.width === 0 || containerRect.height === 0) {
          console.log(`Container has no dimensions (attempt ${attempt}/${maxAttempts})`)
          if (attempt < maxAttempts) {
            setTimeout(() => initializeWithRetry(attempt + 1, maxAttempts), 200 * attempt)
          } else {
            console.error('Container never got dimensions')
            setError('Container failed to get proper dimensions')
            setLoading(false)
          }
          return
        }

        // Container is ready, initialize Cytoscape
        const success = initializeCytoscape(graphData.nodes, graphData.edges)
        if (!success && attempt < maxAttempts) {
          setTimeout(() => initializeWithRetry(attempt + 1, maxAttempts), 200 * attempt)
        }
      }

      // Start the initialization with retry logic
      setTimeout(() => initializeWithRetry(), 100)
    }
  }, [graphData, containerReady])

  useEffect(() => {
    loadGraphData()

    return () => {
      console.log('Component unmounting, cleaning up...')
      setLayoutRunning(false)
      if (cyRef.current) {
        try {
          // Stop any running operations
          cyRef.current.elements().stop()
          cyRef.current.removeAllListeners()
          cyRef.current.destroy()
        } catch (error) {
          console.warn('Error during unmount cleanup:', error)
        }
        cyRef.current = null
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

  if (loading) {
    return (
      <Box 
        height="100%" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="white"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="visium.500" />
          <Text color="gray.600">Loading graph data...</Text>
        </VStack>
      </Box>
    )
  }

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
      {/* Graph Controls */}
      <Box ref={controlsRef} bg={controlsBg} borderBottom="1px solid" borderColor={borderColor} p={isMobile ? 2 : 3}>
        <VStack spacing={2} align="stretch">
          {/* Primary controls */}
          <HStack justify="space-between" align="center">
            <HStack spacing={isMobile ? 2 : 3}>
              <Select 
                size={isMobile ? "md" : "sm"}
                width={isMobile ? "160px" : "140px"}
                value={currentLayout}
                onChange={(e) => changeLayout(e.target.value)}
              >
                <option value="grid">Grid Layout</option>
                <option value="cose">Cose Layout</option>
                <option value="circle">Circle Layout</option>
                <option value="concentric">Concentric</option>
                <option value="breadthfirst">Breadth-First</option>
              </Select>

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
                No groups created yet. Use "Group by Type" or select nodes and "Group Selected".
              </Text>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Graph Container */}
      <Box
        ref={containerRef}
        height={`calc(100vh - ${controlsHeight + 140}px)`} // More conservative calculation
        maxHeight={`calc(100vh - ${controlsHeight + 140}px)`} // Enforce maximum height
        minHeight="300px" // Reduced minimum height
        width="100%"
        bg={bgColor}
        position="relative"
        overflow="hidden" // Ensure content doesn't extend beyond container
      >
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
    </Box>
  )
}

export default GraphVisualization 