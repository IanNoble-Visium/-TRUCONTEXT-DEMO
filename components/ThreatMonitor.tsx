import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  Divider,
  useColorModeValue,
  Icon,
  Flex,
  Circle,
  Tooltip
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi'

const MotionCard = motion(Card)
const MotionBox = motion(Box)

interface ThreatEvent {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description: string
  timestamp: Date
  source?: string
}

interface ThreatMonitorProps {
  graphData?: {
    nodes: any[]
    edges: any[]
  }
}

const ThreatMonitor: React.FC<ThreatMonitorProps> = ({ graphData }) => {
  const [threats, setThreats] = useState<ThreatEvent[]>([])
  const [isActive, setIsActive] = useState(true)

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  // Simulate real-time threat events
  useEffect(() => {
    if (!isActive || !graphData) return

    const threatTypes = [
      {
        type: 'critical' as const,
        titles: ['Unauthorized Access Detected', 'Critical Vulnerability Found', 'Data Exfiltration Attempt'],
        descriptions: ['Suspicious login from unknown location', 'CVE-2023-XXXX affects critical systems', 'Large data transfer detected']
      },
      {
        type: 'warning' as const,
        titles: ['Unusual Network Activity', 'Configuration Drift', 'Performance Anomaly'],
        descriptions: ['Traffic spike detected', 'Security policy changes', 'Response time degradation']
      },
      {
        type: 'info' as const,
        titles: ['System Update Available', 'Backup Completed', 'Maintenance Window'],
        descriptions: ['Security patches ready', 'Daily backup successful', 'Scheduled maintenance in 2 hours']
      },
      {
        type: 'success' as const,
        titles: ['Threat Mitigated', 'Security Scan Complete', 'Patch Applied'],
        descriptions: ['Malware quarantined successfully', 'No vulnerabilities found', 'System updated successfully']
      }
    ]

    const generateThreat = (): ThreatEvent => {
      const category = threatTypes[Math.floor(Math.random() * threatTypes.length)]
      const titleIndex = Math.floor(Math.random() * category.titles.length)
      
      return {
        id: `threat-${Date.now()}-${Math.random()}`,
        type: category.type,
        title: category.titles[titleIndex],
        description: category.descriptions[titleIndex],
        timestamp: new Date(),
        source: graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)]?.data?.id || 'Unknown'
      }
    }

    // Add initial threats
    const initialThreats = Array.from({ length: 3 }, generateThreat)
    setThreats(initialThreats)

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of new threat
        const newThreat = generateThreat()
        setThreats(prev => [newThreat, ...prev.slice(0, 9)]) // Keep last 10 threats
      }
    }, 3000 + Math.random() * 4000) // Random interval 3-7 seconds

    return () => clearInterval(interval)
  }, [isActive, graphData])

  const getThreatIcon = (type: ThreatEvent['type']) => {
    switch (type) {
      case 'critical': return FiAlertCircle
      case 'warning': return FiAlertTriangle
      case 'info': return FiInfo
      case 'success': return FiCheckCircle
      default: return FiActivity
    }
  }

  const getThreatColor = (type: ThreatEvent['type']) => {
    switch (type) {
      case 'critical': return 'red'
      case 'warning': return 'orange'
      case 'info': return 'blue'
      case 'success': return 'green'
      default: return 'gray'
    }
  }

  const threatCounts = threats.reduce((acc, threat) => {
    acc[threat.type] = (acc[threat.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalThreats = threats.length
  const criticalThreats = threatCounts.critical || 0
  const warningThreats = threatCounts.warning || 0

  return (
    <MotionCard
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      h="400px"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Icon as={FiShield} color={accentColor} />
            <Heading size="md" color={textColor}>Threat Monitor</Heading>
          </HStack>
          <HStack>
            <Circle size="8px" bg={isActive ? 'green.400' : 'gray.400'} />
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
              {isActive ? 'Live' : 'Offline'}
            </Text>
          </HStack>
        </HStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch" h="300px">
          {/* Threat Summary */}
          <Box>
            <HStack spacing={4} mb={3}>
              <Tooltip label="Critical Threats">
                <Badge colorScheme="red" variant="solid">
                  {criticalThreats} Critical
                </Badge>
              </Tooltip>
              <Tooltip label="Warning Level">
                <Badge colorScheme="orange" variant="solid">
                  {warningThreats} Warning
                </Badge>
              </Tooltip>
              <Tooltip label="Total Events">
                <Badge colorScheme="blue" variant="outline">
                  {totalThreats} Total
                </Badge>
              </Tooltip>
            </HStack>
            
            {/* Threat Level Progress */}
            <Box>
              <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mb={1}>
                Threat Level
              </Text>
              <Progress
                value={Math.min(100, (criticalThreats * 30 + warningThreats * 10))}
                colorScheme={criticalThreats > 0 ? 'red' : warningThreats > 2 ? 'orange' : 'green'}
                size="sm"
                borderRadius="full"
              />
            </Box>
          </Box>

          <Divider />

          {/* Threat Feed */}
          <Box flex={1} overflowY="auto">
            <Text fontSize="sm" fontWeight="bold" color={textColor} mb={2}>
              Recent Events
            </Text>
            <VStack spacing={2} align="stretch">
              <AnimatePresence>
                {threats.slice(0, 6).map((threat, index) => (
                  <MotionBox
                    key={threat.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Box
                      p={2}
                      borderRadius="md"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderLeft="3px solid"
                      borderLeftColor={`${getThreatColor(threat.type)}.400`}
                      _hover={{
                        bg: useColorModeValue('gray.100', 'gray.600'),
                        transform: 'translateX(2px)'
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={2} align="start">
                        <Icon
                          as={getThreatIcon(threat.type)}
                          color={`${getThreatColor(threat.type)}.400`}
                          mt={0.5}
                          flexShrink={0}
                        />
                        <Box flex={1} minW={0}>
                          <Text fontSize="xs" fontWeight="bold" color={textColor} noOfLines={1}>
                            {threat.title}
                          </Text>
                          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={1}>
                            {threat.description}
                          </Text>
                          <HStack justify="space-between" mt={1}>
                            <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.500')}>
                              {threat.timestamp.toLocaleTimeString()}
                            </Text>
                            {threat.source && (
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.500')} noOfLines={1}>
                                {threat.source}
                              </Text>
                            )}
                          </HStack>
                        </Box>
                      </HStack>
                    </Box>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </MotionCard>
  )
}

export default ThreatMonitor

