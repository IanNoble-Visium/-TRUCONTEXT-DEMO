import React, { useEffect, useRef, useState } from 'react'
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
  ArrowUpIcon, ArrowDownIcon, ViewIcon, ViewOffIcon 
} from '@chakra-ui/icons'
import cytoscape, { Core, NodeSingular, Collection } from 'cytoscape'
// @ts-ignore
import { NodeTooltip, EdgeTooltip } from './GraphTooltip'
import { createRoot } from 'react-dom/client'
import { useGesture } from '@use-gesture/react'
import { motion } from 'framer-motion'

interface GraphVisualizationProps {
  refreshTrigger: number
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

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ refreshTrigger }) => {
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
  const { isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose } = useDisclosure()
  const toast = useToast()

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const controlsBg = useColorModeValue("white", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.600")

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

  // Monitor container ref availability and set ready state
  useEffect(() => {
    if (containerRef.current && !containerReady) {
      console.log('Container ref is now available:', {
        element: containerRef.current,
        rect: containerRef.current.getBoundingClientRect()
      })
      setContainerReady(true)
    }
  }, [containerReady])

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

    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }

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
        }
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
        const renderedPosition = node.renderedPosition()
        setTooltipData({
          type: 'node',
          data: node.data(),
          position: { x: renderedPosition.x, y: renderedPosition.y }
        })
      })

      cy.on('mouseout', 'node', () => {
        setTooltipData(null)
      })

      cy.on('mouseover', 'edge', (event) => {
        const edge = event.target
        const renderedMidpoint = edge.renderedMidpoint()
        setTooltipData({
          type: 'edge',
          data: edge.data(),
          position: { x: renderedMidpoint.x, y: renderedMidpoint.y }
        })
      })

      cy.on('mouseout', 'edge', () => {
        setTooltipData(null)
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

    const cy = cyRef.current
    console.log('Running layout:', currentLayout, 'on', cy.nodes().length, 'nodes')
    
    // Layout configurations optimized for different types
    const layoutConfigs: { [key: string]: any } = {
      grid: {
        name: 'grid',
        rows: Math.ceil(Math.sqrt(cy.nodes().length)),
        cols: Math.ceil(Math.sqrt(cy.nodes().length)),
        padding: 30,
        spacingFactor: 1.2,
        animate: true,
        animationDuration: 800,
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
        animationDuration: 800,
        animationEasing: 'ease-out'
      },
      circle: {
        name: 'circle',
        radius: Math.min(400, cy.container()?.clientWidth ? cy.container()!.clientWidth / 3 : 300),
        padding: 30,
        animate: true,
        animationDuration: 800,
        animationEasing: 'ease-out'
      },
      concentric: {
        name: 'concentric',
        concentric: (node: any) => node.degree(),
        levelWidth: () => 2,
        padding: 30,
        animate: true,
        animationDuration: 800,
        animationEasing: 'ease-out'
      },
      breadthfirst: {
        name: 'breadthfirst',
        directed: false,
        roots: undefined,
        padding: 30,
        spacingFactor: 1.75,
        animate: true,
        animationDuration: 800,
        animationEasing: 'ease-out'
      }
    }

    const config = layoutConfigs[currentLayout] || layoutConfigs.grid
    console.log('Using layout config:', config)
    
    // Add opacity transition during layout
    cy.nodes().animate({
      style: { opacity: 0.7 }
    }, {
      duration: 200,
      complete: () => {
        console.log('Starting layout animation')
        const layout = cy.layout(config)
        layout.run()
        
        layout.one('layoutstop', () => {
          console.log('Layout completed')
          cy.nodes().animate({
            style: { opacity: 1 }
          }, {
            duration: 200,
            complete: () => {
              console.log('Layout animation completed')
            }
          })
        })
      }
    })
  }

  // Change layout with smooth transition
  const changeLayout = (layoutName: string) => {
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
    }, 100)
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

        // Create and add meta-edges
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

    // Hide selected nodes
    selectedNodes.forEach(nodeId => {
      const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
      if (node.length > 0) {
        node.style('display', 'none')
        node.removeClass('selected')
      }
    })

    // Create and add meta-edges
    const metaEdges = createMetaEdges(groupId, selectedNodes)
    if (metaEdges.length > 0) {
      cyRef.current!.add(metaEdges)
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
          // Show all nodes in the group
          groupData.members.forEach(id => {
            const groupedNode = cyRef.current!.nodes(`[id = "${id}"]`)
            if (groupedNode.length > 0) {
              groupedNode.style('display', 'element')
            }
          })

          // Remove meta-edges
          cyRef.current!.remove(cyRef.current!.edges('[type = "META"]'))
          
          // Restore original edges
          if (groupData.originalEdges.length > 0) {
            cyRef.current!.add(groupData.originalEdges)
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
    runLayout()

    if (ungroupedCount > 0) {
      toast({
        title: 'Groups Ungrouped',
        description: `Ungrouped ${ungroupedCount} group(s) and restored original relationships`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
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
        cyRef.current!.add(groupData.originalEdges)
      }
    })

    setGroups({})
    setSelectedNodes([])
    runLayout()

    toast({
      title: 'Groups Reset',
      description: 'All groups have been removed and relationships restored',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
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
  }, [graphData, containerReady, currentLayout])

  useEffect(() => {
    loadGraphData()

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [refreshTrigger])

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
      <Box bg={controlsBg} borderBottom="1px solid" borderColor={borderColor} p={isMobile ? 2 : 3}>
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

              {/* Mobile-specific quick actions */}
              {isMobile && nodeCount > 0 && (
                <IconButton
                  icon={<SettingsIcon />}
                  aria-label="Fit graph"
                  size="md"
                  variant="outline"
                  onClick={() => {
                    if (cyRef.current) {
                      cyRef.current.fit()
                      cyRef.current.center()
                    }
                  }}
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
                onClick={() => {
                  if (cyRef.current) {
                    cyRef.current.fit()
                    cyRef.current.center()
                  }
                }}
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
            </Wrap>
            
            {nodeTypes.length > 0 && (
              <Box mt={3}>
                <Text fontSize="xs" color={textColor} mb={2}>Available Types:</Text>
                <Wrap spacing={isMobile ? 2 : 1}>
                  {nodeTypes.map(type => (
                    <WrapItem key={type}>
                      <Badge 
                        size={isMobile ? "md" : "sm"} 
                        colorScheme="gray"
                        px={isMobile ? 3 : 2}
                        py={isMobile ? 1 : 0}
                      >
                        {type}
                      </Badge>
                    </WrapItem>
                  ))}
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
        height="calc(100% - 80px)"
        minHeight="400px"
        width="100%"
        bg={bgColor}
        position="relative"
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
            top={tooltipData.position.y}
            left={tooltipData.position.x}
            transform="translate(-50%, -100%)"
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