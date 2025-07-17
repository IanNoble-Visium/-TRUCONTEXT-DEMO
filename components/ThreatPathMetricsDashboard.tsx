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
  TabPanel
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
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
  LineChart,
  Line,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  RadialBarChart,
  RadialBar
} from 'recharts'
import {
  FiTarget,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiBarChart3,
  FiPieChart,
  FiMap,
  FiLayers,
  FiZap,
  FiEye,
  FiLock,
  FiUnlock
} from 'react-icons/fi'

const MotionCard = motion(Card)

interface ThreatPathMetricsDashboardProps {
  threatPaths?: any[]
  actions?: any[]
  workflows?: any[]
  timeRange?: '24h' | '7d' | '30d' | '90d'
}

const ThreatPathMetricsDashboard: React.FC<ThreatPathMetricsDashboardProps> = ({
  threatPaths = [],
  actions = [],
  workflows = [],
  timeRange = '24h'
}) => {
  const [metrics, setMetrics] = useState({
    totalThreatPaths: 47,
    activeThreatPaths: 12,
    criticalPaths: 3,
    meanTimeToDetection: 8.5,
    meanTimeToResponse: 15.2,
    meanTimeToContainment: 45.8,
    meanTimeToRecovery: 180.5,
    automationRate: 73.2,
    successRate: 94.7,
    riskReduction: 87.3,
    costAvoidance: 2450000,
    affectedAssets: 156,
    blockedAttacks: 89,
    falsePositiveRate: 4.2
  })

  const [trends, setTrends] = useState({
    detectionTrend: 12.5,
    responseTrend: -8.3,
    containmentTrend: -15.7,
    automationTrend: 18.9,
    successTrend: 5.2
  })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  // Mock data for threat path trends over time
  const threatPathTrends = [
    { date: '2024-01-01', detected: 15, contained: 12, resolved: 10, cost: 125000 },
    { date: '2024-01-02', detected: 18, contained: 16, resolved: 14, cost: 98000 },
    { date: '2024-01-03', detected: 12, contained: 11, resolved: 11, cost: 67000 },
    { date: '2024-01-04', detected: 22, contained: 19, resolved: 16, cost: 156000 },
    { date: '2024-01-05', detected: 16, contained: 15, resolved: 13, cost: 89000 },
    { date: '2024-01-06', detected: 14, contained: 13, resolved: 12, cost: 78000 },
    { date: '2024-01-07', detected: 19, contained: 17, resolved: 15, cost: 112000 }
  ]

  // Response time distribution data
  const responseTimeDistribution = [
    { timeRange: '0-5 min', count: 23, percentage: 32.4 },
    { timeRange: '5-15 min', count: 28, percentage: 39.4 },
    { timeRange: '15-30 min', count: 15, percentage: 21.1 },
    { timeRange: '30-60 min', count: 4, percentage: 5.6 },
    { timeRange: '60+ min', count: 1, percentage: 1.4 }
  ]

  // Threat path severity distribution
  const severityDistribution = [
    { severity: 'Critical', count: 3, color: '#E53E3E' },
    { severity: 'High', count: 8, color: '#DD6B20' },
    { severity: 'Medium', count: 21, color: '#D69E2E' },
    { severity: 'Low', count: 15, color: '#38A169' }
  ]

  // Action effectiveness data
  const actionEffectiveness = [
    { type: 'Containment', automated: 95, manual: 87, total: 91 },
    { type: 'Investigation', automated: 78, manual: 92, total: 85 },
    { type: 'Remediation', automated: 89, manual: 83, total: 86 },
    { type: 'Prevention', automated: 82, manual: 88, total: 85 }
  ]

  // Risk reduction over time
  const riskReductionData = [
    { month: 'Oct', baseline: 100, current: 87, reduction: 13 },
    { month: 'Nov', baseline: 100, current: 82, reduction: 18 },
    { month: 'Dec', baseline: 100, current: 78, reduction: 22 },
    { month: 'Jan', baseline: 100, current: 73, reduction: 27 }
  ]

  // Top threat vectors
  const topThreatVectors = [
    { vector: 'Phishing', count: 18, trend: 'up', change: 12.5 },
    { vector: 'Malware', count: 14, trend: 'down', change: -8.3 },
    { vector: 'Insider Threat', count: 8, trend: 'up', change: 25.0 },
    { vector: 'Supply Chain', count: 5, trend: 'stable', change: 2.1 },
    { vector: 'Zero-day', count: 2, trend: 'down', change: -33.3 }
  ]

  const renderKPICards = () => (
    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiTarget} size="24px" color="blue.500" />
            <Stat>
              <StatNumber fontSize="2xl">
                <CountUp end={metrics.totalThreatPaths} duration={2} />
              </StatNumber>
              <StatLabel fontSize="sm">Total Paths</StatLabel>
              <StatHelpText>
                <StatArrow type="increase" />
                12.5%
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiActivity} size="24px" color="orange.500" />
            <Stat>
              <StatNumber fontSize="2xl">
                <CountUp end={metrics.activeThreatPaths} duration={2} />
              </StatNumber>
              <StatLabel fontSize="sm">Active Paths</StatLabel>
              <StatHelpText>
                <StatArrow type="decrease" />
                8.3%
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiAlertTriangle} size="24px" color="red.500" />
            <Stat>
              <StatNumber fontSize="2xl">
                <CountUp end={metrics.criticalPaths} duration={2} />
              </StatNumber>
              <StatLabel fontSize="sm">Critical Paths</StatLabel>
              <StatHelpText>
                <StatArrow type="decrease" />
                25.0%
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiClock} size="24px" color="green.500" />
            <Stat>
              <StatNumber fontSize="2xl">
                <CountUp end={metrics.meanTimeToDetection} decimals={1} duration={2} />m
              </StatNumber>
              <StatLabel fontSize="sm">MTTD</StatLabel>
              <StatHelpText>
                <StatArrow type="increase" />
                {trends.detectionTrend}%
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiZap} size="24px" color="purple.500" />
            <Stat>
              <StatNumber fontSize="2xl">
                <CountUp end={metrics.automationRate} decimals={1} duration={2} />%
              </StatNumber>
              <StatLabel fontSize="sm">Automation</StatLabel>
              <StatHelpText>
                <StatArrow type="increase" />
                {trends.automationTrend}%
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiCheckCircle} size="24px" color="teal.500" />
            <Stat>
              <StatNumber fontSize="2xl">
                <CountUp end={metrics.successRate} decimals={1} duration={2} />%
              </StatNumber>
              <StatLabel fontSize="sm">Success Rate</StatLabel>
              <StatHelpText>
                <StatArrow type="increase" />
                {trends.successTrend}%
              </StatHelpText>
            </Stat>
          </VStack>
        </CardBody>
      </MotionCard>
    </SimpleGrid>
  )

  const renderThreatPathTrends = () => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Threat Path Trends</Heading>
          <Badge colorScheme="blue">{timeRange}</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={threatPathTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Bar yAxisId="left" dataKey="detected" fill="#3182CE" name="Detected" />
              <Bar yAxisId="left" dataKey="contained" fill="#38A169" name="Contained" />
              <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#E53E3E" strokeWidth={3} name="Cost Impact ($)" />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  )

  const renderResponseTimeMetrics = () => (
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Card>
        <CardHeader>
          <Heading size="md">Response Time Distribution</Heading>
        </CardHeader>
        <CardBody>
          <Box height="250px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeRange" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#4299E1" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Severity Distribution</Heading>
        </CardHeader>
        <CardBody>
          <Box height="250px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ severity, percentage }) => `${severity}: ${((count / severityDistribution.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%`}
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
    </Grid>
  )

  const renderActionEffectiveness = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Action Effectiveness Analysis</Heading>
      </CardHeader>
      <CardBody>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={actionEffectiveness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip />
              <Bar dataKey="automated" fill="#4299E1" name="Automated" />
              <Bar dataKey="manual" fill="#48BB78" name="Manual" />
              <Bar dataKey="total" fill="#ED8936" name="Overall" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  )

  const renderRiskReduction = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Risk Reduction Over Time</Heading>
      </CardHeader>
      <CardBody>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskReductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Area type="monotone" dataKey="baseline" stackId="1" stroke="#E2E8F0" fill="#E2E8F0" name="Baseline Risk" />
              <Area type="monotone" dataKey="current" stackId="2" stroke="#4299E1" fill="#4299E1" name="Current Risk" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  )

  const renderTopThreatVectors = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Top Threat Vectors</Heading>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Threat Vector</Th>
                <Th isNumeric>Count</Th>
                <Th>Trend</Th>
                <Th isNumeric>Change</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topThreatVectors.map((vector, index) => (
                <Tr key={index}>
                  <Td fontWeight="bold">{vector.vector}</Td>
                  <Td isNumeric>{vector.count}</Td>
                  <Td>
                    <HStack>
                      <Icon 
                        as={vector.trend === 'up' ? FiTrendingUp : vector.trend === 'down' ? FiTrendingDown : FiActivity}
                        color={vector.trend === 'up' ? 'red.500' : vector.trend === 'down' ? 'green.500' : 'gray.500'}
                      />
                      <Text fontSize="sm" textTransform="capitalize">{vector.trend}</Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>
                    <Text color={vector.change > 0 ? 'red.500' : vector.change < 0 ? 'green.500' : 'gray.500'}>
                      {vector.change > 0 ? '+' : ''}{vector.change}%
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  )

  const renderBusinessImpactMetrics = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
      <Card bg="green.50" borderLeft="4px solid" borderLeftColor="green.500">
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiShield} size="24px" color="green.500" />
            <Stat>
              <StatNumber fontSize="xl" color="green.600">
                ${(metrics.costAvoidance / 1000000).toFixed(1)}M
              </StatNumber>
              <StatLabel fontSize="sm">Cost Avoidance</StatLabel>
            </Stat>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="blue.50" borderLeft="4px solid" borderLeftColor="blue.500">
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiLock} size="24px" color="blue.500" />
            <Stat>
              <StatNumber fontSize="xl" color="blue.600">
                <CountUp end={metrics.affectedAssets} duration={2} />
              </StatNumber>
              <StatLabel fontSize="sm">Protected Assets</StatLabel>
            </Stat>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="purple.50" borderLeft="4px solid" borderLeftColor="purple.500">
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiEye} size="24px" color="purple.500" />
            <Stat>
              <StatNumber fontSize="xl" color="purple.600">
                <CountUp end={metrics.blockedAttacks} duration={2} />
              </StatNumber>
              <StatLabel fontSize="sm">Blocked Attacks</StatLabel>
            </Stat>
          </VStack>
        </CardBody>
      </Card>

      <Card bg="orange.50" borderLeft="4px solid" borderLeftColor="orange.500">
        <CardBody textAlign="center">
          <VStack spacing={2}>
            <Icon as={FiBarChart3} size="24px" color="orange.500" />
            <Stat>
              <StatNumber fontSize="xl" color="orange.600">
                {metrics.riskReduction.toFixed(1)}%
              </StatNumber>
              <StatLabel fontSize="sm">Risk Reduction</StatLabel>
            </Stat>
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  )

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={textColor}>
              Threat Path Analysis Dashboard
            </Heading>
            <Text color={mutedColor}>
              Comprehensive metrics and trends for Attack Path Analysis (APA)
            </Text>
          </VStack>
          <HStack>
            <Button size="sm" variant="outline">Export Report</Button>
            <Button size="sm" colorScheme="blue">Generate Alert</Button>
          </HStack>
        </HStack>

        {/* KPI Cards */}
        {renderKPICards()}

        {/* Main Charts */}
        <Tabs>
          <TabList>
            <Tab>Trends & Analytics</Tab>
            <Tab>Response Metrics</Tab>
            <Tab>Business Impact</Tab>
            <Tab>Threat Intelligence</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={6}>
                {renderThreatPathTrends()}
                {renderActionEffectiveness()}
                {renderRiskReduction()}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6}>
                {renderResponseTimeMetrics()}
                <Grid templateColumns="2fr 1fr" gap={6}>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Mean Time Metrics Trend</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={threatPathTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="detected" stroke="#3182CE" strokeWidth={2} name="Detection Time" />
                            <Line type="monotone" dataKey="contained" stroke="#38A169" strokeWidth={2} name="Containment Time" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="md">Performance Score</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <Box width="120px" height="120px">
                          <CircularProgressbar
                            value={metrics.successRate}
                            text={`${metrics.successRate.toFixed(1)}%`}
                            styles={buildStyles({
                              textColor: '#4299E1',
                              pathColor: '#4299E1',
                              trailColor: '#E2E8F0'
                            })}
                          />
                        </Box>
                        <Text textAlign="center" fontSize="sm" color={mutedColor}>
                          Overall Success Rate
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6}>
                {renderBusinessImpactMetrics()}
                <Grid templateColumns="1fr 1fr" gap={6}>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Cost Impact Analysis</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={threatPathTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost Impact']} />
                            <Area type="monotone" dataKey="cost" stroke="#E53E3E" fill="#FED7D7" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="md">ROI Metrics</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <Stat textAlign="center">
                          <StatLabel>Security Investment ROI</StatLabel>
                          <StatNumber fontSize="3xl" color="green.500">
                            <CountUp end={340} duration={2} />%
                          </StatNumber>
                          <StatHelpText>
                            <StatArrow type="increase" />
                            Based on cost avoidance
                          </StatHelpText>
                        </Stat>
                        
                        <Divider />
                        
                        <SimpleGrid columns={2} spacing={4} width="100%">
                          <Stat textAlign="center">
                            <StatLabel fontSize="sm">Investment</StatLabel>
                            <StatNumber fontSize="lg">$720K</StatNumber>
                          </Stat>
                          <Stat textAlign="center">
                            <StatLabel fontSize="sm">Savings</StatLabel>
                            <StatNumber fontSize="lg">$2.45M</StatNumber>
                          </Stat>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6}>
                {renderTopThreatVectors()}
                <Grid templateColumns="1fr 1fr" gap={6}>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Attack Vector Trends</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart data={topThreatVectors.slice(0, 4)}>
                            <RadialBar dataKey="count" cornerRadius={10} fill="#4299E1" />
                            <RechartsTooltip />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="md">Threat Intelligence Summary</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text>Active IOCs</Text>
                          <Badge colorScheme="red">1,247</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Threat Feeds</Text>
                          <Badge colorScheme="blue">12</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>MITRE ATT&CK Techniques</Text>
                          <Badge colorScheme="purple">89</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Threat Actors Tracked</Text>
                          <Badge colorScheme="orange">34</Badge>
                        </HStack>
                        
                        <Divider />
                        
                        <Alert status="warning" size="sm">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">New Campaign Detected</AlertTitle>
                            <AlertDescription fontSize="xs">
                              APT29 targeting financial sector
                            </AlertDescription>
                          </Box>
                        </Alert>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default ThreatPathMetricsDashboard

