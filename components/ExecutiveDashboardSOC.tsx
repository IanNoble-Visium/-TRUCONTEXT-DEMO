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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
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
  Line,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis
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
  FiEye,
  FiClock,
  FiLock,
  FiUnlock,
  FiWifi,
  FiServer,
  FiMonitor,
  FiSearch,
  FiBell,
  FiFileText,
  FiTool,
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiMap,
  FiLayers
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

const criticalPulse = keyframes`
  0% { background-color: rgba(229, 62, 62, 0.1); }
  50% { background-color: rgba(229, 62, 62, 0.3); }
  100% { background-color: rgba(229, 62, 62, 0.1); }
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

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

interface ExecutiveDashboardSOCProps {
  graphData?: { nodes: any[]; edges: any[] }
  isLoading?: boolean
  selectedNodes?: string[]
  onNodeSelect?: (nodeId: string) => void
}

const ExecutiveDashboardSOC: React.FC<ExecutiveDashboardSOCProps> = ({
  graphData,
  isLoading = false,
  selectedNodes = [],
  onNodeSelect
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeIncidents, setActiveIncidents] = useState(0)
  const [threatLevel, setThreatLevel] = useState('ELEVATED')
  const [socMetrics, setSocMetrics] = useState({
    alertsToday: 247,
    incidentsResolved: 18,
    meanTimeToDetection: 4.2,
    meanTimeToResponse: 12.8,
    securityScore: 87,
    complianceScore: 94
  })

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  const criticalBg = useColorModeValue('red.50', 'red.900')
  const warningBg = useColorModeValue('orange.50', 'orange.900')
  const successBg = useColorModeValue('green.50', 'green.900')

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate real-time SOC data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSocMetrics(prev => ({
        ...prev,
        alertsToday: prev.alertsToday + Math.floor(Math.random() * 3),
        incidentsResolved: prev.incidentsResolved + (Math.random() > 0.9 ? 1 : 0),
        meanTimeToDetection: Math.max(1, prev.meanTimeToDetection + (Math.random() - 0.5) * 0.5),
        meanTimeToResponse: Math.max(5, prev.meanTimeToResponse + (Math.random() - 0.5) * 2)
      }))
      setActiveIncidents(Math.floor(Math.random() * 8) + 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // SOC-specific data
  const threatIntelligence = [
    { name: 'APT Groups', value: 12, color: '#E53E3E' },
    { name: 'Malware Families', value: 34, color: '#DD6B20' },
    { name: 'IOCs Tracked', value: 156, color: '#D69E2E' },
    { name: 'Threat Feeds', value: 8, color: '#38A169' }
  ]

  const incidentTrends = [
    { time: '00:00', incidents: 2, resolved: 1 },
    { time: '04:00', incidents: 1, resolved: 2 },
    { time: '08:00', incidents: 5, resolved: 3 },
    { time: '12:00', incidents: 8, resolved: 6 },
    { time: '16:00', incidents: 12, resolved: 9 },
    { time: '20:00', incidents: 6, resolved: 8 },
    { time: '24:00', incidents: 3, resolved: 4 }
  ]

  const securityControls = [
    { name: 'Firewalls', status: 'Operational', coverage: 98 },
    { name: 'IDS/IPS', status: 'Operational', coverage: 95 },
    { name: 'SIEM', status: 'Operational', coverage: 100 },
    { name: 'EDR', status: 'Degraded', coverage: 87 },
    { name: 'DLP', status: 'Operational', coverage: 92 },
    { name: 'Email Security', status: 'Operational', coverage: 99 }
  ]

  const recentIncidents = [
    {
      id: 'INC-2024-001',
      title: 'Suspicious PowerShell Activity',
      severity: 'High',
      status: 'Investigating',
      assignee: 'Sarah Chen',
      time: '14:32'
    },
    {
      id: 'INC-2024-002',
      title: 'Unusual Network Traffic',
      severity: 'Medium',
      status: 'Contained',
      assignee: 'Mike Rodriguez',
      time: '13:45'
    },
    {
      id: 'INC-2024-003',
      title: 'Failed Login Attempts',
      severity: 'Low',
      status: 'Resolved',
      assignee: 'Alex Thompson',
      time: '12:18'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'red'
      case 'High': return 'orange'
      case 'Medium': return 'yellow'
      case 'Low': return 'green'
      default: return 'gray'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational': return 'green'
      case 'Degraded': return 'yellow'
      case 'Down': return 'red'
      default: return 'gray'
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'red'
      case 'HIGH': return 'orange'
      case 'ELEVATED': return 'yellow'
      case 'GUARDED': return 'blue'
      case 'LOW': return 'green'
      default: return 'gray'
    }
  }

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="xl" color={textColor}>
              SOC Executive Dashboard
            </Heading>
            <Text color={mutedColor} fontSize="lg">
              Security Operations Center - Real-time Overview
            </Text>
          </VStack>
          <VStack align="end" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {currentTime.toLocaleTimeString()}
            </Text>
            <Text color={mutedColor}>
              {currentTime.toLocaleDateString()}
            </Text>
          </VStack>
        </Flex>

        {/* Threat Level Alert */}
        <MotionCard
          variants={cardVariants}
          bg={warningBg}
          border="2px solid"
          borderColor="orange.300"
          mb={6}
          animation={threatLevel === 'CRITICAL' ? `${criticalPulse} 2s infinite` : undefined}
        >
          <CardBody>
            <HStack spacing={4}>
              <Icon as={FiShield} boxSize={8} color="orange.500" />
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold">
                  Current Threat Level: {threatLevel}
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  Elevated threat activity detected. Enhanced monitoring in effect.
                </Text>
              </VStack>
              <Badge
                colorScheme={getThreatLevelColor(threatLevel)}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {threatLevel}
              </Badge>
            </HStack>
          </CardBody>
        </MotionCard>

        {/* Key Metrics Grid */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={6}>
          <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>Active Incidents</StatLabel>
                <StatNumber fontSize="3xl" color="red.500">
                  <CountUp end={activeIncidents} duration={1} />
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +2 from yesterday
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>Alerts Today</StatLabel>
                <StatNumber fontSize="3xl" color="orange.500">
                  <CountUp end={socMetrics.alertsToday} duration={1} />
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +15% from average
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>MTTD (Minutes)</StatLabel>
                <StatNumber fontSize="3xl" color="blue.500">
                  <CountUp end={socMetrics.meanTimeToDetection} decimals={1} duration={1} />
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  -8% improvement
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>MTTR (Minutes)</StatLabel>
                <StatNumber fontSize="3xl" color="green.500">
                  <CountUp end={socMetrics.meanTimeToResponse} decimals={1} duration={1} />
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  -12% improvement
                </StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </Grid>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
          {/* Incident Trends Chart */}
          <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">24-Hour Incident Trends</Heading>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={incidentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stackId="1"
                    stroke="#E53E3E"
                    fill="#E53E3E"
                    fillOpacity={0.6}
                    name="New Incidents"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#38A169"
                    fill="#38A169"
                    fillOpacity={0.6}
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </MotionCard>

          {/* Security Score */}
          <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Security Posture</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6}>
                <Box width="150px" height="150px">
                  <CircularProgressbar
                    value={socMetrics.securityScore}
                    text={`${socMetrics.securityScore}%`}
                    styles={buildStyles({
                      textColor: useColorModeValue('#2D3748', '#F7FAFC'),
                      pathColor: '#38A169',
                      trailColor: useColorModeValue('#E2E8F0', '#4A5568')
                    })}
                  />
                </Box>
                <VStack spacing={2}>
                  <Text fontWeight="bold">Overall Security Score</Text>
                  <Badge colorScheme="green" fontSize="sm">
                    GOOD
                  </Badge>
                </VStack>
              </VStack>
            </CardBody>
          </MotionCard>
        </Grid>

        {/* Tabs for detailed views */}
        <MotionCard variants={cardVariants} bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Recent Incidents</Tab>
                <Tab>Security Controls</Tab>
                <Tab>Threat Intelligence</Tab>
                <Tab>Threat Path Analysis</Tab>
              </TabList>

              <TabPanels>
                {/* Recent Incidents Tab */}
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Incident ID</Th>
                          <Th>Title</Th>
                          <Th>Severity</Th>
                          <Th>Status</Th>
                          <Th>Assignee</Th>
                          <Th>Time</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentIncidents.map((incident) => (
                          <Tr key={incident.id}>
                            <Td fontFamily="mono">{incident.id}</Td>
                            <Td>{incident.title}</Td>
                            <Td>
                              <Badge colorScheme={getSeverityColor(incident.severity)}>
                                {incident.severity}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge variant="outline">
                                {incident.status}
                              </Badge>
                            </Td>
                            <Td>{incident.assignee}</Td>
                            <Td>{incident.time}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                {/* Security Controls Tab */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {securityControls.map((control) => (
                      <Card key={control.name} variant="outline">
                        <CardBody>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{control.name}</Text>
                              <Badge colorScheme={getStatusColor(control.status)}>
                                {control.status}
                              </Badge>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text fontSize="2xl" fontWeight="bold">
                                {control.coverage}%
                              </Text>
                              <Progress
                                value={control.coverage}
                                colorScheme={getStatusColor(control.status)}
                                size="sm"
                                width="100px"
                              />
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </TabPanel>

                {/* Threat Intelligence Tab */}
                <TabPanel>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <Box>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={threatIntelligence}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {threatIntelligence.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <VStack align="start" spacing={4}>
                      <Heading size="sm">Threat Intelligence Summary</Heading>
                      {threatIntelligence.map((item) => (
                        <HStack key={item.name} spacing={3}>
                          <Box w={4} h={4} bg={item.color} borderRadius="sm" />
                          <Text>{item.name}</Text>
                          <Badge>{item.value}</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </Grid>
                </TabPanel>

                {/* Threat Path Analysis Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Threat Path KPIs */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Card bg="blue.50" borderLeft="4px solid" borderLeftColor="blue.500">
                        <CardBody textAlign="center">
                          <VStack spacing={2}>
                            <Icon as={FiTarget} size="24px" color="blue.500" />
                            <Stat>
                              <StatNumber fontSize="2xl">
                                <CountUp end={47} duration={2} />
                              </StatNumber>
                              <StatLabel fontSize="sm">Total Threat Paths</StatLabel>
                              <StatHelpText>
                                <StatArrow type="increase" />
                                12.5%
                              </StatHelpText>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg="orange.50" borderLeft="4px solid" borderLeftColor="orange.500">
                        <CardBody textAlign="center">
                          <VStack spacing={2}>
                            <Icon as={FiActivity} size="24px" color="orange.500" />
                            <Stat>
                              <StatNumber fontSize="2xl">
                                <CountUp end={12} duration={2} />
                              </StatNumber>
                              <StatLabel fontSize="sm">Active Paths</StatLabel>
                              <StatHelpText>
                                <StatArrow type="decrease" />
                                8.3%
                              </StatHelpText>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg="red.50" borderLeft="4px solid" borderLeftColor="red.500">
                        <CardBody textAlign="center">
                          <VStack spacing={2}>
                            <Icon as={FiAlertTriangle} size="24px" color="red.500" />
                            <Stat>
                              <StatNumber fontSize="2xl">
                                <CountUp end={3} duration={2} />
                              </StatNumber>
                              <StatLabel fontSize="sm">Critical Paths</StatLabel>
                              <StatHelpText>
                                <StatArrow type="decrease" />
                                25.0%
                              </StatHelpText>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg="green.50" borderLeft="4px solid" borderLeftColor="green.500">
                        <CardBody textAlign="center">
                          <VStack spacing={2}>
                            <Icon as={FiZap} size="24px" color="green.500" />
                            <Stat>
                              <StatNumber fontSize="2xl">
                                <CountUp end={73.2} decimals={1} duration={2} />%
                              </StatNumber>
                              <StatLabel fontSize="sm">Automation Rate</StatLabel>
                              <StatHelpText>
                                <StatArrow type="increase" />
                                18.9%
                              </StatHelpText>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Threat Path Response Times */}
                    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
                      <Card>
                        <CardHeader>
                          <Heading size="sm">Mean Time Metrics (Minutes)</Heading>
                        </CardHeader>
                        <CardBody>
                          <Box height="200px">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { metric: 'Detection', time: 8.5, target: 15 },
                                { metric: 'Response', time: 15.2, target: 30 },
                                { metric: 'Containment', time: 45.8, target: 60 },
                                { metric: 'Recovery', time: 180.5, target: 240 }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="metric" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="time" fill="#4299E1" name="Actual" />
                                <Bar dataKey="target" fill="#E2E8F0" name="Target" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardBody>
                      </Card>

                      <Card>
                        <CardHeader>
                          <Heading size="sm">Success Rate</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4}>
                            <Box width="100px" height="100px">
                              <CircularProgressbar
                                value={94.7}
                                text="94.7%"
                                styles={buildStyles({
                                  textColor: '#38A169',
                                  pathColor: '#38A169',
                                  trailColor: '#E2E8F0'
                                })}
                              />
                            </Box>
                            <Text textAlign="center" fontSize="sm" color={mutedColor}>
                              Overall Success Rate
                            </Text>
                            <Badge colorScheme="green" size="sm">
                              +5.2% from last month
                            </Badge>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    {/* Business Impact Metrics */}
                    <Card>
                      <CardHeader>
                        <Heading size="sm">Business Impact & ROI</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                          <VStack spacing={2}>
                            <Icon as={FiShield} size="24px" color="green.500" />
                            <Stat textAlign="center">
                              <StatNumber fontSize="xl" color="green.600">
                                $2.45M
                              </StatNumber>
                              <StatLabel fontSize="sm">Cost Avoidance</StatLabel>
                            </Stat>
                          </VStack>

                          <VStack spacing={2}>
                            <Icon as={FiLock} size="24px" color="blue.500" />
                            <Stat textAlign="center">
                              <StatNumber fontSize="xl" color="blue.600">
                                156
                              </StatNumber>
                              <StatLabel fontSize="sm">Protected Assets</StatLabel>
                            </Stat>
                          </VStack>

                          <VStack spacing={2}>
                            <Icon as={FiEye} size="24px" color="purple.500" />
                            <Stat textAlign="center">
                              <StatNumber fontSize="xl" color="purple.600">
                                89
                              </StatNumber>
                              <StatLabel fontSize="sm">Blocked Attacks</StatLabel>
                            </Stat>
                          </VStack>

                          <VStack spacing={2}>
                            <Icon as={FiTrendingUp} size="24px" color="orange.500" />
                            <Stat textAlign="center">
                              <StatNumber fontSize="xl" color="orange.600">
                                87.3%
                              </StatNumber>
                              <StatLabel fontSize="sm">Risk Reduction</StatLabel>
                            </Stat>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Top Threat Vectors */}
                    <Card>
                      <CardHeader>
                        <Heading size="sm">Top Threat Vectors (Last 30 Days)</Heading>
                      </CardHeader>
                      <CardBody>
                        <TableContainer>
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Threat Vector</Th>
                                <Th isNumeric>Paths Detected</Th>
                                <Th>Trend</Th>
                                <Th isNumeric>Avg. Severity</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td fontWeight="bold">Phishing</Td>
                                <Td isNumeric>18</Td>
                                <Td>
                                  <HStack>
                                    <Icon as={FiTrendingUp} color="red.500" />
                                    <Text fontSize="sm" color="red.500">+12.5%</Text>
                                  </HStack>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme="orange">High</Badge>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Malware</Td>
                                <Td isNumeric>14</Td>
                                <Td>
                                  <HStack>
                                    <Icon as={FiTrendingDown} color="green.500" />
                                    <Text fontSize="sm" color="green.500">-8.3%</Text>
                                  </HStack>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme="red">Critical</Badge>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Insider Threat</Td>
                                <Td isNumeric>8</Td>
                                <Td>
                                  <HStack>
                                    <Icon as={FiTrendingUp} color="red.500" />
                                    <Text fontSize="sm" color="red.500">+25.0%</Text>
                                  </HStack>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme="yellow">Medium</Badge>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td fontWeight="bold">Supply Chain</Td>
                                <Td isNumeric>5</Td>
                                <Td>
                                  <HStack>
                                    <Icon as={FiActivity} color="gray.500" />
                                    <Text fontSize="sm" color="gray.500">+2.1%</Text>
                                  </HStack>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme="orange">High</Badge>
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </MotionCard>
      </MotionBox>
    </Box>
  )
}

export default ExecutiveDashboardSOC

