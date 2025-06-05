import React, { useMemo } from 'react'
import {
  Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  VStack, HStack, Text, Badge, Progress, useColorModeValue, Divider,
  Card, CardBody, CardHeader, Wrap, WrapItem, Tooltip, Icon, Flex, Spacer
} from '@chakra-ui/react'
import { InfoIcon, WarningIcon, CheckCircleIcon, TimeIcon } from '@chakra-ui/icons'
import { motion, useSpring, useTransform } from 'framer-motion'

interface DashboardViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
}

const MotionBox = motion(Box)
const MotionCard = motion(Card)
const MotionText = motion(Text)

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1 }) => {
  const spring = useSpring(0)
  const display = useTransform(spring, current => Math.round(current))
  
  React.useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <MotionText>{display}</MotionText>
}

const DashboardView: React.FC<DashboardViewProps> = ({ nodes, edges, selectedNodes }) => {
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const cardBg = useColorModeValue("white", "gray.700")
  const statBg = useColorModeValue("gray.50", "gray.700")

  // Calculate statistics
  const stats = useMemo(() => {
    // Basic counts
    const totalNodes = nodes.length
    const totalEdges = edges.length
    const selectedCount = selectedNodes.length

    // Node type distribution
    const nodeTypes = nodes.reduce((acc, node) => {
      const type = node.type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Edge type distribution
    const edgeTypes = edges.reduce((acc, edge) => {
      const type = edge.type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Connection analysis
    const connectionCounts = nodes.map(node => {
      return edges.filter(edge => edge.from === node.uid || edge.to === node.uid).length
    })
    
    const avgConnections = connectionCounts.length > 0 
      ? connectionCounts.reduce((a, b) => a + b, 0) / connectionCounts.length 
      : 0

    const maxConnections = connectionCounts.length > 0 ? Math.max(...connectionCounts) : 0
    const isolatedNodes = connectionCounts.filter(count => count === 0).length

    // Most connected nodes
    const mostConnected = nodes
      .map(node => ({
        ...node,
        connections: edges.filter(edge => edge.from === node.uid || edge.to === node.uid).length
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 5)

    // Risk analysis (based on vulnerability nodes and critical properties)
    const vulnerabilityNodes = nodes.filter(node => 
      node.type?.toLowerCase().includes('vulnerability') ||
      node.properties?.severity === 'Critical' ||
      node.properties?.criticality === 'High'
    )

    // Timeline analysis
    const nodesWithTimestamps = nodes.filter(node => node.properties?.timestamp)
    const edgesWithTimestamps = edges.filter(edge => edge.properties?.timestamp)

    // Property analysis
    const allProperties = nodes.reduce((acc, node) => {
      if (node.properties) {
        Object.keys(node.properties).forEach(key => {
          acc.add(key)
        })
      }
      return acc
    }, new Set<string>())

    return {
      totalNodes,
      totalEdges,
      selectedCount,
      nodeTypes,
      edgeTypes,
      avgConnections,
      maxConnections,
      isolatedNodes,
      mostConnected,
      vulnerabilityNodes,
      nodesWithTimestamps: nodesWithTimestamps.length,
      edgesWithTimestamps: edgesWithTimestamps.length,
      totalProperties: allProperties.size
    }
  }, [nodes, edges, selectedNodes])

  // Get color for node type
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'server': return 'blue'
      case 'application': return 'green'
      case 'database': return 'purple'
      case 'user': return 'orange'
      case 'vulnerability': return 'red'
      case 'firewall': return 'red'
      default: return 'gray'
    }
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
      overflow="auto"
      p={6}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Dataset Overview
          </Text>
          <Text color="gray.500">
            Statistical analysis and key metrics for your network data
          </Text>
        </Box>

        {/* Key Statistics Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <Stat>
                <StatLabel>Total Nodes</StatLabel>
                <StatNumber color="blue.500">
                  <AnimatedCounter value={stats.totalNodes} />
                </StatNumber>
                <StatHelpText>
                  {stats.selectedCount > 0 && `${stats.selectedCount} selected`}
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <Stat>
                <StatLabel>Total Edges</StatLabel>
                <StatNumber color="green.500">
                  <AnimatedCounter value={stats.totalEdges} />
                </StatNumber>
                <StatHelpText>
                  {stats.avgConnections.toFixed(1)} avg per node
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <Stat>
                <StatLabel>Node Types</StatLabel>
                <StatNumber color="purple.500">
                  <AnimatedCounter value={Object.keys(stats.nodeTypes).length} />
                </StatNumber>
                <StatHelpText>
                  {Object.keys(stats.edgeTypes).length} edge types
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <Stat>
                <StatLabel>Risk Items</StatLabel>
                <StatNumber color={stats.vulnerabilityNodes.length > 0 ? "red.500" : "green.500"}>
                  <AnimatedCounter value={stats.vulnerabilityNodes.length} />
                </StatNumber>
                <StatHelpText>
                  {stats.vulnerabilityNodes.length > 0 ? (
                    <HStack>
                      <WarningIcon color="red.500" boxSize="3" />
                      <Text>Needs attention</Text>
                    </HStack>
                  ) : (
                    <HStack>
                      <CheckCircleIcon color="green.500" boxSize="3" />
                      <Text>All clear</Text>
                    </HStack>
                  )}
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Node Type Distribution */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">Node Type Distribution</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              {Object.entries(stats.nodeTypes)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([type, count], index) => {
                  const numCount = count as number
                  const percentage = (numCount / stats.totalNodes) * 100
                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <HStack justify="space-between" mb={1}>
                        <HStack>
                          <Badge colorScheme={getTypeColor(type)} variant="subtle">
                            {type}
                          </Badge>
                          <Text fontSize="sm" color="gray.500">
                            {numCount} nodes
                          </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                      <Progress
                        value={percentage}
                        colorScheme={getTypeColor(type)}
                        size="sm"
                        borderRadius="full"
                      />
                    </motion.div>
                  )
                })}
            </VStack>
          </CardBody>
        </MotionCard>

        {/* Connection Analysis & Most Connected Nodes */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Connection Analysis */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">Connection Analysis</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box bg={statBg} p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.500" mb={1}>Max Connections</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.500">
                      {stats.maxConnections}
                    </Text>
                  </Box>
                  <Box bg={statBg} p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.500" mb={1}>Isolated Nodes</Text>
                    <Text fontSize="xl" fontWeight="bold" color={stats.isolatedNodes > 0 ? "orange.500" : "green.500"}>
                      {stats.isolatedNodes}
                    </Text>
                  </Box>
                </SimpleGrid>
                
                <Box>
                  <Text fontSize="sm" mb={2} color="gray.600">Average Connections per Node</Text>
                  <HStack>
                    <Progress
                      value={(stats.avgConnections / (stats.maxConnections || 1)) * 100}
                      colorScheme="teal"
                      size="lg"
                      flex="1"
                      borderRadius="full"
                    />
                    <Text fontSize="sm" fontWeight="medium">
                      {stats.avgConnections.toFixed(1)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </MotionCard>

          {/* Most Connected Nodes */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">Most Connected Nodes</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={3} align="stretch">
                {stats.mostConnected.map((node, index) => (
                  <motion.div
                    key={node.uid}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <HStack justify="space-between" p={2} bg={statBg} borderRadius="md">
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="medium">
                          {node.showname || node.uid}
                        </Text>
                        <HStack>
                          <Badge colorScheme={getTypeColor(node.type)} size="sm">
                            {node.type}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {node.uid}
                          </Text>
                        </HStack>
                      </VStack>
                      <Badge colorScheme="blue" variant="solid">
                        {node.connections} connections
                      </Badge>
                    </HStack>
                  </motion.div>
                ))}
              </VStack>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Data Quality & Timeline Info */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <VStack spacing={2}>
                <Icon as={TimeIcon} boxSize={6} color="purple.500" />
                <Text fontWeight="bold">Timeline Data</Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {stats.nodesWithTimestamps} nodes and {stats.edgesWithTimestamps} edges have timestamps
                </Text>
              </VStack>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <VStack spacing={2}>
                <Icon as={InfoIcon} boxSize={6} color="blue.500" />
                <Text fontWeight="bold">Property Coverage</Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {stats.totalProperties} unique properties across all nodes
                </Text>
              </VStack>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <VStack spacing={2}>
                <Icon 
                  as={stats.vulnerabilityNodes.length > 0 ? WarningIcon : CheckCircleIcon} 
                  boxSize={6} 
                  color={stats.vulnerabilityNodes.length > 0 ? "red.500" : "green.500"} 
                />
                <Text fontWeight="bold">Security Status</Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {stats.vulnerabilityNodes.length === 0 
                    ? "No vulnerabilities detected" 
                    : `${stats.vulnerabilityNodes.length} security items found`}
                </Text>
              </VStack>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Edge Type Distribution */}
        {Object.keys(stats.edgeTypes).length > 0 && (
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">Edge Type Distribution</Text>
            </CardHeader>
            <CardBody pt={0}>
              <Wrap spacing={2}>
                {Object.entries(stats.edgeTypes)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([type, count]) => {
                    const numCount = count as number
                    return (
                                          <WrapItem key={type}>
                        <Tooltip label={`${numCount} connections of type ${type}`}>
                          <Badge 
                            colorScheme="teal" 
                            variant="subtle" 
                            fontSize="sm"
                            p={2}
                            borderRadius="md"
                          >
                            {type}: {numCount}
                          </Badge>
                        </Tooltip>
                      </WrapItem>
                    )
                  })}
              </Wrap>
            </CardBody>
          </MotionCard>
        )}
      </VStack>
    </MotionBox>
  )
}

export default DashboardView 