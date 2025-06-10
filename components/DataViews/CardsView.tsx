import React, { useState, useMemo } from 'react'
import {
  Box, SimpleGrid, Card, CardBody, CardHeader, Text, Badge, Input, Select, 
  HStack, VStack, InputGroup, InputLeftElement, useColorModeValue,
  Icon, Tooltip, Wrap, WrapItem, Flex, Spacer, Image
} from '@chakra-ui/react'
import { SearchIcon, InfoIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import NodeIcon from '../common/NodeIcon'

interface CardsViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
}

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const CardsView: React.FC<CardsViewProps> = ({ nodes, edges, selectedNodes, onNodeSelect }) => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [gridSize, setGridSize] = useState('medium')

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const cardBg = useColorModeValue("white", "gray.700")
  const selectedBg = useColorModeValue("blue.50", "blue.900")
  const hoverBg = useColorModeValue("gray.50", "gray.600")

  // Get unique node types
  const nodeTypes = useMemo(() => {
    const typeMap: { [key: string]: boolean } = {}
    nodes.forEach(node => {
      if (node.type) {
        typeMap[node.type] = true
      }
    })
    const types = Object.keys(typeMap)
    return types.sort()
  }, [nodes])

  // Get connection counts for each node
  const connectionCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    nodes.forEach(node => {
      counts[node.uid] = edges.filter(edge => 
        edge.from === node.uid || edge.to === node.uid
      ).length
    })
    return counts
  }, [nodes, edges])

  // Filter and sort nodes
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter(node => {
      const matchesSearch = !search || 
        node.showname?.toLowerCase().includes(search.toLowerCase()) ||
        node.uid?.toLowerCase().includes(search.toLowerCase()) ||
        node.type?.toLowerCase().includes(search.toLowerCase())
      
      const matchesType = typeFilter === 'all' || node.type === typeFilter
      
      return matchesSearch && matchesType
    })

    // Sort nodes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.showname || a.uid).localeCompare(b.showname || b.uid)
        case 'type':
          return (a.type || '').localeCompare(b.type || '')
        case 'connections':
          return (connectionCounts[b.uid] || 0) - (connectionCounts[a.uid] || 0)
        case 'id':
          return a.uid.localeCompare(b.uid)
        default:
          return 0
      }
    })

    return filtered
  }, [nodes, search, typeFilter, sortBy, connectionCounts])

  // Get grid columns based on size
  const getGridColumns = () => {
    switch (gridSize) {
      case 'small': return { base: 2, md: 4, lg: 6, xl: 8 }
      case 'medium': return { base: 1, md: 2, lg: 3, xl: 4 }
      case 'large': return { base: 1, md: 1, lg: 2, xl: 3 }
      default: return { base: 1, md: 2, lg: 3, xl: 4 }
    }
  }

  // Get card size styles
  const getCardSize = () => {
    switch (gridSize) {
      case 'small': return { minH: '120px', p: 2 }
      case 'medium': return { minH: '160px', p: 4 }
      case 'large': return { minH: '200px', p: 6 }
      default: return { minH: '160px', p: 4 }
    }
  }

  // Get color scheme for node type
  const getNodeColor = (nodeType: string) => {
    switch (nodeType?.toLowerCase()) {
      case 'server': return 'blue'
      case 'application': return 'green'
      case 'database': return 'purple'
      case 'user': return 'orange'
      case 'vulnerability': return 'red'
      case 'firewall': return 'red'
      case 'router': return 'teal'
      case 'switch': return 'cyan'
      case 'workstation': return 'yellow'
      default: return 'gray'
    }
  }

  // Get node icon
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType?.toLowerCase()) {
      case 'server': return '🖥️'
      case 'application': return '📱'
      case 'database': return '🗄️'
      case 'user': return '👤'
      case 'vulnerability': return '⚠️'
      case 'firewall': return '🛡️'
      case 'router': return '📡'
      case 'switch': return '🔌'
      case 'workstation': return '💻'
      default: return '⚪'
    }
  }

  // Get most important properties to display
  const getDisplayProperties = (node: any) => {
    if (!node.properties) return []
    
    const priorityKeys = ['ip', 'version', 'os', 'criticality', 'severity', 'username', 'department']
    const otherKeys = Object.keys(node.properties).filter(key => !priorityKeys.includes(key))
    const orderedKeys = [...priorityKeys.filter(key => node.properties[key]), ...otherKeys]
    
    return orderedKeys.slice(0, 3).map(key => ({
      key,
      value: node.properties[key]
    }))
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
      {/* Cards Filters */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <VStack spacing={3}>
          <HStack spacing={4} width="100%">
            <InputGroup flex="1">
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search nodes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select width="150px" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Select width="150px" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="connections">Sort by Connections</option>
              <option value="id">Sort by ID</option>
            </Select>
            <Select width="120px" value={gridSize} onChange={(e) => setGridSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </HStack>
          
          <HStack spacing={2} width="100%" justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {filteredNodes.length} nodes
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {nodeTypes.slice(0, 5).map(type => (
                <Badge key={type} colorScheme={getNodeColor(type)} variant="subtle" size="sm">
                  {type} ({nodes.filter(n => n.type === type).length})
                </Badge>
              ))}
              {nodeTypes.length > 5 && (
                <Badge colorScheme="gray" variant="subtle" size="sm">
                  +{nodeTypes.length - 5} more
                </Badge>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* Cards Grid */}
      <Box flex="1" overflow="auto" p={4}>
        <SimpleGrid columns={getGridColumns()} spacing={4}>
          {filteredNodes.map((node, index) => {
            const displayProps = getDisplayProperties(node)
            const connectionCount = connectionCounts[node.uid] || 0
            const isSelected = selectedNodes.includes(node.uid)
            
            return (
              <MotionCard
                key={node.uid}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -4,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.03,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                bg={isSelected ? selectedBg : cardBg}
                border="2px solid"
                borderColor={isSelected ? `${getNodeColor(node.type)}.400` : borderColor}
                cursor="pointer"
                onClick={() => onNodeSelect(node.uid)}
                _hover={{
                  bg: hoverBg,
                  borderColor: `${getNodeColor(node.type)}.300`
                }}
                {...getCardSize()}
              >
                <CardHeader pb={2}>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between" align="start">
                      <HStack spacing={2}>
                        <NodeIcon nodeType={node.type} size={24} />
                        <VStack spacing={0} align="start" flex="1">
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                            {node.showname || node.uid}
                          </Text>
                          <Text fontSize="xs" color="gray.500" fontFamily="mono">
                            {node.uid}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack spacing={1} align="end">
                        <Badge colorScheme={getNodeColor(node.type)} variant="solid" size="sm">
                          {node.type}
                        </Badge>
                        {connectionCount > 0 && (
                          <Tooltip label={`${connectionCount} connections`}>
                            <Badge colorScheme="blue" variant="outline" size="sm">
                              {connectionCount} 🔗
                            </Badge>
                          </Tooltip>
                        )}
                      </VStack>
                    </HStack>
                  </VStack>
                </CardHeader>

                <CardBody pt={0}>
                  <VStack spacing={2} align="stretch">
                    {/* Properties */}
                    {displayProps.length > 0 && (
                      <VStack spacing={1} align="stretch">
                        {displayProps.map(({ key, value }) => (
                          <Flex key={key} fontSize="xs">
                            <Text fontWeight="medium" color="gray.600" mr={1}>
                              {key}:
                            </Text>
                            <Text color="gray.800" noOfLines={1} flex="1">
                              {String(value)}
                            </Text>
                          </Flex>
                        ))}
                      </VStack>
                    )}
                    
                    {/* Additional info */}
                    {node.properties && Object.keys(node.properties).length > 3 && (
                      <Tooltip label={`${Object.keys(node.properties).length - 3} more properties`}>
                        <HStack spacing={1} cursor="help">
                          <Icon as={InfoIcon} boxSize="3" color="gray.400" />
                          <Text fontSize="xs" color="gray.500">
                            +{Object.keys(node.properties).length - 3} more
                          </Text>
                        </HStack>
                      </Tooltip>
                    )}

                    {/* Connection indicators */}
                    {connectionCount > 0 && gridSize === 'large' && (
                      <Box pt={2} borderTop="1px solid" borderColor={borderColor}>
                        <HStack spacing={1} justify="center">
                          <Text fontSize="xs" color="gray.500">
                            Connected to {connectionCount} node{connectionCount !== 1 ? 's' : ''}
                          </Text>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </MotionCard>
            )
          })}
        </SimpleGrid>

        {/* Empty state */}
        {filteredNodes.length === 0 && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            <VStack spacing={4}>
              <Text fontSize="4xl" opacity={0.3}>🔍</Text>
              <Text color="gray.500" textAlign="center">
                No nodes match your search criteria.
                <br />
                Try adjusting your filters.
              </Text>
            </VStack>
          </MotionBox>
        )}
      </Box>
    </MotionBox>
  )
}

export default CardsView 