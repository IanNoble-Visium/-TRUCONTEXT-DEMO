import React, { useEffect, useRef, useState } from 'react'
import { 
  Box, Alert, AlertIcon, Spinner, Text, VStack, HStack, 
  Select, Button, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter, Input, FormControl, 
  FormLabel, useToast, Collapse, IconButton, Wrap, WrapItem,
  Badge, Menu, MenuButton, MenuList, MenuItem, Divider,
  Tooltip, useDisclosure, useColorModeValue, Portal
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, SettingsIcon } from '@chakra-ui/icons'
import cytoscape, { Core, NodeSingular, Collection } from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'
import { NodeTooltip, EdgeTooltip } from './GraphTooltip'
import { createRoot } from 'react-dom/client'
import { useGesture } from '@use-gesture/react'
import { motion } from 'framer-motion'

// Register the cola layout
cytoscape.use(cola)

interface GraphVisualizationProps {
  refreshTrigger: number
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ refreshTrigger }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nodeCount, setNodeCount] = useState(0)
  const [edgeCount, setEdgeCount] = useState(0)
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [groups, setGroups] = useState<{ [key: string]: string[] }>({})
  const [currentLayout, setCurrentLayout] = useState('grid')
  const [nodeTypes, setNodeTypes] = useState<string[]>([])
  const [showControls, setShowControls] = useState(false)
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
        boxSelectionEnabled: !isMobile, // Disable on mobile for better touch
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
              'width': (ele: any) => ele.data('type') === 'Group' ? 80 : 60,
              'height': (ele: any) => ele.data('type') === 'Group' ? 80 : 60,
              'color': '#333333',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '10px',
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
            selector: 'node:hover',
            style: {
              'border-width': 3,
              'border-color': '#ff6600',
              'background-color': 'rgba(255, 102, 0, 0.1)'
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#ff6600',
              'background-color': 'rgba(255, 102, 0, 0.1)'
            }
          },
          {
            selector: 'node.grouped',
            style: {
              'opacity': 0.5
            }
          },
          {
            selector: 'node[type="Group"]',
            style: {
              'border-style': 'dashed',
              'border-width': 3,
              'background-opacity': 0.7,
              'font-size': '12px',
              'font-weight': 'bold'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#cccccc',
              'target-arrow-color': '#cccccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '8px',
              'text-rotation': 'autorotate',
              'text-margin-y': -10,
              'color': '#666666',
              'transition-property': 'line-color, target-arrow-color, width',
              'transition-duration': 200
            }
          },
          {
            selector: 'edge:hover',
            style: {
              'width': 3,
              'line-color': '#ff9900',
              'target-arrow-color': '#ff9900'
            }
          },
          {
            selector: 'edge:selected',
            style: {
              'width': 3,
              'line-color': '#ff6600',
              'target-arrow-color': '#ff6600'
            }
          }
        ],
        layout: {
          name: currentLayout
        }
      })

      // Add event listeners
      cy.on('tap', 'node', function(evt) {
        const node = evt.target as NodeSingular
        const nodeId = node.data('id')
        console.log('Node clicked:', node.data())

        if (node.data('type') === 'Group') {
          // Toggle group visibility
          const groupNodes = groups[nodeId] || []
          const areVisible = groupNodes.some(id => {
            const n = cy.nodes(`[id = "${id}"]`)
            return n.length > 0 && n.style('display') !== 'none'
          })

          groupNodes.forEach(id => {
            const n = cy.nodes(`[id = "${id}"]`)
            if (n.length > 0) {
              n.style('display', areVisible ? 'none' : 'element')
            }
          })

          runLayout()
        } else {
          // Handle node selection for grouping
          if (selectedNodes.includes(nodeId)) {
            setSelectedNodes(prev => prev.filter(id => id !== nodeId))
            node.removeClass('selected')
          } else {
            setSelectedNodes(prev => [...prev, nodeId])
            node.addClass('selected')
          }
        }
      })

      cy.on('tap', 'edge', function(evt) {
        const edge = evt.target
        console.log('Edge clicked:', edge.data())
      })

      // Tooltip event handlers
      cy.on('mouseover', 'node', function(evt) {
        const node = evt.target as NodeSingular
        const renderedPosition = node.renderedPosition()
        const containerOffset = containerRef.current?.getBoundingClientRect()
        
        if (containerOffset) {
          setTooltipData({
            type: 'node',
            data: node.data(),
            position: {
              x: containerOffset.left + renderedPosition.x,
              y: containerOffset.top + renderedPosition.y - 80 // Position above node
            }
          })
        }
      })

      cy.on('mouseout', 'node', function(evt) {
        setTimeout(() => setTooltipData(null), 150) // Small delay for smooth transition
      })

      cy.on('mouseover', 'edge', function(evt) {
        const edge = evt.target
        const renderedMidpoint = edge.renderedMidpoint()
        const containerOffset = containerRef.current?.getBoundingClientRect()
        
        if (containerOffset) {
          setTooltipData({
            type: 'edge',
            data: edge.data(),
            position: {
              x: containerOffset.left + renderedMidpoint.x,
              y: containerOffset.top + renderedMidpoint.y - 60 // Position above edge
            }
          })
        }
      })

      cy.on('mouseout', 'edge', function(evt) {
        setTimeout(() => setTooltipData(null), 150) // Small delay for smooth transition
      })

      // Hide tooltip on pan/zoom
      cy.on('pan zoom', function() {
        setTooltipData(null)
      })

      // Fit the graph after initialization
      cy.ready(() => {
        setTimeout(() => {
          cy.fit()
          cy.center()
          console.log('Cytoscape successfully initialized:', {
            nodes: cy.nodes().length,
            edges: cy.edges().length,
            container: containerRef.current?.offsetWidth + 'x' + containerRef.current?.offsetHeight
          })
        }, 100)
      })

      cyRef.current = cy
      return true
    } catch (err) {
      console.error('Cytoscape initialization error:', err)
      return false
    }
  }

  const loadGraphData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/graph')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load graph data')
      }

      console.log('Raw graph data:', data)
      
      // Process nodes and edges to ensure proper format
      const processedNodes = (data.nodes || []).map((node: any, index: number) => {
        console.log('Processing node:', node)
        return {
          data: {
            id: node.data?.id || node.data?.uid || `node-${index}`,
            label: node.data?.label || node.data?.showname || node.data?.id || 'Node',
            type: node.data?.type || 'Unknown',
            ...node.data
          }
        }
      })

      const processedEdges = (data.edges || []).map((edge: any, index: number) => {
        console.log('Processing edge:', edge)
        return {
          data: {
            id: edge.data?.id || `edge-${index}`,
            source: edge.data?.source || edge.data?.from,
            target: edge.data?.target || edge.data?.to,
            label: edge.data?.label || edge.data?.type || 'Edge',
            ...edge.data
          }
        }
      })

      console.log('Processed nodes:', processedNodes)
      console.log('Processed edges:', processedEdges)

      // Extract unique node types for dynamic grouping
      const types: string[] = []
      const typeSet = new Set<string>()
      processedNodes.forEach((node: any) => {
        if (node.data.type && node.data.type !== 'Group') {
          typeSet.add(node.data.type)
        }
      })
      types.push(...Array.from(typeSet))
      setNodeTypes(types)

      setNodeCount(processedNodes.length)
      setEdgeCount(processedEdges.length)
      setGraphData({ nodes: processedNodes, edges: processedEdges })

    } catch (err) {
      console.error('Graph loading error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const runLayout = () => {
    if (cyRef.current) {
      try {
        // Enhanced layout configuration with animations
        const layoutConfig: any = {
          name: currentLayout,
          animate: true,
          animationDuration: 800,
          animationEasing: 'ease-out-cubic',
          fit: true,
          padding: 50
        }

        // Layout-specific configurations
        switch (currentLayout) {
          case 'cola':
            Object.assign(layoutConfig, {
              infinite: false,
              ungrabifyWhileSimulating: false,
              userConstIter: 0,
              allConstIter: 1,
              ready: () => {
                setTimeout(() => cyRef.current?.fit(undefined, 50), 100)
              }
            })
            break
          
          case 'cose':
            Object.assign(layoutConfig, {
              idealEdgeLength: 100,
              nodeOverlap: 20,
              refresh: 20,
              randomize: false,
              componentSpacing: 100,
              nodeRepulsion: 400000,
              edgeElasticity: 100,
              nestingFactor: 5,
              gravity: 80,
              numIter: 1000,
              initialTemp: 200,
              coolingFactor: 0.95,
              minTemp: 1.0
            })
            break
          
          case 'concentric':
            Object.assign(layoutConfig, {
              startAngle: 3 / 2 * Math.PI,
              clockwise: true,
              equidistant: false,
              minNodeSpacing: 10,
              avoidOverlap: true,
              concentric: (node: any) => node.degree(),
              levelWidth: () => 1
            })
            break
          
          case 'circle':
            Object.assign(layoutConfig, {
              avoidOverlap: true,
              startAngle: 3 / 2 * Math.PI,
              clockwise: true,
              animationDuration: 600
            })
            break
          
          case 'grid':
            Object.assign(layoutConfig, {
              avoidOverlap: true,
              avoidOverlapPadding: 10,
              condense: false,
              animationDuration: 500
            })
            break
        }

        const layout = cyRef.current.layout(layoutConfig)
        layout.run()

        // Enhanced completion handling
        layout.on('layoutstop', () => {
          setTimeout(() => {
            cyRef.current?.fit(undefined, 50)
          }, 100)
        })

      } catch (err) {
        console.error('Layout error:', err)
        toast({
          title: 'Layout Error',
          description: 'Failed to apply layout',
          status: 'error',
          duration: 3000,
          isClosable: true
        })
      }
    }
  }

  const changeLayout = (layoutName: string) => {
    if (layoutName === currentLayout) return // Avoid unnecessary changes
    
    setCurrentLayout(layoutName)
    
    if (cyRef.current) {
      // Add smooth transition effect
      cyRef.current.nodes().animate({
        style: { opacity: 0.7 }
      }, {
        duration: 150,
        complete: () => {
          runLayout()
          // Fade back in with slight delay
          setTimeout(() => {
            cyRef.current?.nodes().animate({
              style: { opacity: 1 }
            }, {
              duration: 250
            })
          }, 200)
        }
      })

      // Show visual feedback
      toast({
        title: 'Layout Changed',
        description: `Switching to ${layoutName} layout`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      })
    }
  }

  const groupByNodeType = () => {
    if (!cyRef.current || !graphData) return

    const typeGroups: { [key: string]: string[] } = {}
    
    // Collect nodes by type
    cyRef.current.nodes().forEach(node => {
      const type = node.data('type')
      if (type !== 'Group') {
        if (!typeGroups[type]) typeGroups[type] = []
        typeGroups[type].push(node.data('id'))
      }
    })

    // Create group nodes
    const newGroups = { ...groups }
    Object.keys(typeGroups).forEach(type => {
      const groupId = `group-${type}-${Date.now()}`
      const nodeIds = typeGroups[type]
      
      if (nodeIds.length > 1) {
        // Add group node
        cyRef.current!.add({
          group: 'nodes',
          data: { 
            id: groupId, 
            label: `${type} (${nodeIds.length})`, 
            type: 'Group' 
          }
        })

        // Hide grouped nodes
        nodeIds.forEach(nodeId => {
          const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
          if (node.length > 0) {
            node.style('display', 'none')
          }
        })

        newGroups[groupId] = nodeIds
      }
    })

    setGroups(newGroups)
    runLayout()

    toast({
      title: 'Grouped by Type',
      description: `Created ${Object.keys(typeGroups).length} type-based groups`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const createCustomGroup = () => {
    if (!cyRef.current || selectedNodes.length < 2) return

    const groupId = `group-custom-${Date.now()}`
    
    // Add group node
    cyRef.current.add({
      group: 'nodes',
      data: { 
        id: groupId, 
        label: groupName || `Custom Group (${selectedNodes.length})`, 
        type: 'Group' 
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

    setGroups(prev => ({ ...prev, [groupId]: selectedNodes }))
    setSelectedNodes([])
    setGroupName('')
    onGroupModalClose()
    
    runLayout()

    toast({
      title: 'Custom Group Created',
      description: `Created "${groupName || 'Custom Group'}" with ${selectedNodes.length} nodes`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const ungroupSelected = () => {
    if (!cyRef.current || selectedNodes.length === 0) return

    let ungroupedCount = 0
    
    selectedNodes.forEach(nodeId => {
      const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
      if (node.length > 0 && node.data('type') === 'Group') {
        const nodesInGroup = groups[nodeId] || []
        
        // Show all nodes in the group
        nodesInGroup.forEach(id => {
          const groupedNode = cyRef.current!.nodes(`[id = "${id}"]`)
          if (groupedNode.length > 0) {
            groupedNode.style('display', 'element')
          }
        })

        // Remove the group node
        node.remove()
        
        // Update groups state
        setGroups(prev => {
          const newGroups = { ...prev }
          delete newGroups[nodeId]
          return newGroups
        })
        
        ungroupedCount++
      }
    })

    setSelectedNodes([])
    runLayout()

    if (ungroupedCount > 0) {
      toast({
        title: 'Groups Ungrouped',
        description: `Ungrouped ${ungroupedCount} group(s)`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    }
  }

  const resetGroups = () => {
    if (!cyRef.current) return

    // Remove all group nodes and show all hidden nodes
    Object.keys(groups).forEach(groupId => {
      const groupNode = cyRef.current!.nodes(`[id = "${groupId}"]`)
      if (groupNode.length > 0) {
        groupNode.remove()
      }

      groups[groupId].forEach(nodeId => {
        const node = cyRef.current!.nodes(`[id = "${nodeId}"]`)
        if (node.length > 0) {
          node.style('display', 'element')
          node.removeClass('selected')
        }
      })
    })

    setGroups({})
    setSelectedNodes([])
    runLayout()

    toast({
      title: 'Groups Reset',
      description: 'All groups have been removed',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  // Separate effect for initializing Cytoscape when container is ready
  useEffect(() => {
    if (graphData && graphData.nodes.length > 0) {
      console.log('Attempting to initialize Cytoscape...')
      
      // Try immediately
      let success = initializeCytoscape(graphData.nodes, graphData.edges)
      
      // If failed, try again after a short delay
      if (!success) {
        const timeout = setTimeout(() => {
          console.log('Retrying Cytoscape initialization...')
          initializeCytoscape(graphData.nodes, graphData.edges)
        }, 100)
        
        return () => clearTimeout(timeout)
      }
    }
  }, [graphData, currentLayout])

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
                <option value="cola">Cola Layout</option>
                <option value="circle">Circle Layout</option>
                <option value="concentric">Concentric</option>
                <option value="cose">Cose Layout</option>
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
      </Box>

      {/* Graph Container */}
      <Box
        ref={containerRef}
        height="calc(100% - 80px)"
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