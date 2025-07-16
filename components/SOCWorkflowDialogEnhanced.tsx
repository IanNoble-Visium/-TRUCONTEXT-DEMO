import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Icon,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  useColorModeValue,
  Spinner,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Tooltip,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark
} from '@chakra-ui/react'
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiClock,
  FiActivity,
  FiShield,
  FiEye,
  FiTarget,
  FiZap,
  FiServer,
  FiDatabase,
  FiWifi,
  FiLock,
  FiUnlock,
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiSearch,
  FiFileText,
  FiUsers,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMonitor,
  FiHardDrive,
  FiCpu,
  FiTool,
  FiDownload,
  FiUpload,
  FiFilter,
  FiSettings,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi'

interface SOCWorkflowDialogEnhancedProps {
  isOpen: boolean
  onClose: () => void
  action: any
  targetId: string
  targetData: any
  targetType: 'node' | 'edge'
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
  result?: any
  error?: string
  substeps?: WorkflowStep[]
}

interface MockResult {
  status: 'success' | 'warning' | 'error'
  title: string
  description: string
  data?: any
  recommendations?: string[]
  nextSteps?: string[]
  artifacts?: any[]
  timeline?: any[]
}

interface IncidentForm {
  severity: string
  category: string
  description: string
  assignee: string
  priority: string
  tags: string[]
  affectedSystems: string[]
  estimatedImpact: string
  containmentActions: string
  communicationPlan: string
}

interface ThreatHuntForm {
  huntType: string
  timeRange: string
  targetSystems: string[]
  iocs: string[]
  techniques: string[]
  confidence: number
  scope: string
  methodology: string
}

interface ForensicsForm {
  evidenceType: string
  preservationMethod: string
  chainOfCustody: string
  analysisTools: string[]
  timeline: string
  findings: string
  recommendations: string
}

const SOCWorkflowDialogEnhanced: React.FC<SOCWorkflowDialogEnhancedProps> = ({
  isOpen,
  onClose,
  action,
  targetId,
  targetData,
  targetType
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<MockResult[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [incidentForm, setIncidentForm] = useState<IncidentForm>({
    severity: 'Medium',
    category: 'Security Incident',
    description: '',
    assignee: 'Auto-assign',
    priority: 'Normal',
    tags: [],
    affectedSystems: [],
    estimatedImpact: 'Low',
    containmentActions: '',
    communicationPlan: 'Standard'
  })
  const [threatHuntForm, setThreatHuntForm] = useState<ThreatHuntForm>({
    huntType: 'Proactive Hunt',
    timeRange: '24h',
    targetSystems: [],
    iocs: [],
    techniques: [],
    confidence: 70,
    scope: 'Network-wide',
    methodology: 'MITRE ATT&CK'
  })
  const [forensicsForm, setForensicsForm] = useState<ForensicsForm>({
    evidenceType: 'Network Traffic',
    preservationMethod: 'Live Capture',
    chainOfCustody: '',
    analysisTools: [],
    timeline: '',
    findings: '',
    recommendations: ''
  })

  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Enhanced workflow definitions with realistic SOC processes
  const workflowDefinitions: { [key: string]: WorkflowStep[] } = {
    'monitor_investigate': [
      {
        id: 'initial_triage',
        title: 'Initial Triage',
        description: 'Performing initial assessment and data collection',
        status: 'pending',
        substeps: [
          { id: 'collect_logs', title: 'Collect System Logs', description: 'Gathering relevant log data', status: 'pending' },
          { id: 'check_reputation', title: 'Check IP/Domain Reputation', description: 'Querying threat intelligence feeds', status: 'pending' },
          { id: 'baseline_analysis', title: 'Baseline Analysis', description: 'Comparing against normal behavior', status: 'pending' }
        ]
      },
      {
        id: 'deep_analysis',
        title: 'Deep Analysis',
        description: 'Conducting detailed investigation and correlation',
        status: 'pending',
        substeps: [
          { id: 'traffic_analysis', title: 'Network Traffic Analysis', description: 'Analyzing network patterns and flows', status: 'pending' },
          { id: 'malware_scan', title: 'Malware Detection', description: 'Running advanced malware analysis', status: 'pending' },
          { id: 'user_behavior', title: 'User Behavior Analysis', description: 'Analyzing user activity patterns', status: 'pending' }
        ]
      },
      {
        id: 'threat_assessment',
        title: 'Threat Assessment',
        description: 'Evaluating threat level and potential impact',
        status: 'pending',
        substeps: [
          { id: 'risk_scoring', title: 'Risk Scoring', description: 'Calculating threat risk score', status: 'pending' },
          { id: 'impact_analysis', title: 'Impact Analysis', description: 'Assessing potential business impact', status: 'pending' },
          { id: 'attribution', title: 'Threat Attribution', description: 'Identifying threat actor patterns', status: 'pending' }
        ]
      },
      {
        id: 'documentation',
        title: 'Documentation & Reporting',
        description: 'Creating comprehensive investigation report',
        status: 'pending'
      }
    ],
    'incident_response': [
      {
        id: 'incident_declaration',
        title: 'Incident Declaration',
        description: 'Formally declaring security incident and activating response team',
        status: 'pending'
      },
      {
        id: 'containment',
        title: 'Containment',
        description: 'Implementing immediate containment measures',
        status: 'pending',
        substeps: [
          { id: 'isolate_systems', title: 'Isolate Affected Systems', description: 'Network isolation and quarantine', status: 'pending' },
          { id: 'block_indicators', title: 'Block Malicious Indicators', description: 'Updating security controls', status: 'pending' },
          { id: 'preserve_evidence', title: 'Preserve Evidence', description: 'Securing forensic evidence', status: 'pending' }
        ]
      },
      {
        id: 'eradication',
        title: 'Eradication',
        description: 'Removing threat from environment',
        status: 'pending',
        substeps: [
          { id: 'malware_removal', title: 'Malware Removal', description: 'Cleaning infected systems', status: 'pending' },
          { id: 'patch_vulnerabilities', title: 'Patch Vulnerabilities', description: 'Applying security patches', status: 'pending' },
          { id: 'credential_reset', title: 'Reset Compromised Credentials', description: 'Updating passwords and certificates', status: 'pending' }
        ]
      },
      {
        id: 'recovery',
        title: 'Recovery',
        description: 'Restoring normal operations',
        status: 'pending'
      },
      {
        id: 'lessons_learned',
        title: 'Lessons Learned',
        description: 'Post-incident review and improvement recommendations',
        status: 'pending'
      }
    ],
    'threat_hunting': [
      {
        id: 'hunt_planning',
        title: 'Hunt Planning',
        description: 'Defining hunt objectives and methodology',
        status: 'pending'
      },
      {
        id: 'data_collection',
        title: 'Data Collection',
        description: 'Gathering relevant data sources for analysis',
        status: 'pending',
        substeps: [
          { id: 'endpoint_data', title: 'Endpoint Data Collection', description: 'Gathering endpoint telemetry', status: 'pending' },
          { id: 'network_data', title: 'Network Data Collection', description: 'Collecting network traffic data', status: 'pending' },
          { id: 'log_aggregation', title: 'Log Aggregation', description: 'Centralizing security logs', status: 'pending' }
        ]
      },
      {
        id: 'hypothesis_testing',
        title: 'Hypothesis Testing',
        description: 'Testing threat hypotheses against collected data',
        status: 'pending'
      },
      {
        id: 'pattern_analysis',
        title: 'Pattern Analysis',
        description: 'Identifying suspicious patterns and anomalies',
        status: 'pending'
      },
      {
        id: 'hunt_results',
        title: 'Hunt Results',
        description: 'Documenting findings and creating detection rules',
        status: 'pending'
      }
    ],
    'forensic_analysis': [
      {
        id: 'evidence_acquisition',
        title: 'Evidence Acquisition',
        description: 'Securing and acquiring digital evidence',
        status: 'pending'
      },
      {
        id: 'evidence_preservation',
        title: 'Evidence Preservation',
        description: 'Ensuring evidence integrity and chain of custody',
        status: 'pending'
      },
      {
        id: 'analysis_preparation',
        title: 'Analysis Preparation',
        description: 'Setting up forensic analysis environment',
        status: 'pending'
      },
      {
        id: 'detailed_analysis',
        title: 'Detailed Analysis',
        description: 'Conducting comprehensive forensic examination',
        status: 'pending',
        substeps: [
          { id: 'file_analysis', title: 'File System Analysis', description: 'Examining file system artifacts', status: 'pending' },
          { id: 'memory_analysis', title: 'Memory Analysis', description: 'Analyzing memory dumps', status: 'pending' },
          { id: 'network_forensics', title: 'Network Forensics', description: 'Examining network evidence', status: 'pending' },
          { id: 'timeline_reconstruction', title: 'Timeline Reconstruction', description: 'Building event timeline', status: 'pending' }
        ]
      },
      {
        id: 'report_generation',
        title: 'Report Generation',
        description: 'Creating detailed forensic report',
        status: 'pending'
      }
    ]
  }

  // Initialize workflow steps based on action
  useEffect(() => {
    if (action && isOpen) {
      const workflowKey = action.id || 'monitor_investigate'
      const workflowSteps = workflowDefinitions[workflowKey] || workflowDefinitions['monitor_investigate']
      setSteps([...workflowSteps])
      setCurrentStep(0)
      setResults([])
      setIsRunning(false)
      setActiveTab(0)
    }
  }, [action, isOpen])

  // Simulate workflow execution
  const executeWorkflow = async () => {
    setIsRunning(true)
    const updatedSteps = [...steps]

    for (let i = 0; i < updatedSteps.length; i++) {
      setCurrentStep(i)
      updatedSteps[i].status = 'running'
      setSteps([...updatedSteps])

      // Execute substeps if they exist
      if (updatedSteps[i].substeps) {
        for (let j = 0; j < updatedSteps[i].substeps!.length; j++) {
          updatedSteps[i].substeps![j].status = 'running'
          setSteps([...updatedSteps])
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          updatedSteps[i].substeps![j].status = 'completed'
          updatedSteps[i].substeps![j].duration = Math.floor(Math.random() * 3000) + 500
          setSteps([...updatedSteps])
        }
      }

      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, 2000))

      updatedSteps[i].status = 'completed'
      updatedSteps[i].duration = Math.floor(Math.random() * 5000) + 1000
      setSteps([...updatedSteps])

      // Generate mock results for each step
      const mockResult = generateMockResult(updatedSteps[i], targetData)
      setResults(prev => [...prev, mockResult])
    }

    setIsRunning(false)
    toast({
      title: 'Workflow Completed',
      description: `${action?.title || 'SOC Workflow'} completed successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  // Generate realistic mock results
  const generateMockResult = (step: WorkflowStep, data: any): MockResult => {
    const mockResults: { [key: string]: MockResult } = {
      'initial_triage': {
        status: 'warning',
        title: 'Suspicious Activity Detected',
        description: 'Initial analysis reveals potential security concerns requiring further investigation.',
        data: {
          'Risk Score': '7.2/10',
          'Confidence Level': '85%',
          'Data Sources': '12 systems',
          'Time Range': 'Last 24 hours'
        },
        recommendations: [
          'Escalate to Tier 2 analyst for deep dive analysis',
          'Implement temporary monitoring on affected systems',
          'Notify stakeholders of potential security event'
        ],
        artifacts: [
          { name: 'System Logs', type: 'log', size: '2.3 MB' },
          { name: 'Network Capture', type: 'pcap', size: '15.7 MB' },
          { name: 'Process List', type: 'csv', size: '156 KB' }
        ]
      },
      'deep_analysis': {
        status: 'error',
        title: 'Malicious Activity Confirmed',
        description: 'Deep analysis confirms presence of advanced persistent threat with lateral movement indicators.',
        data: {
          'Threat Actor': 'APT-29 (Cozy Bear)',
          'Attack Vector': 'Spear Phishing',
          'Persistence Mechanism': 'Registry Modification',
          'Lateral Movement': 'WMI/PowerShell'
        },
        recommendations: [
          'Immediate containment of affected systems',
          'Hunt for additional compromised assets',
          'Activate incident response team'
        ],
        artifacts: [
          { name: 'Malware Sample', type: 'exe', size: '2.1 MB' },
          { name: 'IOC List', type: 'json', size: '45 KB' },
          { name: 'Attack Timeline', type: 'pdf', size: '890 KB' }
        ]
      },
      'threat_assessment': {
        status: 'error',
        title: 'High Risk Threat Identified',
        description: 'Threat assessment indicates high probability of data exfiltration and system compromise.',
        data: {
          'Risk Level': 'HIGH',
          'Business Impact': 'Critical',
          'Affected Assets': '23 systems',
          'Estimated Damage': '$2.3M potential'
        },
        recommendations: [
          'Declare major security incident',
          'Activate crisis management team',
          'Prepare external communication plan'
        ]
      },
      'incident_declaration': {
        status: 'warning',
        title: 'Security Incident Declared',
        description: 'Major security incident formally declared. Response team activated.',
        data: {
          'Incident ID': 'INC-2024-0157',
          'Severity': 'High',
          'Response Team': '8 members',
          'Estimated Duration': '72 hours'
        },
        timeline: [
          { time: '14:32', event: 'Incident declared', status: 'completed' },
          { time: '14:35', event: 'Response team notified', status: 'completed' },
          { time: '14:40', event: 'War room established', status: 'completed' },
          { time: '14:45', event: 'Stakeholders briefed', status: 'in-progress' }
        ]
      },
      'containment': {
        status: 'success',
        title: 'Containment Successful',
        description: 'Threat successfully contained. No further lateral movement detected.',
        data: {
          'Systems Isolated': '23',
          'Network Segments': '4',
          'Blocked IOCs': '156',
          'Containment Time': '18 minutes'
        },
        recommendations: [
          'Proceed with eradication phase',
          'Continue monitoring for persistence',
          'Prepare recovery procedures'
        ]
      }
    }

    return mockResults[step.id] || {
      status: 'success',
      title: `${step.title} Completed`,
      description: `${step.description} executed successfully.`,
      data: {
        'Execution Time': `${step.duration || 1500}ms`,
        'Status': 'Success',
        'Target': targetId
      },
      recommendations: ['Review results and proceed to next step']
    }
  }

  const renderFormFields = () => {
    if (!action) return null

    switch (action.id) {
      case 'incident_response':
        return (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Incident Severity</FormLabel>
              <Select
                value={incidentForm.severity}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Incident Category</FormLabel>
              <Select
                value={incidentForm.category}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Security Incident">Security Incident</option>
                <option value="Data Breach">Data Breach</option>
                <option value="Malware Infection">Malware Infection</option>
                <option value="Unauthorized Access">Unauthorized Access</option>
                <option value="DDoS Attack">DDoS Attack</option>
                <option value="Insider Threat">Insider Threat</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={incidentForm.description}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the incident..."
                rows={4}
              />
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Assignee</FormLabel>
                <Select
                  value={incidentForm.assignee}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, assignee: e.target.value }))}
                >
                  <option value="Auto-assign">Auto-assign</option>
                  <option value="Sarah Chen">Sarah Chen (Senior Analyst)</option>
                  <option value="Mike Rodriguez">Mike Rodriguez (Lead Investigator)</option>
                  <option value="Alex Thompson">Alex Thompson (Incident Manager)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={incidentForm.priority}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Estimated Impact</FormLabel>
              <RadioGroup
                value={incidentForm.estimatedImpact}
                onChange={(value) => setIncidentForm(prev => ({ ...prev, estimatedImpact: value }))}
              >
                <Stack direction="row" spacing={6}>
                  <Radio value="Low">Low</Radio>
                  <Radio value="Medium">Medium</Radio>
                  <Radio value="High">High</Radio>
                  <Radio value="Critical">Critical</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Immediate Containment Actions</FormLabel>
              <Textarea
                value={incidentForm.containmentActions}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, containmentActions: e.target.value }))}
                placeholder="Describe immediate containment measures taken..."
                rows={3}
              />
            </FormControl>
          </VStack>
        )

      case 'threat_hunting':
        return (
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Hunt Type</FormLabel>
                <Select
                  value={threatHuntForm.huntType}
                  onChange={(e) => setThreatHuntForm(prev => ({ ...prev, huntType: e.target.value }))}
                >
                  <option value="Proactive Hunt">Proactive Hunt</option>
                  <option value="Reactive Hunt">Reactive Hunt</option>
                  <option value="IOC Hunt">IOC Hunt</option>
                  <option value="Behavioral Hunt">Behavioral Hunt</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Time Range</FormLabel>
                <Select
                  value={threatHuntForm.timeRange}
                  onChange={(e) => setThreatHuntForm(prev => ({ ...prev, timeRange: e.target.value }))}
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Confidence Level: {threatHuntForm.confidence}%</FormLabel>
              <Slider
                value={threatHuntForm.confidence}
                onChange={(value) => setThreatHuntForm(prev => ({ ...prev, confidence: value }))}
                min={0}
                max={100}
                step={5}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
                <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">25%</SliderMark>
                <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">50%</SliderMark>
                <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">75%</SliderMark>
              </Slider>
            </FormControl>

            <FormControl>
              <FormLabel>Hunt Scope</FormLabel>
              <RadioGroup
                value={threatHuntForm.scope}
                onChange={(value) => setThreatHuntForm(prev => ({ ...prev, scope: value }))}
              >
                <Stack direction="column" spacing={2}>
                  <Radio value="Network-wide">Network-wide</Radio>
                  <Radio value="Specific Segment">Specific Network Segment</Radio>
                  <Radio value="Critical Assets">Critical Assets Only</Radio>
                  <Radio value="User Endpoints">User Endpoints</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Methodology</FormLabel>
              <Select
                value={threatHuntForm.methodology}
                onChange={(e) => setThreatHuntForm(prev => ({ ...prev, methodology: e.target.value }))}
              >
                <option value="MITRE ATT&CK">MITRE ATT&CK Framework</option>
                <option value="Cyber Kill Chain">Cyber Kill Chain</option>
                <option value="Diamond Model">Diamond Model</option>
                <option value="Custom">Custom Methodology</option>
              </Select>
            </FormControl>
          </VStack>
        )

      case 'forensic_analysis':
        return (
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Evidence Type</FormLabel>
                <Select
                  value={forensicsForm.evidenceType}
                  onChange={(e) => setForensicsForm(prev => ({ ...prev, evidenceType: e.target.value }))}
                >
                  <option value="Network Traffic">Network Traffic</option>
                  <option value="Disk Image">Disk Image</option>
                  <option value="Memory Dump">Memory Dump</option>
                  <option value="Log Files">Log Files</option>
                  <option value="Mobile Device">Mobile Device</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Preservation Method</FormLabel>
                <Select
                  value={forensicsForm.preservationMethod}
                  onChange={(e) => setForensicsForm(prev => ({ ...prev, preservationMethod: e.target.value }))}
                >
                  <option value="Live Capture">Live Capture</option>
                  <option value="Bit-for-bit Copy">Bit-for-bit Copy</option>
                  <option value="Logical Copy">Logical Copy</option>
                  <option value="Remote Acquisition">Remote Acquisition</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Chain of Custody</FormLabel>
              <Textarea
                value={forensicsForm.chainOfCustody}
                onChange={(e) => setForensicsForm(prev => ({ ...prev, chainOfCustody: e.target.value }))}
                placeholder="Document chain of custody details..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Analysis Tools</FormLabel>
              <Stack direction="column" spacing={2}>
                {['Volatility', 'Autopsy', 'Wireshark', 'YARA', 'Sleuth Kit', 'X-Ways Forensics'].map(tool => (
                  <Checkbox
                    key={tool}
                    isChecked={forensicsForm.analysisTools.includes(tool)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForensicsForm(prev => ({
                          ...prev,
                          analysisTools: [...prev.analysisTools, tool]
                        }))
                      } else {
                        setForensicsForm(prev => ({
                          ...prev,
                          analysisTools: prev.analysisTools.filter(t => t !== tool)
                        }))
                      }
                    }}
                  >
                    {tool}
                  </Checkbox>
                ))}
              </Stack>
            </FormControl>
          </VStack>
        )

      default:
        return (
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Workflow Configuration</AlertTitle>
                <AlertDescription>
                  Configure parameters for {action?.title || 'this workflow'} execution.
                </AlertDescription>
              </Box>
            </Alert>
            <FormControl>
              <FormLabel>Analysis Depth</FormLabel>
              <Select defaultValue="standard">
                <option value="basic">Basic Analysis</option>
                <option value="standard">Standard Analysis</option>
                <option value="deep">Deep Analysis</option>
                <option value="comprehensive">Comprehensive Analysis</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Time Range</FormLabel>
              <Select defaultValue="24h">
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </Select>
            </FormControl>
          </VStack>
        )
    }
  }

  const renderResults = () => {
    if (results.length === 0) return null

    return (
      <VStack spacing={4} align="stretch">
        {results.map((result, index) => (
          <Card key={index} variant="outline">
            <CardHeader>
              <HStack>
                <Icon
                  as={result.status === 'success' ? FiCheckCircle : result.status === 'warning' ? FiAlertCircle : FiXCircle}
                  color={result.status === 'success' ? 'green.500' : result.status === 'warning' ? 'orange.500' : 'red.500'}
                />
                <Heading size="sm">{result.title}</Heading>
                <Badge colorScheme={result.status === 'success' ? 'green' : result.status === 'warning' ? 'orange' : 'red'}>
                  {result.status.toUpperCase()}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text>{result.description}</Text>
                
                {result.data && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Key Findings:</Text>
                    <SimpleGrid columns={2} spacing={2}>
                      {Object.entries(result.data).map(([key, value]) => (
                        <HStack key={key} justify="space-between">
                          <Text fontSize="sm" color="gray.600">{key}:</Text>
                          <Text fontSize="sm" fontWeight="medium">{String(value)}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {result.artifacts && result.artifacts.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Evidence Artifacts:</Text>
                    <VStack spacing={1} align="stretch">
                      {result.artifacts.map((artifact, i) => (
                        <HStack key={i} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <HStack>
                            <Icon as={FiFileText} />
                            <Text fontSize="sm">{artifact.name}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">{artifact.size}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {result.timeline && result.timeline.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Timeline:</Text>
                    <VStack spacing={1} align="stretch">
                      {result.timeline.map((event, i) => (
                        <HStack key={i} justify="space-between">
                          <HStack>
                            <Icon
                              as={event.status === 'completed' ? FiCheck : FiClock}
                              color={event.status === 'completed' ? 'green.500' : 'orange.500'}
                            />
                            <Text fontSize="sm">{event.event}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">{event.time}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Recommendations:</Text>
                    <UnorderedList spacing={1}>
                      {result.recommendations.map((rec, i) => (
                        <ListItem key={i} fontSize="sm">{rec}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    )
  }

  const renderWorkflowProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length
    const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

    return (
      <VStack spacing={4} align="stretch">
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold">Workflow Progress</Text>
            <Text fontSize="sm" color="gray.600">
              {completedSteps} of {steps.length} steps completed
            </Text>
          </HStack>
          <Progress value={progressPercentage} colorScheme="blue" size="lg" />
        </Box>

        <VStack spacing={3} align="stretch">
          {steps.map((step, index) => (
            <Box key={step.id}>
              <Card variant={index === currentStep && isRunning ? 'filled' : 'outline'}>
                <CardBody>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon
                        as={
                          step.status === 'completed' ? FiCheck :
                          step.status === 'running' ? FiActivity :
                          step.status === 'failed' ? FiX : FiClock
                        }
                        color={
                          step.status === 'completed' ? 'green.500' :
                          step.status === 'running' ? 'blue.500' :
                          step.status === 'failed' ? 'red.500' : 'gray.400'
                        }
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{step.title}</Text>
                        <Text fontSize="sm" color="gray.600">{step.description}</Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={0}>
                      <Badge
                        colorScheme={
                          step.status === 'completed' ? 'green' :
                          step.status === 'running' ? 'blue' :
                          step.status === 'failed' ? 'red' : 'gray'
                        }
                      >
                        {step.status}
                      </Badge>
                      {step.duration && (
                        <Text fontSize="xs" color="gray.500">
                          {step.duration}ms
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {step.substeps && step.substeps.length > 0 && (
                    <Box mt={3} ml={6}>
                      <VStack spacing={2} align="stretch">
                        {step.substeps.map((substep, subIndex) => (
                          <HStack key={substep.id} justify="space-between">
                            <HStack>
                              <Icon
                                as={
                                  substep.status === 'completed' ? FiCheck :
                                  substep.status === 'running' ? FiActivity : FiClock
                                }
                                color={
                                  substep.status === 'completed' ? 'green.500' :
                                  substep.status === 'running' ? 'blue.500' : 'gray.400'
                                }
                                boxSize={3}
                              />
                              <Text fontSize="sm">{substep.title}</Text>
                            </HStack>
                            {substep.duration && (
                              <Text fontSize="xs" color="gray.500">
                                {substep.duration}ms
                              </Text>
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </Box>
          ))}
        </VStack>
      </VStack>
    )
  }

  if (!action) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <Icon as={FiShield} color="blue.500" />
            <VStack align="start" spacing={0}>
              <Text>{action.title}</Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.600">
                Target: {targetType} {targetId}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Configuration</Tab>
              <Tab>Execution</Tab>
              <Tab>Results</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>SOC Workflow: {action.title}</AlertTitle>
                      <AlertDescription>
                        {action.description}
                      </AlertDescription>
                    </Box>
                  </Alert>
                  {renderFormFields()}
                </VStack>
              </TabPanel>

              <TabPanel>
                {renderWorkflowProgress()}
              </TabPanel>

              <TabPanel>
                {renderResults()}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {activeTab === 0 && (
              <Button
                colorScheme="blue"
                onClick={() => setActiveTab(1)}
                leftIcon={<FiPlay />}
              >
                Start Workflow
              </Button>
            )}
            {activeTab === 1 && (
              <Button
                colorScheme="green"
                onClick={executeWorkflow}
                isLoading={isRunning}
                loadingText="Executing..."
                leftIcon={<FiZap />}
                isDisabled={isRunning}
              >
                Execute
              </Button>
            )}
            {activeTab === 2 && results.length > 0 && (
              <Button
                colorScheme="blue"
                leftIcon={<FiDownload />}
              >
                Export Report
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SOCWorkflowDialogEnhanced

