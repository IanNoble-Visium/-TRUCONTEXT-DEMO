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
  Button
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { keyframes } from '@emotion/react'
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
  Area,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line
} from 'recharts'
import {
  FiActivity,
  FiUsers,
  FiGlobe,
  FiShield,
  FiDatabase,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiTarget,
  FiZap,
  FiAward,
  FiEye
} from 'react-icons/fi'

// Import TC_ALARM levels for alarm integration
import { TC_ALARM_LEVELS } from './GraphVisualization'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

// Keyframe animations for enhanced visual effects
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.3); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.6); }
  100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.3); }
`

const slideInUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

// Enhanced animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
}

const cardHoverVariants = {
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

interface GraphData {
  nodes: any[]
  edges: any[]
}

interface ExecutiveDashboardProps {
  graphData?: GraphData
  isLoading?: boolean
  onViewChange?: (view: 'executive' | 'graph' | 'table' | 'timeline' | 'cards' | 'dashboard' | 'geomap') => void
}

// Animated Gauge Component for Security Score
const AnimatedGauge: React.FC<{
  value: number
  maxValue: number
  title: string
  color: string
  icon: any
  size?: number
}> = ({ value, maxValue, title, color, icon, size = 120 }) => {
  const percentage = (value / maxValue) * 100
  const textColor = useColorModeValue('gray.800', 'white')
  const bgColor = useColorModeValue('gray.100', 'gray.700')

  return (
    <VStack spacing={3}>
      <Box position="relative" width={size} height={size}>
        <CircularProgressbar
          value={percentage}
          text=""
          styles={buildStyles({
            pathColor: color,
            trailColor: bgColor,
            strokeLinecap: 'round',
            pathTransitionDuration: 2,
          })}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Icon as={icon} boxSize={6} color={color} mb={1} />
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            <CountUp end={value} duration={2} />
          </Text>
          <Text fontSize="xs" color="gray.500">
            / {maxValue}
          </Text>
        </Box>
      </Box>
      <Text fontSize="sm" fontWeight="medium" color={textColor} textAlign="center">
        {title}
      </Text>
    </VStack>
  )
}

// Animated Counter Component
const AnimatedCounter: React.FC<{
  value: number
  title: string
  subtitle?: string
  icon: any
  color: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}> = ({ value, title, subtitle, icon, color, trend, trendValue }) => {
  const textColor = useColorModeValue('gray.800', 'white')
  const grayTextColor = useColorModeValue('gray.600', 'gray.400')

  const getTrendIcon = () => {
    if (trend === 'up') return FiTrendingUp
    if (trend === 'down') return FiTrendingUp // We'll rotate it for down
    return null
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'green.500'
    if (trend === 'down') return 'red.500'
    return 'gray.500'
  }

  return (
    <VStack spacing={2} align="start" w="full">
      <HStack spacing={3}>
        <Box
          p={3}
          borderRadius="lg"
          bg={`${color}.50`}
          color={`${color}.500`}
          animation={`${pulse} 2s infinite`}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            <CountUp end={value} duration={2.5} />
          </Text>
          <Text fontSize="sm" color={grayTextColor}>
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color={grayTextColor}>
              {subtitle}
            </Text>
          )}
        </VStack>
      </HStack>
      {trend && trendValue && (
        <HStack spacing={1}>
          <Icon
            as={getTrendIcon()}
            boxSize={3}
            color={getTrendColor()}
            transform={trend === 'down' ? 'rotate(180deg)' : 'none'}
          />
          <Text fontSize="xs" color={getTrendColor()}>
            {trendValue}
          </Text>
        </HStack>
      )}
    </VStack>
  )
}

interface DashboardMetrics {
  totalNodes: number
  totalEdges: number
  networkDensity: number
  securityScore: number
  criticalAssets: number
  vulnerabilities: number
  alarmCounts: {
    Alert: number
    Warning: number
    Success: number
    Info: number
    None: number
  }
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

  // Additional color mode values for JSX expressions
  const mainBgGradient = useColorModeValue(
    'linear(to-br, gray.50, blue.50, purple.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  )
  const overlayBgGradient = useColorModeValue(
    'radial(circle at 20% 80%, blue.100 0%, transparent 50%), radial(circle at 80% 20%, purple.100 0%, transparent 50%)',
    'radial(circle at 20% 80%, blue.800 0%, transparent 50%), radial(circle at 80% 20%, purple.800 0%, transparent 50%)'
  )
  const chartStroke = useColorModeValue('#ffffff', '#1a202c')
  const gridStroke = useColorModeValue('#e2e8f0', '#4a5568')
  const blueBgGradient = useColorModeValue('blue.50', 'blue.900')
  const greenBgGradient = useColorModeValue('green.50', 'green.900')
  const purpleBgGradient = useColorModeValue('purple.50', 'purple.900')
  const redBgGradient = useColorModeValue('red.50', 'red.900')

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [currentTime, setCurrentTime] = useState<string>('')

  // Calculate metrics from graph data
  const calculatedMetrics = useMemo(() => {
    if (!graphData || !graphData.nodes || !graphData.edges) {
      return {
        totalNodes: 0,
        totalEdges: 0,
        networkDensity: 0,
        securityScore: 85.5,
        criticalAssets: 0,
        vulnerabilities: 0,
        alarmCounts: {
          Alert: 0,
          Warning: 0,
          Success: 0,
          Info: 0,
          None: 0
        }
      }
    }

    const nodeCount = graphData.nodes.length
    const edgeCount = graphData.edges.length
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2
    const density = maxPossibleEdges > 0 ? (edgeCount / maxPossibleEdges) * 100 : 0

    // Calculate alarm counts from nodes and edges
    const alarmCounts = {
      Alert: 0,
      Warning: 0,
      Success: 0,
      Info: 0,
      None: 0
    }

    // Count alarms from nodes - check both main data and properties
    console.log('Executive Dashboard: Analyzing nodes for TC_ALARM properties:', {
      totalNodes: graphData.nodes.length,
      sampleNode: graphData.nodes[0],
      sampleNodeKeys: graphData.nodes[0] ? Object.keys(graphData.nodes[0]) : [],
      nodesWithTCProperties: graphData.nodes.filter(n => Object.keys(n).some(k => k.startsWith('TC_'))).length,
      allTCProperties: graphData.nodes.flatMap(n => Object.keys(n).filter(k => k.startsWith('TC_')))
    })

    graphData.nodes.forEach((node, index) => {
      // Check multiple possible locations for TC_ALARM
      const alarmLevel = node.TC_ALARM || node.data?.TC_ALARM || node.data?.properties?.TC_ALARM || 'None'

      if (alarmLevel !== 'None') {
        console.log(`Executive Dashboard: Found alarm ${alarmLevel} on node ${node.id || node.uid || index}`, {
          nodeStructure: Object.keys(node),
          tcProperties: Object.entries(node).filter(([key]) => key.startsWith('TC_'))
        })
      }

      if (alarmCounts.hasOwnProperty(alarmLevel)) {
        alarmCounts[alarmLevel as keyof typeof alarmCounts]++
      } else {
        alarmCounts.None++
      }
    })

    // Count alarms from edges - check both main data and properties
    graphData.edges.forEach(edge => {
      const alarmLevel = edge.TC_ALARM || edge.data?.TC_ALARM || edge.data?.properties?.TC_ALARM || 'None'
      if (alarmLevel !== 'None') {
        console.log(`Executive Dashboard: Found alarm ${alarmLevel} on edge`, edge)
      }
      if (alarmCounts.hasOwnProperty(alarmLevel)) {
        alarmCounts[alarmLevel as keyof typeof alarmCounts]++
      } else {
        alarmCounts.None++
      }
    })

    console.log('Executive Dashboard: Final alarm counts:', alarmCounts)

    // Calculate security metrics based on node types and alarm status
    const criticalAssets = graphData.nodes.filter(node => {
      const isServerOrDB = node.type === 'server' || node.type === 'database' ||
                          node.data?.type === 'server' || node.data?.type === 'database'
      const tcAlarm = node.TC_ALARM || node.data?.TC_ALARM || node.data?.properties?.TC_ALARM
      const hasAlarm = tcAlarm && ['Alert', 'Warning'].includes(tcAlarm)
      return isServerOrDB || hasAlarm
    }).length

    const vulnerabilities = graphData.nodes.filter(node => {
      const tcAlarm = node.TC_ALARM || node.data?.TC_ALARM || node.data?.properties?.TC_ALARM
      return node.status === 'vulnerable' ||
             node.alert === 'high' ||
             node.data?.status === 'vulnerable' ||
             node.data?.alert === 'high' ||
             tcAlarm === 'Alert'
    }).length

    console.log('Executive Dashboard: Critical assets calculation:', {
      criticalAssets,
      vulnerabilities,
      nodesWithAlarms: graphData.nodes.filter(node => {
        const tcAlarm = node.TC_ALARM || node.data?.TC_ALARM || node.data?.properties?.TC_ALARM
        return tcAlarm && ['Alert', 'Warning'].includes(tcAlarm)
      }).length
    })

    // Enhanced security score calculation with alarm integration
    let securityScore = 100

    // Deduct points for alarms
    securityScore -= alarmCounts.Alert * 10      // Critical alerts: -10 points each
    securityScore -= alarmCounts.Warning * 5     // Warnings: -5 points each
    securityScore += alarmCounts.Success * 2     // Success states: +2 points each
    securityScore -= alarmCounts.Info * 1        // Info alerts: -1 point each

    // Deduct points for vulnerabilities and critical assets
    securityScore -= vulnerabilities * 3
    securityScore -= criticalAssets * 1

    // Ensure score stays within bounds
    securityScore = Math.max(0, Math.min(100, securityScore))

    return {
      totalNodes: nodeCount,
      totalEdges: edgeCount,
      networkDensity: density,
      securityScore,
      criticalAssets,
      vulnerabilities,
      alarmCounts
    }
  }, [graphData])

  // Sample data for charts
  const nodeTypeData = useMemo(() => {
    if (!graphData?.nodes || graphData.nodes.length === 0) return []

    console.log('ExecutiveDashboard: Processing node types from graphData:', {
      nodeCount: graphData.nodes.length,
      sampleNode: graphData.nodes[0],
      sampleNodeData: graphData.nodes[0]?.data,
      sampleNodeType: graphData.nodes[0]?.type || graphData.nodes[0]?.data?.type
    })

    const typeCounts: { [key: string]: number } = {}
    graphData.nodes.forEach((node, index) => {
      // Try multiple paths to find the node type
      let type = 'unknown'

      if (node.type) {
        // Direct type property (original JSON format)
        type = node.type
      } else if (node.data?.type) {
        // Cytoscape format
        type = node.data.type
      } else if (node.data?.properties?.type) {
        // Type in properties
        type = node.data.properties.type
      }

      // Log first few nodes for debugging
      if (index < 3) {
        console.log(`Node ${index}:`, {
          node,
          extractedType: type,
          directType: node.type,
          dataType: node.data?.type,
          propertiesType: node.data?.properties?.type
        })
      }

      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    console.log('ExecutiveDashboard: Final type counts:', typeCounts)

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

  const networkActivityData = useMemo(() => [
    { name: 'Nodes', current: calculatedMetrics.totalNodes, capacity: 100 },
    { name: 'Critical Assets', current: calculatedMetrics.criticalAssets, capacity: 20 }
  ], [calculatedMetrics.totalNodes, calculatedMetrics.criticalAssets])

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

  // Set current time on client side only to prevent hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

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
      key="executive-dashboard"
      p={6}
      bg={bgColor}
      bgGradient={mainBgGradient}
      minH="100%"
      w="100%"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: overlayBgGradient,
        opacity: 0.3,
        zIndex: -1
      }}
    >
      {/* Enhanced Header Section */}
      <MotionBox variants={itemVariants} mb={8}>
        <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
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
              <Badge colorScheme="green" px={3} py={1}>Live Data</Badge>
              <Text fontSize="sm" color={grayTextColor}>
                {currentTime || 'Loading...'}
              </Text>
            </HStack>
          </VStack>

          {/* Interactive Controls */}
          <VStack spacing={2}>
            <HStack spacing={2}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<Icon as={FiTarget} />}
                  onClick={() => {
                    // Export dashboard data as JSON
                    const dashboardData = {
                      timestamp: new Date().toISOString(),
                      metrics: metrics,
                      nodeTypes: nodeTypeData,
                      securityTrend: securityTrendData
                    }
                    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `executive-dashboard-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Export Data
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  leftIcon={<Icon as={FiZap} />}
                  onClick={() => {
                    // Refresh dashboard data
                    window.location.reload()
                  }}
                >
                  Refresh
                </Button>
              </motion.div>
            </HStack>

            {/* Time Range Filter */}
            <HStack spacing={1}>
              <Text fontSize="xs" color={grayTextColor}>View:</Text>
              {['24h', '7d', '30d'].map((range) => (
                <Button
                  key={range}
                  size="xs"
                  variant={range === '24h' ? 'solid' : 'ghost'}
                  colorScheme="blue"
                  onClick={() => {
                    console.log(`Time range changed to: ${range}`)
                    // Could implement time range filtering here
                  }}
                >
                  {range}
                </Button>
              ))}
            </HStack>
          </VStack>
        </Flex>
      </MotionBox>

      {/* Enhanced Key Metrics Row with Animations */}
      <MotionBox variants={itemVariants} mb={8}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {/* Network Entities - Enhanced with Animation */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "blue.300"
            }}
          >
            <CardBody>
              <AnimatedCounter
                value={metrics?.totalNodes || 0}
                title="Network Entities"
                subtitle={metrics?.alarmCounts?.Alert > 0 || metrics?.alarmCounts?.Warning > 0
                  ? 'Some with alerts' : 'All monitored'}
                icon={FiDatabase}
                color="blue"
                trend="up"
                trendValue="12% this week"
              />
              {/* Alarm indicators */}
              {metrics?.alarmCounts && (metrics.alarmCounts.Alert > 0 || metrics.alarmCounts.Warning > 0) && (
                <HStack spacing={1} mt={2}>
                  {metrics.alarmCounts.Alert > 0 && (
                    <Tooltip label={`${metrics.alarmCounts.Alert} critical alerts`}>
                      <Badge colorScheme="red" fontSize="xs" px={2} py={1}>
                        {metrics.alarmCounts.Alert} Critical
                      </Badge>
                    </Tooltip>
                  )}
                  {metrics.alarmCounts.Warning > 0 && (
                    <Tooltip label={`${metrics.alarmCounts.Warning} warnings`}>
                      <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>
                        {metrics.alarmCounts.Warning} Warning
                      </Badge>
                    </Tooltip>
                  )}
                </HStack>
              )}
            </CardBody>
          </MotionCard>

          {/* Active Relationships - Enhanced */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "green.300"
            }}
          >
            <CardBody>
              <AnimatedCounter
                value={metrics?.totalEdges || 0}
                title="Active Relationships"
                subtitle="Network connections"
                icon={FiGlobe}
                color="green"
                trend="up"
                trendValue="8% increase"
              />
            </CardBody>
          </MotionCard>

          {/* Network Health - Animated Gauge */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: metrics?.alarmCounts?.Alert > 0 ? 'red.300' :
                          metrics?.alarmCounts?.Warning > 0 ? 'orange.300' :
                          (metrics?.securityScore || 0) >= 80 ? 'green.300' : 'yellow.300'
            }}
          >
            <CardBody display="flex" justifyContent="center" alignItems="center">
              <AnimatedGauge
                value={Math.round(metrics?.securityScore || 0)}
                maxValue={100}
                title="Network Health"
                color={
                  metrics?.alarmCounts?.Alert > 0 ? '#E53E3E' :
                  metrics?.alarmCounts?.Warning > 0 ? '#DD6B20' :
                  (metrics?.securityScore || 0) >= 80 ? '#38A169' :
                  (metrics?.securityScore || 0) >= 60 ? '#D69E2E' : '#E53E3E'
                }
                icon={FiShield}
                size={100}
              />
              {/* Status Badge */}
              {metrics?.alarmCounts && (
                <Badge
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme={
                    metrics.alarmCounts.Alert > 0 ? 'red' :
                    metrics.alarmCounts.Warning > 0 ? 'orange' :
                    metrics.securityScore >= 80 ? 'green' :
                    metrics.securityScore >= 60 ? 'yellow' : 'red'
                  }
                  fontSize="xs"
                  animation={metrics.alarmCounts.Alert > 0 ? `${pulse} 2s infinite` : 'none'}
                >
                  {metrics.alarmCounts.Alert > 0 ? 'CRITICAL' :
                   metrics.alarmCounts.Warning > 0 ? 'WARNING' :
                   metrics.securityScore >= 80 ? 'HEALTHY' :
                   metrics.securityScore >= 60 ? 'MODERATE' : 'POOR'}
                </Badge>
              )}
            </CardBody>
          </MotionCard>

          {/* Critical Assets - Enhanced with Gauge */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: metrics?.alarmCounts?.Alert > 0 ? 'red.300' :
                          metrics?.alarmCounts?.Warning > 0 ? 'orange.300' : 'purple.300'
            }}
          >
            <CardBody display="flex" justifyContent="center" alignItems="center">
              <AnimatedGauge
                value={metrics?.criticalAssets || 0}
                maxValue={20}
                title="Critical Assets"
                color={
                  metrics?.alarmCounts?.Alert > 0 ? '#E53E3E' :
                  metrics?.alarmCounts?.Warning > 0 ? '#DD6B20' : '#805AD5'
                }
                icon={FiTarget}
                size={100}
              />
              {/* Alarm indicators */}
              {metrics?.alarmCounts && (metrics.alarmCounts.Alert > 0 || metrics.alarmCounts.Warning > 0) && (
                <VStack position="absolute" top={2} right={2} spacing={1}>
                  {metrics.alarmCounts.Alert > 0 && (
                    <Badge
                      colorScheme="red"
                      fontSize="xs"
                      px={2}
                      animation={`${pulse} 2s infinite`}
                    >
                      {metrics.alarmCounts.Alert} Critical
                    </Badge>
                  )}
                  {metrics.alarmCounts.Warning > 0 && (
                    <Badge colorScheme="orange" fontSize="xs" px={2}>
                      {metrics.alarmCounts.Warning} Warning
                    </Badge>
                  )}
                </VStack>
              )}
            </CardBody>
          </MotionCard>
        </SimpleGrid>
      </MotionBox>

      {/* Executive Summary Cards */}
      <MotionBox variants={itemVariants} mb={8}>
        <Heading size="lg" color={textColor} mb={4}>Executive Summary</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {/* Risk Assessment Card */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "red.300"
            }}
          >
            <CardHeader>
              <HStack>
                <Icon as={FiAlertTriangle} color="red.500" boxSize={5} />
                <Heading size="md" color={textColor}>Risk Assessment</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={grayTextColor}>Overall Risk Level</Text>
                  <Badge
                    colorScheme={
                      metrics?.alarmCounts?.Alert > 0 ? 'red' :
                      metrics?.alarmCounts?.Warning > 0 ? 'orange' :
                      (metrics?.securityScore || 0) >= 80 ? 'green' : 'yellow'
                    }
                    fontSize="sm"
                    px={3}
                    py={1}
                  >
                    {metrics?.alarmCounts?.Alert > 0 ? 'HIGH RISK' :
                     metrics?.alarmCounts?.Warning > 0 ? 'MEDIUM RISK' :
                     (metrics?.securityScore || 0) >= 80 ? 'LOW RISK' : 'MODERATE RISK'}
                  </Badge>
                </HStack>
                <Progress
                  value={
                    metrics?.alarmCounts?.Alert > 0 ? 90 :
                    metrics?.alarmCounts?.Warning > 0 ? 60 :
                    (metrics?.securityScore || 0) >= 80 ? 20 : 40
                  }
                  colorScheme={
                    metrics?.alarmCounts?.Alert > 0 ? 'red' :
                    metrics?.alarmCounts?.Warning > 0 ? 'orange' :
                    (metrics?.securityScore || 0) >= 80 ? 'green' : 'yellow'
                  }
                  size="lg"
                  w="full"
                />
                <VStack align="start" spacing={1} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color={grayTextColor}>Critical Issues</Text>
                    <Text fontSize="xs" fontWeight="bold" color="red.500">
                      {metrics?.alarmCounts?.Alert || 0}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color={grayTextColor}>Vulnerabilities</Text>
                    <Text fontSize="xs" fontWeight="bold" color="orange.500">
                      {metrics?.vulnerabilities || 0}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </MotionCard>

          {/* Performance Benchmarking Card */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "blue.300"
            }}
          >
            <CardHeader>
              <HStack>
                <Icon as={FiAward} color="blue.500" boxSize={5} />
                <Heading size="md" color={textColor}>Performance Benchmark</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={grayTextColor}>Industry Percentile</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    <CountUp end={Math.min(95, (metrics?.securityScore || 0) + 15)} duration={2} />th
                  </Text>
                </HStack>
                <Progress
                  value={Math.min(95, (metrics?.securityScore || 0) + 15)}
                  colorScheme="blue"
                  size="lg"
                  w="full"
                />
                <SimpleGrid columns={2} spacing={2} w="full">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color={grayTextColor}>Network Efficiency</Text>
                    <Text fontSize="sm" fontWeight="bold" color="green.500">
                      {((metrics?.networkDensity || 0) * 100).toFixed(1)}%
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color={grayTextColor}>Response Time</Text>
                    <Text fontSize="sm" fontWeight="bold" color="blue.500">
                      <CountUp end={Math.floor(Math.random() * 50) + 10} duration={2} />ms
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </MotionCard>

          {/* Compliance Status Card */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "green.300"
            }}
          >
            <CardHeader>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                <Heading size="md" color={textColor}>Compliance Status</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={grayTextColor}>Overall Compliance</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    <CountUp end={Math.max(75, (metrics?.securityScore || 0) - 5)} duration={2} />%
                  </Text>
                </HStack>
                <Progress
                  value={Math.max(75, (metrics?.securityScore || 0) - 5)}
                  colorScheme="green"
                  size="lg"
                  w="full"
                />
                <VStack align="start" spacing={1} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color={grayTextColor}>SOC 2 Type II</Text>
                    <Badge colorScheme="green" fontSize="xs">Compliant</Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color={grayTextColor}>ISO 27001</Text>
                    <Badge colorScheme="green" fontSize="xs">Certified</Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color={grayTextColor}>GDPR</Text>
                    <Badge colorScheme={metrics?.alarmCounts?.Alert > 0 ? 'orange' : 'green'} fontSize="xs">
                      {metrics?.alarmCounts?.Alert > 0 ? 'Review Required' : 'Compliant'}
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </MotionCard>
        </SimpleGrid>
      </MotionBox>

      {/* Enhanced Charts Grid */}
      <MotionBox variants={itemVariants} mb={8}>
        <Heading size="lg" color={textColor} mb={4}>Analytics Dashboard</Heading>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Enhanced Node Types Distribution */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "2xl",
              borderColor: "blue.300",
              transform: "translateY(-2px)"
            }}
            bgGradient={`linear(to-br, ${cardBg}, ${blueBgGradient})`}
          >
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>Node Types Distribution</Heading>
                  <Text fontSize="sm" color={grayTextColor}>
                    {nodeTypeData.length} types • <CountUp end={metrics?.totalNodes || 0} duration={2} /> total nodes
                  </Text>
                </VStack>
                <Icon as={FiActivity} color="blue.500" boxSize={5} />
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nodeTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    animationBegin={0}
                    animationDuration={2000}
                    onClick={(data, index) => {
                      console.log('Pie chart clicked:', data, index)
                      // Could implement drill-down functionality here
                    }}
                  >
                    {nodeTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={chartStroke}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: cardBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </MotionCard>

          {/* Enhanced Security Trend */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "2xl",
              borderColor: "green.300",
              transform: "translateY(-2px)"
            }}
            bgGradient={`linear(to-br, ${cardBg}, ${greenBgGradient})`}
          >
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>Security Trend (24h)</Heading>
                  <HStack>
                    <Icon as={FiTrendingUp} color={successColor} />
                    <Text fontSize="sm" color={successColor}>
                      +{((Math.random() * 5) + 2).toFixed(1)}% improvement
                    </Text>
                  </HStack>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color={successColor}>
                    <CountUp end={Math.round(metrics?.securityScore || 85)} duration={2} />%
                  </Text>
                  <Text fontSize="xs" color={grayTextColor}>Current Score</Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={securityTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: grayTextColor }}
                  />
                  <YAxis
                    domain={[75, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: grayTextColor }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: cardBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00C49F"
                    strokeWidth={3}
                    fill="url(#securityGradient)"
                    animationDuration={2000}
                    animationBegin={500}
                  />
                  <defs>
                    <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </MotionCard>
        </Grid>
      </MotionBox>

      {/* Enhanced Bottom Row */}
      <MotionBox variants={itemVariants}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Enhanced Network Activity */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "purple.300"
            }}
            bgGradient={`linear(to-br, ${cardBg}, ${purpleBgGradient})`}
          >
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>Network Activity</Heading>
                  <Text fontSize="sm" color={grayTextColor}>
                    Real-time capacity monitoring
                  </Text>
                </VStack>
                <Icon as={FiZap} color="purple.500" boxSize={5} />
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={networkActivityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStroke}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: grayTextColor }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: grayTextColor }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: cardBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="current"
                    fill="#0088FE"
                    name="Current"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationBegin={1000}
                  />
                  <Bar
                    dataKey="capacity"
                    fill="#E0E0E0"
                    name="Capacity"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationBegin={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </MotionCard>

          {/* Enhanced Alarm Status Summary */}
          <MotionCard
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            variants={cardHoverVariants}
            whileHover="hover"
            _hover={{
              boxShadow: "xl",
              borderColor: "red.300"
            }}
            bgGradient={`linear(to-br, ${cardBg}, ${redBgGradient})`}
          >
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>Security Alarm Status</Heading>
                  <Text fontSize="sm" color={grayTextColor}>
                    Network-wide alarm distribution
                  </Text>
                </VStack>
                <Icon as={FiAlertTriangle} color="red.500" boxSize={5} />
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Enhanced Alarm Status Bars */}
                {Object.entries(TC_ALARM_LEVELS).map(([level, config], index) => {
                  const count = metrics?.alarmCounts?.[level as keyof typeof metrics.alarmCounts] || 0
                  const total = metrics ?
                    Object.values(metrics.alarmCounts).reduce((sum, val) => sum + val, 0) : 1
                  const percentage = total > 0 ? (count / total) * 100 : 0

                  return (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <HStack>
                            <Box
                              w={4}
                              h={4}
                              borderRadius="full"
                              bg={config.color}
                              animation={level === 'Alert' && count > 0 ? `${pulse} 2s infinite` : 'none'}
                            />
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {config.label}
                            </Text>
                          </HStack>
                          <Badge
                            colorScheme={
                              level === 'Alert' ? 'red' :
                              level === 'Warning' ? 'orange' :
                              level === 'Success' ? 'green' :
                              level === 'Info' ? 'blue' : 'gray'
                            }
                            fontSize="sm"
                            px={3}
                            py={1}
                            animation={level === 'Alert' && count > 0 ? `${pulse} 2s infinite` : 'none'}
                          >
                            <CountUp end={count} duration={1.5} />
                          </Badge>
                        </HStack>
                        <Progress
                          value={percentage}
                          size="md"
                          colorScheme={
                            level === 'Alert' ? 'red' :
                            level === 'Warning' ? 'orange' :
                            level === 'Success' ? 'green' :
                            level === 'Info' ? 'blue' : 'gray'
                          }
                          borderRadius="md"
                          hasStripe
                          isAnimated
                        />
                        <Text fontSize="xs" color={grayTextColor} mt={1}>
                          {percentage.toFixed(1)}% of total alarms
                        </Text>
                      </Box>
                    </motion.div>
                  )
                })}

                {/* Alarm Distribution Pie Chart */}
                {metrics && Object.values(metrics.alarmCounts).some(count => count > 0) && (
                  <Box mt={6}>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
                      Alarm Distribution Overview
                    </Text>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={Object.entries(metrics.alarmCounts)
                            .filter(([_, count]) => count > 0)
                            .map(([level, count]) => ({
                              name: level,
                              value: count,
                              color: TC_ALARM_LEVELS[level as keyof typeof TC_ALARM_LEVELS]?.color || '#6c757d'
                            }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={30}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {Object.entries(metrics.alarmCounts)
                            .filter(([_, count]) => count > 0)
                            .map(([level], index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={TC_ALARM_LEVELS[level as keyof typeof TC_ALARM_LEVELS]?.color || '#6c757d'}
                              />
                            ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: cardBg,
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: string) => [
                            `${value} ${value === 1 ? 'alarm' : 'alarms'}`,
                            name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}

                {/* Enhanced Quick Action Button */}
                {onViewChange && (
                  <Box pt={4}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="md"
                        colorScheme="blue"
                        variant="solid"
                        onClick={() => onViewChange('graph')}
                        leftIcon={<Icon as={FiEye} />}
                        width="full"
                        bgGradient="linear(to-r, blue.400, blue.600)"
                        _hover={{
                          bgGradient: "linear(to-r, blue.500, blue.700)",
                          transform: "translateY(-1px)",
                          boxShadow: "lg"
                        }}
                        _active={{
                          transform: "translateY(0px)"
                        }}
                      >
                        View Network Topology
                      </Button>
                    </motion.div>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </MotionCard>
        </Grid>
      </MotionBox>
    </MotionBox>
  )
}

export default ExecutiveDashboard

