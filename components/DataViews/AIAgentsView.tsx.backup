import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Badge,
  List,
  ListItem,
  Progress,
  VStack,
  HStack,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorModeValue,
  Icon,
  Divider,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Select,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaRobot, FaShieldAlt, FaSearch, FaExclamationTriangle, FaEye, FaClock, FaBolt } from 'react-icons/fa'

// Mock data generator for agent activities
const generateActivity = () => ({
  id: Math.random().toString(36).substr(2, 9),
  time: new Date().toLocaleTimeString(),
  agent: `Agent-${Math.ceil(Math.random() * 50)}`,
  action: [
    "scanned node for vulnerabilities",
    "detected logic bomb",
    "patched misconfiguration",
    "flagged suspicious pattern",
    "identified threat vector",
    "analyzed network traffic",
    "discovered unauthorized access",
    "mitigated potential breach"
  ][Math.floor(Math.random() * 8)],
  target: `Node-${Math.ceil(Math.random() * 300)}`,
  severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
  category: ["Vulnerability", "Logic Bomb", "Threat", "Anomaly", "Prevention"][Math.floor(Math.random() * 5)]
})

const generateAgent = (id: number) => ({
  id: `agent-${id}`,
  name: `Agent-${id}`,
  nickname: [
    "Sentinel", "Guardian", "Hunter", "Analyzer", "Defender", "Scanner", "Watcher", "Protector"
  ][Math.floor(Math.random() * 8)] + `-${id}`,
  status: ["Idle", "Investigating", "Responding", "Active"][Math.floor(Math.random() * 4)],
  currentTask: [
    "Threat hunting", "Vulnerability scan", "Logic bomb search", "Anomaly detection",
    "Network monitoring", "Access control audit", "Pattern analysis", "Risk assessment"
  ][Math.floor(Math.random() * 8)],
  type: ["threat-hunter", "logic-bomb-detector", "vulnerability-scanner", "anomaly-detector"][Math.floor(Math.random() * 4)],
  role: [
    "Threat Detection Specialist", "Anomaly Analyzer", "Incident Responder", "Vulnerability Hunter",
    "Network Monitor", "Security Analyst", "Risk Assessor", "Compliance Officer"
  ][Math.floor(Math.random() * 8)],
  priority: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
  findings: Math.floor(Math.random() * 50),
  alertsRaised: Math.floor(Math.random() * 20),
  efficiency: Math.floor(Math.random() * 100),
  lastActive: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
  tokenUsage: Math.floor(Math.random() * 1000),
  maxTokens: 1000,
  tokenCost: Math.floor(Math.random() * 50) + 10
})

interface AIAgentsViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect: (nodeId: string) => void
}

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const AIAgentsView: React.FC<AIAgentsViewProps> = ({ nodes, edges, selectedNodes, onNodeSelect }) => {
  const [activities, setActivities] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [threatSummary, setThreatSummary] = useState({
    currentIncidents: 0,
    openVulnerabilities: 0,
    activeInvestigations: 0,
    threatsByCategory: {
      "Vulnerability": 0,
      "Logic Bomb": 0,
      "Threat": 0,
      "Anomaly": 0,
      "Prevention": 0
    }
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [isEditingAgent, setIsEditingAgent] = useState(false)
  const [editedAgent, setEditedAgent] = useState<any>(null)

  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  // Initialize agents
  useEffect(() => {
    const initialAgents = Array.from({ length: Math.floor(Math.random() * 30) + 20 }, (_, i) => generateAgent(i + 1))
    setAgents(initialAgents)

    // Initialize with some activities
    const initialActivities = Array.from({ length: 15 }, () => generateActivity())
    setActivities(initialActivities)
  }, [])

  // Mock activity feed update
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = generateActivity()
      setActivities((prev) => [newActivity, ...prev.slice(0, 99)])

      // Update threat summary
      setThreatSummary(prev => ({
        ...prev,
        currentIncidents: prev.currentIncidents + (newActivity.severity === 'Critical' ? 1 : 0),
        openVulnerabilities: prev.openVulnerabilities + (newActivity.category === 'Vulnerability' ? 1 : 0),
        activeInvestigations: prev.activeInvestigations + (Math.random() > 0.7 ? 1 : 0),
        threatsByCategory: {
          ...prev.threatsByCategory,
          [newActivity.category]: prev.threatsByCategory[newActivity.category as keyof typeof prev.threatsByCategory] + 1
        }
      }))

      // Update random agent metrics
      setAgents(prev => prev.map(agent =>
        Math.random() > 0.8 ? {
          ...agent,
          findings: agent.findings + Math.floor(Math.random() * 3),
          alertsRaised: agent.alertsRaised + (Math.random() > 0.9 ? 1 : 0),
          lastActive: new Date().toLocaleTimeString()
        } : agent
      ))
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green'
      case 'Investigating': return 'orange'
      case 'Responding': return 'red'
      case 'Idle': return 'gray'
      default: return 'gray'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'red'
      case 'High': return 'orange'
      case 'Medium': return 'yellow'
      case 'Low': return 'green'
      default: return 'gray'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'threat-hunter': return FaSearch
      case 'logic-bomb-detector': return FaExclamationTriangle
      case 'vulnerability-scanner': return FaShieldAlt
      case 'anomaly-detector': return FaEye
      default: return FaRobot
    }
  }

  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent)
    setEditedAgent({ ...agent })
    setIsEditingAgent(false)
    onOpen()
  }

  const handleEditAgent = () => {
    setIsEditingAgent(true)
  }

  const handleSaveAgent = () => {
    setAgents(prev => prev.map(agent =>
      agent.id === editedAgent.id ? { ...editedAgent } : agent
    ))
    setSelectedAgent(editedAgent)
    setIsEditingAgent(false)
  }

  const handleCancelEdit = () => {
    setEditedAgent({ ...selectedAgent })
    setIsEditingAgent(false)
  }

  const handleResetTokens = () => {
    setEditedAgent((prev: any) => ({ ...prev, tokenUsage: 0 }))
  }

  const updateEditedAgent = (field: string, value: any) => {
    setEditedAgent((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <Box p={6} bg={bgColor} minH="100%" w="100%">
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={6}
      >
        <Heading size="lg" mb={2}>🤖 AI Agents Dashboard</Heading>
        <Text color="gray.600" fontSize="sm">
          Real-time monitoring of {agents.length} AI agents scanning your Neo4j dataset for SOC-relevant threats
        </Text>
      </MotionBox>

      {/* Content Area */}
      <VStack spacing={4} align="stretch">

        {/* Threat Summary Widgets */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Current Incidents</StatLabel>
                <StatNumber color="red.500">{threatSummary.currentIncidents}</StatNumber>
                <StatHelpText>Active security incidents</StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Open Vulnerabilities</StatLabel>
                <StatNumber color="orange.500">{threatSummary.openVulnerabilities}</StatNumber>
                <StatHelpText>Unpatched security issues</StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Active Investigations</StatLabel>
                <StatNumber color="blue.500">{threatSummary.activeInvestigations}</StatNumber>
                <StatHelpText>Ongoing agent investigations</StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <CardBody>
              <Stat>
                <StatLabel>Agents Online</StatLabel>
                <StatNumber color="green.500">{agents.filter(a => a.status !== 'Idle').length}</StatNumber>
                <StatHelpText>Active AI agents</StatHelpText>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Real-time Performance Graphs */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <CardHeader>
            <Heading size="md">Real-time Performance Analytics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="gray.600">Detection Accuracy</Text>
                <Box>
                  <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">94.2%</Text>
                    <Text fontSize="sm" color="green.400">↗ +2.1%</Text>
                  </HStack>
                  <Progress value={94.2} colorScheme="green" size="sm" mt={2} />
                </Box>
                <Text fontSize="xs" color="gray.500">Last 24 hours</Text>
              </VStack>

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="gray.600">Response Time</Text>
                <Box>
                  <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">1.8s</Text>
                    <Text fontSize="sm" color="red.400">↗ +0.3s</Text>
                  </HStack>
                  <Progress value={75} colorScheme="blue" size="sm" mt={2} />
                </Box>
                <Text fontSize="xs" color="gray.500">Average response</Text>
              </VStack>

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="gray.600">Threat Mitigation</Text>
                <Box>
                  <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">87.3%</Text>
                    <Text fontSize="sm" color="green.400">↗ +5.2%</Text>
                  </HStack>
                  <Progress value={87.3} colorScheme="orange" size="sm" mt={2} />
                </Box>
                <Text fontSize="xs" color="gray.500">Success rate</Text>
              </VStack>

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="gray.600">False Positive Rate</Text>
                <Box>
                  <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">3.2%</Text>
                    <Text fontSize="sm" color="green.400">↘ -0.8%</Text>
                  </HStack>
                  <Progress value={16.8} colorScheme="purple" size="sm" mt={2} />
                </Box>
                <Text fontSize="xs" color="gray.500">Current rate</Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </MotionCard>

        {/* Predictive Analytics Section */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <CardHeader>
            <Heading size="md">Predictive Cyber Risk Analytics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="red.600">🚨 High Risk Alert</Text>
                <Text fontSize="sm">Potential zero-day vulnerability in authentication system detected. Risk level: Critical</Text>
                <HStack>
                  <Badge colorScheme="red">95% confidence</Badge>
                  <Text fontSize="xs" color="gray.500">2 hours ago</Text>
                </HStack>
              </VStack>

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="orange.600">⚠️ Emerging Threat</Text>
                <Text fontSize="sm">Unusual network traffic patterns suggest possible lateral movement. Monitor closely.</Text>
                <HStack>
                  <Badge colorScheme="orange">78% confidence</Badge>
                  <Text fontSize="xs" color="gray.500">15 minutes ago</Text>
                </HStack>
              </VStack>

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="bold" color="blue.600">🔮 Future Projection</Text>
                <Text fontSize="sm">Based on current trends, vulnerability count may increase by 23% in next 7 days.</Text>
                <HStack>
                  <Badge colorScheme="blue">82% accuracy</Badge>
                  <Text fontSize="xs" color="gray.500">Model prediction</Text>
                </HStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </MotionCard>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          {/* Left Column - Agent List and Activity Feed */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Agent List */}
              <MotionCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <CardHeader>
                  <Heading size="md">Agent Status Panel</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns={{ base: "repeat(auto-fill, minmax(250px, 1fr))", md: "repeat(auto-fill, minmax(300px, 1fr))" }} gap={4}>
                    {agents.map((agent) => (
                      <MotionBox
                        key={agent.id}
                        p={4}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="lg"
                        bg={cardBg}
                        cursor="pointer"
                        onClick={() => handleAgentClick(agent)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Icon as={getTypeIcon(agent.type)} color="blue.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="sm">{agent.name}</Text>
                                <Text fontSize="xs" color="gray.500">{agent.nickname}</Text>
                              </VStack>
                            </HStack>
                            <Badge colorScheme={getStatusColor(agent.status)} fontSize="xs">
                              {agent.status}
                            </Badge>
                          </HStack>

                          <Text fontSize="xs" color="gray.600">{agent.currentTask}</Text>

                          <HStack w="full" justify="space-between">
                            <Text fontSize="xs">Findings: {agent.findings}</Text>
                            <Text fontSize="xs">Alerts: {agent.alertsRaised}</Text>
                          </HStack>

                          <Progress value={agent.efficiency} size="xs" colorScheme="blue" w="full" />
                          <Text fontSize="xs" color="gray.500">Efficiency: {agent.efficiency}%</Text>
                        </VStack>
                      </MotionBox>
                    ))}
                  </Grid>
                </CardBody>
              </MotionCard>

              {/* Live Activity Feed */}
              <MotionCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <CardHeader>
                  <Heading size="md">Live Activity Feed</Heading>
                </CardHeader>
                <CardBody>
                  <Box maxH="400px" overflowY="auto">
                    <VStack spacing={2} align="stretch">
                      {activities.slice(0, 20).map((activity, idx) => (
                        <MotionBox
                          key={activity.id}
                          p={3}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          bg={cardBg}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack>
                                <Badge colorScheme={getSeverityColor(activity.severity)} fontSize="xs">
                                  {activity.severity}
                                </Badge>
                                <Badge colorScheme="blue" fontSize="xs">
                                  {activity.category}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm">
                                <strong>{activity.agent}</strong> {activity.action} on <strong>{activity.target}</strong>
                              </Text>
                            </VStack>
                            <Text fontSize="xs" color="gray.500">{activity.time}</Text>
                          </HStack>
                        </MotionBox>
                      ))}
                    </VStack>
                  </Box>
                </CardBody>
              </MotionCard>
            </VStack>
          </GridItem>

          {/* Right Column - Threat Summary and Performance */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Threat Categories */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <CardHeader>
                  <Heading size="md">Threats by Category</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {Object.entries(threatSummary.threatsByCategory).map(([category, count]) => (
                      <HStack key={category} justify="space-between">
                        <Text fontSize="sm">{category}</Text>
                        <Badge colorScheme={count > 10 ? 'red' : count > 5 ? 'orange' : 'green'}>
                          {count}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Performance Metrics */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <CardHeader>
                  <Heading size="md">Performance Metrics</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">Detection Speed</Text>
                        <Text fontSize="sm" fontWeight="bold">2.3s avg</Text>
                      </HStack>
                      <Progress value={85} colorScheme="green" size="sm" />
                    </Box>

                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">False Positive Rate</Text>
                        <Text fontSize="sm" fontWeight="bold">3.2%</Text>
                      </HStack>
                      <Progress value={12} colorScheme="blue" size="sm" />
                    </Box>

                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">System Uptime</Text>
                        <Text fontSize="sm" fontWeight="bold">99.8%</Text>
                      </HStack>
                      <Progress value={99.8} colorScheme="purple" size="sm" />
                    </Box>

                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">Agent Utilization</Text>
                        <Text fontSize="sm" fontWeight="bold">87%</Text>
                      </HStack>
                      <Progress value={87} colorScheme="orange" size="sm" />
                    </Box>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Collaboration Tools */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <CardHeader>
                  <Heading size="md">Agent Collaboration</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Button size="sm" colorScheme="purple" variant="outline">
                      Delegate: Threat Hunter → Vulnerability Scanner
                    </Button>
                    <Button size="sm" colorScheme="teal" variant="outline">
                      Task Transfer: Anomaly Detector → Incident Responder
                    </Button>
                    <Button size="sm" colorScheme="cyan" variant="outline">
                      Joint Investigation: Multi-Agent Analysis
                    </Button>
                    <Divider />
                    <Text fontSize="xs" color="gray.600" fontWeight="bold">Active Collaborations:</Text>
                    <VStack spacing={1} align="stretch">
                      <Text fontSize="xs">• Agent-7 ↔ Agent-12 (threat correlation)</Text>
                      <Text fontSize="xs">• Agent-3 → Agent-15 (evidence sharing)</Text>
                      <Text fontSize="xs">• Agent-9 → Agent-22 (pattern analysis)</Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Simulated Attack Scenarios */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <CardHeader>
                  <Heading size="md">Training Scenarios</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Button size="sm" colorScheme="red" variant="outline">
                      🏴‍☠️ Ransomware Simulation
                    </Button>
                    <Button size="sm" colorScheme="orange" variant="outline">
                      🎯 APT Attack Chain
                    </Button>
                    <Button size="sm" colorScheme="yellow" variant="outline">
                      🔓 Zero-Day Exploitation
                    </Button>
                    <Button size="sm" colorScheme="green" variant="outline">
                      🕵️ Insider Threat Exercise
                    </Button>
                    <Divider />
                    <Text fontSize="xs" color="gray.600" fontWeight="bold">Scenario Status:</Text>
                    <Alert status="info" size="sm" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="xs">Active: DDoS Attack Simulation</AlertTitle>
                        <AlertDescription fontSize="xs">
                          Testing agent response to volumetric attacks
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* AI Capabilities Highlight */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <CardHeader>
                  <Heading size="md">AI Capabilities</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack>
                      <Icon as={FaSearch} color="blue.500" />
                      <Text fontSize="sm">Proactive Threat Hunting</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaShieldAlt} color="green.500" />
                      <Text fontSize="sm">Automated Patching</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaEye} color="purple.500" />
                      <Text fontSize="sm">Behavioral Analysis</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaBolt} color="orange.500" />
                      <Text fontSize="sm">SIEM Integration</Text>
                    </HStack>
                    <Divider />
                    <Text fontSize="xs" color="gray.600">
                      <strong>Real-time Orchestration:</strong> AI agents continuously monitor, analyze, and respond to threats 24/7, reducing response time by 89%.
                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      {/* Agent Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between" w="full">
              <HStack>
                <Icon as={getTypeIcon(selectedAgent?.type)} />
                <Text>{selectedAgent?.name} - {selectedAgent?.nickname}</Text>
              </HStack>
              <HStack>
                {!isEditingAgent ? (
                  <Button size="sm" colorScheme="blue" onClick={handleEditAgent}>
                    Edit Agent
                  </Button>
                ) : (
                  <>
                    <Button size="sm" colorScheme="green" onClick={handleSaveAgent}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                )}
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAgent && editedAgent && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge colorScheme={getStatusColor(selectedAgent.status)} fontSize="sm">
                    {selectedAgent.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">Last active: {selectedAgent.lastActive}</Text>
                </HStack>

                <Divider />

                <Tabs>
                  <TabList>
                    <Tab>Configuration</Tab>
                    <Tab>Activities</Tab>
                    <Tab>Performance</Tab>
                    <Tab>Token Usage</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <SimpleGrid columns={2} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">Agent Name</FormLabel>
                            {isEditingAgent ? (
                              <Input
                                value={editedAgent.name}
                                onChange={(e) => updateEditedAgent('name', e.target.value)}
                                size="sm"
                              />
                            ) : (
                              <Text fontWeight="medium">{selectedAgent.name}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm">Priority Level</FormLabel>
                            {isEditingAgent ? (
                              <Select
                                value={editedAgent.priority}
                                onChange={(e) => updateEditedAgent('priority', e.target.value)}
                                size="sm"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </Select>
                            ) : (
                              <Badge colorScheme={
                                selectedAgent.priority === 'High' ? 'red' :
                                selectedAgent.priority === 'Medium' ? 'orange' : 'green'
                              }>
                                {selectedAgent.priority}
                              </Badge>
                            )}
                          </FormControl>
                        </SimpleGrid>

                        <FormControl>
                          <FormLabel fontSize="sm">Agent Role</FormLabel>
                          {isEditingAgent ? (
                            <Select
                              value={editedAgent.role}
                              onChange={(e) => updateEditedAgent('role', e.target.value)}
                              size="sm"
                            >
                              <option value="Threat Detection Specialist">Threat Detection Specialist</option>
                              <option value="Anomaly Analyzer">Anomaly Analyzer</option>
                              <option value="Incident Responder">Incident Responder</option>
                              <option value="Vulnerability Hunter">Vulnerability Hunter</option>
                              <option value="Network Monitor">Network Monitor</option>
                              <option value="Security Analyst">Security Analyst</option>
                              <option value="Risk Assessor">Risk Assessor</option>
                              <option value="Compliance Officer">Compliance Officer</option>
                            </Select>
                          ) : (
                            <Text>{selectedAgent.role}</Text>
                          )}
                        </FormControl>

                        <Box>
                          <Text fontWeight="bold">Current Task:</Text>
                          <Text>{selectedAgent.currentTask}</Text>
                        </Box>

                        <Box>
                          <Text fontWeight="bold">Agent Type:</Text>
                          <Text>{selectedAgent.type.replace('-', ' ').toUpperCase()}</Text>
                        </Box>

                        <HStack justify="space-between">
                          <Box>
                            <Text fontWeight="bold">Findings:</Text>
                            <Text>{selectedAgent.findings}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Alerts Raised:</Text>
                            <Text>{selectedAgent.alertsRaised}</Text>
                          </Box>
                        </HStack>
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                        {activities.filter(a => a.agent === selectedAgent.name).slice(0, 10).map((activity: any) => (
                          <Box key={activity.id} p={2} border="1px solid" borderColor={borderColor} borderRadius="md">
                            <HStack justify="space-between">
                              <Text fontSize="sm">{activity.action} on {activity.target}</Text>
                              <Badge colorScheme={getSeverityColor(activity.severity)} fontSize="xs">
                                {activity.severity}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">{activity.time}</Text>
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Efficiency Rating:</Text>
                            <Text fontSize="sm">{selectedAgent.efficiency}%</Text>
                          </HStack>
                          <Progress value={selectedAgent.efficiency} colorScheme="blue" size="lg" />
                        </Box>

                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontWeight="bold">Detection Accuracy:</Text>
                            <Text>94.2%</Text>
                            <Progress value={94.2} colorScheme="green" size="sm" mt={1} />
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Response Time:</Text>
                            <Text>1.8s avg</Text>
                            <Progress value={85} colorScheme="purple" size="sm" mt={1} />
                          </Box>
                        </SimpleGrid>

                        <Box>
                          <Text fontWeight="bold">Threat Mitigation Success:</Text>
                          <Text>87.3%</Text>
                          <Progress value={87.3} colorScheme="orange" size="sm" mt={1} />
                        </Box>
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <HStack justify="space-between" align="center">
                            <Text fontWeight="bold">Token Usage</Text>
                            <Button size="xs" colorScheme="red" onClick={handleResetTokens}>
                              Reset Tokens
                            </Button>
                          </HStack>
                          <Progress
                            value={(editedAgent.tokenUsage / editedAgent.maxTokens) * 100}
                            colorScheme={editedAgent.tokenUsage > editedAgent.maxTokens * 0.8 ? 'red' : 'blue'}
                            size="lg"
                            mt={2}
                          />
                          <HStack justify="space-between" fontSize="sm">
                            <Text>{editedAgent.tokenUsage} / {editedAgent.maxTokens} tokens used</Text>
                            <Text color={editedAgent.tokenUsage > editedAgent.maxTokens * 0.8 ? 'red.500' : 'gray.600'}>
                              {((editedAgent.tokenUsage / editedAgent.maxTokens) * 100).toFixed(1)}%
                            </Text>
                          </HStack>
                        </Box>

                        <SimpleGrid columns={2} spacing={4}>
                          <Box p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">Cost per Task</Text>
                            <Text fontSize="lg" fontWeight="bold">${editedAgent.tokenCost}</Text>
                          </Box>
                          <Box p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                            <Text fontSize="sm" fontWeight="bold" color="gray.600">Projected Cost</Text>
                            <Text fontSize="lg" fontWeight="bold">
                              ${(editedAgent.tokenUsage * editedAgent.tokenCost / 1000).toFixed(2)}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        {isEditingAgent && (
                          <FormControl>
                            <FormLabel fontSize="sm">Max Tokens</FormLabel>
                            <NumberInput
                              value={editedAgent.maxTokens}
                              onChange={(valueString) => updateEditedAgent('maxTokens', parseInt(valueString))}
                              min={100}
                              max={10000}
                              size="sm"
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AIAgentsView