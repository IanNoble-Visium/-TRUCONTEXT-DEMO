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
  Tooltip,
  Button,
  useBreakpointValue
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
  FiLock,
  FiMaximize2
} from 'react-icons/fi'
import NetworkTopologyPreview from './NetworkTopologyPreview'
import ThreatMonitor from './ThreatMonitor'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

interface ExecutiveDashboardProps {
  graphData?: {
    nodes: any[]
    edges: any[]
  }
  isLoading?: boolean
  onViewChange?: (view: string) => void
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
  isLoading = false,
  onViewChange
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Responsive grid columns
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4 })
  const chartGridColumns = useBreakpointValue({ base: 1, lg: 2 })

  // Color scheme with enhanced gradients
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const successColor = useColorModeValue('green.500', 'green.300')
  const warningColor = useColorModeValue('orange.500', 'orange.300')
  const dangerColor = useColorModeValue('red.500', 'red.300')

  // Enhanced background with animated gradient
  const backgroundGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  )

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

  // Progressive animation sequence with enhanced timing
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev < 6 ? prev + 1 : prev))
    }, 400)

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
    // Enhanced trend data with more realistic patterns
    return [
      { time: '00:00', score: 85, threats: 12, activity: 45 },
      { time: '04:00', score: 82, threats: 15, activity: 32 },
      { time: '08:00', score: 88, threats: 8, activity: 78 },
      { time: '12:00', score: metrics.securityScore, threats: metrics.vulnerabilities, activity: 95 },
      { time: '16:00', score: 91, threats: 5, activity: 88 },
      { time: '20:00', score: 89, threats: 7, activity: 65 }
    ]
  }, [metrics])

  const networkActivityData = useMemo(() => {
    if (!metrics) return []
    return [
      { category: 'Nodes', current: metrics.totalNodes, capacity: metrics.totalNodes * 1.2, utilization: 83 },
      { category: 'Connections', current: metrics.totalEdges, capacity: metrics.totalEdges * 1.5, utilization: 67 },
      { category: 'Critical Assets', current: metrics.criticalNodes, capacity: metrics.totalNodes * 0.3, utilization: 45 }
    ]
  }, [metrics])

  // Enhanced color schemes for charts
  const pieColors = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20', '#319795', '#E53E3E']
  const gradientColors = {
    primary: ['#3182CE', '#63B3ED'],
    success: ['#38A169', '#68D391'],
    warning: ['#D69E2E', '#F6E05E'],
    danger: ['#E53E3E', '#FC8181']
  }

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        duration: 0.4
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      boxShadow: [
        '0 0 0 0 rgba(49, 130, 206, 0)',
        '0 0 0 10px rgba(49, 130, 206, 0.1)',
        '0 0 0 0 rgba(49, 130, 206, 0)'
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const floatingVariants = {
    float: {
      y: [-2, 2, -2],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (isLoading || !metrics) {
    return (
      <MotionBox 
        p={6} 
        bgGradient={backgroundGradient} 
        minH="100vh"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={6} align="stretch">
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Heading size="lg" color={textColor} textAlign="center">
              Executive Dashboard
            </Heading>
          </MotionBox>
          <MotionBox
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Text color={textColor} textAlign="center">
              Analyzing network data and generating insights...
            </Text>
            <Progress 
              size="lg" 
              isIndeterminate 
              colorScheme="blue" 
              mt={4}
              borderRadius="full"
            />
          </MotionBox>
        </VStack>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      p={6}
      bgGradient={backgroundGradient}
      minH="100vh"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      position="relative"
      overflow="hidden"
    >
      {/* Animated background elements */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={0} opacity={0.1}>
        <MotionBox
          position="absolute"
          top="10%"
          right="10%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg={accentColor}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <MotionBox
          position="absolute"
          bottom="20%"
          left="15%"
          w="150px"
          h="150px"
          borderRadius="full"
          bg={successColor}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </Box>

      {/* Content with higher z-index */}
      <Box position="relative" zIndex={1}>
        {/* Enhanced Header Section */}
        <MotionBox variants={itemVariants} mb={8}>
          <VStack align="start" spacing={3}>
            <HStack spacing={4}>
              <MotionBox
                animate={animationStep >= 1 ? floatingVariants.float : {}}
              >
                <Icon as={FiActivity} boxSize={10} color={accentColor} />
              </MotionBox>
              <VStack align="start" spacing={1}>
                <Heading size="2xl" color={textColor} fontWeight="bold">
                  Executive Dashboard
                </Heading>
                <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                  Real-time network analytics and security insights
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={4}>
              <Badge colorScheme="green" variant="solid" px={3} py={1}>
                Live Data
              </Badge>
              <Badge colorScheme="blue" variant="outline" px={3} py={1}>
                {new Date().toLocaleString()}
              </Badge>
            </HStack>
          </VStack>
        </MotionBox>

        {/* Enhanced Key Metrics Row */}
        <MotionBox variants={itemVariants} mb={8}>
          <SimpleGrid columns={gridColumns} spacing={6}>
            <MotionCard
              bg={cardBg}
              borderColor={borderColor}
              borderWidth="1px"
              variants={pulseVariants}
              animate={animationStep >= 1 ? "pulse" : ""}
              onHoverStart={() => setHoveredCard('nodes')}
              onHoverEnd={() => setHoveredCard(null)}
              cursor="pointer"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl'
              }}
              transition="all 0.3s ease"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    <HStack>
                      <Icon as={FiDatabase} />
                      <Text>Total Nodes</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl" color={accentColor} fontWeight="bold">
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
              onHoverStart={() => setHoveredCard('connections')}
              onHoverEnd={() => setHoveredCard(null)}
              cursor="pointer"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl'
              }}
              transition="all 0.3s ease"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    <HStack>
                      <Icon as={FiNetwork} />
                      <Text>Connections</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl" color={successColor} fontWeight="bold">
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
              onHoverStart={() => setHoveredCard('security')}
              onHoverEnd={() => setHoveredCard(null)}
              cursor="pointer"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl'
              }}
              transition="all 0.3s ease"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    <HStack>
                      <Icon as={FiShield} />
                      <Text>Security Score</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl" color={
                    metrics.securityScore >= 80 ? successColor :
                    metrics.securityScore >= 60 ? warningColor : dangerColor
                  } fontWeight="bold">
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
              onHoverStart={() => setHoveredCard('density')}
              onHoverEnd={() => setHoveredCard(null)}
              cursor="pointer"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'xl'
              }}
              transition="all 0.3s ease"
            >
              <CardBody>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    <HStack>
                      <Icon as={FiZap} />
                      <Text>Density</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl" color={warningColor} fontWeight="bold">
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

        {/* Enhanced Charts Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={8}>
          {/* Node Types Distribution */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={itemVariants}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            transition="all 0.3s ease"
          >
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiUsers} color={accentColor} />
                  <Heading size="md" color={textColor}>Node Types Distribution</Heading>
                </HStack>
                <Badge colorScheme="blue" variant="subtle">
                  {nodeTypeData.length} types
                </Badge>
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
                    animationBegin={0}
                    animationDuration={1000}
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
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            transition="all 0.3s ease"
          >
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiTrendingUp} color={successColor} />
                  <Heading size="md" color={textColor}>Security Trend (24h)</Heading>
                </HStack>
                <Badge colorScheme="green" variant="subtle">
                  Trending Up
                </Badge>
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
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </MotionCard>
        </Grid>

        {/* Enhanced Bottom Grid with New Components */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr 1fr" }} gap={6}>
          {/* Network Activity */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={itemVariants}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            transition="all 0.3s ease"
          >
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiActivity} color={accentColor} />
                  <Heading size="md" color={textColor}>Network Activity</Heading>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewChange?.('graph')}
                  leftIcon={<Icon as={FiMaximize2} />}
                >
                  View Details
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={networkActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar 
                    dataKey="current" 
                    fill={accentColor} 
                    animationDuration={1200}
                  />
                  <Bar 
                    dataKey="capacity" 
                    fill={useColorModeValue('gray.300', 'gray.600')} 
                    opacity={0.3} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </MotionCard>

          {/* Network Topology Preview */}
          <MotionBox variants={itemVariants}>
            <NetworkTopologyPreview 
              graphData={graphData}
              onViewFullTopology={() => onViewChange?.('graph')}
            />
          </MotionBox>

          {/* Threat Monitor */}
          <MotionBox variants={itemVariants}>
            <ThreatMonitor graphData={graphData} />
          </MotionBox>
        </Grid>
      </Box>
    </MotionBox>
  )
}

export default ExecutiveDashboard

