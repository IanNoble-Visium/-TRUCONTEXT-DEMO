import React, { useState, useMemo } from 'react'
import {
  Box, VStack, HStack, Text, Badge, Input, Select, InputGroup, InputLeftElement,
  useColorModeValue, Tooltip, Icon, Flex, Spacer, Divider
} from '@chakra-ui/react'
import { SearchIcon, TimeIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

interface TimelineViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
}

interface TimelineEvent {
  id: string
  type: 'node' | 'edge'
  timestamp: Date
  title: string
  subtitle: string
  data: any
  category: string
}

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)

const TimelineView: React.FC<TimelineViewProps> = ({ nodes, edges, selectedNodes, onNodeSelect }) => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const timelineBg = useColorModeValue("gray.50", "gray.700")
  const eventBg = useColorModeValue("white", "gray.800")
  const selectedBg = useColorModeValue("blue.50", "blue.900")

  // Parse timestamp helper
  const parseTimestamp = (timestamp: any): Date | null => {
    if (!timestamp) return null
    try {
      return new Date(timestamp)
    } catch {
      return null
    }
  }

  // Convert nodes and edges to timeline events
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = []

    // Add nodes with timestamps
    nodes.forEach(node => {
      const timestamp = parseTimestamp(node.properties?.timestamp)
      if (timestamp) {
        events.push({
          id: node.uid,
          type: 'node',
          timestamp,
          title: node.showname || node.uid,
          subtitle: node.type || 'Unknown Type',
          data: node,
          category: node.type || 'unknown'
        })
      }
    })

    // Add edges with timestamps
    edges.forEach(edge => {
      const timestamp = parseTimestamp(edge.properties?.timestamp)
      if (timestamp) {
        const fromNode = nodes.find(n => n.uid === edge.from)
        const toNode = nodes.find(n => n.uid === edge.to)
        
        events.push({
          id: `${edge.from}-${edge.to}`,
          type: 'edge',
          timestamp,
          title: edge.type || 'Connection',
          subtitle: `${fromNode?.showname || edge.from} → ${toNode?.showname || edge.to}`,
          data: edge,
          category: edge.type || 'unknown'
        })
      }
    })

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [nodes, edges])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(timelineEvents.map(event => event.category))].filter(Boolean)
    return cats.sort()
  }, [timelineEvents])

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = timelineEvents

    // Search filter
    if (search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        event.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      switch (dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoff.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoff.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(event => event.timestamp >= cutoff)
      }
    }

    return filtered
  }, [timelineEvents, search, typeFilter, dateRange])

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {}
    
    filteredEvents.forEach(event => {
      const dateKey = event.timestamp.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(event)
    })
    
    return groups
  }, [filteredEvents])

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get color scheme for event type
  const getEventColor = (event: TimelineEvent) => {
    if (event.type === 'node') {
      switch (event.category.toLowerCase()) {
        case 'server': return 'blue'
        case 'application': return 'green'
        case 'database': return 'purple'
        case 'user': return 'orange'
        case 'vulnerability': return 'red'
        default: return 'gray'
      }
    } else {
      switch (event.category.toLowerCase()) {
        case 'hosts': return 'blue'
        case 'connects_to': return 'green'
        case 'has_access': return 'orange'
        case 'affects': return 'red'
        default: return 'teal'
      }
    }
  }

  // Get event icon
  const getEventIcon = (event: TimelineEvent) => {
    return event.type === 'node' ? '🔵' : '🔗'
  }

  if (timelineEvents.length === 0) {
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
          <Icon as={TimeIcon} boxSize={12} color="gray.400" />
          <Text color="gray.500" textAlign="center">
            No timestamp data available for timeline view.
            <br />
            Add timestamp properties to nodes or edges to see timeline events.
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
      {/* Timeline Filters */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <VStack spacing={3}>
          <HStack spacing={4} width="100%">
            <InputGroup flex="1">
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search timeline events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select width="150px" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="node">Nodes</option>
              <option value="edge">Edges</option>
            </Select>
            <Select width="150px" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </Select>
          </HStack>
          
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="sm" color="gray.500">
              {filteredEvents.length} events found
            </Text>
            {categories.length > 0 && (
              <>
                <Text fontSize="sm" color="gray.500">•</Text>
                <Text fontSize="sm" color="gray.500">
                  Categories: {categories.join(', ')}
                </Text>
              </>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* Timeline Container */}
      <Box flex="1" overflow="auto" p={4} bg={timelineBg}>
        <MotionVStack
          spacing={6}
          align="stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {Object.entries(groupedEvents).map(([dateKey, events], groupIndex) => (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
            >
              <VStack spacing={4} align="stretch">
                {/* Date Header */}
                <Box position="relative">
                  <Divider />
                  <Box
                    position="absolute"
                    top="-12px"
                    left="20px"
                    bg={timelineBg}
                    px={3}
                  >
                    <Badge colorScheme="purple" variant="solid">
                      {new Date(dateKey).toLocaleDateString()}
                    </Badge>
                  </Box>
                </Box>

                {/* Events for this date */}
                <VStack spacing={3} align="stretch" pl={4}>
                  {events.map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: eventIndex * 0.05 }}
                    >
                      <Box
                        position="relative"
                        bg={selectedNodes.includes(event.id) ? selectedBg : eventBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="lg"
                        p={4}
                        cursor={event.type === 'node' ? 'pointer' : 'default'}
                        onClick={event.type === 'node' ? () => onNodeSelect(event.id) : undefined}
                        _hover={{
                          transform: 'translateY(-2px)',
                          shadow: 'md',
                          borderColor: `${getEventColor(event)}.300`
                        }}
                        transition="all 0.2s"
                        borderLeft="4px solid"
                        borderLeftColor={`${getEventColor(event)}.400`}
                      >
                        {/* Timeline dot */}
                        <Box
                          position="absolute"
                          left="-23px"
                          top="20px"
                          width="6px"
                          height="6px"
                          bg={`${getEventColor(event)}.400`}
                          borderRadius="full"
                          border="2px solid"
                          borderColor={timelineBg}
                        />

                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Text fontSize="lg">{getEventIcon(event)}</Text>
                              <VStack spacing={0} align="start">
                                <Text fontWeight="bold" fontSize="md">
                                  {event.title}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {event.subtitle}
                                </Text>
                              </VStack>
                            </HStack>
                            <VStack spacing={1} align="end">
                              <Badge colorScheme={getEventColor(event)} variant="subtle">
                                {event.type}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {formatTime(event.timestamp)}
                              </Text>
                            </VStack>
                          </HStack>

                          {/* Event properties */}
                          {event.data.properties && Object.keys(event.data.properties).length > 0 && (
                            <Box pt={2} borderTop="1px solid" borderColor={borderColor}>
                              <HStack spacing={2} flexWrap="wrap">
                                {Object.entries(event.data.properties).slice(0, 3).map(([key, value]) => (
                                  <Tooltip key={key} label={`${key}: ${value}`}>
                                    <Badge size="sm" variant="outline">
                                      {key}: {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
                                    </Badge>
                                  </Tooltip>
                                ))}
                                {Object.keys(event.data.properties).length > 3 && (
                                  <Badge size="sm" variant="outline" colorScheme="gray">
                                    +{Object.keys(event.data.properties).length - 3} more
                                  </Badge>
                                )}
                              </HStack>
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    </motion.div>
                  ))}
                </VStack>
              </VStack>
            </motion.div>
          ))}
        </MotionVStack>
      </Box>
    </MotionBox>
  )
}

export default TimelineView 