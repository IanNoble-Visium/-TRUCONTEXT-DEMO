import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  IconButton,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Collapse,
  useColorModeValue,
  Tooltip,
  Code,
  Flex,
  Spacer,
  Button,
  useDisclosure
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloseIcon, 
  SearchIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  CopyIcon,
  TimeIcon,
  InfoIcon
} from '@chakra-ui/icons'

const MotionBox = motion(Box)

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedElement: {
    type: 'node' | 'edge'
    data: any
  } | null
}

interface PropertyItemProps {
  label: string
  value: any
  isSearchMatch?: boolean
}

const PropertyItem: React.FC<PropertyItemProps> = ({ label, value, isSearchMatch = false }) => {
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const highlightBg = useColorModeValue('yellow.100', 'yellow.800')
  const [isExpanded, setIsExpanded] = useState(false)
  const { isOpen: isCopied, onOpen: onCopy, onClose: onCopyClose } = useDisclosure()

  // Handle different value types
  const renderValue = () => {
    if (value === null || value === undefined) {
      return <Text fontSize="sm" color={mutedColor} fontStyle="italic">null</Text>
    }

    if (typeof value === 'boolean') {
      return (
        <Badge colorScheme={value ? 'green' : 'red'} size="sm">
          {value.toString()}
        </Badge>
      )
    }

    if (typeof value === 'number') {
      return <Text fontSize="sm" color={textColor} fontFamily="mono">{value}</Text>
    }

    if (typeof value === 'string') {
      // Check if it's a timestamp
      const isTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) ||
                         /^\d{10,13}$/.test(value)

      if (isTimestamp) {
        const date = new Date(isNaN(Number(value)) ? value : Number(value))
        if (!isNaN(date.getTime())) {
          return (
            <HStack spacing={2}>
              <TimeIcon color={mutedColor} boxSize={3} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={textColor}>
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </Text>
                <Text fontSize="xs" color={mutedColor} fontFamily="mono">
                  {value}
                </Text>
              </VStack>
            </HStack>
          )
        }
      }

      // Check if it's a URL
      const isUrl = /^https?:\/\//.test(value)
      if (isUrl) {
        return (
          <Text
            fontSize="sm"
            color="blue.500"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => window.open(value, '_blank')}
            _hover={{ color: 'blue.600' }}
          >
            {value}
          </Text>
        )
      }

      // Check if it's an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      if (isEmail) {
        return (
          <Text
            fontSize="sm"
            color="blue.500"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => window.open(`mailto:${value}`, '_blank')}
            _hover={{ color: 'blue.600' }}
          >
            {value}
          </Text>
        )
      }

      // Long strings get truncated with expand option
      if (value.length > 100) {
        return (
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" color={textColor}>
              {isExpanded ? value : `${value.substring(0, 100)}...`}
            </Text>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              leftIcon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </VStack>
        )
      }

      return <Text fontSize="sm" color={textColor}>{value}</Text>
    }

    if (typeof value === 'object') {
      return (
        <VStack align="start" spacing={2} w="full">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            leftIcon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          >
            {isExpanded ? 'Hide Object' : 'Show Object'}
          </Button>
          <Collapse in={isExpanded}>
            <Code
              p={3}
              borderRadius="md"
              fontSize="xs"
              w="full"
              whiteSpace="pre-wrap"
              overflowX="auto"
            >
              {JSON.stringify(value, null, 2)}
            </Code>
          </Collapse>
        </VStack>
      )
    }

    return <Text fontSize="sm" color={textColor}>{String(value)}</Text>
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(String(value))
    onCopy()
    setTimeout(onCopyClose, 2000)
  }

  return (
    <Box
      p={3}
      borderRadius="md"
      bg={isSearchMatch ? highlightBg : 'transparent'}
      border="1px solid"
      borderColor={isSearchMatch ? 'yellow.300' : 'transparent'}
    >
      <HStack justify="space-between" align="start" spacing={3}>
        <VStack align="start" spacing={1} flex={1}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            {label}
          </Text>
          {renderValue()}
        </VStack>
        <Tooltip label={isCopied ? 'Copied!' : 'Copy value'}>
          <IconButton
            icon={<CopyIcon />}
            size="xs"
            variant="ghost"
            onClick={copyToClipboard}
            aria-label="Copy value"
          />
        </Tooltip>
      </HStack>
    </Box>
  )
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  isOpen,
  onClose,
  selectedElement
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const headerBg = useColorModeValue('visium.500', 'visium.600')

  // Reset search when panel closes or element changes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen, selectedElement])

  if (!selectedElement) return null

  const { type, data } = selectedElement
  const isNode = type === 'node'

  // Get basic info
  const elementId = data.id || data.uid || 'Unknown'
  const elementLabel = data.label || data.showname || data.name || elementId
  const elementType = data.type || 'Unknown'

  // Collect all properties for search
  const allProperties: { [key: string]: any } = {}
  
  // Add basic properties
  if (data.id) allProperties['ID'] = data.id
  if (data.uid && data.uid !== data.id) allProperties['UID'] = data.uid
  if (data.label) allProperties['Label'] = data.label
  if (data.showname && data.showname !== data.label) allProperties['Display Name'] = data.showname
  if (data.name && data.name !== data.label && data.name !== data.showname) allProperties['Name'] = data.name
  allProperties['Type'] = elementType

  // Add edge-specific properties
  if (!isNode) {
    if (data.source) allProperties['Source'] = data.source
    if (data.target) allProperties['Target'] = data.target
    if (data.from) allProperties['From'] = data.from
    if (data.to) allProperties['To'] = data.to
  }

  // Add timestamp if available at root level
  if (data.timestamp) allProperties['Timestamp'] = data.timestamp

  // Add all custom properties
  if (data.properties && typeof data.properties === 'object') {
    Object.entries(data.properties).forEach(([key, value]) => {
      allProperties[key] = value
    })
  }

  // Filter properties based on search
  const filteredProperties = Object.entries(allProperties).filter(([key, value]) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      key.toLowerCase().includes(searchLower) ||
      String(value).toLowerCase().includes(searchLower)
    )
  })

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'Server': 'blue',
      'Application': 'green',
      'Database': 'purple',
      'User': 'orange',
      'Vulnerability': 'red',
      'Device': 'cyan',
      'Machine': 'gray',
      'References': 'yellow',
      'Group': 'pink'
    }
    return typeColors[type] || 'gray'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.300"
            zIndex={1000}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <MotionBox
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            width={{ base: '100%', md: '400px', lg: '500px' }}
            bg={bgColor}
            borderLeft="1px solid"
            borderColor={borderColor}
            shadow="xl"
            zIndex={1001}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            display="flex"
            flexDirection="column"
          >
            {/* Header */}
            <Box bg={headerBg} color="white" p={4}>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1} flex={1}>
                  <HStack spacing={2}>
                    <Badge colorScheme={getTypeColor(elementType)} size="sm">
                      {isNode ? 'Node' : 'Edge'}
                    </Badge>
                    <Badge colorScheme={getTypeColor(elementType)} variant="outline" size="sm">
                      {elementType}
                    </Badge>
                  </HStack>
                  <Heading size="md" noOfLines={2}>
                    {elementLabel}
                  </Heading>
                  {elementId !== elementLabel && (
                    <Text fontSize="sm" opacity={0.8} fontFamily="mono">
                      {elementId}
                    </Text>
                  )}
                </VStack>
                <IconButton
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="whiteAlpha"
                  onClick={onClose}
                  aria-label="Close properties panel"
                />
              </HStack>
            </Box>

            {/* Search */}
            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
              <InputGroup size="sm">
                <InputLeftElement>
                  <SearchIcon color={mutedColor} />
                </InputLeftElement>
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              {searchTerm && (
                <Text fontSize="xs" color={mutedColor} mt={2}>
                  {filteredProperties.length} of {Object.keys(allProperties).length} properties
                </Text>
              )}
            </Box>

            {/* Properties */}
            <Box flex={1} overflowY="auto" p={4}>
              <VStack spacing={3} align="stretch">
                {filteredProperties.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <InfoIcon color={mutedColor} boxSize={8} mb={2} />
                    <Text color={mutedColor}>
                      {searchTerm ? 'No properties match your search' : 'No properties available'}
                    </Text>
                  </Box>
                ) : (
                  filteredProperties.map(([key, value]) => (
                    <PropertyItem
                      key={key}
                      label={key}
                      value={value}
                      isSearchMatch={Boolean(searchTerm && (
                        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        String(value).toLowerCase().includes(searchTerm.toLowerCase())
                      ))}
                    />
                  ))
                )}
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={4} borderTop="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" color={mutedColor} textAlign="center">
                {Object.keys(allProperties).length} properties • {isNode ? 'Node' : 'Edge'} Details
              </Text>
            </Box>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  )
}

export default PropertiesPanel
