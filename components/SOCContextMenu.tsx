import React, { useState } from 'react'
import {
  Box,
  Menu,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  Portal,
  Tooltip
} from '@chakra-ui/react'
import {
  FiShield,
  FiEye,
  FiAlertTriangle,
  FiActivity,
  FiLock,
  FiUnlock,
  FiSearch,
  FiFileText,
  FiTool,
  FiZap,
  FiClock,
  FiTarget,
  FiDatabase,
  FiWifi,
  FiServer,
  FiMonitor,
  FiHardDrive,
  FiCpu,
  FiUsers,
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi'

interface SOCContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  nodeId: string | null
  nodeData: any
  onClose: () => void
  onAction: (action: string, nodeId: string, data?: any) => void
}

interface SOCAction {
  id: string
  label: string
  description: string
  icon: any
  category: 'monitor' | 'security' | 'incident' | 'threat'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  requiresConfirmation?: boolean
  mockDuration?: number // seconds for demo
}

const SOC_NODE_ACTIONS: SOCAction[] = [
  // Monitor & Investigate
  {
    id: 'health_check',
    label: 'Node Health Status',
    description: 'Check current health and performance metrics',
    icon: FiActivity,
    category: 'monitor',
    mockDuration: 3
  },
  {
    id: 'alert_investigation',
    label: 'Alert Investigation',
    description: 'Investigate active alerts and anomalies',
    icon: FiAlertTriangle,
    category: 'monitor',
    severity: 'medium',
    mockDuration: 8
  },
  {
    id: 'log_analysis',
    label: 'Log Analysis',
    description: 'Analyze recent logs and events',
    icon: FiFileText,
    category: 'monitor',
    mockDuration: 12
  },
  {
    id: 'performance_metrics',
    label: 'Performance Metrics',
    description: 'View detailed performance analytics',
    icon: FiMonitor,
    category: 'monitor',
    mockDuration: 5
  },

  // Security Operations
  {
    id: 'isolate_node',
    label: 'Isolate Node',
    description: 'Quarantine node from network',
    icon: FiLock,
    category: 'security',
    severity: 'high',
    requiresConfirmation: true,
    mockDuration: 15
  },
  {
    id: 'endpoint_validation',
    label: 'Endpoint Security Validation',
    description: 'Validate security controls and compliance',
    icon: FiShield,
    category: 'security',
    mockDuration: 10
  },
  {
    id: 'access_review',
    label: 'Access Review',
    description: 'Review user access and permissions',
    icon: FiKey,
    category: 'security',
    mockDuration: 7
  },
  {
    id: 'vulnerability_scan',
    label: 'Vulnerability Scan',
    description: 'Scan for security vulnerabilities',
    icon: FiSearch,
    category: 'security',
    severity: 'medium',
    mockDuration: 20
  },

  // Incident Response
  {
    id: 'forensic_collection',
    label: 'Forensic Collection',
    description: 'Collect forensic evidence and artifacts',
    icon: FiDatabase,
    category: 'incident',
    severity: 'high',
    mockDuration: 25
  },
  {
    id: 'remediation_execution',
    label: 'Remediation Execution',
    description: 'Execute automated remediation actions',
    icon: FiTool,
    category: 'incident',
    severity: 'medium',
    requiresConfirmation: true,
    mockDuration: 18
  },
  {
    id: 'patch_management',
    label: 'Patch Management',
    description: 'Deploy security patches and updates',
    icon: FiZap,
    category: 'incident',
    mockDuration: 30
  },
  {
    id: 'incident_containment',
    label: 'Incident Containment',
    description: 'Contain and limit incident spread',
    icon: FiTarget,
    category: 'incident',
    severity: 'critical',
    requiresConfirmation: true,
    mockDuration: 12
  },

  // Threat Hunting
  {
    id: 'historical_analysis',
    label: 'Historical Analysis',
    description: 'Analyze historical patterns and trends',
    icon: FiClock,
    category: 'threat',
    mockDuration: 15
  },
  {
    id: 'behavioral_analysis',
    label: 'Behavioral Anomaly Detection',
    description: 'Detect unusual behavioral patterns',
    icon: FiEye,
    category: 'threat',
    severity: 'medium',
    mockDuration: 22
  },
  {
    id: 'threat_intelligence',
    label: 'Threat Intelligence Lookup',
    description: 'Query threat intelligence databases',
    icon: FiInfo,
    category: 'threat',
    mockDuration: 8
  },
  {
    id: 'ioc_analysis',
    label: 'IOC Analysis',
    description: 'Analyze indicators of compromise',
    icon: FiTarget,
    category: 'threat',
    severity: 'high',
    mockDuration: 18
  }
]

const CATEGORY_CONFIG = {
  monitor: {
    label: 'Monitor & Investigate',
    color: 'blue',
    icon: FiEye
  },
  security: {
    label: 'Security Operations',
    color: 'orange',
    icon: FiShield
  },
  incident: {
    label: 'Incident Response',
    color: 'red',
    icon: FiAlertTriangle
  },
  threat: {
    label: 'Threat Hunting',
    color: 'purple',
    icon: FiSearch
  }
}

const SEVERITY_CONFIG = {
  low: { color: 'green', label: 'Low' },
  medium: { color: 'yellow', label: 'Medium' },
  high: { color: 'orange', label: 'High' },
  critical: { color: 'red', label: 'Critical' }
}

const SOCContextMenu: React.FC<SOCContextMenuProps> = ({
  isOpen,
  position,
  nodeId,
  nodeData,
  onClose,
  onAction
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  // Color mode values
  const menuBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const subtextColor = useColorModeValue('gray.600', 'gray.400')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const categoryHeaderBg = useColorModeValue('gray.100', 'gray.700')

  if (!isOpen || !nodeId) return null

  const handleActionClick = (action: SOCAction) => {
    onAction(action.id, nodeId, {
      ...action,
      nodeData,
      timestamp: new Date().toISOString()
    })
    onClose()
  }

  const getNodeTypeIcon = (nodeType: string) => {
    const type = nodeType?.toLowerCase() || ''
    if (type.includes('server')) return FiServer
    if (type.includes('database')) return FiDatabase
    if (type.includes('network')) return FiWifi
    if (type.includes('endpoint')) return FiMonitor
    if (type.includes('storage')) return FiHardDrive
    if (type.includes('cpu') || type.includes('processor')) return FiCpu
    if (type.includes('user')) return FiUsers
    return FiMonitor
  }

  const groupedActions = SOC_NODE_ACTIONS.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = []
    }
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, SOCAction[]>)

  return (
    <Portal>
      {/* Invisible overlay to capture clicks outside the menu */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={99998}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClose()
        }}
      />
      <Box
        position="fixed"
        top={Math.max(10, Math.min(window.innerHeight - 400, position.y))}
        left={Math.max(10, Math.min(window.innerWidth - 350, position.x))}
        zIndex={99999}
        data-soc-context-menu
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Menu isOpen={true} onClose={onClose}>
          <MenuList
            minW="320px"
            maxW="400px"
            maxH="500px"
            overflowY="auto"
            bg={menuBg}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="xl"
            borderRadius="lg"
          >
            {/* Node Header */}
            <Box p={3} bg={categoryHeaderBg} borderRadius="lg" m={2}>
              <HStack spacing={3}>
                <Icon 
                  as={getNodeTypeIcon(nodeData?.type || nodeData?.label)} 
                  boxSize={5} 
                  color="blue.500" 
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {nodeData?.label || nodeId}
                  </Text>
                  <Text fontSize="xs" color={subtextColor}>
                    {nodeData?.type || 'Network Node'} • SOC Operations
                  </Text>
                </VStack>
                <Badge colorScheme="blue" size="sm">
                  SOC
                </Badge>
              </HStack>
            </Box>

            <MenuDivider />

            {/* SOC Action Categories */}
            {Object.entries(groupedActions).map(([category, actions]) => {
              const categoryConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
              
              return (
                <Box key={category}>
                  {/* Category Header */}
                  <Box px={3} py={2}>
                    <HStack spacing={2}>
                      <Icon as={categoryConfig.icon} boxSize={4} color={`${categoryConfig.color}.500`} />
                      <Text fontSize="xs" fontWeight="bold" color={subtextColor} textTransform="uppercase">
                        {categoryConfig.label}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Category Actions */}
                  {actions.map((action) => (
                    <Tooltip
                      key={action.id}
                      label={action.description}
                      placement="left"
                      hasArrow
                      openDelay={500}
                    >
                      <MenuItem
                        onClick={() => handleActionClick(action)}
                        onMouseEnter={() => setHoveredAction(action.id)}
                        onMouseLeave={() => setHoveredAction(null)}
                        _hover={{ bg: hoverBg }}
                        py={3}
                        px={3}
                      >
                        <HStack spacing={3} w="100%">
                          <Icon 
                            as={action.icon} 
                            boxSize={4} 
                            color={`${categoryConfig.color}.500`}
                          />
                          <VStack align="start" spacing={0} flex={1}>
                            <HStack spacing={2} w="100%">
                              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                {action.label}
                              </Text>
                              {action.severity && (
                                <Badge 
                                  colorScheme={SEVERITY_CONFIG[action.severity].color}
                                  size="xs"
                                >
                                  {SEVERITY_CONFIG[action.severity].label}
                                </Badge>
                              )}
                              {action.requiresConfirmation && (
                                <Badge colorScheme="gray" size="xs">
                                  Confirm
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color={subtextColor} noOfLines={1}>
                              {action.description}
                            </Text>
                            {action.mockDuration && hoveredAction === action.id && (
                              <Text fontSize="xs" color="blue.500">
                                ~{action.mockDuration}s demo duration
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </MenuItem>
                    </Tooltip>
                  ))}
                  
                  <MenuDivider />
                </Box>
              )
            })}

            {/* Quick Actions Footer */}
            <Box p={2} bg={categoryHeaderBg} borderRadius="lg" m={2}>
              <Text fontSize="xs" color={subtextColor} textAlign="center">
                Right-click edges for network-specific SOC actions
              </Text>
            </Box>
          </MenuList>
        </Menu>
      </Box>
    </Portal>
  )
}

export default SOCContextMenu
export { SOC_NODE_ACTIONS, CATEGORY_CONFIG, SEVERITY_CONFIG }
export type { SOCAction }

