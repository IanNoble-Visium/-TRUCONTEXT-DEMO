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
  Progress,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  Flex,
  Spacer,
  Avatar,
  AvatarGroup,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react'
import {
  CheckCircleIcon,
  TimeIcon,
  WarningIcon,
  InfoIcon,
  EditIcon,
  DeleteIcon,
  AddIcon,
  EmailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  RepeatIcon,
  DownloadIcon,
  SettingsIcon,
  CalendarIcon,
  BellIcon,
  ChatIcon
} from '@chakra-ui/icons'
import { ThreatPathScenario, SOCAction, WorkflowTemplate, WorkflowExecution, ActionStatus } from '../types/threatPath'

interface ThreatPathWorkflowManagerProps {
  threatPath: ThreatPathScenario
  actions: SOCAction[]
  onActionUpdate: (actionId: string, updates: Partial<SOCAction>) => void
  onWorkflowExecute: (workflow: WorkflowExecution) => void
  onNotificationSend: (notification: any) => void
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  actionType: 'containment' | 'investigation' | 'remediation' | 'preventive'
  estimatedDuration: string
  dependencies: string[]
  assignedRole: string
  automatable: boolean
  approvalRequired: boolean
  criticalPath: boolean
}

interface WorkflowProgress {
  totalSteps: number
  completedSteps: number
  inProgressSteps: number
  pendingSteps: number
  failedSteps: number
  estimatedCompletion: string
  actualDuration: string
}

const ThreatPathWorkflowManager: React.FC<ThreatPathWorkflowManagerProps> = ({
  threatPath,
  actions,
  onActionUpdate,
  onWorkflowExecute,
  onNotificationSend
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null)
  const [workflowExecution, setWorkflowExecution] = useState<WorkflowExecution | null>(null)
  const [customWorkflow, setCustomWorkflow] = useState<WorkflowStep[]>([])
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Sarah Chen', role: 'SOC Analyst L2', avatar: '', status: 'online' },
    { id: '2', name: 'Mike Rodriguez', role: 'SOC Analyst L3', avatar: '', status: 'online' },
    { id: '3', name: 'Dr. Emily Watson', role: 'CISO', avatar: '', status: 'away' },
    { id: '4', name: 'James Park', role: 'Incident Response', avatar: '', status: 'online' },
    { id: '5', name: 'Lisa Thompson', role: 'Threat Hunter', avatar: '', status: 'busy' }
  ])
  
  const { isOpen: isWorkflowModalOpen, onOpen: onWorkflowModalOpen, onClose: onWorkflowModalClose } = useDisclosure()
  const { isOpen: isCustomModalOpen, onOpen: onCustomModalOpen, onClose: onCustomModalClose } = useDisclosure()
  const { isOpen: isNotificationModalOpen, onOpen: onNotificationModalOpen, onClose: onNotificationModalClose } = useDisclosure()
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Predefined workflow templates
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'critical-incident',
      name: 'Critical Incident Response',
      description: 'Comprehensive response for critical security incidents',
      severity: 'Critical',
      estimatedDuration: '4-8 hours',
      steps: [
        {
          id: 'immediate-containment',
          title: 'Immediate Containment',
          description: 'Isolate affected systems and block malicious traffic',
          actionType: 'containment',
          estimatedDuration: '30 minutes',
          dependencies: [],
          assignedRole: 'SOC Analyst L2',
          automatable: true,
          approvalRequired: false,
          criticalPath: true
        },
        {
          id: 'stakeholder-notification',
          title: 'Stakeholder Notification',
          description: 'Notify CISO and relevant stakeholders',
          actionType: 'investigation',
          estimatedDuration: '15 minutes',
          dependencies: ['immediate-containment'],
          assignedRole: 'SOC Analyst L3',
          automatable: false,
          approvalRequired: false,
          criticalPath: true
        },
        {
          id: 'forensic-collection',
          title: 'Forensic Evidence Collection',
          description: 'Collect and preserve forensic evidence',
          actionType: 'investigation',
          estimatedDuration: '2 hours',
          dependencies: ['immediate-containment'],
          assignedRole: 'Incident Response',
          automatable: false,
          approvalRequired: false,
          criticalPath: false
        },
        {
          id: 'threat-analysis',
          title: 'Threat Intelligence Analysis',
          description: 'Analyze threat indicators and attribution',
          actionType: 'investigation',
          estimatedDuration: '1 hour',
          dependencies: ['forensic-collection'],
          assignedRole: 'Threat Hunter',
          automatable: false,
          approvalRequired: false,
          criticalPath: false
        },
        {
          id: 'system-remediation',
          title: 'System Remediation',
          description: 'Clean and restore affected systems',
          actionType: 'remediation',
          estimatedDuration: '3 hours',
          dependencies: ['forensic-collection'],
          assignedRole: 'SOC Analyst L2',
          automatable: true,
          approvalRequired: true,
          criticalPath: true
        },
        {
          id: 'security-hardening',
          title: 'Security Hardening',
          description: 'Implement additional security controls',
          actionType: 'preventive',
          estimatedDuration: '2 hours',
          dependencies: ['system-remediation'],
          assignedRole: 'SOC Analyst L3',
          automatable: false,
          approvalRequired: false,
          criticalPath: false
        }
      ]
    },
    {
      id: 'apt-response',
      name: 'APT Investigation Workflow',
      description: 'Specialized workflow for Advanced Persistent Threat incidents',
      severity: 'High',
      estimatedDuration: '1-3 days',
      steps: [
        {
          id: 'initial-triage',
          title: 'Initial Triage',
          description: 'Assess scope and impact of APT activity',
          actionType: 'investigation',
          estimatedDuration: '2 hours',
          dependencies: [],
          assignedRole: 'SOC Analyst L3',
          automatable: false,
          approvalRequired: false,
          criticalPath: true
        },
        {
          id: 'covert-monitoring',
          title: 'Covert Monitoring Setup',
          description: 'Deploy enhanced monitoring without alerting attackers',
          actionType: 'investigation',
          estimatedDuration: '4 hours',
          dependencies: ['initial-triage'],
          assignedRole: 'Threat Hunter',
          automatable: false,
          approvalRequired: true,
          criticalPath: true
        },
        {
          id: 'attribution-analysis',
          title: 'Attribution Analysis',
          description: 'Identify threat actor and campaign',
          actionType: 'investigation',
          estimatedDuration: '8 hours',
          dependencies: ['covert-monitoring'],
          assignedRole: 'Threat Hunter',
          automatable: false,
          approvalRequired: false,
          criticalPath: false
        },
        {
          id: 'coordinated-response',
          title: 'Coordinated Response',
          description: 'Execute coordinated containment and eradication',
          actionType: 'containment',
          estimatedDuration: '6 hours',
          dependencies: ['attribution-analysis'],
          assignedRole: 'Incident Response',
          automatable: false,
          approvalRequired: true,
          criticalPath: true
        }
      ]
    },
    {
      id: 'ransomware-response',
      name: 'Ransomware Response',
      description: 'Rapid response workflow for ransomware incidents',
      severity: 'Critical',
      estimatedDuration: '2-6 hours',
      steps: [
        {
          id: 'network-isolation',
          title: 'Network Isolation',
          description: 'Immediately isolate affected networks',
          actionType: 'containment',
          estimatedDuration: '15 minutes',
          dependencies: [],
          assignedRole: 'SOC Analyst L2',
          automatable: true,
          approvalRequired: false,
          criticalPath: true
        },
        {
          id: 'backup-verification',
          title: 'Backup Verification',
          description: 'Verify integrity of backup systems',
          actionType: 'investigation',
          estimatedDuration: '30 minutes',
          dependencies: ['network-isolation'],
          assignedRole: 'SOC Analyst L3',
          automatable: false,
          approvalRequired: false,
          criticalPath: true
        },
        {
          id: 'ransom-analysis',
          title: 'Ransomware Analysis',
          description: 'Identify ransomware variant and capabilities',
          actionType: 'investigation',
          estimatedDuration: '2 hours',
          dependencies: ['network-isolation'],
          assignedRole: 'Threat Hunter',
          automatable: false,
          approvalRequired: false,
          criticalPath: false
        },
        {
          id: 'recovery-planning',
          title: 'Recovery Planning',
          description: 'Plan system recovery and restoration',
          actionType: 'remediation',
          estimatedDuration: '1 hour',
          dependencies: ['backup-verification', 'ransom-analysis'],
          assignedRole: 'Incident Response',
          automatable: false,
          approvalRequired: true,
          criticalPath: true
        }
      ]
    }
  ]
  
  // Calculate workflow progress
  useEffect(() => {
    if (workflowExecution) {
      const totalSteps = workflowExecution.steps.length
      const completedSteps = workflowExecution.steps.filter(step => step.status === 'completed').length
      const inProgressSteps = workflowExecution.steps.filter(step => step.status === 'in_progress').length
      const pendingSteps = workflowExecution.steps.filter(step => step.status === 'pending').length
      const failedSteps = workflowExecution.steps.filter(step => step.status === 'failed').length
      
      const progress: WorkflowProgress = {
        totalSteps,
        completedSteps,
        inProgressSteps,
        pendingSteps,
        failedSteps,
        estimatedCompletion: calculateEstimatedCompletion(workflowExecution),
        actualDuration: calculateActualDuration(workflowExecution)
      }
      
      setWorkflowProgress(progress)
    }
  }, [workflowExecution])
  
  const calculateEstimatedCompletion = (execution: WorkflowExecution): string => {
    // Simple estimation based on remaining steps and average duration
    const remainingSteps = execution.steps.filter(step => step.status !== 'completed').length
    const avgDuration = 60 // minutes per step
    const estimatedMinutes = remainingSteps * avgDuration
    
    const completionTime = new Date(Date.now() + estimatedMinutes * 60000)
    return completionTime.toLocaleString()
  }
  
  const calculateActualDuration = (execution: WorkflowExecution): string => {
    if (!execution.startedAt) return '0 minutes'
    
    const startTime = new Date(execution.startedAt)
    const endTime = execution.completedAt ? new Date(execution.completedAt) : new Date()
    const durationMs = endTime.getTime() - startTime.getTime()
    const durationMinutes = Math.floor(durationMs / 60000)
    
    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }
  
  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'pending': return 'yellow'
      case 'in_progress': return 'blue'
      case 'completed': return 'green'
      case 'failed': return 'red'
      case 'cancelled': return 'gray'
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
  
  const handleWorkflowStart = async (template: WorkflowTemplate) => {
    try {
      const execution: WorkflowExecution = {
        id: `workflow-${Date.now()}`,
        threatPathId: threatPath.id,
        templateId: template.id,
        name: template.name,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        steps: template.steps.map(step => ({
          ...step,
          status: step.dependencies.length === 0 ? 'pending' : 'waiting',
          startedAt: step.dependencies.length === 0 ? new Date().toISOString() : undefined
        }))
      }
      
      setWorkflowExecution(execution)
      await onWorkflowExecute(execution)
      
      // Send initial notifications
      await sendWorkflowNotifications(execution, 'started')
      
      toast({
        title: 'Workflow Started',
        description: `${template.name} workflow has been initiated`,
        status: 'success',
        duration: 3000
      })
      
      onWorkflowModalClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start workflow',
        status: 'error',
        duration: 5000
      })
    }
  }
  
  const handleStepUpdate = async (stepId: string, updates: any) => {
    if (!workflowExecution) return
    
    const updatedSteps = workflowExecution.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, ...updates }
      }
      return step
    })
    
    // Check for newly available steps
    updatedSteps.forEach(step => {
      if (step.status === 'waiting') {
        const dependenciesMet = step.dependencies.every(depId =>
          updatedSteps.find(s => s.id === depId)?.status === 'completed'
        )
        
        if (dependenciesMet) {
          step.status = 'pending'
          step.startedAt = new Date().toISOString()
        }
      }
    })
    
    const updatedExecution = {
      ...workflowExecution,
      steps: updatedSteps
    }
    
    setWorkflowExecution(updatedExecution)
    
    // Check if workflow is complete
    const allCompleted = updatedSteps.every(step => 
      step.status === 'completed' || step.status === 'cancelled'
    )
    
    if (allCompleted) {
      updatedExecution.status = 'completed'
      updatedExecution.completedAt = new Date().toISOString()
      await sendWorkflowNotifications(updatedExecution, 'completed')
    }
  }
  
  const sendWorkflowNotifications = async (execution: WorkflowExecution, event: string) => {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'workflow',
      event,
      workflowId: execution.id,
      threatPathId: execution.threatPathId,
      message: `Workflow "${execution.name}" ${event}`,
      timestamp: new Date().toISOString(),
      recipients: teamMembers.map(member => member.id)
    }
    
    setNotifications(prev => [notification, ...prev])
    await onNotificationSend(notification)
  }
  
  const renderWorkflowTemplates = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">Workflow Templates</Text>
      
      {workflowTemplates.map(template => (
        <Card
          key={template.id}
          cursor="pointer"
          onClick={() => setSelectedWorkflow(template)}
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          borderLeft="4px solid"
          borderLeftColor={getSeverityColor(template.severity) + '.500'}
        >
          <CardBody>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg">{template.name}</Text>
                  <Badge colorScheme={getSeverityColor(template.severity)}>
                    {template.severity}
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" color="gray.600">
                  {template.description}
                </Text>
                
                <HStack spacing={4} fontSize="sm" color="gray.500">
                  <HStack>
                    <TimeIcon />
                    <Text>{template.estimatedDuration}</Text>
                  </HStack>
                  <HStack>
                    <InfoIcon />
                    <Text>{template.steps.length} steps</Text>
                  </HStack>
                  <HStack>
                    <CheckCircleIcon />
                    <Text>{template.steps.filter(s => s.automatable).length} automated</Text>
                  </HStack>
                </HStack>
              </VStack>
              
              <Button
                colorScheme={getSeverityColor(template.severity)}
                onClick={(e) => {
                  e.stopPropagation()
                  handleWorkflowStart(template)
                }}
              >
                Start Workflow
              </Button>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  )
  
  const renderWorkflowProgress = () => {
    if (!workflowExecution || !workflowProgress) return null
    
    const progressPercentage = (workflowProgress.completedSteps / workflowProgress.totalSteps) * 100
    
    return (
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{workflowExecution.name}</Text>
              <Text fontSize="sm" color="gray.600">
                Started: {new Date(workflowExecution.startedAt!).toLocaleString()}
              </Text>
            </VStack>
            
            <Badge colorScheme={getStatusColor(workflowExecution.status)} size="lg">
              {workflowExecution.status.replace('_', ' ')}
            </Badge>
          </HStack>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={4}>
            {/* Progress Overview */}
            <Box width="100%">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="bold">Overall Progress</Text>
                <Text fontSize="sm">{Math.round(progressPercentage)}%</Text>
              </HStack>
              <Progress value={progressPercentage} colorScheme="blue" size="lg" />
            </Box>
            
            {/* Progress Stats */}
            <Grid templateColumns="repeat(5, 1fr)" gap={4} width="100%">
              <Stat textAlign="center">
                <StatNumber color="green.500">{workflowProgress.completedSteps}</StatNumber>
                <StatLabel fontSize="xs">Completed</StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="blue.500">{workflowProgress.inProgressSteps}</StatNumber>
                <StatLabel fontSize="xs">In Progress</StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="yellow.500">{workflowProgress.pendingSteps}</StatNumber>
                <StatLabel fontSize="xs">Pending</StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="red.500">{workflowProgress.failedSteps}</StatNumber>
                <StatLabel fontSize="xs">Failed</StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber fontSize="sm">{workflowProgress.actualDuration}</StatNumber>
                <StatLabel fontSize="xs">Duration</StatLabel>
              </Stat>
            </Grid>
            
            {/* Estimated Completion */}
            {workflowExecution.status === 'in_progress' && (
              <Alert status="info" size="sm">
                <AlertIcon />
                <AlertTitle fontSize="sm">Estimated Completion:</AlertTitle>
                <AlertDescription fontSize="sm">
                  {workflowProgress.estimatedCompletion}
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    )
  }
  
  const renderWorkflowSteps = () => {
    if (!workflowExecution) return null
    
    return (
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontWeight="bold">Workflow Steps</Text>
            <ButtonGroup size="sm">
              <Button leftIcon={<BellIcon />} variant="outline">
                Notifications
              </Button>
              <Button leftIcon={<ChatIcon />} variant="outline">
                Team Chat
              </Button>
            </ButtonGroup>
          </HStack>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={4} align="stretch">
            {workflowExecution.steps.map((step, index) => (
              <Card
                key={step.id}
                size="sm"
                borderLeft="4px solid"
                borderLeftColor={getStatusColor(step.status) + '.500'}
              >
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack>
                        <Text fontWeight="bold">{step.title}</Text>
                        <Badge colorScheme={getStatusColor(step.status)} size="sm">
                          {step.status.replace('_', ' ')}
                        </Badge>
                        {step.criticalPath && (
                          <Badge colorScheme="red" variant="outline" size="sm">
                            Critical Path
                          </Badge>
                        )}
                        {step.automatable && (
                          <Badge colorScheme="blue" variant="outline" size="sm">
                            Automated
                          </Badge>
                        )}
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600">
                        {step.description}
                      </Text>
                      
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <Text><strong>Assigned:</strong> {step.assignedRole}</Text>
                        <Text><strong>Duration:</strong> {step.estimatedDuration}</Text>
                        {step.dependencies.length > 0 && (
                          <Text><strong>Depends on:</strong> {step.dependencies.length} steps</Text>
                        )}
                      </HStack>
                      
                      {step.startedAt && (
                        <Text fontSize="xs" color="gray.500">
                          Started: {new Date(step.startedAt).toLocaleString()}
                        </Text>
                      )}
                    </VStack>
                    
                    <VStack spacing={2}>
                      {step.status === 'pending' && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleStepUpdate(step.id, { 
                            status: 'in_progress',
                            startedAt: new Date().toISOString()
                          })}
                        >
                          Start
                        </Button>
                      )}
                      
                      {step.status === 'in_progress' && (
                        <ButtonGroup size="sm">
                          <Button
                            colorScheme="green"
                            onClick={() => handleStepUpdate(step.id, { 
                              status: 'completed',
                              completedAt: new Date().toISOString()
                            })}
                          >
                            Complete
                          </Button>
                          <Button
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleStepUpdate(step.id, { 
                              status: 'failed',
                              failedAt: new Date().toISOString()
                            })}
                          >
                            Mark Failed
                          </Button>
                        </ButtonGroup>
                      )}
                      
                      {step.status === 'completed' && (
                        <CheckCircleIcon color="green.500" />
                      )}
                      
                      {step.status === 'failed' && (
                        <WarningIcon color="red.500" />
                      )}
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </CardBody>
      </Card>
    )
  }
  
  const renderTeamCollaboration = () => (
    <Card>
      <CardHeader>
        <Text fontWeight="bold">Team Collaboration</Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          {/* Team Members */}
          <Box width="100%">
            <Text fontSize="sm" fontWeight="bold" mb={2}>Team Members</Text>
            <VStack spacing={2} align="stretch">
              {teamMembers.map(member => (
                <HStack key={member.id} justify="space-between">
                  <HStack>
                    <Avatar size="sm" name={member.name} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold">{member.name}</Text>
                      <Text fontSize="xs" color="gray.600">{member.role}</Text>
                    </VStack>
                  </HStack>
                  <HStack>
                    <Badge 
                      colorScheme={member.status === 'online' ? 'green' : 
                                 member.status === 'busy' ? 'red' : 'yellow'}
                      size="sm"
                    >
                      {member.status}
                    </Badge>
                    <IconButton
                      size="xs"
                      icon={<EmailIcon />}
                      aria-label="Send email"
                      variant="outline"
                    />
                    <IconButton
                      size="xs"
                      icon={<ChatIcon />}
                      aria-label="Send message"
                      variant="outline"
                    />
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>
          
          <Divider />
          
          {/* Recent Notifications */}
          <Box width="100%">
            <Text fontSize="sm" fontWeight="bold" mb={2}>Recent Notifications</Text>
            <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
              {notifications.slice(0, 5).map(notification => (
                <HStack key={notification.id} p={2} bg="gray.50" borderRadius="md">
                  <BellIcon color="blue.500" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm">{notification.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
  
  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              Workflow Management
            </Text>
            <Text color="gray.600">
              Threat Path: {threatPath.name}
            </Text>
          </VStack>
          
          <ButtonGroup>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onWorkflowModalOpen}
              isDisabled={!!workflowExecution && workflowExecution.status === 'in_progress'}
            >
              Start Workflow
            </Button>
            <Button
              leftIcon={<SettingsIcon />}
              variant="outline"
              onClick={onCustomModalOpen}
            >
              Custom Workflow
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              variant="outline"
            >
              Export Report
            </Button>
          </ButtonGroup>
        </HStack>
        
        {/* Main Content */}
        <Grid templateColumns="2fr 1fr" gap={6}>
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Workflow Progress */}
              {renderWorkflowProgress()}
              
              {/* Workflow Steps */}
              {renderWorkflowSteps()}
              
              {/* Workflow Templates (when no active workflow) */}
              {!workflowExecution && renderWorkflowTemplates()}
            </VStack>
          </GridItem>
          
          <GridItem>
            {/* Team Collaboration */}
            {renderTeamCollaboration()}
          </GridItem>
        </Grid>
        
        {/* Workflow Selection Modal */}
        <Modal isOpen={isWorkflowModalOpen} onClose={onWorkflowModalClose} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select Workflow Template</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {renderWorkflowTemplates()}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={onWorkflowModalClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}

export default ThreatPathWorkflowManager

