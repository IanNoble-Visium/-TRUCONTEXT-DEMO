import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  IconButton,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Progress,
  Flex,
  Spacer,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react'
import {
  QuestionIcon,
  InfoIcon,
  WarningIcon,
  TimeIcon,
  SearchIcon,
  EditIcon,
  AddIcon,
  DeleteIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ViewIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import { ThreatPathScenario, RootCauseAnalysis } from '../types/threatPath'

// Define missing types locally
interface WhyAnalysisLevel {
  level: number
  question: string
  answer: string
  evidence: string[]
}

interface ContributingFactor {
  category: 'Technical' | 'Process' | 'Human' | 'Environmental'
  factor: string
  impact: 'High' | 'Medium' | 'Low'
  description: string
}

interface ThreatPathRootCauseAnalysisProps {
  threatPath: ThreatPathScenario
  onAnalysisUpdate: (analysis: RootCauseAnalysis) => void
  existingAnalysis?: RootCauseAnalysis
}

interface FishboneCategory {
  id: string
  name: string
  color: string
  factors: ContributingFactor[]
}

interface TimelineEvent {
  id: string
  timestamp: string
  event: string
  category: 'technical' | 'process' | 'human' | 'environmental'
  impact: 'high' | 'medium' | 'low'
  evidence: string[]
  relatedFactors: string[]
}

const ThreatPathRootCauseAnalysis: React.FC<ThreatPathRootCauseAnalysisProps> = ({
  threatPath,
  onAnalysisUpdate,
  existingAnalysis
}) => {
  const [analysis, setAnalysis] = useState<RootCauseAnalysis>(existingAnalysis || {
    id: `rca-${Date.now()}`,
    threatPathId: threatPath.id,
    primaryCause: '',
    whyAnalysis: [],
    contributingFactors: [],
    fishboneDiagram: {
      categories: []
    },
    timeline: [],
    recommendations: [],
    lessonsLearned: [],
    createdAt: new Date().toISOString(),
    createdBy: 'SOC Analyst',
    status: 'Draft'
  })
  
  const [currentWhyLevel, setCurrentWhyLevel] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('technical')
  const [newFactor, setNewFactor] = useState<Partial<ContributingFactor>>({})
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  
  const { isOpen: isFactorModalOpen, onOpen: onFactorModalOpen, onClose: onFactorModalClose } = useDisclosure()
  const { isOpen: isTimelineModalOpen, onOpen: onTimelineModalOpen, onClose: onTimelineModalClose } = useDisclosure()
  const { isOpen: isWhyModalOpen, onOpen: onWhyModalOpen, onClose: onWhyModalClose } = useDisclosure()
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Fishbone diagram categories
  const fishboneCategories: FishboneCategory[] = [
    {
      id: 'technical',
      name: 'Technical',
      color: 'blue',
      factors: analysis.contributingFactors.filter(f => f.category === 'Technical')
    },
    {
      id: 'process',
      name: 'Process',
      color: 'green',
      factors: analysis.contributingFactors.filter(f => f.category === 'Process')
    },
    {
      id: 'human',
      name: 'Human',
      color: 'orange',
      factors: analysis.contributingFactors.filter(f => f.category === 'Human')
    },
    {
      id: 'environmental',
      name: 'Environmental',
      color: 'purple',
      factors: analysis.contributingFactors.filter(f => f.category === 'Environmental')
    }
  ]
  
  // Predefined contributing factor templates
  const factorTemplates = {
    technical: [
      { title: 'Unpatched Vulnerabilities', description: 'Systems with known security vulnerabilities' },
      { title: 'Misconfigured Security Controls', description: 'Improperly configured firewalls, access controls, etc.' },
      { title: 'Weak Authentication', description: 'Inadequate password policies or MFA implementation' },
      { title: 'Network Segmentation Issues', description: 'Poor network isolation and segmentation' },
      { title: 'Outdated Software', description: 'Legacy systems and outdated software versions' },
      { title: 'Insufficient Monitoring', description: 'Gaps in security monitoring and detection' }
    ],
    process: [
      { title: 'Inadequate Change Management', description: 'Poor change control processes' },
      { title: 'Insufficient Incident Response', description: 'Gaps in incident response procedures' },
      { title: 'Weak Vulnerability Management', description: 'Ineffective vulnerability assessment and remediation' },
      { title: 'Poor Access Management', description: 'Inadequate user access provisioning and deprovisioning' },
      { title: 'Lack of Security Policies', description: 'Missing or outdated security policies' },
      { title: 'Insufficient Training Programs', description: 'Inadequate security awareness training' }
    ],
    human: [
      { title: 'Social Engineering Susceptibility', description: 'Users vulnerable to social engineering attacks' },
      { title: 'Poor Security Awareness', description: 'Lack of security knowledge among staff' },
      { title: 'Insider Threat', description: 'Malicious or negligent insider actions' },
      { title: 'Human Error', description: 'Mistakes in configuration or operations' },
      { title: 'Inadequate Training', description: 'Insufficient security training for personnel' },
      { title: 'Privilege Misuse', description: 'Misuse of elevated privileges' }
    ],
    environmental: [
      { title: 'Third-Party Dependencies', description: 'Vulnerabilities in third-party systems or services' },
      { title: 'Supply Chain Compromise', description: 'Compromise of supply chain components' },
      { title: 'Physical Security Gaps', description: 'Inadequate physical security controls' },
      { title: 'Cloud Misconfigurations', description: 'Improperly configured cloud services' },
      { title: 'Regulatory Compliance Gaps', description: 'Non-compliance with security regulations' },
      { title: 'Business Pressure', description: 'Business demands compromising security' }
    ],
    management: [
      { title: 'Insufficient Security Budget', description: 'Inadequate funding for security initiatives' },
      { title: 'Lack of Executive Support', description: 'Insufficient leadership commitment to security' },
      { title: 'Poor Risk Management', description: 'Inadequate risk assessment and management' },
      { title: 'Organizational Silos', description: 'Poor communication between departments' },
      { title: 'Inadequate Governance', description: 'Weak security governance and oversight' },
      { title: 'Resource Constraints', description: 'Insufficient staffing or resources' }
    ],
    external: [
      { title: 'Advanced Threat Actors', description: 'Sophisticated attackers with advanced capabilities' },
      { title: 'Zero-Day Exploits', description: 'Previously unknown vulnerabilities' },
      { title: 'Threat Intelligence Gaps', description: 'Lack of relevant threat intelligence' },
      { title: 'Industry Targeting', description: 'Specific targeting of the industry sector' },
      { title: 'Geopolitical Factors', description: 'Nation-state or politically motivated attacks' },
      { title: 'Criminal Organizations', description: 'Organized cybercriminal groups' }
    ]
  }
  
  // Initialize timeline events from threat path
  useEffect(() => {
    const events: TimelineEvent[] = threatPath.timeline.map((stage, index) => ({
      id: `event-${index}`,
      timestamp: stage.timeframe,
      event: stage.description,
      category: 'technical',
      impact: 'medium',
      evidence: stage.indicators,
      relatedFactors: []
    }))
    
    setTimelineEvents(events)
  }, [threatPath])
  
  const handleWhyAnalysisAdd = (level: number, question: string, answer: string) => {
    const newLevel: WhyAnalysisLevel = {
      level,
      question,
      answer,
      evidence: []
    }
    
    const updatedAnalysis = {
      ...analysis,
      whyAnalysis: [...analysis.whyAnalysis.slice(0, level), newLevel]
    }
    
    setAnalysis(updatedAnalysis)
    onAnalysisUpdate(updatedAnalysis)
  }
  
  const handleFactorAdd = (factor: ContributingFactor) => {
    const updatedAnalysis = {
      ...analysis,
      contributingFactors: [...analysis.contributingFactors, factor]
    }
    
    setAnalysis(updatedAnalysis)
    onAnalysisUpdate(updatedAnalysis)
  }
  
  const handleFactorRemove = (factorId: string) => {
    const updatedAnalysis = {
      ...analysis,
      contributingFactors: analysis.contributingFactors.filter(f => f.factor !== factorId)
    }
    
    setAnalysis(updatedAnalysis)
    onAnalysisUpdate(updatedAnalysis)
  }
  
  const handleRecommendationAdd = (recommendation: string) => {
    const updatedAnalysis = {
      ...analysis,
      recommendations: [...analysis.recommendations, {
        type: 'Short-term' as const,
        action: recommendation,
        owner: 'SOC Team',
        timeline: '1-3 months',
        priority: 'Medium' as const
      }]
    }
    
    setAnalysis(updatedAnalysis)
    onAnalysisUpdate(updatedAnalysis)
  }
  
  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'blue',
      process: 'green',
      human: 'orange',
      environmental: 'purple',
      management: 'red',
      external: 'cyan'
    }
    return colors[category as keyof typeof colors] || 'gray'
  }
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }
  
  const renderWhyAnalysis = () => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Text fontWeight="bold">5 Whys Analysis</Text>
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onWhyModalOpen}
          >
            Add Why Level
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {analysis.whyAnalysis.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>Start Why Analysis</AlertTitle>
              <AlertDescription>
                Begin by asking &quot;Why did this incident occur?&quot; and continue drilling down.
              </AlertDescription>
            </Alert>
          ) : (
            analysis.whyAnalysis.map((level, index) => (
              <Card key={index} size="sm" borderLeft="4px solid" borderLeftColor="blue.500">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Badge colorScheme="blue">Why #{level.level + 1}</Badge>
                      <Text fontWeight="bold">{level.question}</Text>
                    </HStack>
                    <Text color="gray.600">{level.answer}</Text>
                    {level.evidence.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Evidence:</Text>
                        <VStack align="start" spacing={1}>
                          {level.evidence.map((evidence, evidenceIndex) => (
                            <Text key={evidenceIndex} fontSize="sm" color="gray.600">
                              • {evidence}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))
          )}
          
          {analysis.whyAnalysis.length > 0 && analysis.whyAnalysis.length < 5 && (
            <Button
              variant="outline"
              leftIcon={<QuestionIcon />}
              onClick={() => {
                setCurrentWhyLevel(analysis.whyAnalysis.length)
                onWhyModalOpen()
              }}
            >
              Ask Why #{analysis.whyAnalysis.length + 1}
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
  
  const renderFishboneDiagram = () => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Text fontWeight="bold">Fishbone Diagram (Cause & Effect)</Text>
          <ButtonGroup size="sm">
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onFactorModalOpen}
            >
              Add Factor
            </Button>
            <Button
              leftIcon={<ViewIcon />}
              variant="outline"
            >
              View Diagram
            </Button>
          </ButtonGroup>
        </HStack>
      </CardHeader>
      <CardBody>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          {fishboneCategories.map(category => (
            <Card key={category.id} size="sm">
              <CardHeader pb={2}>
                <HStack>
                  <Badge colorScheme={category.color}>{category.name}</Badge>
                  <Spacer />
                  <Text fontSize="sm" color="gray.500">
                    {category.factors.length} factors
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={2} align="stretch">
                  {category.factors.length === 0 ? (
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      No factors identified
                    </Text>
                  ) : (
                    category.factors.map(factor => (
                      <HStack key={factor.factor} justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="bold">{factor.factor}</Text>
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>
                            {factor.description}
                          </Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Badge colorScheme={getImpactColor(factor.impact)} size="sm">
                            {factor.impact}
                          </Badge>
                          <IconButton
                            size="xs"
                            icon={<DeleteIcon />}
                            aria-label="Remove factor"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleFactorRemove(factor.factor)}
                          />
                        </VStack>
                      </HStack>
                    ))
                  )}
                  
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme={category.color}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      onFactorModalOpen()
                    }}
                  >
                    Add {category.name} Factor
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </CardBody>
    </Card>
  )
  
  const renderTimelineReconstruction = () => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Text fontWeight="bold">Timeline Reconstruction</Text>
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onTimelineModalOpen}
          >
            Add Event
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {timelineEvents.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No timeline events</AlertTitle>
              <AlertDescription>
                Add events to reconstruct the incident timeline.
              </AlertDescription>
            </Alert>
          ) : (
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Event</Th>
                    <Th>Category</Th>
                    <Th>Impact</Th>
                    <Th>Evidence</Th>
                    <Th>Related Factors</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {timelineEvents
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map(event => (
                      <Tr key={event.id}>
                        <Td>
                          <Text fontSize="sm">{event.timestamp}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="bold">{event.event}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getCategoryColor(event.category)} size="sm">
                            {event.category}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getImpactColor(event.impact)} size="sm">
                            {event.impact}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="xs">{event.evidence.length} items</Text>
                        </Td>
                        <Td>
                          <Text fontSize="xs">{event.relatedFactors.length} factors</Text>
                        </Td>
                        <Td>
                          <ButtonGroup size="xs">
                            <IconButton
                              icon={<EditIcon />}
                              aria-label="Edit event"
                              variant="outline"
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              aria-label="Delete event"
                              variant="outline"
                              colorScheme="red"
                            />
                          </ButtonGroup>
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
  
  const renderRecommendations = () => (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Text fontWeight="bold">Recommendations</Text>
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            colorScheme="green"
          >
            Add Recommendation
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {analysis.recommendations.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No recommendations yet</AlertTitle>
              <AlertDescription>
                Add recommendations based on your root cause analysis.
              </AlertDescription>
            </Alert>
          ) : (
            analysis.recommendations.map((rec, index) => (
              <Card key={index} size="sm">
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Badge colorScheme={getImpactColor(rec.priority)}>{rec.priority}</Badge>
                        <Badge colorScheme="blue" variant="outline">
                          {rec.type}
                        </Badge>
                      </HStack>
                      <Text fontWeight="bold">{rec.action}</Text>
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <Text><strong>Owner:</strong> {rec.owner}</Text>
                        <Text><strong>Timeline:</strong> {rec.timeline}</Text>
                      </HStack>
                    </VStack>
                    <ButtonGroup size="xs">
                      <IconButton
                        icon={<EditIcon />}
                        aria-label="Edit recommendation"
                        variant="outline"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete recommendation"
                        variant="outline"
                        colorScheme="red"
                      />
                    </ButtonGroup>
                  </HStack>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>
      </CardBody>
    </Card>
  )
  
  const renderFactorModal = () => (
    <Modal isOpen={isFactorModalOpen} onClose={onFactorModalClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Contributing Factor</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Manual Entry</Tab>
              <Tab>Templates</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {fishboneCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Factor</FormLabel>
                    <Input
                      value={newFactor.factor || ''}
                      onChange={(e) => setNewFactor(prev => ({ ...prev, factor: e.target.value }))}
                      placeholder="Brief description of the contributing factor"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={newFactor.description || ''}
                      onChange={(e) => setNewFactor(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of how this factor contributed"
                      rows={3}
                    />
                  </FormControl>
                  
                  <HStack spacing={4} width="100%">
                    <FormControl>
                      <FormLabel>Impact</FormLabel>
                      <Select
                        value={newFactor.impact || 'medium'}
                        onChange={(e) => setNewFactor(prev => ({ ...prev, impact: e.target.value as any }))}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </Select>
                    </FormControl>
                  </HStack>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold">Factor Templates - {selectedCategory}</Text>
                  {factorTemplates[selectedCategory as keyof typeof factorTemplates]?.map((template, index) => (
                    <Card
                      key={index}
                      cursor="pointer"
                      onClick={() => setNewFactor({
                        title: template.title,
                        description: template.description,
                        category: selectedCategory as any,
                        impact: 'medium',
                        likelihood: 'medium',
                        evidence: []
                      })}
                      _hover={{ shadow: 'md' }}
                      size="sm"
                    >
                      <CardBody>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="sm">{template.title}</Text>
                          <Text fontSize="xs" color="gray.600">{template.description}</Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" onClick={onFactorModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                if (newFactor.title && newFactor.description) {
                  const factor: ContributingFactor = {
                    id: `factor-${Date.now()}`,
                    title: newFactor.title,
                    description: newFactor.description,
                    category: selectedCategory as any,
                    impact: newFactor.impact || 'medium',
                    likelihood: newFactor.likelihood || 'medium',
                    evidence: newFactor.evidence || [],
                    mitigations: []
                  }
                  
                  handleFactorAdd(factor)
                  setNewFactor({})
                  onFactorModalClose()
                  
                  toast({
                    title: 'Factor Added',
                    description: 'Contributing factor has been added to the analysis',
                    status: 'success',
                    duration: 3000
                  })
                }
              }}
              isDisabled={!newFactor.title || !newFactor.description}
            >
              Add Factor
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
  
  const renderWhyModal = () => (
    <Modal isOpen={isWhyModalOpen} onClose={onWhyModalClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Why Analysis Level #{currentWhyLevel + 1}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Question</FormLabel>
              <Input
                placeholder={`Why did ${currentWhyLevel === 0 ? 'this incident occur' : 'the previous cause happen'}?`}
                id="why-question"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Answer</FormLabel>
              <Textarea
                placeholder="Provide a detailed answer based on evidence and analysis"
                rows={4}
                id="why-answer"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Supporting Evidence</FormLabel>
              <Textarea
                placeholder="List evidence that supports this answer (one per line)"
                rows={3}
                id="why-evidence"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" onClick={onWhyModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                const questionInput = document.getElementById('why-question') as HTMLInputElement
                const answerInput = document.getElementById('why-answer') as HTMLTextAreaElement
                const evidenceInput = document.getElementById('why-evidence') as HTMLTextAreaElement
                
                if (questionInput.value && answerInput.value) {
                  handleWhyAnalysisAdd(
                    currentWhyLevel,
                    questionInput.value,
                    answerInput.value
                  )
                  
                  onWhyModalClose()
                  
                  toast({
                    title: 'Why Level Added',
                    description: `Why analysis level ${currentWhyLevel + 1} has been added`,
                    status: 'success',
                    duration: 3000
                  })
                }
              }}
            >
              Add Why Level
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
  
  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              Root Cause Analysis
            </Text>
            <Text color="gray.600">
              Threat Path: {threatPath.name}
            </Text>
          </VStack>
          
          <HStack>
            <Badge colorScheme={analysis.status === 'completed' ? 'green' : 'yellow'}>
              {analysis.status.replace('_', ' ')}
            </Badge>
            <ButtonGroup>
              <Button
                leftIcon={<DownloadIcon />}
                variant="outline"
              >
                Export Report
              </Button>
              <Button
                leftIcon={<RepeatIcon />}
                colorScheme="blue"
                onClick={() => {
                  const updatedAnalysis = { ...analysis, status: 'completed' as const }
                  setAnalysis(updatedAnalysis)
                  onAnalysisUpdate(updatedAnalysis)
                }}
              >
                Complete Analysis
              </Button>
            </ButtonGroup>
          </HStack>
        </HStack>
        
        {/* Analysis Progress */}
        <Card>
          <CardBody>
            <VStack spacing={3}>
              <HStack justify="space-between" width="100%">
                <Text fontWeight="bold">Analysis Progress</Text>
                <Text fontSize="sm" color="gray.600">
                  {Math.round(((analysis.whyAnalysis.length > 0 ? 25 : 0) +
                              (analysis.contributingFactors.length > 0 ? 25 : 0) +
                              (timelineEvents.length > 0 ? 25 : 0) +
                              (analysis.recommendations.length > 0 ? 25 : 0)))}% Complete
                </Text>
              </HStack>
              <Progress
                value={(analysis.whyAnalysis.length > 0 ? 25 : 0) +
                       (analysis.contributingFactors.length > 0 ? 25 : 0) +
                       (timelineEvents.length > 0 ? 25 : 0) +
                       (analysis.recommendations.length > 0 ? 25 : 0)}
                colorScheme="blue"
                size="lg"
              />
              <HStack spacing={6} fontSize="sm" color="gray.600">
                <HStack>
                  <Badge colorScheme={analysis.whyAnalysis.length > 0 ? 'green' : 'gray'} size="sm">
                    {analysis.whyAnalysis.length > 0 ? '✓' : '○'}
                  </Badge>
                  <Text>Why Analysis</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme={analysis.contributingFactors.length > 0 ? 'green' : 'gray'} size="sm">
                    {analysis.contributingFactors.length > 0 ? '✓' : '○'}
                  </Badge>
                  <Text>Contributing Factors</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme={timelineEvents.length > 0 ? 'green' : 'gray'} size="sm">
                    {timelineEvents.length > 0 ? '✓' : '○'}
                  </Badge>
                  <Text>Timeline</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme={analysis.recommendations.length > 0 ? 'green' : 'gray'} size="sm">
                    {analysis.recommendations.length > 0 ? '✓' : '○'}
                  </Badge>
                  <Text>Recommendations</Text>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Main Analysis Tabs */}
        <Tabs>
          <TabList>
            <Tab>5 Whys Analysis</Tab>
            <Tab>Fishbone Diagram</Tab>
            <Tab>Timeline Reconstruction</Tab>
            <Tab>Recommendations</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              {renderWhyAnalysis()}
            </TabPanel>
            
            <TabPanel>
              {renderFishboneDiagram()}
            </TabPanel>
            
            <TabPanel>
              {renderTimelineReconstruction()}
            </TabPanel>
            
            <TabPanel>
              {renderRecommendations()}
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Modals */}
        {renderFactorModal()}
        {renderWhyModal()}
      </VStack>
    </Box>
  )
}

export default ThreatPathRootCauseAnalysis

