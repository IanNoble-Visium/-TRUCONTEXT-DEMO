import React, { useState, useEffect } from 'react'
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
  Divider,
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
  CheckboxGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spacer
} from '@chakra-ui/react'
import {
  LockIcon,
  SearchIcon,
  SettingsIcon,
  WarningIcon,
  CheckCircleIcon,
  TimeIcon,
  InfoIcon,
  ExternalLinkIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  DownloadIcon,
  EmailIcon,
  PhoneIcon,
  UnlockIcon
} from '@chakra-ui/icons'
import { ThreatPathScenario, SOCAction } from '../types/threatPath'

// Define the missing types locally
type ActionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Failed'
type ActionType = 'Containment' | 'Investigation' | 'Remediation' | 'Preventive'

interface ThreatPathActionsProps {
  threatPath: ThreatPathScenario
  onActionExecute: (action: SOCAction) => void
  onActionUpdate: (actionId: string, updates: Partial<SOCAction>) => void
  existingActions: SOCAction[]
}

interface ActionFormData {
  type: ActionType
  title: string
  description: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  assignedTo: string
  estimatedDuration: string
  targetNodes: string[]
  targetIPs: string[]
  targetDomains: string[]
  targetAccounts: string[]
  notes: string
  approvalRequired: boolean
  automatedExecution: boolean
  scheduledTime?: string
}

const ThreatPathActions: React.FC<ThreatPathActionsProps> = ({
  threatPath,
  onActionExecute,
  onActionUpdate,
  existingActions
}) => {
  const [selectedActionType, setSelectedActionType] = useState<ActionType | null>(null)
  const [actionFormData, setActionFormData] = useState<ActionFormData>({
    type: 'Containment',
    title: '',
    description: '',
    priority: 'High',
    assignedTo: '',
    estimatedDuration: '30 minutes',
    targetNodes: [],
    targetIPs: [],
    targetDomains: [],
    targetAccounts: [],
    notes: '',
    approvalRequired: false,
    automatedExecution: false
  })
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set())
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  
  const { isOpen: isActionModalOpen, onOpen: onActionModalOpen, onClose: onActionModalClose } = useDisclosure()
  const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onClose: onBulkModalClose } = useDisclosure()
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Predefined action templates
  const actionTemplates = {
    Containment: [
      {
        title: 'Isolate Affected Systems',
        description: 'Quarantine compromised systems to prevent lateral movement',
        targetType: 'nodes',
        automatable: true,
        priority: 'Critical'
      },
      {
        title: 'Block Malicious IPs',
        description: 'Add malicious IP addresses to firewall blocklist',
        targetType: 'ips',
        automatable: true,
        priority: 'High'
      },
      {
        title: 'Block Malicious Domains',
        description: 'Add malicious domains to DNS blocklist',
        targetType: 'domains',
        automatable: true,
        priority: 'High'
      },
      {
        title: 'Disable Compromised Accounts',
        description: 'Disable user accounts showing signs of compromise',
        targetType: 'accounts',
        automatable: true,
        priority: 'Critical'
      },
      {
        title: 'Segment Network Connections',
        description: 'Implement network segmentation to limit attack spread',
        targetType: 'nodes',
        automatable: false,
        priority: 'High'
      }
    ],
    Investigation: [
      {
        title: 'Mark for Forensic Analysis',
        description: 'Tag systems for detailed forensic investigation',
        targetType: 'nodes',
        automatable: false,
        priority: 'Medium'
      },
      {
        title: 'Assign to SOC Analyst',
        description: 'Assign threat path investigation to specific analyst',
        targetType: 'general',
        automatable: false,
        priority: 'Medium'
      },
      {
        title: 'Collect Additional Logs',
        description: 'Gather extended logs from affected systems',
        targetType: 'nodes',
        automatable: true,
        priority: 'Medium'
      },
      {
        title: 'Cross-Reference Threat Intelligence',
        description: 'Check IOCs against threat intelligence feeds',
        targetType: 'general',
        automatable: true,
        priority: 'Low'
      },
      {
        title: 'Interview System Owners',
        description: 'Contact system owners for additional context',
        targetType: 'general',
        automatable: false,
        priority: 'Low'
      }
    ],
    Remediation: [
      {
        title: 'Flag Vulnerabilities for Patching',
        description: 'Create tickets for vulnerability remediation',
        targetType: 'nodes',
        automatable: true,
        priority: 'High'
      },
      {
        title: 'Schedule System Restoration',
        description: 'Plan system restoration from clean backups',
        targetType: 'nodes',
        automatable: false,
        priority: 'High'
      },
      {
        title: 'Remove Malicious Artifacts',
        description: 'Clean malware and malicious files from systems',
        targetType: 'nodes',
        automatable: true,
        priority: 'Critical'
      },
      {
        title: 'Update Security Configurations',
        description: 'Harden security settings on affected systems',
        targetType: 'nodes',
        automatable: true,
        priority: 'Medium'
      },
      {
        title: 'Reset Compromised Credentials',
        description: 'Force password reset for compromised accounts',
        targetType: 'accounts',
        automatable: true,
        priority: 'Critical'
      }
    ],
    Preventive: [
      {
        title: 'Add to Threat Hunting Watchlist',
        description: 'Monitor for similar attack patterns',
        targetType: 'general',
        automatable: true,
        priority: 'Medium'
      },
      {
        title: 'Create Automated Detection Rules',
        description: 'Develop SIEM rules to detect similar attacks',
        targetType: 'general',
        automatable: false,
        priority: 'Medium'
      },
      {
        title: 'Update Security Policies',
        description: 'Revise security policies based on lessons learned',
        targetType: 'general',
        automatable: false,
        priority: 'Low'
      },
      {
        title: 'Schedule Security Awareness Training',
        description: 'Provide targeted training to prevent similar attacks',
        targetType: 'general',
        automatable: false,
        priority: 'Low'
      },
      {
        title: 'Implement Additional Monitoring',
        description: 'Deploy enhanced monitoring for attack vectors',
        targetType: 'nodes',
        automatable: false,
        priority: 'Medium'
      }
    ]
  }
  
  const getActionTypeIcon = (type: ActionType) => {
    switch (type) {
      case 'Containment': return <LockIcon />
      case 'Investigation': return <SearchIcon />
      case 'Remediation': return <SettingsIcon />
      case 'Preventive': return <WarningIcon />
      default: return <InfoIcon />
    }
  }
  
  const getActionTypeColor = (type: ActionType) => {
    switch (type) {
      case 'Containment': return 'red'
      case 'Investigation': return 'blue'
      case 'Remediation': return 'orange'
      case 'Preventive': return 'green'
      default: return 'gray'
    }
  }
  
  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'Pending': return 'yellow'
      case 'In Progress': return 'blue'
      case 'Completed': return 'green'
      case 'Failed': return 'red'
      case 'Verified': return 'green'
      default: return 'gray'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'red'
      case 'High': return 'orange'
      case 'Medium': return 'yellow'
      case 'Low': return 'green'
      default: return 'gray'
    }
  }
  
  const handleActionTypeSelect = (type: ActionType) => {
    setSelectedActionType(type)
    setActionFormData(prev => ({ ...prev, type }))
    onActionModalOpen()
  }
  
  const handleTemplateSelect = (template: any) => {
    setActionFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      priority: template.priority as any,
      automatedExecution: template.automatable
    }))
  }
  
  const handleActionSubmit = async () => {
    try {
      const newAction: SOCAction = {
        id: `action-${Date.now()}`,
        threatPathId: threatPath.id,
        type: actionFormData.type,
        category: actionFormData.type,
        name: actionFormData.title,
        description: actionFormData.description,
        status: 'Pending',
        priority: actionFormData.priority,
        assignedTo: actionFormData.assignedTo,
        estimatedTime: actionFormData.estimatedDuration,
        automationAvailable: false,
        approvalRequired: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await onActionExecute(newAction)
      
      toast({
        title: 'Action Created',
        description: `${actionFormData.title} has been created successfully`,
        status: 'success',
        duration: 3000
      })
      
      onActionModalClose()
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create action',
        status: 'error',
        duration: 5000
      })
    }
  }
  
  const handleActionExecute = async (action: SOCAction) => {
    setExecutingActions(prev => new Set(prev).add(action.id))
    
    try {
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await onActionUpdate(action.id, {
        status: 'Completed',
        completedAt: new Date().toISOString()
      })
      
      toast({
        title: 'Action Executed',
        description: `${action.name} completed successfully`,
        status: 'success',
        duration: 3000
      })
    } catch (error) {
      await onActionUpdate(action.id, {
        status: 'Failed'
      })
      
      toast({
        title: 'Action Failed',
        description: `${action.name} execution failed`,
        status: 'error',
        duration: 5000
      })
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(action.id)
        return newSet
      })
    }
  }
  
  const resetForm = () => {
    setActionFormData({
      type: 'Containment',
      title: '',
      description: '',
      priority: 'High',
      assignedTo: '',
      estimatedDuration: '30 minutes',
      targetNodes: [],
      targetIPs: [],
      targetDomains: [],
      targetAccounts: [],
      notes: '',
      approvalRequired: false,
      automatedExecution: false
    })
  }
  
  const renderActionTypeCards = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">SOC Response Actions</Text>
      
      <HStack spacing={4} wrap="wrap">
        {(['Containment', 'Investigation', 'Remediation', 'Preventive'] as ActionType[]).map(type => (
          <Card
            key={type}
            cursor="pointer"
            onClick={() => handleActionTypeSelect(type)}
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            minW="200px"
            borderColor={getActionTypeColor(type) + '.300'}
            borderWidth="2px"
          >
            <CardBody textAlign="center" p={4}>
              <VStack spacing={2}>
                <Box color={getActionTypeColor(type) + '.500'} fontSize="2xl">
                  {getActionTypeIcon(type)}
                </Box>
                <Text fontWeight="bold" textTransform="capitalize">
                  {type}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {type === 'Containment' && 'Isolate and contain threats'}
                  {type === 'Investigation' && 'Analyze and investigate'}
                  {type === 'Remediation' && 'Fix and restore systems'}
                  {type === 'Preventive' && 'Prevent future attacks'}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </HStack>
    </VStack>
  )
  
  const renderExistingActions = () => {
    const pathActions = existingActions.filter(action => action.threatPathId === threatPath.id)
    
    if (pathActions.length === 0) {
      return (
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No actions taken yet</AlertTitle>
          <AlertDescription>
            Create SOC response actions to address this threat path.
          </AlertDescription>
        </Alert>
      )
    }
    
    return (
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Existing Actions ({pathActions.length})
          </Text>
          <ButtonGroup size="sm">
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={onBulkModalOpen}
            >
              Bulk Actions
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              variant="outline"
            >
              Export
            </Button>
          </ButtonGroup>
        </HStack>
        
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>
                  <Checkbox
                    isChecked={selectedActions.length === pathActions.length}
                    isIndeterminate={selectedActions.length > 0 && selectedActions.length < pathActions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActions(pathActions.map(a => a.id))
                      } else {
                        setSelectedActions([])
                      }
                    }}
                  />
                </Th>
                <Th>Action</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Assigned To</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pathActions.map(action => (
                <Tr key={action.id}>
                  <Td>
                    <Checkbox
                      isChecked={selectedActions.includes(action.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActions(prev => [...prev, action.id])
                        } else {
                          setSelectedActions(prev => prev.filter(id => id !== action.id))
                        }
                      }}
                    />
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">{action.name}</Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                        {action.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getActionTypeColor(action.type)} size="sm">
                      {action.type}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(action.status)} size="sm">
                      {action.status.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getPriorityColor(action.priority)} size="sm">
                      {action.priority}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{action.assignedTo || 'Unassigned'}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="xs">
                      {new Date(action.createdAt).toLocaleDateString()}
                    </Text>
                  </Td>
                  <Td>
                    <ButtonGroup size="xs">
                      {action.status === 'Pending' && (
                        <Tooltip label="Execute Action">
                          <IconButton
                            icon={executingActions.has(action.id) ? <TimeIcon /> : <CheckCircleIcon />}
                            onClick={() => handleActionExecute(action)}
                            colorScheme="green"
                            variant="outline"
                            isLoading={executingActions.has(action.id)}
                            aria-label="Execute"
                          />
                        </Tooltip>
                      )}
                      <Tooltip label="Edit Action">
                        <IconButton
                          icon={<EditIcon />}
                          variant="outline"
                          aria-label="Edit"
                        />
                      </Tooltip>
                      <Tooltip label="View Details">
                        <IconButton
                          icon={<InfoIcon />}
                          variant="outline"
                          aria-label="Details"
                        />
                      </Tooltip>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    )
  }
  
  const renderActionModal = () => (
    <Modal isOpen={isActionModalOpen} onClose={onActionModalClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Box color={getActionTypeColor(actionFormData.type) + '.500'}>
              {getActionTypeIcon(actionFormData.type)}
            </Box>
            <Text>Create {actionFormData.type} Action</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Basic Info</Tab>
              <Tab>Templates</Tab>
              <Tab>Targets</Tab>
              <Tab>Advanced</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Action Title</FormLabel>
                    <Input
                      value={actionFormData.title}
                      onChange={(e) => setActionFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter action title"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={actionFormData.description}
                      onChange={(e) => setActionFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the action to be taken"
                      rows={3}
                    />
                  </FormControl>
                  
                  <HStack spacing={4} width="100%">
                    <FormControl>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={actionFormData.priority}
                        onChange={(e) => setActionFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Assigned To</FormLabel>
                      <Input
                        value={actionFormData.assignedTo}
                        onChange={(e) => setActionFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        placeholder="SOC Analyst"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Estimated Duration</FormLabel>
                      <Select
                        value={actionFormData.estimatedDuration}
                        onChange={(e) => setActionFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      >
                        <option value="15 minutes">15 minutes</option>
                        <option value="30 minutes">30 minutes</option>
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                        <option value="4 hours">4 hours</option>
                        <option value="1 day">1 day</option>
                      </Select>
                    </FormControl>
                  </HStack>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="bold">Action Templates</Text>
                  {actionTemplates[actionFormData.type]?.map((template, index) => (
                    <Card
                      key={index}
                      cursor="pointer"
                      onClick={() => handleTemplateSelect(template)}
                      _hover={{ shadow: 'md' }}
                      size="sm"
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="sm">{template.title}</Text>
                            <Text fontSize="xs" color="gray.600">{template.description}</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Badge colorScheme={getPriorityColor(template.priority)} size="sm">
                              {template.priority}
                            </Badge>
                            {template.automatable && (
                              <Badge colorScheme="blue" variant="outline" size="sm">
                                Automatable
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Target Nodes</FormLabel>
                    <CheckboxGroup
                      value={actionFormData.targetNodes}
                      onChange={(values) => setActionFormData(prev => ({ ...prev, targetNodes: values as string[] }))}
                    >
                      <Stack spacing={2}>
                        {threatPath.path.slice(0, 10).map(nodeId => (
                          <Checkbox key={nodeId} value={nodeId}>
                            {nodeId}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Target IP Addresses</FormLabel>
                    <Textarea
                      value={actionFormData.targetIPs.join('\n')}
                      onChange={(e) => setActionFormData(prev => ({ 
                        ...prev, 
                        targetIPs: e.target.value.split('\n').filter(ip => ip.trim()) 
                      }))}
                      placeholder="Enter IP addresses (one per line)"
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Target Domains</FormLabel>
                    <Textarea
                      value={actionFormData.targetDomains.join('\n')}
                      onChange={(e) => setActionFormData(prev => ({ 
                        ...prev, 
                        targetDomains: e.target.value.split('\n').filter(domain => domain.trim()) 
                      }))}
                      placeholder="Enter domains (one per line)"
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Target Accounts</FormLabel>
                    <Textarea
                      value={actionFormData.targetAccounts.join('\n')}
                      onChange={(e) => setActionFormData(prev => ({ 
                        ...prev, 
                        targetAccounts: e.target.value.split('\n').filter(account => account.trim()) 
                      }))}
                      placeholder="Enter user accounts (one per line)"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Additional Notes</FormLabel>
                    <Textarea
                      value={actionFormData.notes}
                      onChange={(e) => setActionFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or instructions"
                      rows={4}
                    />
                  </FormControl>
                  
                  <HStack spacing={4} width="100%">
                    <Checkbox
                      isChecked={actionFormData.approvalRequired}
                      onChange={(e) => setActionFormData(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                    >
                      Requires Approval
                    </Checkbox>
                    
                    <Checkbox
                      isChecked={actionFormData.automatedExecution}
                      onChange={(e) => setActionFormData(prev => ({ ...prev, automatedExecution: e.target.checked }))}
                    >
                      Automated Execution
                    </Checkbox>
                  </HStack>
                  
                  {actionFormData.automatedExecution && (
                    <FormControl>
                      <FormLabel>Scheduled Time (Optional)</FormLabel>
                      <Input
                        type="datetime-local"
                        value={actionFormData.scheduledTime}
                        onChange={(e) => setActionFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      />
                    </FormControl>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" onClick={onActionModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme={getActionTypeColor(actionFormData.type)}
              onClick={handleActionSubmit}
              isDisabled={!actionFormData.title || !actionFormData.description}
            >
              Create Action
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
              SOC Response Actions
            </Text>
            <Text color="gray.600">
              Threat Path: {threatPath.name}
            </Text>
          </VStack>
          
          <HStack>
            <Badge colorScheme={getActionTypeColor('Containment')} variant="outline">
              {existingActions.filter(a => a.threatPathId === threatPath.id && a.type === 'Containment').length} Containment
            </Badge>
            <Badge colorScheme={getActionTypeColor('Investigation')} variant="outline">
              {existingActions.filter(a => a.threatPathId === threatPath.id && a.type === 'Investigation').length} Investigation
            </Badge>
            <Badge colorScheme={getActionTypeColor('Remediation')} variant="outline">
              {existingActions.filter(a => a.threatPathId === threatPath.id && a.type === 'Remediation').length} Remediation
            </Badge>
            <Badge colorScheme={getActionTypeColor('Preventive')} variant="outline">
              {existingActions.filter(a => a.threatPathId === threatPath.id && a.type === 'Preventive').length} Preventive
            </Badge>
          </HStack>
        </HStack>
        
        {/* Action Type Cards */}
        {renderActionTypeCards()}
        
        <Divider />
        
        {/* Existing Actions */}
        {renderExistingActions()}
        
        {/* Action Creation Modal */}
        {renderActionModal()}
      </VStack>
    </Box>
  )
}

export default ThreatPathActions

