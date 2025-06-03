import React, { useEffect, useRef, useState } from 'react'
import { Box, Alert, AlertIcon, Spinner, Text, VStack } from '@chakra-ui/react'
import cytoscape, { Core } from 'cytoscape'

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
                  default: return '#666666'
                }
              },
              'label': 'data(label)',
              'width': 60,
              'height': 60,
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
          name: 'grid',
          fit: true,
          padding: 50,
          avoidOverlap: true,
          rows: undefined,
          cols: undefined
        }
      })

      // Add event listeners
      cy.on('tap', 'node', function(evt) {
        const node = evt.target
        console.log('Node clicked:', node.data())
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
  }, [graphData])

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
        height="400px" 
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
      <Alert status="error" borderRadius="lg" height="400px">
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
      <Box
        ref={containerRef}
        height="100%"
        width="100%"
        bg="white"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
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
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default GraphVisualization 