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
  Tooltip,
  Progress
} from '@chakra-ui/react'
import {
  FiActivity,
  FiBarChart,
  FiTrendingUp,
  FiWifi,
  FiShield,
  FiLock,
  FiUnlock,
  FiSlash,
  FiCheck,
  FiAlertTriangle,
  FiTarget,
  FiEye,
  FiSearch,
  FiFileText,
  FiClipboard,
  FiBook,
  FiSettings,
  FiZap,
  FiClock,
  FiArrowRight,
  FiArrowLeft,
  FiRefreshCw,
  FiFilter,
  FiDatabase,
  FiGlobe,
  FiServer
} from 'react-icons/fi'

interface SOCEdgeContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  edgeId: string | null
  edgeData: any
  onClose: () => void
  onAction: (action: string, edgeId: string, data?: any) => void
}

interface SOCEdgeAction {
  id: string
  label: string
  description: string
  icon: any
  category: 'traffic' | 'security' | 'threat' | 'compliance'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  requiresConfirmation?: boolean
  mockDuration?: number // seconds for demo
  destructive?: boolean
}

const SOC_EDGE_ACTIONS: SOCEdgeAction[] = [
  // Traffic Analysis
  {
    id: 'network_flow_monitoring',
    label: 'Network Flow Monitoring',
    description: 'Monitor real-time network traffic flow',
    icon: FiActivity,
    category: 'traffic',
    mockDuration: 5
  },
  {
    id: 'bandwidth_analysis',
    label: 'Bandwidth Analysis',
    description: 'Analyze bandwidth usage and patterns',
    icon: FiBarChart,
    category: 'traffic',
    mockDuration: 8
  },
  {
    id: 'connection_patterns',
    label: 'Connection Patterns',
    description: 'Analyze connection frequency and timing',
    icon: FiTrendingUp,
    category: 'traffic',
    mockDuration: 12
  },
  {
    id: 'protocol_analysis',
    label: 'Protocol Analysis',
    description: 'Deep packet inspection and protocol analysis',
    icon: FiWifi,
    category: 'traffic',
    mockDuration: 15
  },
  {
    id: 'traffic_baseline',
    label: 'Traffic Baseline',
    description: 'Establish normal traffic baseline',
    icon: FiRefreshCw,
    category: 'traffic',
    mockDuration: 20
  },

  // Security Controls
  {
    id: 'block_connection',
    label: 'Block Connection',
    description: 'Block this network connection',
    icon: FiSlash,
    category: 'security',
    severity: 'high',
    requiresConfirmation: true,
    destructive: true,
    mockDuration: 3
  },
  {
    id: 'allow_connection',
    label: 'Allow Connection',
    description: 'Explicitly allow this connection',
    icon: FiCheck,
    category: 'security',
    mockDuration: 2
  },
  {
    id: 'rule_management',
    label: 'Firewall Rule Management',
    description: 'Manage firewall rules for this connection',
    icon: FiSettings,
    category: 'security',
    mockDuration: 10
  },
  {
    id: 'access_path_audit',
    label: 'Access Path Auditing',
    description: 'Audit access paths and permissions',
    icon: FiEye,
    category: 'security',
    severity: 'medium',
    mockDuration: 18
  },
  {
    id: 'connection_encryption',
    label: 'Connection Encryption',
    description: 'Verify and enforce encryption',
    icon: FiLock,
    category: 'security',
    mockDuration: 7
  },
  {
    id: 'rate_limiting',
    label: 'Rate Limiting',
    description: 'Apply rate limiting controls',
    icon: FiFilter,
    category: 'security',
    mockDuration: 5
  },

  // Threat Detection
  {
    id: 'alert_correlation',
    label: 'Alert Correlation',
    description: 'Correlate alerts across this connection',
    icon: FiAlertTriangle,
    category: 'threat',
    severity: 'medium',
    mockDuration: 12
  },
  {
    id: 'lateral_movement_detection',
    label: 'Lateral Movement Detection',
    description: 'Detect potential lateral movement',
    icon: FiTarget,
    category: 'threat',
    severity: 'high',
    mockDuration: 25
  },
  {
    id: 'apt_investigation',
    label: 'APT Investigation',
    description: 'Investigate advanced persistent threats',
    icon: FiSearch,
    category: 'threat',
    severity: 'critical',
    mockDuration: 35
  },
  {
    id: 'anomaly_detection',
    label: 'Anomaly Detection',
    description: 'Detect unusual connection behavior',
    icon: FiZap,
    category: 'threat',
    severity: 'medium',
    mockDuration: 15
  },
  {
    id: 'threat_hunting',
    label: 'Threat Hunting',
    description: 'Proactive threat hunting on this path',
    icon: FiTarget,
    category: 'threat',
    severity: 'medium',
    mockDuration: 30
  },

  // Compliance
  {
    id: 'connection_logging',
    label: 'Connection Logging',
    description: 'Enable detailed connection logging',
    icon: FiFileText,
    category: 'compliance',
    mockDuration: 3
  },
  {
    id: 'audit_trail',
    label: 'Audit Trail Generation',
    description: 'Generate comprehensive audit trail',
    icon: FiClipboard,
    category: 'compliance',
    mockDuration: 8
  },
  {
    id: 'policy_enforcement',
    label: 'Policy Enforcement',
    description: 'Enforce security policies',
    icon: FiBook,
    category: 'compliance',
    severity: 'medium',
    mockDuration: 12
  },
  {
    id: 'compliance_check',
    label: 'Compliance Check',
    description: 'Verify regulatory compliance',
    icon: FiCheck,
    category: 'compliance',
    mockDuration: 15
  },
  {
    id: 'data_retention',
    label: 'Data Retention Policy',
    description: 'Apply data retention policies',
    icon: FiDatabase,
    category: 'compliance',
    mockDuration: 5
  }
]

const EDGE_CATEGORY_CONFIG = {
  traffic: {
    label: 'Traffic Analysis',
    color: 'blue',
    icon: FiActivity
  },
  security: {
    label: 'Security Controls',
    color: 'orange',
    icon: FiShield
  },
  threat: {
    label: 'Threat Detection',
    color: 'red',
    icon: FiAlertTriangle
  },
  compliance: {
    label: 'Compliance',
    color: 'green',
    icon: FiFileText
  }
}

const SOCEdgeContextMenu: React.FC<SOCEdgeContextMenuProps> = ({
  isOpen,
  position,
  edgeId,
  edgeData,
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

  if (!isOpen || !edgeId) return null

  const handleActionClick = (action: SOCEdgeAction) => {
    onAction(action.id, edgeId, {
      ...action,
      edgeData,
      timestamp: new Date().toISOString()
    })
    onClose()
  }

  const getConnectionTypeIcon = (edgeType: string) => {
    const type = edgeType?.toLowerCase() || ''
    if (type.includes('network')) return FiWifi
    if (type.includes('database')) return FiDatabase
    if (type.includes('api')) return FiGlobe
    if (type.includes('internal')) return FiServer
    return FiArrowRight
  }

  const getConnectionStatus = () => {
    // Mock connection status based on edge data
    const statuses = ['Active', 'Monitored', 'Encrypted', 'Suspicious']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getConnectionMetrics = () => {
    // Mock connection metrics
    return {
      bandwidth: Math.floor(Math.random() * 100) + 'Mbps',
      latency: Math.floor(Math.random() * 50) + 'ms',
      packets: Math.floor(Math.random() * 10000) + 'pps'
    }
  }

  const groupedActions = SOC_EDGE_ACTIONS.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = []
    }
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, SOCEdgeAction[]>)

  const connectionStatus = getConnectionStatus()
  const metrics = getConnectionMetrics()

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
        top={Math.max(10, Math.min(window.innerHeight - 450, position.y))}
        left={Math.max(10, Math.min(window.innerWidth - 380, position.x))}
        zIndex={99999}
        data-soc-edge-context-menu
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Menu isOpen={true} onClose={onClose}>
          <MenuList
            minW="350px"
            maxW="420px"
            maxH="550px"
            overflowY="auto"
            bg={menuBg}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="xl"
            borderRadius="lg"
          >
            {/* Connection Header */}
            <Box p={3} bg={categoryHeaderBg} borderRadius="lg" m={2}>
              <VStack spacing={2} align="stretch">
                <HStack spacing={3}>
                  <Icon 
                    as={getConnectionTypeIcon(edgeData?.type || 'network')} 
                    boxSize={5} 
                    color="blue.500" 
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="bold" color={textColor}>
                      {edgeData?.source?.label || 'Source'} → {edgeData?.target?.label || 'Target'}
                    </Text>
                    <Text fontSize="xs" color={subtextColor}>
                      {edgeData?.type || 'Network Connection'} • {connectionStatus}
                    </Text>
                  </VStack>
                  <Badge colorScheme="blue" size="sm">
                    SOC
                  </Badge>
                </HStack>
                
                {/* Connection Metrics */}
                <HStack spacing={4} fontSize="xs">
                  <VStack spacing={0}>
                    <Text color={subtextColor}>Bandwidth</Text>
                    <Text color={textColor} fontWeight="medium">{metrics.bandwidth}</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text color={subtextColor}>Latency</Text>
                    <Text color={textColor} fontWeight="medium">{metrics.latency}</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text color={subtextColor}>Packets</Text>
                    <Text color={textColor} fontWeight="medium">{metrics.packets}</Text>
                  </VStack>
                </HStack>

                {/* Connection Health */}
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" color={subtextColor}>Connection Health</Text>
                    <Text fontSize="xs" color="green.500" fontWeight="medium">85%</Text>
                  </HStack>
                  <Progress value={85} size="sm" colorScheme="green" borderRadius="full" />
                </Box>
              </VStack>
            </Box>

            <MenuDivider />

            {/* SOC Edge Action Categories */}
            {Object.entries(groupedActions).map(([category, actions]) => {
              const categoryConfig = EDGE_CATEGORY_CONFIG[category as keyof typeof EDGE_CATEGORY_CONFIG]
              
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
                        bg={action.destructive ? 'red.50' : 'transparent'}
                        _dark={{
                          bg: action.destructive ? 'red.900' : 'transparent'
                        }}
                      >
                        <HStack spacing={3} w="100%">
                          <Icon 
                            as={action.icon} 
                            boxSize={4} 
                            color={action.destructive ? 'red.500' : `${categoryConfig.color}.500`}
                          />
                          <VStack align="start" spacing={0} flex={1}>
                            <HStack spacing={2} w="100%">
                              <Text 
                                fontSize="sm" 
                                fontWeight="medium" 
                                color={action.destructive ? 'red.600' : textColor}
                              >
                                {action.label}
                              </Text>
                              {action.severity && (
                                <Badge 
                                  colorScheme={
                                    action.severity === 'critical' ? 'red' :
                                    action.severity === 'high' ? 'orange' :
                                    action.severity === 'medium' ? 'yellow' : 'green'
                                  }
                                  size="xs"
                                >
                                  {action.severity.toUpperCase()}
                                </Badge>
                              )}
                              {action.requiresConfirmation && (
                                <Badge colorScheme="gray" size="xs">
                                  Confirm
                                </Badge>
                              )}
                              {action.destructive && (
                                <Badge colorScheme="red" size="xs">
                                  Destructive
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
                Connection-based SOC operations and monitoring
              </Text>
            </Box>
          </MenuList>
        </Menu>
      </Box>
    </Portal>
  )
}

export default SOCEdgeContextMenu
export { SOC_EDGE_ACTIONS, EDGE_CATEGORY_CONFIG }
export type { SOCEdgeAction }

