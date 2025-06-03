import React, { useEffect, useRef, useState } from 'react'
import { 
  Box, Alert, AlertIcon, Spinner, Text, VStack, HStack, 
  Select, Button, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter, Input, FormControl, 
  FormLabel, useToast, Collapse, IconButton, Wrap, WrapItem,
  Badge, Menu, MenuButton, MenuList, MenuItem, Divider,
  Tooltip, useDisclosure
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, SettingsIcon } from '@chakra-ui/icons'
import cytoscape, { Core, NodeSingular, Collection } from 'cytoscape'
// @ts-ignore
import cola from 'cytoscape-cola'

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
  const { isOpen: isGroupModalOpen, onOpen: onGroupModalOpen, onClose: onGroupModalClose } = useDisclosure()
  const toast = useToast()

  // Helper function to get node icon path with fallback
  const getNodeIconPath = (nodeType: string) => {
    if (!nodeType) return '/icons/unknown.png'
    
    // Convert type to lowercase for filename matching
    const filename = nodeType.toLowerCase()
    
    // List of available icons (only includes icons that actually exist in public/icons)
    const availableIcons = [
      'server', 'application', 'database', 'user', 'threatactor', 
      'firewall', 'router', 'switch', 'workstation', 'client', 'entity'
    ]
    
    if (availableIcons.includes(filename)) {
      return `/icons/${filename}.png`
    }
    
    // Fallback to unknown.png for any missing icons (like 'vulnerability')
    return '/icons/unknown.png'
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
              'text-background-color': 'rgba(255, 255, 255, 0.8)',
              'text-background-opacity': 1,
              'text-background-padding': '2px',
              'text-border-width': 1,
              'text-border-color': '#cccccc',
              'text-border-opacity': 0.8
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
              'color': '#666666'
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
      const types = Array.from(new Set(processedNodes.map((node: any) => node.data.type as string)))
        .filter((type: string) => type !== 'Group') as string[]
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
        const layout = cyRef.current.layout({ name: currentLayout })
        layout.run()
        // Use cy.fit() separately after layout
        setTimeout(() => {
          cyRef.current?.fit()
        }, 100)
      } catch (err) {
        console.error('Layout error:', err)
      }
    }
  }

  const changeLayout = (layoutName: string) => {
    setCurrentLayout(layoutName)
    if (cyRef.current) {
      try {
        const layout = cyRef.current.layout({ name: layoutName })
        layout.run()
        setTimeout(() => {
          cyRef.current?.fit()
        }, 100)
      } catch (err) {
        console.error('Layout error:', err)
      }
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
    cyRef.current.layout({ name: currentLayout, avoidOverlap: true }).run()

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
    
    cyRef.current.layout({ name: currentLayout, avoidOverlap: true }).run()

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
    cyRef.current.layout({ name: currentLayout, avoidOverlap: true }).run()

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
    cyRef.current.layout({ name: currentLayout, avoidOverlap: true }).run()

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
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" p={3}>
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Select 
              size="sm" 
              width="140px" 
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
                size="sm"
                variant="outline"
                onClick={() => setShowControls(!showControls)}
              />
            </Tooltip>
          </HStack>

          {selectedNodes.length > 0 && (
            <Badge colorScheme="blue" fontSize="xs">
              {selectedNodes.length} selected
            </Badge>
          )}
        </HStack>

        <Collapse in={showControls} animateOpacity>
          <Box pt={3}>
            <Wrap spacing={2}>
              <WrapItem>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  onClick={groupByNodeType}
                  isDisabled={nodeTypes.length <= 1}
                >
                  Group by Type
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size="sm" 
                  colorScheme="teal" 
                  onClick={onGroupModalOpen}
                  isDisabled={selectedNodes.length < 2}
                >
                  Group Selected ({selectedNodes.length})
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size="sm" 
                  colorScheme="orange" 
                  onClick={ungroupSelected}
                  isDisabled={selectedNodes.length === 0}
                >
                  Ungroup
                </Button>
              </WrapItem>
              <WrapItem>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={resetGroups}
                  isDisabled={Object.keys(groups).length === 0}
                >
                  Reset Groups
                </Button>
              </WrapItem>
            </Wrap>
            
            {nodeTypes.length > 0 && (
              <Box mt={2}>
                <Text fontSize="xs" color="gray.600" mb={1}>Available Types:</Text>
                <Wrap spacing={1}>
                  {nodeTypes.map(type => (
                    <WrapItem key={type}>
                      <Badge size="sm" colorScheme="gray">{type}</Badge>
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
        bg="white"
        position="relative"
      >
        {nodeCount === 0 && edgeCount === 0 && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
            color="gray.500"
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
            bg="white"
            px={3}
            py={1}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            fontSize="xs"
            color="gray.600"
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
              <Text fontSize="sm" color="gray.600">
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
    </Box>
  )
}

export default GraphVisualization 