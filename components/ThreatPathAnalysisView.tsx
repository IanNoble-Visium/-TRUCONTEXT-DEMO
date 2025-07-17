import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Progress,
  Tooltip,
  IconButton,
  Flex,
  Spacer,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner
} from '@chakra-ui/react'
import { 
  SearchIcon, 
  ViewIcon, 
  WarningIcon, 
  TimeIcon, 
  InfoIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  DownloadIcon,
  RepeatIcon,
  SettingsIcon
} from '@chakra-ui/icons'
import { ThreatPathScenario, ThreatPathAnalytics } from '../types/threatPath'

interface ThreatPathAnalysisViewProps {
  nodes: any[]
  edges: any[]
  onPathHighlight: (pathNodes: string[]) => void
  onNodeSelect: (nodeId: string) => void
  onGenerateNewPaths: () => void
}

interface ThreatPathFilter {
  severity: string[]
  attackerType: string[]
  targetAsset: string[]
  riskScore: [number, number]
  searchTerm: string
}

const ThreatPathAnalysisView: React.FC<ThreatPathAnalysisViewProps> = ({
  nodes,
  edges,
  onPathHighlight,
  onNodeSelect,
  onGenerateNewPaths
}) => {
  const [threatPaths, setThreatPaths] = useState<ThreatPathScenario[]>([])
  const [analytics, setAnalytics] = useState<ThreatPathAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPath, setSelectedPath] = useState<ThreatPathScenario | null>(null)
  const [filters, setFilters] = useState<ThreatPathFilter>({
    severity: [],
    attackerType: [],
    targetAsset: [],
    riskScore: [0, 20], // Increased range to accommodate API risk scores up to 12+
    searchTerm: ''
  })
  const [sortBy, setSortBy] = useState<'riskScore' | 'likelihood' | 'impact' | 'createdAt'>('riskScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'matrix'>('list')
  
  const { isOpen: isPathDetailOpen, onOpen: onPathDetailOpen, onClose: onPathDetailClose } = useDisclosure()
  const { isOpen: isTimelineOpen, onOpen: onTimelineOpen, onClose: onTimelineClose } = useDisclosure()
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  
  // Load threat paths on component mount
  useEffect(() => {
    loadThreatPaths()
  }, [nodes, edges])
  
  const loadThreatPaths = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/threat-paths/generate-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          config: {
            maxPathsPerScenario: 20,
            includeExternalThreats: true,
            includeInsiderThreats: true,
            includeLateralMovement: true,
            includePrivilegeEscalation: true
          }
        })
      })
      
      const data = await response.json()
      console.log('ThreatPathAnalysisView: API Response:', data)

      if (data.success) {
        // Transform ThreatScenario[] to ThreatPathScenario[]
        // Each ThreatScenario contains multiple ThreatPath objects that need to be flattened
        const flattenedPaths: ThreatPathScenario[] = []
        console.log('ThreatPathAnalysisView: Raw threat paths from API:', data.threatPaths)

        data.threatPaths.forEach((scenario: any, scenarioIndex: number) => {
          console.log(`ThreatPathAnalysisView: Processing scenario ${scenarioIndex}:`, scenario)
          if (scenario.paths && Array.isArray(scenario.paths)) {
            console.log(`ThreatPathAnalysisView: Scenario ${scenarioIndex} has ${scenario.paths.length} paths`)
            scenario.paths.forEach((path: any, index: number) => {
              console.log(`ThreatPathAnalysisView: Processing path ${index} in scenario ${scenarioIndex}:`, path)
              const threatPathScenario: ThreatPathScenario = {
                id: `${scenario.id}-path-${index}`,
                name: path.name || `${scenario.name} - Path ${index + 1}`,
                description: path.description || scenario.description,
                scenario: scenario.description || 'Automated threat scenario',
                attackerProfile: {
                  type: 'External',
                  sophistication: 'Medium',
                  motivation: ['Data Theft'],
                  capabilities: ['Network Reconnaissance']
                },
                path: path.nodes || [], // This is the key fix - use path.nodes
                pathDetails: [],
                riskScore: path.riskScore || 5,
                severity: path.severity || 'Medium',
                likelihood: 0.5,
                impact: 0.5,
                mitreTactics: path.mitreTactics || [],
                mitreTechniques: [],
                entryPoint: path.nodes?.[0] || '',
                targetAsset: path.nodes?.[path.nodes?.length - 1] || '',
                estimatedDwellTime: path.estimatedTime || '1-2 hours',
                detectionDifficulty: 'Medium',
                timeline: [],
                prerequisites: [],
                businessImpact: {
                  confidentiality: 'Medium',
                  integrity: 'Medium',
                  availability: 'Medium',
                  financialImpact: 'Medium',
                  reputationalImpact: 'Medium'
                },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                status: 'Active'
              }
              flattenedPaths.push(threatPathScenario)
              console.log(`ThreatPathAnalysisView: Added threat path scenario:`, threatPathScenario)
            })
          } else {
            console.log(`ThreatPathAnalysisView: Scenario ${scenarioIndex} has no valid paths array:`, scenario)
          }
        })

        console.log(`ThreatPathAnalysisView: Final flattened paths (${flattenedPaths.length} total):`, flattenedPaths)
        setThreatPaths(flattenedPaths)
        setAnalytics(data.analytics)
        toast({
          title: 'Threat Paths Generated',
          description: `Found ${data.threatPaths.length} potential attack paths`,
          status: 'success',
          duration: 3000
        })
      } else {
        throw new Error(data.error || 'Failed to generate threat paths')
      }
    } catch (error) {
      console.error('Error loading threat paths:', error)
      toast({
        title: 'Error',
        description: 'Failed to load threat paths',
        status: 'error',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Filter and sort threat paths
  const filteredAndSortedPaths = useMemo(() => {
    console.log('ThreatPathAnalysisView: Filtering threat paths. Input:', threatPaths)
    console.log('ThreatPathAnalysisView: Current filters:', filters)
    let filtered = threatPaths.filter(path => {
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(path.severity)) {
        return false
      }
      
      // Attacker type filter
      if (filters.attackerType.length > 0 && !filters.attackerType.includes(path.attackerProfile?.type)) {
        return false
      }
      
      // Risk score filter
      const riskScore = path.riskScore || 5 // Default to middle value if not set
      if (riskScore < filters.riskScore[0] || riskScore > filters.riskScore[1]) {
        return false
      }
      
      // Search term filter
      if (filters.searchTerm && !(path.name || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !(path.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false
      }
      
      return true
    })
    
    // Sort paths
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || 0
      const bValue = b[sortBy] || 0

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    console.log('ThreatPathAnalysisView: Filtered and sorted paths:', filtered)
    return filtered
  }, [threatPaths, filters, sortBy, sortOrder])
  
  const handlePathSelect = (path: ThreatPathScenario) => {
    setSelectedPath(path)
    onPathHighlight(path.path || [])
    onPathDetailOpen()
  }
  
  const handlePathHover = (path: ThreatPathScenario) => {
    // Use same fallback pattern as handlePathSelect for consistency
    onPathHighlight(path.path || [])
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
  
  const getAttackerTypeColor = (type: string) => {
    switch (type) {
      case 'External': return 'red'
      case 'Insider': return 'orange'
      case 'APT': return 'purple'
      case 'Ransomware': return 'red'
      default: return 'blue'
    }
  }
  
  const formatTimeEstimate = (estimate: string) => {
    return estimate || 'Unknown'
  }
  
  const renderPathListView = () => {
    console.log('ThreatPathAnalysisView: Rendering path list view with paths:', filteredAndSortedPaths)
    return (
      <VStack spacing={4} align="stretch">
        {filteredAndSortedPaths.map((path, index) => (
        <Card
          key={path.id}
          cursor="pointer"
          onClick={() => handlePathSelect(path)}
          onMouseEnter={() => handlePathHover(path)}
          _hover={{ 
            shadow: 'lg', 
            transform: 'translateY(-2px)',
            borderColor: getSeverityColor(path.severity) + '.300'
          }}
          transition="all 0.2s"
          borderLeft={`4px solid`}
          borderLeftColor={getSeverityColor(path.severity) + '.500'}
        >
          <CardBody>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2} flex={1}>
                <HStack>
                  <Badge colorScheme={getSeverityColor(path.severity)} size="sm">
                    {path.severity}
                  </Badge>
                  <Badge colorScheme={getAttackerTypeColor(path.attackerProfile?.type)} variant="outline" size="sm">
                    {path.attackerProfile?.type || 'Unknown'}
                  </Badge>
                  <Badge colorScheme="blue" variant="subtle" size="sm">
                    Risk: {path.riskScore}/10
                  </Badge>
                </HStack>
                
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  {path.name}
                </Text>
                
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {path.description}
                </Text>
                
                <HStack spacing={4} fontSize="sm" color="gray.500">
                  <HStack>
                    <TimeIcon />
                    <Text>{path.estimatedDwellTime || 'Unknown'}</Text>
                  </HStack>
                  <HStack>
                    <InfoIcon />
                    <Text>{(path.path?.length || 0)} hops</Text>
                  </HStack>
                  <HStack>
                    <WarningIcon />
                    <Text>{path.detectionDifficulty || 'Unknown'} to detect</Text>
                  </HStack>
                </HStack>
              </VStack>
              
              <VStack align="end" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color={getSeverityColor(path.severity) + '.500'}>
                  {path.riskScore || 0}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Risk Score
                </Text>
                <Progress
                  value={(path.likelihood || 0) * 100}
                  size="sm"
                  colorScheme={getSeverityColor(path.severity)}
                  width="80px"
                />
                <Text fontSize="xs" color="gray.500">
                  {Math.round((path.likelihood || 0) * 100)}% likely
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
        ))}
      </VStack>
    )
  }
  
  const renderTimelineView = () => (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>Attack Timeline Analysis</Text>
      <VStack spacing={6} align="stretch">
        {filteredAndSortedPaths.slice(0, 5).map((path, index) => (
          <Card key={path.id} bg={bgColor} borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{path.name}</Text>
                  <HStack>
                    <Badge colorScheme={getSeverityColor(path.severity)}>{path.severity}</Badge>
                    <Badge colorScheme="blue" variant="outline">
                      {path.estimatedDwellTime}
                    </Badge>
                  </HStack>
                </VStack>
                <Button size="sm" onClick={() => handlePathSelect(path)}>
                  View Details
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <HStack spacing={4} align="start">
                {(path.timeline || []).map((stage, stageIndex) => (
                  <React.Fragment key={stageIndex}>
                    <VStack spacing={2} align="center" minW="120px">
                      <Box
                        w={8}
                        h={8}
                        borderRadius="full"
                        bg={getSeverityColor(path.severity) + '.500'}
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {stageIndex + 1}
                      </Box>
                      <Text fontSize="sm" fontWeight="bold" textAlign="center">
                        {stage.stage}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center">
                        {stage.timeframe}
                      </Text>
                      <Text fontSize="xs" color="gray.500" textAlign="center" noOfLines={2}>
                        {stage.description}
                      </Text>
                    </VStack>
                    {stageIndex < (path.timeline || []).length - 1 && (
                      <ChevronRightIcon color="gray.400" mt={4} />
                    )}
                  </React.Fragment>
                ))}
              </HStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  )
  
  const renderMatrixView = () => (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>Risk Impact Matrix</Text>
      <Box position="relative" height="400px" bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md">
        {/* Y-axis (Impact) */}
        <VStack position="absolute" left={2} top={2} bottom={2} justify="space-between">
          <Text fontSize="xs" color="gray.500" transform="rotate(-90deg)">High Impact</Text>
          <Text fontSize="xs" color="gray.500" transform="rotate(-90deg)">Medium Impact</Text>
          <Text fontSize="xs" color="gray.500" transform="rotate(-90deg)">Low Impact</Text>
        </VStack>
        
        {/* X-axis (Likelihood) */}
        <HStack position="absolute" bottom={2} left={12} right={2} justify="space-between">
          <Text fontSize="xs" color="gray.500">Low Likelihood</Text>
          <Text fontSize="xs" color="gray.500">Medium Likelihood</Text>
          <Text fontSize="xs" color="gray.500">High Likelihood</Text>
        </HStack>
        
        {/* Plot points */}
        <Box position="absolute" top={8} left={12} right={8} bottom={8}>
          {filteredAndSortedPaths.map((path, index) => {
            const x = ((path.likelihood || 0) * 100) + '%'
            const y = (100 - (path.impact || 0) * 10) + '%'
            
            return (
              <Tooltip key={path.id} label={path.name} placement="top">
                <Box
                  position="absolute"
                  left={x}
                  top={y}
                  w={3}
                  h={3}
                  borderRadius="full"
                  bg={getSeverityColor(path.severity) + '.500'}
                  cursor="pointer"
                  onClick={() => handlePathSelect(path)}
                  _hover={{ transform: 'scale(1.5)' }}
                  transition="transform 0.2s"
                />
              </Tooltip>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
  
  const renderAnalyticsSummary = () => {
    if (!analytics) return null

    return (
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
        <Stat bg={bgColor} p={4} borderRadius="md" border="1px" borderColor={borderColor}>
          <StatLabel>Total Threat Paths</StatLabel>
          <StatNumber>{analytics.totalPaths || 0}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            {analytics.activePaths || 0} active
          </StatHelpText>
        </Stat>

        <Stat bg={bgColor} p={4} borderRadius="md" border="1px" borderColor={borderColor}>
          <StatLabel>Average Risk Score</StatLabel>
          <StatNumber>{(analytics.averageRiskScore || 0).toFixed(1)}</StatNumber>
          <StatHelpText>
            Out of 10.0
          </StatHelpText>
        </Stat>
        
        <Stat bg={bgColor} p={4} borderRadius="md" border="1px" borderColor={borderColor}>
          <StatLabel>Critical Paths</StatLabel>
          <StatNumber color="red.500">{analytics.riskDistribution?.critical || 0}</StatNumber>
          <StatHelpText>
            Require immediate attention
          </StatHelpText>
        </Stat>

        <Stat bg={bgColor} p={4} borderRadius="md" border="1px" borderColor={borderColor}>
          <StatLabel>Network Coverage</StatLabel>
          <StatNumber>{analytics.coverageMetrics?.nodesInvolved || 0}</StatNumber>
          <StatHelpText>
            Nodes involved in paths
          </StatHelpText>
        </Stat>
      </Grid>
    )
  }
  
  const renderFilters = () => (
    <Card mb={6}>
      <CardHeader>
        <Text fontWeight="bold">Filters & Search</Text>
      </CardHeader>
      <CardBody>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search threat paths..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </InputGroup>
          
          <Select
            placeholder="Filter by severity"
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              severity: e.target.value ? [e.target.value] : [] 
            }))}
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
          
          <Select
            placeholder="Filter by attacker type"
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              attackerType: e.target.value ? [e.target.value] : [] 
            }))}
          >
            <option value="External">External</option>
            <option value="Insider">Insider</option>
            <option value="APT">APT</option>
            <option value="Ransomware">Ransomware</option>
          </Select>
          
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="riskScore">Sort by Risk Score</option>
            <option value="likelihood">Sort by Likelihood</option>
            <option value="impact">Sort by Impact</option>
            <option value="createdAt">Sort by Date</option>
          </Select>
        </Grid>
      </CardBody>
    </Card>
  )
  
  const renderPathDetail = () => {
    if (!selectedPath) return null
    
    return (
      <Modal isOpen={isPathDetailOpen} onClose={onPathDetailClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>
            <HStack>
              <Text>{selectedPath.name}</Text>
              <Badge colorScheme={getSeverityColor(selectedPath.severity)}>
                {selectedPath.severity}
              </Badge>
              <Badge colorScheme={getAttackerTypeColor(selectedPath.attackerProfile?.type)} variant="outline">
                {selectedPath.attackerProfile?.type || 'Unknown'}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Tabs>
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Attack Path</Tab>
                <Tab>Timeline</Tab>
                <Tab>Business Impact</Tab>
                <Tab>MITRE ATT&CK</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text>{selectedPath.description}</Text>
                    
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <Stat>
                        <StatLabel>Risk Score</StatLabel>
                        <StatNumber color={getSeverityColor(selectedPath.severity) + '.500'}>
                          {selectedPath.riskScore}/10
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Likelihood</StatLabel>
                        <StatNumber>{Math.round(selectedPath.likelihood * 100)}%</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Impact</StatLabel>
                        <StatNumber>{selectedPath.impact}/10</StatNumber>
                      </Stat>
                    </Grid>
                    
                    <Divider />
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Attacker Profile</Text>
                      <VStack align="start" spacing={1}>
                        <Text><strong>Type:</strong> {selectedPath.attackerProfile?.type || 'Unknown'}</Text>
                        <Text><strong>Sophistication:</strong> {selectedPath.attackerProfile?.sophistication || 'Unknown'}</Text>
                        <Text><strong>Motivation:</strong> {(selectedPath.attackerProfile?.motivation || []).join(', ') || 'Unknown'}</Text>
                        <Text><strong>Capabilities:</strong> {(selectedPath.attackerProfile?.capabilities || []).join(', ') || 'Unknown'}</Text>
                      </VStack>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Detection & Response</Text>
                      <VStack align="start" spacing={1}>
                        <Text><strong>Detection Difficulty:</strong> {selectedPath.detectionDifficulty || 'Unknown'}</Text>
                        <Text><strong>Estimated Dwell Time:</strong> {selectedPath.estimatedDwellTime || 'Unknown'}</Text>
                        <Text><strong>Prerequisites:</strong> {(selectedPath.prerequisites || []).join(', ') || 'None'}</Text>
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold">Attack Path Details</Text>
                    <TableContainer>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Step</Th>
                            <Th>Node</Th>
                            <Th>Action</Th>
                            <Th>Technique</Th>
                            <Th>Time Estimate</Th>
                            <Th>Detection Probability</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(selectedPath.pathDetails || []).map((detail, index) => (
                            <Tr key={index}>
                              <Td>{index + 1}</Td>
                              <Td>
                                <Button
                                  size="xs"
                                  variant="link"
                                  onClick={() => onNodeSelect(detail.nodeId)}
                                >
                                  {detail.nodeName}
                                </Button>
                              </Td>
                              <Td>{detail.action}</Td>
                              <Td>{detail.technique}</Td>
                              <Td>{detail.timeEstimate}</Td>
                              <Td>
                                <Progress
                                  value={detail.detectionProbability * 100}
                                  size="sm"
                                  colorScheme={detail.detectionProbability > 0.7 ? 'green' : 'red'}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold">Attack Timeline</Text>
                    {(selectedPath.timeline || []).map((stage, index) => (
                      <Card key={index}>
                        <CardBody>
                          <HStack align="start">
                            <Box
                              w={8}
                              h={8}
                              borderRadius="full"
                              bg={getSeverityColor(selectedPath.severity) + '.500'}
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="sm"
                              fontWeight="bold"
                              flexShrink={0}
                            >
                              {index + 1}
                            </Box>
                            <VStack align="start" spacing={2} flex={1}>
                              <Text fontWeight="bold">{stage.stage}</Text>
                              <Text fontSize="sm" color="gray.600">{stage.description}</Text>
                              <Badge colorScheme="blue" variant="outline">{stage.timeframe}</Badge>
                              <Box>
                                <Text fontSize="sm" fontWeight="bold" mb={1}>Indicators:</Text>
                                <VStack align="start" spacing={1}>
                                  {stage.indicators.map((indicator, idx) => (
                                    <Text key={idx} fontSize="xs" color="gray.500">
                                      • {indicator}
                                    </Text>
                                  ))}
                                </VStack>
                              </Box>
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold">Business Impact Assessment</Text>
                    
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <Stat>
                        <StatLabel>Confidentiality</StatLabel>
                        <StatNumber color={selectedPath.businessImpact?.confidentiality === 'High' ? 'red.500' : 'green.500'}>
                          {selectedPath.businessImpact?.confidentiality || 'Unknown'}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Integrity</StatLabel>
                        <StatNumber color={selectedPath.businessImpact?.integrity === 'High' ? 'red.500' : 'green.500'}>
                          {selectedPath.businessImpact?.integrity || 'Unknown'}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Availability</StatLabel>
                        <StatNumber color={selectedPath.businessImpact?.availability === 'High' ? 'red.500' : 'green.500'}>
                          {selectedPath.businessImpact?.availability || 'Unknown'}
                        </StatNumber>
                      </Stat>
                    </Grid>
                    
                    <Divider />
                    
                    <VStack align="start" spacing={2}>
                      <Text><strong>Financial Impact:</strong> {selectedPath.businessImpact?.financialImpact || 'Unknown'}</Text>
                      <Text><strong>Reputational Impact:</strong> {selectedPath.businessImpact?.reputationalImpact || 'Unknown'}</Text>
                    </VStack>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold">MITRE ATT&CK Mapping</Text>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Tactics</Text>
                      <HStack wrap="wrap" spacing={2}>
                        {(selectedPath.mitreTactics || []).map((tactic, index) => (
                          <Badge key={index} colorScheme="purple" variant="outline">
                            {tactic}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Techniques</Text>
                      <VStack align="start" spacing={1}>
                        {(selectedPath.mitreTechniques || []).map((technique, index) => (
                          <HStack key={index}>
                            <Badge colorScheme="blue" variant="subtle" size="sm">
                              {technique}
                            </Badge>
                            <IconButton
                              size="xs"
                              icon={<ExternalLinkIcon />}
                              aria-label="View MITRE details"
                              variant="ghost"
                            />
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }
  
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Generating threat path analysis...</Text>
      </Box>
    )
  }
  
  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">
              Threat Path Analysis
            </Text>
            <Text color="gray.600">
              Comprehensive Attack Path Analysis (APA) for network security assessment
            </Text>
          </VStack>
          
          <HStack>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={onGenerateNewPaths}
              colorScheme="blue"
              variant="outline"
            >
              Regenerate Paths
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="green"
              variant="outline"
            >
              Export Report
            </Button>
            <IconButton
              icon={<SettingsIcon />}
              aria-label="Settings"
              variant="outline"
            />
          </HStack>
        </HStack>
        
        {/* Analytics Summary */}
        {renderAnalyticsSummary()}
        
        {/* Filters */}
        {renderFilters()}
        
        {/* View Mode Selector */}
        <HStack>
          <Text fontWeight="bold">View Mode:</Text>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'solid' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'solid' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'matrix' ? 'solid' : 'outline'}
            onClick={() => setViewMode('matrix')}
          >
            Risk Matrix
          </Button>
        </HStack>
        
        {/* Main Content */}
        {(threatPaths || []).length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>No threat paths found!</AlertTitle>
            <AlertDescription>
              Try adjusting your filters or generate new threat paths.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {viewMode === 'list' && renderPathListView()}
            {viewMode === 'timeline' && renderTimelineView()}
            {viewMode === 'matrix' && renderMatrixView()}
          </>
        )}
        
        {/* Path Detail Modal */}
        {renderPathDetail()}
      </VStack>
    </Box>
  )
}

export default ThreatPathAnalysisView

