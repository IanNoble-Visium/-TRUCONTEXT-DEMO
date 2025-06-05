import React, { useState, useMemo } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Input, Select, HStack, VStack,
  Badge, Text, IconButton, Tooltip, Tabs, TabList, TabPanels, Tab, TabPanel,
  useColorModeValue, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, InputGroup, InputLeftElement, Flex, Spacer
} from '@chakra-ui/react'
import { SearchIcon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

interface TableViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
}

type SortDirection = 'asc' | 'desc' | null
type SortField = string | null

const MotionBox = motion(Box)
const MotionTr = motion(Tr)

const TableView: React.FC<TableViewProps> = ({ nodes, edges, selectedNodes, onNodeSelect }) => {
  // Sorting and filtering state
  const [nodeSearch, setNodeSearch] = useState('')
  const [edgeSearch, setEdgeSearch] = useState('')
  const [nodeSort, setNodeSort] = useState<{ field: SortField; direction: SortDirection }>({ field: null, direction: null })
  const [edgeSort, setEdgeSort] = useState<{ field: SortField; direction: SortDirection }>({ field: null, direction: null })
  const [nodeTypeFilter, setNodeTypeFilter] = useState('all')
  const [edgeTypeFilter, setEdgeTypeFilter] = useState('all')

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const selectedBg = useColorModeValue("blue.50", "blue.900")

  // Get unique node and edge types
  const nodeTypes = useMemo(() => {
    const typeSet = new Set(nodes.map(node => node.type))
    const types = Array.from(typeSet).filter(Boolean)
    return types.sort()
  }, [nodes])

  const edgeTypes = useMemo(() => {
    const typeSet = new Set(edges.map(edge => edge.type))
    const types = Array.from(typeSet).filter(Boolean)
    return types.sort()
  }, [edges])

  // Filtered and sorted nodes
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter(node => {
      const matchesSearch = !nodeSearch || 
        node.showname?.toLowerCase().includes(nodeSearch.toLowerCase()) ||
        node.uid?.toLowerCase().includes(nodeSearch.toLowerCase()) ||
        node.type?.toLowerCase().includes(nodeSearch.toLowerCase())
      
      const matchesType = nodeTypeFilter === 'all' || node.type === nodeTypeFilter
      
      return matchesSearch && matchesType
    })

    if (nodeSort.field && nodeSort.direction) {
      filtered.sort((a, b) => {
        let aVal = getNestedValue(a, nodeSort.field!)
        let bVal = getNestedValue(b, nodeSort.field!)
        
        // Handle different data types
        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()
        
        if (aVal < bVal) return nodeSort.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return nodeSort.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [nodes, nodeSearch, nodeTypeFilter, nodeSort])

  // Filtered and sorted edges
  const filteredEdges = useMemo(() => {
    let filtered = edges.filter(edge => {
      const fromNode = nodes.find(n => n.uid === edge.from)
      const toNode = nodes.find(n => n.uid === edge.to)
      
      const matchesSearch = !edgeSearch || 
        edge.type?.toLowerCase().includes(edgeSearch.toLowerCase()) ||
        fromNode?.showname?.toLowerCase().includes(edgeSearch.toLowerCase()) ||
        toNode?.showname?.toLowerCase().includes(edgeSearch.toLowerCase())
      
      const matchesType = edgeTypeFilter === 'all' || edge.type === edgeTypeFilter
      
      return matchesSearch && matchesType
    })

    if (edgeSort.field && edgeSort.direction) {
      filtered.sort((a, b) => {
        let aVal = getNestedValue(a, edgeSort.field!)
        let bVal = getNestedValue(b, edgeSort.field!)
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()
        
        if (aVal < bVal) return edgeSort.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return edgeSort.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [edges, nodes, edgeSearch, edgeTypeFilter, edgeSort])

  // Helper function to get nested object values
  const getNestedValue = (obj: any, path: string) => {
    if (path.startsWith('properties.')) {
      const propKey = path.replace('properties.', '')
      return obj.properties?.[propKey] || ''
    }
    return obj[path] || ''
  }

  // Sort handler
  const handleSort = (field: string, isNode: boolean) => {
    if (isNode) {
      setNodeSort(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }))
    } else {
      setEdgeSort(prev => ({
        field,
        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
      }))
    }
  }

  // Get sort icon
  const getSortIcon = (field: string, isNode: boolean) => {
    const currentSort = isNode ? nodeSort : edgeSort
    if (currentSort.field !== field) return null
    return currentSort.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />
  }

  // Render property value with proper formatting
  const renderPropertyValue = (value: any) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string' && value.length > 50) {
      return (
        <Tooltip label={value} placement="top">
          <Text cursor="help">{value.substring(0, 50)}...</Text>
        </Tooltip>
      )
    }
    return String(value)
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
    >
      <Tabs height="100%" display="flex" flexDirection="column">
        <TabList bg={headerBg} px={4}>
          <Tab>Nodes ({filteredNodes.length})</Tab>
          <Tab>Edges ({filteredEdges.length})</Tab>
        </TabList>

        <TabPanels flex="1" overflow="hidden">
          {/* Nodes Tab */}
          <TabPanel p={0} height="100%" display="flex" flexDirection="column">
            {/* Nodes Filters */}
            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
              <HStack spacing={4}>
                <InputGroup flex="1">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search nodes..."
                    value={nodeSearch}
                    onChange={(e) => setNodeSearch(e.target.value)}
                  />
                </InputGroup>
                <Select width="200px" value={nodeTypeFilter} onChange={(e) => setNodeTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {nodeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </HStack>
            </Box>

            {/* Nodes Table */}
            <Box flex="1" overflow="auto">
              <Table size="sm">
                <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                  <Tr>
                    <Th cursor="pointer" onClick={() => handleSort('uid', true)}>
                      <HStack>
                        <Text>ID</Text>
                        {getSortIcon('uid', true)}
                      </HStack>
                    </Th>
                    <Th cursor="pointer" onClick={() => handleSort('showname', true)}>
                      <HStack>
                        <Text>Name</Text>
                        {getSortIcon('showname', true)}
                      </HStack>
                    </Th>
                    <Th cursor="pointer" onClick={() => handleSort('type', true)}>
                      <HStack>
                        <Text>Type</Text>
                        {getSortIcon('type', true)}
                      </HStack>
                    </Th>
                    <Th>Properties</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredNodes.map((node, index) => (
                    <MotionTr
                      key={node.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      bg={selectedNodes.includes(node.uid) ? selectedBg : 'transparent'}
                      _hover={{ bg: hoverBg }}
                      cursor="pointer"
                      onClick={() => onNodeSelect(node.uid)}
                    >
                      <Td fontFamily="mono" fontSize="sm">{node.uid}</Td>
                      <Td fontWeight="medium">{node.showname || 'N/A'}</Td>
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {node.type}
                        </Badge>
                      </Td>
                      <Td>
                        {node.properties && Object.keys(node.properties).length > 0 ? (
                          <Accordion allowToggle size="sm">
                            <AccordionItem border="none">
                              <AccordionButton p={1}>
                                <Text fontSize="xs" color="blue.500">
                                  {Object.keys(node.properties).length} properties
                                </Text>
                                <Spacer />
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel p={2}>
                                <VStack align="stretch" spacing={1}>
                                  {Object.entries(node.properties).map(([key, value]) => (
                                    <Flex key={key} fontSize="xs">
                                      <Text fontWeight="bold" mr={2}>{key}:</Text>
                                      <Text>{renderPropertyValue(value)}</Text>
                                    </Flex>
                                  ))}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Text fontSize="xs" color="gray.500">No properties</Text>
                        )}
                      </Td>
                    </MotionTr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* Edges Tab */}
          <TabPanel p={0} height="100%" display="flex" flexDirection="column">
            {/* Edges Filters */}
            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
              <HStack spacing={4}>
                <InputGroup flex="1">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search edges..."
                    value={edgeSearch}
                    onChange={(e) => setEdgeSearch(e.target.value)}
                  />
                </InputGroup>
                <Select width="200px" value={edgeTypeFilter} onChange={(e) => setEdgeTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {edgeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </HStack>
            </Box>

            {/* Edges Table */}
            <Box flex="1" overflow="auto">
              <Table size="sm">
                <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                  <Tr>
                    <Th cursor="pointer" onClick={() => handleSort('from', false)}>
                      <HStack>
                        <Text>From</Text>
                        {getSortIcon('from', false)}
                      </HStack>
                    </Th>
                    <Th cursor="pointer" onClick={() => handleSort('to', false)}>
                      <HStack>
                        <Text>To</Text>
                        {getSortIcon('to', false)}
                      </HStack>
                    </Th>
                    <Th cursor="pointer" onClick={() => handleSort('type', false)}>
                      <HStack>
                        <Text>Type</Text>
                        {getSortIcon('type', false)}
                      </HStack>
                    </Th>
                    <Th>Properties</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredEdges.map((edge, index) => {
                    const fromNode = nodes.find(n => n.uid === edge.from)
                    const toNode = nodes.find(n => n.uid === edge.to)
                    
                    return (
                      <MotionTr
                        key={`edge-${index}-${edge.from}-${edge.to}-${edge.type || 'unknown'}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        _hover={{ bg: hoverBg }}
                      >
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontFamily="mono">{edge.from}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {fromNode?.showname || 'Unknown'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" fontFamily="mono">{edge.to}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {toNode?.showname || 'Unknown'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="green" variant="subtle">
                            {edge.type}
                          </Badge>
                        </Td>
                        <Td>
                          {edge.properties && Object.keys(edge.properties).length > 0 ? (
                            <Accordion allowToggle size="sm">
                              <AccordionItem border="none">
                                <AccordionButton p={1}>
                                  <Text fontSize="xs" color="green.500">
                                    {Object.keys(edge.properties).length} properties
                                  </Text>
                                  <Spacer />
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel p={2}>
                                  <VStack align="stretch" spacing={1}>
                                    {Object.entries(edge.properties).map(([key, value]) => (
                                      <Flex key={key} fontSize="xs">
                                        <Text fontWeight="bold" mr={2}>{key}:</Text>
                                        <Text>{renderPropertyValue(value)}</Text>
                                      </Flex>
                                    ))}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          ) : (
                            <Text fontSize="xs" color="gray.500">No properties</Text>
                          )}
                        </Td>
                      </MotionTr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MotionBox>
  )
}

export default TableView 