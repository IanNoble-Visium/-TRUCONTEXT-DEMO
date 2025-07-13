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
import { motion, AnimatePresence } from 'framer-motion'
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
import {
  FiActivity,
  FiUsers,
  FiGlobe,
  FiShield,
  FiTrendingUp,
  FiDatabase,
  FiNetwork,
  FiZap,
  FiEye,
  FiLock
} from 'react-icons/fi'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

interface ExecutiveDashboardProps {
  graphData?: {
    nodes: any[]
    edges: any[]
  }
  isLoading?: boolean
}

interface DashboardMetrics {
  totalNodes: number
  totalEdges: number
  networkDensity: number
  avgConnections: number
  nodeTypes: { [key: string]: number }
  criticalNodes: number
  vulnerabilities: number
  securityScore: number
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  graphData,
  isLoading = false
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [animationStep, setAnimationStep] = useState(0)

  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const successColor = useColorModeValue('green.500', 'green.300')
  const warningColor = useColorModeValue('orange.500', 'orange.300')
  const dangerColor = useColorModeValue('red.500', 'red.300')

  // Calculate metrics from graph data
  const calculateMetrics = useMemo(() => {
    if (!graphData || !graphData.nodes || !graphData.edges) {
      return null
    }

    const nodes = graphData.nodes
    const edges = graphData.edges
    const totalNodes = nodes.length
    const totalEdges = edges.length

    // Calculate network density
    const maxPossibleEdges = totalNodes * (totalNodes - 1) / 2
    const networkDensity = maxPossibleEdges > 0 ? (totalEdges / maxPossibleEdges) * 100 : 0

    // Calculate average connections
    const avgConnections = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0

    // Analyze node types
    const nodeTypes: { [key: string]: number } = {}
    nodes.forEach(node => {
      const type = node.data?.type || node.data?.label || 'Unknown'
      nodeTypes[type] = (nodeTypes[type] || 0) + 1
    })

    // Calculate security metrics (simulated based on node types)
    const criticalNodes = nodes.filter(node => 
      node.data?.type?.toLowerCase().includes('server') ||
      node.data?.type?.toLowerCase().includes('database') ||
      node.data?.type?.toLowerCase().includes('domain')
    ).length

    const vulnerabilities = nodes.filter(node =>
      node.data?.type?.toLowerCase().includes('vulnerability') ||
      node.data?.severity === 'high' ||
      node.data?.risk === 'critical'
    ).length

    // Calculate security score (0-100)
    const securityScore = Math.max(0, 100 - (vulnerabilities / totalNodes) * 100)

    return {
      totalNodes,
      totalEdges,
      networkDensity,
      avgConnections,
      nodeTypes,
      criticalNodes,
      vulnerabilities,
      securityScore
    }
  }, [graphData])

  useEffect(() => {
    if (calculateMetrics) {
      setMetrics(calculateMetrics)
    }
  }, [calculateMetrics])

  // Progressive animation sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev < 4 ? prev + 1 : prev))
    }, 500)

    return () => clearInterval(timer)
  }, [])

  // Chart data preparation
  const nodeTypeData = useMemo(() => {
    if (!metrics) return []
    return Object.entries(metrics.nodeTypes).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: ((count / metrics.totalNodes) * 100).toFixed(1)
    }))
  }, [metrics])

  const securityTrendData = useMemo(() => {
    if (!metrics) return []
    // Simulated trend data - in real app this would come from historical data
    return [
      { time: '00:00', score: 85, threats: 12 },
      { time: '04:00', score: 82, threats: 15 },
      { time: '08:00', score: 88, threats: 8 },
      { time: '12:00', score: metrics.securityScore, threats: metrics.vulnerabilities },
      { time: '16:00', score: 91, threats: 5 },
      { time: '20:00', score: 89, threats: 7 }
    ]
  }, [metrics])

  const networkActivityData = useMemo(() => {
    if (!metrics) return []
    return [
      { category: 'Nodes', current: metrics.totalNodes, capacity: metrics.totalNodes * 1.2 },
      { category: 'Connections', current: metrics.totalEdges, capacity: metrics.totalEdges * 1.5 },
      { category: 'Critical Assets', current: metrics.criticalNodes, capacity: metrics.totalNodes * 0.3 }
    ]
  }, [metrics])

  // Color schemes for charts
  const pieColors = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20', '#319795']
  const gradientColors = {
    primary: ['#3182CE', '#63B3ED'],
    success: ['#38A169', '#68D391'],
    warning: ['#D69E2E', '#F6E05E'],
    danger: ['#E53E3E', '#FC8181']
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (isLoading || !metrics) {
    return (
      <Box p={6} bg={bgColor} minH="100vh">
        <VStack spacing={6} align="stretch">
          <Heading size="lg" color={textColor}>Executive Dashboard</Heading>
          <Text color={textColor}>Loading analytics...</Text>
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
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
            Real-time network analytics and security insights
          </Text>
        </VStack>
      </MotionBox>

      {/* Key Metrics Row */}
      <MotionBox variants={itemVariants} mb={8}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={pulseVariants}
            animate={animationStep >= 1 ? "pulse" : ""}
          >
            <CardBody>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                  <HStack>
                    <Icon as={FiDatabase} />
                    <Text>Total Nodes</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={accentColor}>
                  {metrics.totalNodes.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Network entities
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={pulseVariants}
            animate={animationStep >= 2 ? "pulse" : ""}
          >
            <CardBody>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                  <HStack>
                    <Icon as={FiNetwork} />
                    <Text>Connections</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={successColor}>
                  {metrics.totalEdges.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Active relationships
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={pulseVariants}
            animate={animationStep >= 3 ? "pulse" : ""}
          >
            <CardBody>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                  <HStack>
                    <Icon as={FiShield} />
                    <Text>Security Score</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={
                  metrics.securityScore >= 80 ? successColor :
                  metrics.securityScore >= 60 ? warningColor : dangerColor
                }>
                  {metrics.securityScore.toFixed(0)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={metrics.securityScore >= 80 ? "increase" : "decrease"} />
                  Network health
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={pulseVariants}
            animate={animationStep >= 4 ? "pulse" : ""}
          >
            <CardBody>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                  <HStack>
                    <Icon as={FiZap} />
                    <Text>Density</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" color={warningColor}>
                  {metrics.networkDensity.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Network connectivity
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>
      </MotionBox>

      {/* Charts Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={8}>
        {/* Node Types Distribution */}
        <MotionCard
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          variants={itemVariants}
        >
          <CardHeader>
            <HStack>
              <Icon as={FiUsers} color={accentColor} />
              <Heading size="md" color={textColor}>Node Types Distribution</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nodeTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {nodeTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </MotionCard>

        {/* Security Trend */}
        <MotionCard
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          variants={itemVariants}
        >
          <CardHeader>
            <HStack>
              <Icon as={FiTrendingUp} color={successColor} />
              <Heading size="md" color={textColor}>Security Trend (24h)</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={securityTrendData}>
                <defs>
                  <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={successColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={successColor} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={successColor}
                  fillOpacity={1}
                  fill="url(#securityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </MotionCard>
      </Grid>

      {/* Network Activity and Critical Assets */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Network Activity */}
        <MotionCard
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          variants={itemVariants}
        >
          <CardHeader>
            <HStack>
              <Icon as={FiActivity} color={accentColor} />
              <Heading size="md" color={textColor}>Network Activity</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={networkActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="current" fill={accentColor} />
                <Bar dataKey="capacity" fill={useColorModeValue('gray.300', 'gray.600')} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </MotionCard>

        {/* Critical Assets Summary */}
        <MotionCard
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          variants={itemVariants}
        >
          <CardHeader>
            <HStack>
              <Icon as={FiLock} color={dangerColor} />
              <Heading size="md" color={textColor}>Critical Assets</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    High-Value Targets
                  </Text>
                  <Badge colorScheme="red">{metrics.criticalNodes}</Badge>
                </HStack>
                <Progress
                  value={(metrics.criticalNodes / metrics.totalNodes) * 100}
                  colorScheme="red"
                  size="sm"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    Vulnerabilities
                  </Text>
                  <Badge colorScheme="orange">{metrics.vulnerabilities}</Badge>
                </HStack>
                <Progress
                  value={(metrics.vulnerabilities / metrics.totalNodes) * 100}
                  colorScheme="orange"
                  size="sm"
                />
              </Box>

              <Divider />

              <Box>
                <Text fontSize="sm" fontWeight="bold" color={textColor} mb={2}>
                  Risk Assessment
                </Text>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs">Network Exposure</Text>
                    <Badge colorScheme={metrics.networkDensity > 50 ? "red" : "green"} size="sm">
                      {metrics.networkDensity > 50 ? "High" : "Low"}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs">Asset Protection</Text>
                    <Badge colorScheme={metrics.securityScore > 80 ? "green" : "orange"} size="sm">
                      {metrics.securityScore > 80 ? "Strong" : "Moderate"}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </MotionCard>
      </Grid>
    </MotionBox>
  )
}

export default ExecutiveDashboard

