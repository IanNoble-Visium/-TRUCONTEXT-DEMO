import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Input, Select, InputGroup, InputLeftElement,
  useColorModeValue, Tooltip, Icon, Flex, Spacer, Alert, AlertIcon
} from '@chakra-ui/react'
import { SearchIcon, ViewIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import the entire Map component to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

interface GeoMapViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
}

interface GeoNode {
  id: string
  uid: string
  showname: string
  type: string
  latitude: number
  longitude: number
  color: string
  properties: any
  isSelected: boolean
}

const MotionBox = motion(Box)

const GeoMapView: React.FC<GeoMapViewProps> = ({ nodes, edges, selectedNodes, onNodeSelect }) => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Debug logging
  useEffect(() => {
    console.log('GeoMapView received nodes:', nodes)
    console.log('Sample node structure:', nodes[0])
    if (nodes.length > 0) {
      const sampleNode = nodes[0]
      console.log('Sample node latitude:', sampleNode.latitude, sampleNode.properties?.latitude)
      console.log('Sample node longitude:', sampleNode.longitude, sampleNode.properties?.longitude)
    }
  }, [nodes])

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  // Process nodes with valid coordinates
  const geoNodes = useMemo((): GeoNode[] => {
    const validNodes: GeoNode[] = []

    console.log('Processing nodes for geo coordinates:', nodes.length)

    nodes.forEach((node, index) => {
      // Check for coordinates in multiple possible locations
      const lat = node.latitude || node.properties?.latitude
      const lng = node.longitude || node.properties?.longitude

      console.log(`Node ${index} (${node.uid}):`, {
        directLat: node.latitude,
        directLng: node.longitude,
        propsLat: node.properties?.latitude,
        propsLng: node.properties?.longitude,
        finalLat: lat,
        finalLng: lng
      })

      if (lat !== undefined && lng !== undefined &&
          !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        console.log(`✓ Valid coordinates found for node ${node.uid}:`, lat, lng, `Type: ${node.type}`, `Color: ${node.color}`)
        validNodes.push({
          id: node.uid,
          uid: node.uid,
          showname: node.showname || node.uid,
          type: node.type || 'Unknown',
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          color: node.color || node.properties?.color || '#666666',
          properties: node.properties || {},
          isSelected: selectedNodes.includes(node.uid)
        })
      } else {
        console.log(`✗ Invalid coordinates for node ${node.uid}:`, { lat, lng })
      }
    })

    console.log(`Found ${validNodes.length} nodes with valid coordinates`)
    console.log('Node types found:', [...new Set(validNodes.map(n => n.type))])
    console.log('Node colors found:', [...new Set(validNodes.map(n => n.color))])
    return validNodes
  }, [nodes, selectedNodes])

  // Process edges for geographic display
  const geoEdges = useMemo(() => {
    if (!edges || edges.length === 0) {
      console.log('No edges available for geo map')
      return []
    }

    console.log('Processing edges for geo map:', edges.length)
    const validNodeIds = new Set(geoNodes.map(node => node.uid))
    console.log('Valid node IDs for edges:', Array.from(validNodeIds))

    const validEdges = edges.filter(edge => {
      const fromValid = validNodeIds.has(edge.from) || validNodeIds.has(edge.source)
      const toValid = validNodeIds.has(edge.to) || validNodeIds.has(edge.target)
      return fromValid && toValid
    }).map(edge => ({
      from: edge.from || edge.source,
      to: edge.to || edge.target,
      type: edge.type || edge.label || 'connection',
      properties: edge.properties || {}
    }))

    console.log(`Found ${validEdges.length} valid edges for geo map`)
    return validEdges
  }, [edges, geoNodes])

  // Get unique node types for filtering
  const nodeTypes = useMemo(() => {
    const types = new Set(geoNodes.map(node => node.type))
    return Array.from(types).sort()
  }, [geoNodes])

  // Filter nodes based on search and type
  const filteredNodes = useMemo(() => {
    let filtered = geoNodes

    // Search filter
    if (search) {
      filtered = filtered.filter(node =>
        node.showname.toLowerCase().includes(search.toLowerCase()) ||
        node.type.toLowerCase().includes(search.toLowerCase()) ||
        node.uid.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(node => node.type === typeFilter)
    }

    return filtered
  }, [geoNodes, search, typeFilter])



  // Handle marker click
  const handleMarkerClick = (nodeId: string) => {
    onNodeSelect(nodeId)
  }



  if (geoNodes.length === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <Icon as={ViewIcon} boxSize={12} color="gray.400" />
          <Text color="gray.500" textAlign="center">
            No geographic data available for map view.
            <br />
            Add latitude and longitude properties to nodes to see them on the map.
          </Text>
        </VStack>
      </MotionBox>
    )
  }



  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      height="100%"
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Map Filters */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <VStack spacing={3}>
          <HStack spacing={4} width="100%">
            <InputGroup flex="1">
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search nodes on map..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select width="200px" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </HStack>
          
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="sm" color="gray.500">
              {filteredNodes.length} of {geoNodes.length} nodes shown
            </Text>
            {selectedNodes.length > 0 && (
              <>
                <Text fontSize="sm" color="gray.500">•</Text>
                <Text fontSize="sm" color="gray.500">
                  {selectedNodes.length} selected
                </Text>
              </>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* Map Container */}
      <Box flex="1" position="relative">
        <LeafletMap
          geoNodes={filteredNodes}
          geoEdges={geoEdges}
          onNodeSelect={handleMarkerClick}
          height="100%"
        />
      </Box>
    </MotionBox>
  )
}

export default GeoMapView
