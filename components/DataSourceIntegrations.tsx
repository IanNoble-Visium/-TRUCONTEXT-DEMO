import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Tooltip,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react'
import { SettingsIcon, InfoIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface Integration {
  id: string
  name: string
  description: string
  category: 'security' | 'messaging' | 'analytics' | 'storage' | 'ai'
  enabled: boolean
  status?: 'active' | 'inactive' | 'pending'
}

const integrations: Integration[] = [
  {
    id: 'datadog',
    name: 'DataDog',
    description: 'Application performance monitoring and log aggregation',
    category: 'analytics',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'tenable',
    name: 'Tenable',
    description: 'Vulnerability management and security scanning',
    category: 'security',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'splunk',
    name: 'Splunk',
    description: 'Enterprise search, monitoring, and analytics platform',
    category: 'analytics',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'pcap',
    name: 'PCAP',
    description: 'Network packet capture and analysis files',
    category: 'security',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'kafka',
    name: 'Kafka Bus',
    description: 'Real-time data streaming and message queuing',
    category: 'messaging',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'webhooks',
    name: 'Web Hooks',
    description: 'HTTP callbacks for real-time event notifications',
    category: 'messaging',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'pubsub',
    name: 'Google Cloud Pub/Sub',
    description: 'Managed messaging service for event-driven systems',
    category: 'messaging',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'datalake',
    name: 'Unified Data Lake',
    description: 'Centralized repository for structured and unstructured data',
    category: 'storage',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'ai-mcp',
    name: 'AI MCP (Model Context Protocol)',
    description: 'AI model integration and context management',
    category: 'ai',
    enabled: false,
    status: 'inactive'
  },
  {
    id: 'iceberg',
    name: 'Apache Iceberg',
    description: 'Table format for large analytic datasets (staging area)',
    category: 'storage',
    enabled: false,
    status: 'inactive'
  }
]

const categoryLabels = {
  security: 'Security Tools',
  messaging: 'Messaging Systems',
  analytics: 'Analytics Platforms',
  storage: 'Data Storage',
  ai: 'AI & Machine Learning'
}

const categoryColors = {
  security: 'red',
  messaging: 'blue',
  analytics: 'green',
  storage: 'purple',
  ai: 'orange'
}

const DataSourceIntegrations: React.FC = () => {
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>({})
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')
  const cardBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.100', 'gray.600')

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dataSourceIntegrations')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setIntegrationStates(parsed)
      } catch (error) {
        console.error('Error loading integration settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(integrationStates).length > 0) {
      localStorage.setItem('dataSourceIntegrations', JSON.stringify(integrationStates))
    }
  }, [integrationStates])

  const handleToggle = (integrationId: string) => {
    setIntegrationStates(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }))
  }

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = []
    }
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, Integration[]>)

  const slideIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  }

  const enabledCount = Object.values(integrationStates).filter(Boolean).length
  const totalCount = integrations.length

  return (
    <VStack spacing={6} align="stretch" p={4}>
      {/* Header */}
      <MotionBox {...slideIn}>
        <HStack spacing={3} mb={4}>
          <Icon as={SettingsIcon} boxSize={6} color="visium.500" />
          <Heading size="lg" color={headingColor}>
            Data Source Integrations
          </Heading>
        </HStack>
        <Text fontSize="sm" color={textColor} mb={4}>
          Configure and manage connections to external data sources and platforms.
          Enable integrations to automatically import and synchronize data from various systems.
        </Text>

        {/* Summary Stats */}
        <HStack spacing={4} mb={6} p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
          <Badge colorScheme="visium" variant="solid" fontSize="sm" px={3} py={1}>
            {enabledCount} of {totalCount} Enabled
          </Badge>
          <Text fontSize="xs" color={textColor}>
            {enabledCount === 0
              ? 'No integrations enabled'
              : `${enabledCount} integration${enabledCount === 1 ? '' : 's'} ready for data import`
            }
          </Text>
        </HStack>
      </MotionBox>

      {/* Integration Categories */}
      <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]}>
        {Object.entries(groupedIntegrations).map(([category, categoryIntegrations], index) => (
          <MotionBox
            key={category}
            {...slideIn}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md" mb={4}>
              <h2>
                <AccordionButton _hover={{ bg: hoverBg }} py={4}>
                  <HStack flex="1" textAlign="left" spacing={3}>
                    <Badge colorScheme={categoryColors[category as keyof typeof categoryColors]} variant="subtle">
                      {categoryIntegrations.length}
                    </Badge>
                    <Text fontWeight="medium" fontSize="md">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </Text>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {categoryIntegrations.map((integration) => (
                    <Card
                      key={integration.id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      _hover={{
                        borderColor: 'visium.300',
                        transform: 'translateY(-2px)',
                        shadow: 'md'
                      }}
                      transition="all 0.2s"
                    >
                      <CardBody p={4}>
                        <FormControl display="flex" alignItems="flex-start" justifyContent="space-between">
                          <Box flex="1" mr={4}>
                            <HStack spacing={2} mb={2}>
                              <FormLabel htmlFor={integration.id} mb={0} fontWeight="semibold" fontSize="sm">
                                {integration.name}
                              </FormLabel>
                              <Tooltip
                                label={`${integration.name}: ${integration.description}`}
                                placement="top"
                                hasArrow
                              >
                                <InfoIcon boxSize={3} color="gray.400" cursor="help" />
                              </Tooltip>
                              {integrationStates[integration.id] && (
                                <Badge colorScheme="green" size="sm" variant="subtle">
                                  Enabled
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color={textColor} lineHeight="short">
                              {integration.description}
                            </Text>
                          </Box>
                          <Switch
                            id={integration.id}
                            colorScheme="visium"
                            isChecked={integrationStates[integration.id] || false}
                            onChange={() => handleToggle(integration.id)}
                            size="md"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>
          </MotionBox>
        ))}
      </Accordion>

      {/* Footer Info */}
      <MotionBox
        {...slideIn}
        transition={{ duration: 0.3, delay: 0.5 }}
        p={4}
        bg={cardBg}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={2} mb={2}>
          <InfoIcon boxSize={4} color="visium.500" />
          <Text fontSize="sm" fontWeight="medium" color={headingColor}>
            Integration Status
          </Text>
        </HStack>
        <Text fontSize="xs" color={textColor}>
          Settings are automatically saved to your browser&apos;s local storage.
          Enabled integrations will be available for data import and real-time synchronization
          once the corresponding API credentials are configured.
        </Text>
      </MotionBox>
    </VStack>
  )
}

export default DataSourceIntegrations
