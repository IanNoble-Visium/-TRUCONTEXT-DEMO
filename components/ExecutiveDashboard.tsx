import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Flex,
  Badge,
  Progress,
  Divider,
  SimpleGrid,
  Icon,
  Tooltip
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  FiActivity,
  FiUsers,
  FiGlobe,
  FiShield,
  FiDatabase,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

interface GraphData {
  nodes: any[]
  edges: any[]
}

interface ExecutiveDashboardProps {
  graphData?: GraphData
  isLoading?: boolean
  onViewChange?: (view: 'executive' | 'graph' | 'table' | 'timeline' | 'cards' | 'dashboard' | 'geomap') => void
}

interface DashboardMetrics {
  totalNodes: number
  totalEdges: number
  networkDensity: number
  securityScore: number
  criticalAssets: number
  vulnerabilities: number
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  graphData,
  isLoading = false,
  onViewChange
}) => {
  // All hooks must be called at the top level, before any early returns
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const successColor = useColorModeValue('green.500', 'green.300')
  const warningColor = useColorModeValue('orange.500', 'orange.300')
  const dangerColor = useColorModeValue('red.500', 'red.300')
  const grayTextColor = useColorModeValue('gray.600', 'gray.400')
  const mutedBg = useColorModeValue('gray.100', 'gray.700')

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [animationStep, setAnimationStep] = useState(0)

  // Calculate metrics from graph data
  const calculatedMetrics = useMemo(() => {
    if (!graphData || !graphData.nodes || !graphData.edges) {
      return {
        totalNodes: 0,
        totalEdges: 0,
        networkDensity: 0,
        securityScore: 85.5,
        criticalAssets: 0,
        vulnerabilities: 0
      }
    }

    const nodeCount = graphData.nodes.length
    const edgeCount = graphData.edges.length
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2
    const density = maxPossibleEdges > 0 ? (edgeCount / maxPossibleEdges) * 100 : 0

    // Calculate security metrics based on node types
    const criticalAssets = graphData.nodes.filter(node => 
      node.data?.type === 'server' || node.data?.type === 'database'
    ).length

    const vulnerabilities = graphData.nodes.filter(node => 
      node.data?.status === 'vulnerable' || node.data?.alert === 'high'
    ).length

    const securityScore = Math.max(0, 100 - (vulnerabilities * 5) - (criticalAssets * 2))

    return {
      totalNodes: nodeCount,
      totalEdges: edgeCount,
      networkDensity: density,
      securityScore,
      criticalAssets,
      vulnerabilities
    }
  }, [graphData])

  // Sample data for charts
  const nodeTypeData = useMemo(() => {
    if (!graphData?.nodes) return []
    
    const typeCounts: { [key: string]: number } = {}
    graphData.nodes.forEach(node => {
      const type = node.data?.type || 'unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: ((count / graphData.nodes.length) * 100).toFixed(1)
    }))
  }, [graphData])

  const securityTrendData = [
    { time: '00:00', score: 82 },
    { time: '04:00', score: 85 },
    { time: '08:00', score: 88 },
    { time: '12:00', score: 86 },
    { time: '16:00', score: 89 },
    { time: '20:00', score: 85 }
  ]

  const networkActivityData = [
    { name: 'Nodes', current: calculatedMetrics.totalNodes, capacity: 100 },
    { name: 'Critical Assets', current: calculatedMetrics.criticalAssets, capacity: 20 }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Update metrics when data changes
  useEffect(() => {
    setMetrics(calculatedMetrics)
  }, [calculatedMetrics])

  // Progressive animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(prev => prev + 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [animationStep])

  // Loading state
  if (isLoading) {
    return (
      <Box p={6} bg={bgColor} minH="100vh">
        <VStack spacing={4} align="center" justify="center" minH="50vh">
          <Heading size="lg" color={textColor}>Loading Dashboard...</Heading>
          <Progress size="lg" isIndeterminate colorScheme="blue" />
        </VStack>
      </Box>
    )
  }

  return (
    <MotionBox
      p={6}
      bg={bgColor}
      minH="100vh"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <MotionBox variants={itemVariants} mb={8}>
        <VStack align="start" spacing={2}>
          <HStack>
            <Icon as={FiActivity} boxSize={8} color={accentColor} />
            <Heading size="xl" color={textColor}>
              Executive Dashboard
            </Heading>
          </HStack>
          <Text fontSize="lg" color={grayTextColor}>
            Real-time network analytics and security insights
          </Text>
          <HStack>
            <Badge colorScheme="green">Live Data</Badge>
            <Text fontSize="sm" color={grayTextColor}>
              {new Date().toLocaleString()}
            </Text>
          </HStack>
        </VStack>
      </MotionBox>

      {/* Key Metrics Row */}
      <MotionBox variants={itemVariants} mb={8}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <MotionCard bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={grayTextColor}>
                  <HStack>
                    <Icon as={FiDatabase} />
                    <Text>Network entities</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={accentColor}>
                  {metrics?.totalNodes || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  increased by
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={grayTextColor}>
                  <HStack>
                    <Icon as={FiGlobe} />
                    <Text>Active relationships</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={successColor}>
                  {metrics?.totalEdges || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  increased by
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={grayTextColor}>
                  <HStack>
                    <Icon as={FiShield} />
                    <Text>Network health</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={successColor}>
                  {metrics?.securityScore.toFixed(1) || '0.0'}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  decreased by
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={grayTextColor}>
                  <HStack>
                    <Icon as={FiTrendingUp} />
                    <Text>Network connectivity</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={accentColor}>
                  {metrics?.networkDensity.toFixed(1) || '0.0'}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  increased by
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>
      </MotionBox>

      {/* Charts Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={8}>
        {/* Node Types Distribution */}
        <MotionBox variants={itemVariants}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textColor}>Node Types Distribution</Heading>
              <Text fontSize="sm" color={grayTextColor}>
                {nodeTypeData.length} types
              </Text>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nodeTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {nodeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Security Trend */}
        <MotionBox variants={itemVariants}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>Security Trend (24h)</Heading>
                  <HStack>
                    <Icon as={FiTrendingUp} color={successColor} />
                    <Text fontSize="sm" color={successColor}>Trending Up</Text>
                  </HStack>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={securityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[75, 100]} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00C49F"
                    fill="url(#colorGradient)"
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </MotionBox>
      </Grid>

      {/* Bottom Row */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Network Activity */}
        <MotionBox variants={itemVariants}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textColor}>Network Activity</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={networkActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="current" fill="#0088FE" name="Current" />
                  <Bar dataKey="capacity" fill="#E0E0E0" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Quick Actions */}
        <MotionBox variants={itemVariants}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md" color={textColor}>Network Topology</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="center" justify="center" minH="200px">
                <Icon as={FiGlobe} boxSize={12} color={mutedBg} />
                <Text color={grayTextColor} textAlign="center">
                  No network data available
                </Text>
                <Text fontSize="sm" color={grayTextColor} textAlign="center">
                  Load a dataset to see topology preview
                </Text>
                {onViewChange && (
                  <Box
                    as="button"
                    px={4}
                    py={2}
                    bg={accentColor}
                    color="white"
                    borderRadius="md"
                    fontSize="sm"
                    onClick={() => onViewChange('graph')}
                    _hover={{ opacity: 0.8 }}
                  >
                    View Details
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Grid>
    </MotionBox>
  )
}

export default ExecutiveDashboard

