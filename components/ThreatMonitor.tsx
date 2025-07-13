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
  Divider,
  useColorModeValue,
  Icon,
  Progress,
  SimpleGrid
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiActivity
} from 'react-icons/fi'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

interface ThreatEvent {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  timestamp: Date
}

interface ThreatMonitorProps {
  graphData?: {
    nodes: any[]
    edges: any[]
  }
}

const ThreatMonitor: React.FC<ThreatMonitorProps> = ({ graphData }) => {
  // All hooks must be called at the top level
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const grayTextColor = useColorModeValue('gray.600', 'gray.400')
  const dangerColor = useColorModeValue('red.500', 'red.300')
  const warningColor = useColorModeValue('orange.500', 'orange.300')
  const successColor = useColorModeValue('green.500', 'green.300')
  const mutedBg = useColorModeValue('gray.50', 'gray.700')

  const [threats, setThreats] = useState<{
    critical: number
    warning: number
    total: number
  }>({
    critical: 0,
    warning: 0,
    total: 3
  })

  const [recentEvents, setRecentEvents] = useState<ThreatEvent[]>([
    {
      id: '1',
      type: 'info',
      title: 'Maintenance Window',
      description: 'Scheduled maintenance in 2 hours',
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      id: '2',
      type: 'info',
      title: 'Backup Completed',
      description: 'Daily backup successful',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '3',
      type: 'info',
      title: 'Maintenance Window',
      description: 'Scheduled maintenance in 2 hours',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    }
  ])

  // Calculate threat metrics from graph data
  useEffect(() => {
    if (graphData?.nodes) {
      const criticalThreats = graphData.nodes.filter(node => 
        node.data?.alert === 'critical' || node.data?.status === 'critical'
      ).length

      const warningThreats = graphData.nodes.filter(node => 
        node.data?.alert === 'warning' || node.data?.status === 'warning'
      ).length

      setThreats({
        critical: criticalThreats,
        warning: warningThreats,
        total: criticalThreats + warningThreats + recentEvents.length
      })
    }
  }, [graphData, recentEvents.length])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return FiAlertTriangle
      case 'warning':
        return FiAlertTriangle
      case 'info':
      default:
        return FiCheckCircle
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'critical':
        return dangerColor
      case 'warning':
        return warningColor
      case 'info':
      default:
        return successColor
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`
    } else {
      return 'Just now'
    }
  }

  return (
    <MotionCard
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <CardHeader>
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="md" color={textColor}>Threat Monitor</Heading>
            <HStack spacing={4}>
              <HStack spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color={dangerColor}>
                  {threats.critical}
                </Text>
                <Text fontSize="sm" color={grayTextColor}>Critical</Text>
              </HStack>
              <HStack spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color={warningColor}>
                  {threats.warning}
                </Text>
                <Text fontSize="sm" color={grayTextColor}>Warning</Text>
              </HStack>
              <HStack spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                  {threats.total}
                </Text>
                <Text fontSize="sm" color={grayTextColor}>Total</Text>
              </HStack>
            </HStack>
          </VStack>
          <Icon as={FiShield} boxSize={6} color={successColor} />
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Threat Level Indicator */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color={grayTextColor}>Security Level</Text>
              <Text fontSize="sm" color={successColor} fontWeight="bold">Normal</Text>
            </HStack>
            <Progress
              value={85}
              colorScheme="green"
              size="sm"
              borderRadius="full"
            />
          </Box>

          <Divider />

          {/* Recent Events */}
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
              Recent Events
            </Text>
            <VStack spacing={3} align="stretch" width="100%">
              <AnimatePresence>
                {recentEvents.slice(0, 3).map((event, index) => (
                  <MotionBox
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <HStack spacing={3} p={3} bg={mutedBg} borderRadius="md">
                      <Icon
                        as={getEventIcon(event.type)}
                        color={getEventColor(event.type)}
                        boxSize={4}
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color={textColor}>
                          {event.title}
                        </Text>
                        <Text fontSize="xs" color={grayTextColor}>
                          {event.description}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Icon as={FiClock} boxSize={3} color={grayTextColor} />
                        <Text fontSize="xs" color={grayTextColor}>
                          {formatTimeAgo(event.timestamp)}
                        </Text>
                      </VStack>
                    </HStack>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </VStack>
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  )
}

export default ThreatMonitor

