import React, { useState, useEffect, useCallback } from 'react'
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
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloseIcon,
  SearchIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CopyIcon,
  TimeIcon,
  InfoIcon,
  EditIcon,
  AddIcon,
  DeleteIcon,
  SettingsIcon,
  ArrowBackIcon,
  ArrowForwardIcon
} from '@chakra-ui/icons'

// Import TC_ALARM_LEVELS from GraphVisualization
import { TC_ALARM_LEVELS } from './GraphVisualization'

const MotionBox = motion(Box)

// TC Property Control Component
const TCPropertyControl: React.FC<{
  property: TCProperty
  value: any
  onChange: (value: any) => void
}> = ({ property, value, onChange }) => {
  const textColor = useColorModeValue('gray.700', 'gray.200')

  const renderControl = () => {
    switch (property.type) {
      case 'slider':
        return (
          <VStack spacing={2} w="full">
            <HStack w="full" justify="space-between">
              <Text fontSize="xs" color={textColor}>{property.min}</Text>
              <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                {value ?? property.defaultValue}
              </Text>
              <Text fontSize="xs" color={textColor}>{property.max}</Text>
            </HStack>
            <Slider
              value={value ?? property.defaultValue}
              min={property.min}
              max={property.max}
              step={property.step}
              onChange={onChange}
              colorScheme="visium"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </VStack>
        )

      case 'color':
        return (
          <HStack spacing={2} w="full">
            <Input
              type="color"
              value={value ?? property.defaultValue}
              onChange={(e) => onChange(e.target.value)}
              w="60px"
              h="32px"
              p={1}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
            />
            <Input
              value={value ?? property.defaultValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              size="sm"
              fontFamily="mono"
            />
          </HStack>
        )

      case 'select':
        return (
          <Select
            value={value ?? property.defaultValue}
            onChange={(e) => onChange(e.target.value)}
            size="sm"
          >
            {property.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </Select>
        )

      case 'number':
        return (
          <NumberInput
            value={value ?? property.defaultValue}
            onChange={(_, val) => onChange(val)}
            min={property.min}
            max={property.max}
            step={property.step}
            size="sm"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )

      case 'text':
        return (
          <Input
            value={value ?? property.defaultValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.placeholder || 'Enter text...'}
            size="sm"
          />
        )

      default:
        return null
    }
  }

  return (
    <Box p={3} borderRadius="md" bg="blue.50" border="1px solid" borderColor="blue.200">
      <VStack align="start" spacing={2} w="full">
        <HStack justify="space-between" w="full">
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            {property.label}
          </Text>
          <Tooltip label={property.description}>
            <InfoIcon boxSize={3} color="blue.500" />
          </Tooltip>
        </HStack>
        {renderControl()}
      </VStack>
    </Box>
  )
}

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedElement: {
    type: 'node' | 'edge'
    data: any
  } | null
  onPropertyChange?: (elementType: 'node' | 'edge', elementId: string, properties: Record<string, any>) => void
}

// TC_ Property definitions
interface TCProperty {
  key: string
  label: string
  description: string
  type: 'number' | 'color' | 'select' | 'slider' | 'text'
  applies: 'node' | 'edge' | 'both'
  options?: string[]
  min?: number
  max?: number
  step?: number
  defaultValue: any
  cytoscapeProperty: string
  placeholder?: string
}

const TC_PROPERTIES: TCProperty[] = [
  {
    key: 'TC_SIZE',
    label: 'Size',
    description: 'Node size in pixels',
    type: 'slider',
    applies: 'node',
    min: 10,
    max: 100,
    step: 1,
    defaultValue: 30,
    cytoscapeProperty: 'width'
  },
  {
    key: 'TC_WIDTH',
    label: 'Width',
    description: 'Edge width in pixels',
    type: 'slider',
    applies: 'edge',
    min: 1,
    max: 20,
    step: 0.5,
    defaultValue: 2,
    cytoscapeProperty: 'width'
  },
  {
    key: 'TC_COLOR',
    label: 'Color',
    description: 'Element color',
    type: 'color',
    applies: 'both',
    defaultValue: '#3182ce',
    cytoscapeProperty: 'background-color'
  },
  {
    key: 'TC_OPACITY',
    label: 'Opacity',
    description: 'Element transparency (0-1)',
    type: 'slider',
    applies: 'both',
    min: 0,
    max: 1,
    step: 0.1,
    defaultValue: 1,
    cytoscapeProperty: 'opacity'
  },
  {
    key: 'TC_CURVE',
    label: 'Curve Style',
    description: 'Edge curve style',
    type: 'select',
    applies: 'edge',
    options: ['straight', 'bezier', 'unbundled-bezier', 'segments', 'taxi'],
    defaultValue: 'bezier',
    cytoscapeProperty: 'curve-style'
  },
  {
    key: 'TC_LINE',
    label: 'Line Style',
    description: 'Edge line style',
    type: 'select',
    applies: 'edge',
    options: ['solid', 'dotted', 'dashed'],
    defaultValue: 'solid',
    cytoscapeProperty: 'line-style'
  },
  {
    key: 'TC_TEXT_COLOR',
    label: 'Text Color',
    description: 'Label text color',
    type: 'color',
    applies: 'both',
    defaultValue: '#000000',
    cytoscapeProperty: 'text-outline-color'
  },
  {
    key: 'TC_ANIMATION',
    label: 'Animation',
    description: 'Animation effect',
    type: 'select',
    applies: 'both',
    options: ['none', 'pulse', 'flash', 'strobe', 'glow', 'flow'],
    defaultValue: 'none',
    cytoscapeProperty: 'animation'
  },
  {
    key: 'TC_ALARM',
    label: 'Alarm Status',
    description: 'Security alarm severity level',
    type: 'select',
    applies: 'node',
    options: ['None', 'Info', 'Success', 'Warning', 'Alert'],
    defaultValue: 'None',
    cytoscapeProperty: 'border-color'
  },
  {
    key: 'TC_THREAT_PATH',
    label: 'Threat Paths',
    description: 'Comma-separated threat path identifiers',
    type: 'text',
    applies: 'both',
    defaultValue: '',
    cytoscapeProperty: 'threat-path',
    placeholder: 'e.g., THREAT-malware-to-internet,THREAT-high-utilization'
  }
]

interface PropertyItemProps {
  label: string
  value: any
  isSearchMatch?: boolean
  isEditable?: boolean
  isTCProperty?: boolean
  onEdit?: (key: string, value: any) => void
  onDelete?: (key: string) => void
}

interface EditPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property: { key: string; value: any } | null
  onSave: (key: string, value: any) => void
}

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (key: string, value: any) => void
  existingKeys: string[]
}

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  propertyKey: string
}

// Edit Property Modal
const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  onSave
}) => {
  const [value, setValue] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (property) {
      setValue(typeof property.value === 'object' ? JSON.stringify(property.value, null, 2) : String(property.value))
    }
  }, [property])

  const handleSave = () => {
    if (!property) return

    try {
      // Try to parse as JSON if it looks like an object
      let parsedValue: any = value
      if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
        parsedValue = JSON.parse(value)
      } else if (value === 'true' || value === 'false') {
        parsedValue = value === 'true'
      } else if (!isNaN(Number(value)) && value.trim() !== '') {
        parsedValue = Number(value)
      }

      onSave(property.key, parsedValue)
      onClose()
      toast({
        title: 'Property Updated',
        description: `Property "${property.key}" has been updated`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Invalid Value',
        description: 'Please enter a valid value. For objects, use valid JSON format.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Property</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Property Key</FormLabel>
              <Input value={property?.key || ''} isReadOnly bg="gray.50" />
            </FormControl>
            <FormControl>
              <FormLabel>Property Value</FormLabel>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter property value"
                as={value.includes('\n') ? 'textarea' : 'input'}
                minH={value.includes('\n') ? '100px' : 'auto'}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Supports strings, numbers, booleans, and JSON objects/arrays
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Add Property Modal
const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingKeys
}) => {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const toast = useToast()

  const handleAdd = () => {
    if (!key.trim()) {
      toast({
        title: 'Invalid Key',
        description: 'Property key cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (existingKeys.includes(key.trim())) {
      toast({
        title: 'Duplicate Key',
        description: 'A property with this key already exists',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      // Try to parse as JSON if it looks like an object
      let parsedValue: any = value
      if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
        parsedValue = JSON.parse(value)
      } else if (value === 'true' || value === 'false') {
        parsedValue = value === 'true'
      } else if (!isNaN(Number(value)) && value.trim() !== '') {
        parsedValue = Number(value)
      }

      onAdd(key.trim(), parsedValue)
      setKey('')
      setValue('')
      onClose()
      toast({
        title: 'Property Added',
        description: `Property "${key.trim()}" has been added`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Invalid Value',
        description: 'Please enter a valid value. For objects, use valid JSON format.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Property</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Property Key</FormLabel>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter property key"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Property Value</FormLabel>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter property value"
                as={value.includes('\n') ? 'textarea' : 'input'}
                minH={value.includes('\n') ? '100px' : 'auto'}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Supports strings, numbers, booleans, and JSON objects/arrays
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleAdd}>
            Add Property
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Delete Confirmation Dialog
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  propertyKey
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Property
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the property &quot;{propertyKey}&quot;?
            This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

const PropertyItem: React.FC<PropertyItemProps> = ({
  label,
  value,
  isSearchMatch = false,
  isEditable = false,
  isTCProperty = false,
  onEdit,
  onDelete
}) => {
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const highlightBg = useColorModeValue('yellow.100', 'yellow.800')
  const tcBg = useColorModeValue('blue.50', 'blue.900')
  const tcBorder = useColorModeValue('blue.200', 'blue.600')
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
      bg={isSearchMatch ? highlightBg : isTCProperty ? tcBg : 'transparent'}
      border="1px solid"
      borderColor={isSearchMatch ? 'yellow.300' : isTCProperty ? tcBorder : 'transparent'}
    >
      <HStack justify="space-between" align="start" spacing={3}>
        <VStack align="start" spacing={1} flex={1}>
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              {label}
            </Text>
            {isTCProperty && (
              <Badge colorScheme="blue" size="sm">
                TC
              </Badge>
            )}
          </HStack>
          {renderValue()}
        </VStack>
        <HStack spacing={1}>
          {isEditable && onEdit && (
            <Tooltip label="Edit property">
              <IconButton
                icon={<EditIcon />}
                size="xs"
                variant="ghost"
                onClick={() => onEdit(label, value)}
                aria-label="Edit property"
              />
            </Tooltip>
          )}
          {isEditable && onDelete && !['uid', 'type', 'showname', 'from', 'to'].includes(label) && (
            <Tooltip label="Delete property">
              <IconButton
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(label)}
                aria-label="Delete property"
              />
            </Tooltip>
          )}
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
      </HStack>
    </Box>
  )
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  isOpen,
  onClose,
  selectedElement,
  onPropertyChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showTCProperties, setShowTCProperties] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProperty, setEditingProperty] = useState<{ key: string; value: any } | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState<Array<{
    elementType: 'node' | 'edge'
    elementId: string
    oldProperties: Record<string, any>
    newProperties: Record<string, any>
  }>>([])
  const [redoStack, setRedoStack] = useState<Array<{
    elementType: 'node' | 'edge'
    elementId: string
    oldProperties: Record<string, any>
    newProperties: Record<string, any>
  }>>([])

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const headerBg = useColorModeValue('visium.500', 'visium.600')
  const toast = useToast()

  // Reset search when panel closes or element changes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setIsEditMode(false)
      setShowTCProperties(false)
    }
  }, [isOpen, selectedElement])

  // Property change handlers
  const handlePropertyEdit = useCallback((key: string, value: any) => {
    setEditingProperty({ key, value })
    setIsEditModalOpen(true)
  }, [])

  const handlePropertyDelete = useCallback((key: string) => {
    setDeletingProperty(key)
    setIsDeleteDialogOpen(true)
  }, [])

  const handlePropertySave = useCallback((key: string, value: any) => {
    if (!selectedElement || !onPropertyChange) {
      console.warn('Cannot save property: missing selectedElement or onPropertyChange')
      return
    }

    try {
      const elementId = selectedElement.data.uid || selectedElement.data.id
      if (!elementId) {
        console.warn('Cannot save property: missing element ID')
        return
      }

      const oldProperties = { ...selectedElement.data.properties }
      const currentProperties = { ...selectedElement.data.properties }
      currentProperties[key] = value

      // Add to undo stack
      setUndoStack(prev => [...prev, {
        elementType: selectedElement.type,
        elementId,
        oldProperties,
        newProperties: currentProperties
      }])
      setRedoStack([]) // Clear redo stack when new action is performed

      // Call the property change handler with error handling
      try {
        onPropertyChange(selectedElement.type, elementId, currentProperties)
        setIsEditModalOpen(false)
        setEditingProperty(null)
      } catch (changeError) {
        console.error('Error in onPropertyChange callback:', changeError)

        // Show user-friendly error message
        toast({
          title: 'Property Save Failed',
          description: `Failed to save property "${key}". Please try again.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error saving property:', error)

      toast({
        title: 'Property Save Error',
        description: 'An unexpected error occurred while saving the property.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [selectedElement, onPropertyChange, toast])

  const handlePropertyAdd = useCallback((key: string, value: any) => {
    if (!selectedElement || !onPropertyChange) return

    const elementId = selectedElement.data.uid || selectedElement.data.id
    const oldProperties = { ...selectedElement.data.properties }
    const currentProperties = { ...selectedElement.data.properties }
    currentProperties[key] = value

    // Add to undo stack
    setUndoStack(prev => [...prev, {
      elementType: selectedElement.type,
      elementId,
      oldProperties,
      newProperties: currentProperties
    }])
    setRedoStack([]) // Clear redo stack when new action is performed

    onPropertyChange(selectedElement.type, elementId, currentProperties)
    setIsAddModalOpen(false)
  }, [selectedElement, onPropertyChange])

  const handlePropertyDeleteConfirm = useCallback(() => {
    if (!selectedElement || !onPropertyChange || !deletingProperty) return

    const elementId = selectedElement.data.uid || selectedElement.data.id
    const oldProperties = { ...selectedElement.data.properties }
    const currentProperties = { ...selectedElement.data.properties }
    delete currentProperties[deletingProperty]

    // Add to undo stack
    setUndoStack(prev => [...prev, {
      elementType: selectedElement.type,
      elementId,
      oldProperties,
      newProperties: currentProperties
    }])
    setRedoStack([]) // Clear redo stack when new action is performed

    onPropertyChange(selectedElement.type, elementId, currentProperties)
    setIsDeleteDialogOpen(false)
    setDeletingProperty(null)

    toast({
      title: 'Property Deleted',
      description: `Property "${deletingProperty}" has been deleted`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }, [selectedElement, onPropertyChange, deletingProperty, toast])

  const handleTCPropertyChange = useCallback((tcKey: string, value: any) => {
    if (!selectedElement || !onPropertyChange) {
      console.warn('Cannot update TC property: missing selectedElement or onPropertyChange')
      return
    }

    try {
      // Validate the property value
      if (value === undefined || value === null) {
        console.warn(`Invalid value for TC property ${tcKey}:`, value)
        return
      }

      const elementId = selectedElement.data.uid || selectedElement.data.id
      if (!elementId) {
        console.warn('Cannot update TC property: missing element ID')
        return
      }

      const oldProperties = { ...selectedElement.data.properties }
      const currentProperties = { ...selectedElement.data.properties }
      currentProperties[tcKey] = value

      // Add to undo stack
      setUndoStack(prev => [...prev, {
        elementType: selectedElement.type,
        elementId,
        oldProperties,
        newProperties: currentProperties
      }])
      setRedoStack([]) // Clear redo stack when new action is performed

      // Call the property change handler with error handling
      try {
        onPropertyChange(selectedElement.type, elementId, currentProperties)
      } catch (changeError) {
        console.error('Error in onPropertyChange callback:', changeError)

        // Show user-friendly error message
        toast({
          title: 'Property Update Failed',
          description: `Failed to update ${tcKey}. Please try again.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error handling TC property change:', error)

      toast({
        title: 'Property Update Error',
        description: 'An unexpected error occurred while updating the property.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [selectedElement, onPropertyChange, toast])

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !onPropertyChange) return

    const lastAction = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setRedoStack(prev => [...prev, lastAction])

    onPropertyChange(lastAction.elementType, lastAction.elementId, lastAction.oldProperties)

    toast({
      title: 'Undo',
      description: 'Property change has been undone',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [undoStack, onPropertyChange, toast])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !onPropertyChange) return

    const lastAction = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))
    setUndoStack(prev => [...prev, lastAction])

    onPropertyChange(lastAction.elementType, lastAction.elementId, lastAction.newProperties)

    toast({
      title: 'Redo',
      description: 'Property change has been redone',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [redoStack, onPropertyChange, toast])

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

  // Separate TC properties from regular properties
  const tcProperties: { [key: string]: any } = {}

  // Add all custom properties, separating TC_ properties
  // Check both data.properties and main data object for TC_ properties
  const allDataProperties = { ...data.properties, ...data }

  if (allDataProperties && typeof allDataProperties === 'object') {
    Object.entries(allDataProperties).forEach(([key, value]) => {
      if (key.startsWith('TC_')) {
        tcProperties[key] = value
      } else if (data.properties && data.properties.hasOwnProperty(key)) {
        // Only add non-TC properties from data.properties to avoid duplicates
        allProperties[key] = value
      }
    })
  }

  // Filter regular properties based on search
  const filteredProperties = Object.entries(allProperties).filter(([key, value]) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      key.toLowerCase().includes(searchLower) ||
      String(value).toLowerCase().includes(searchLower)
    )
  })

  // Filter TC properties based on search and element type
  const filteredTCProperties = Object.entries(tcProperties).filter(([key, value]) => {
    const tcProperty = TC_PROPERTIES.find(p => p.key === key)
    if (!tcProperty) return true // Show unknown TC properties

    // Check if property applies to current element type
    if (tcProperty.applies !== 'both' && tcProperty.applies !== type) return false

    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      key.toLowerCase().includes(searchLower) ||
      String(value).toLowerCase().includes(searchLower)
    )
  })

  // Get applicable TC properties for this element type
  const applicableTCProperties = TC_PROPERTIES.filter(p =>
    p.applies === 'both' || p.applies === type
  )

  // Get existing property keys for validation
  const existingKeys = Object.keys(allProperties).concat(Object.keys(tcProperties))

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
                  {filteredProperties.length + filteredTCProperties.length} of {Object.keys(allProperties).length + Object.keys(tcProperties).length} properties
                </Text>
              )}
            </Box>

            {/* Controls */}
            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="edit-mode" mb="0" fontSize="sm">
                      Edit Mode
                    </FormLabel>
                    <Switch
                      id="edit-mode"
                      isChecked={isEditMode}
                      onChange={(e) => setIsEditMode(e.target.checked)}
                      colorScheme="visium"
                      size="sm"
                    />
                  </FormControl>
                  {isEditMode && (
                    <HStack spacing={2}>
                      <Tooltip label="Undo last change">
                        <IconButton
                          icon={<ArrowBackIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={handleUndo}
                          isDisabled={undoStack.length === 0}
                          aria-label="Undo"
                        />
                      </Tooltip>
                      <Tooltip label="Redo last change">
                        <IconButton
                          icon={<ArrowForwardIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={handleRedo}
                          isDisabled={redoStack.length === 0}
                          aria-label="Redo"
                        />
                      </Tooltip>
                      <Button
                        size="xs"
                        leftIcon={<AddIcon />}
                        onClick={() => setIsAddModalOpen(true)}
                        colorScheme="blue"
                      >
                        Add Property
                      </Button>
                    </HStack>
                  )}
                </HStack>

                <HStack justify="space-between" w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="tc-properties" mb="0" fontSize="sm">
                      TC Properties
                    </FormLabel>
                    <Switch
                      id="tc-properties"
                      isChecked={showTCProperties}
                      onChange={(e) => setShowTCProperties(e.target.checked)}
                      colorScheme="blue"
                      size="sm"
                    />
                  </FormControl>
                  <Tooltip label="TruContext custom properties for styling and animation">
                    <InfoIcon boxSize={3} color={mutedColor} />
                  </Tooltip>
                </HStack>
              </VStack>
            </Box>

            {/* Properties */}
            <Box flex={1} overflowY="auto" p={4}>
              <VStack spacing={4} align="stretch">
                {/* Regular Properties */}
                {filteredProperties.length === 0 && (!showTCProperties || filteredTCProperties.length === 0) ? (
                  <Box textAlign="center" py={8}>
                    <InfoIcon color={mutedColor} boxSize={8} mb={2} />
                    <Text color={mutedColor}>
                      {searchTerm ? 'No properties match your search' : 'No properties available'}
                    </Text>
                  </Box>
                ) : (
                  <>
                    {/* Regular Properties Section */}
                    {filteredProperties.length > 0 && (
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          Properties ({filteredProperties.length})
                        </Text>
                        {filteredProperties.map(([key, value]) => (
                          <PropertyItem
                            key={key}
                            label={key}
                            value={value}
                            isSearchMatch={Boolean(searchTerm && (
                              key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              String(value).toLowerCase().includes(searchTerm.toLowerCase())
                            ))}
                            isEditable={isEditMode}
                            onEdit={handlePropertyEdit}
                            onDelete={handlePropertyDelete}
                          />
                        ))}
                      </VStack>
                    )}

                    {/* TC Properties Section */}
                    {showTCProperties && (
                      <VStack spacing={3} align="stretch">
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="semibold" color="blue.500">
                            TruContext Properties ({filteredTCProperties.length})
                          </Text>
                          <Badge colorScheme="blue" size="sm">TC</Badge>
                        </HStack>

                        {/* Existing TC Properties */}
                        {filteredTCProperties.map(([key, value]) => (
                          <PropertyItem
                            key={key}
                            label={key}
                            value={value}
                            isSearchMatch={Boolean(searchTerm && (
                              key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              String(value).toLowerCase().includes(searchTerm.toLowerCase())
                            ))}
                            isEditable={isEditMode}
                            isTCProperty={true}
                            onEdit={handlePropertyEdit}
                            onDelete={handlePropertyDelete}
                          />
                        ))}

                        {/* Available TC Properties Controls */}
                        {applicableTCProperties.map(tcProperty => {
                          const currentValue = tcProperties[tcProperty.key]
                          return (
                            <TCPropertyControl
                              key={tcProperty.key}
                              property={tcProperty}
                              value={currentValue}
                              onChange={(value) => handleTCPropertyChange(tcProperty.key, value)}
                            />
                          )
                        })}

                        {/* Bulk TC Properties Section */}
                        {isEditMode && (
                          <Box p={3} borderRadius="md" bg="purple.50" border="1px solid" borderColor="purple.200">
                            <VStack spacing={3} align="start">
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                                  Bulk TC Properties
                                </Text>
                                <Badge colorScheme="purple" size="sm">BULK</Badge>
                              </HStack>
                              <Text fontSize="xs" color="purple.600">
                                Apply TC properties to multiple selected elements in the graph
                              </Text>
                              <Button
                                size="sm"
                                colorScheme="purple"
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: 'Bulk Operations',
                                    description: 'Select multiple elements in the graph (Ctrl+Click) to apply TC properties to all selected elements',
                                    status: 'info',
                                    duration: 5000,
                                    isClosable: true,
                                  })
                                }}
                                w="full"
                              >
                                How to Use Bulk Operations
                              </Button>
                            </VStack>
                          </Box>
                        )}

                        {/* TC Property Presets */}
                        <Box p={3} borderRadius="md" bg="green.50" border="1px solid" borderColor="green.200">
                          <VStack spacing={3} align="start">
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" fontWeight="semibold" color="green.700">
                                TC Property Presets
                              </Text>
                              <Badge colorScheme="green" size="sm">PRESETS</Badge>
                            </HStack>
                            <Text fontSize="xs" color="green.600">
                              Quick apply common TC property combinations
                            </Text>
                            <HStack spacing={2} w="full" flexWrap="wrap">
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => {
                                  handleTCPropertyChange('TC_ALARM', 'Alert')
                                  handleTCPropertyChange('TC_ANIMATION', 'pulse')
                                }}
                              >
                                Alert
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="orange"
                                variant="outline"
                                onClick={() => {
                                  handleTCPropertyChange('TC_ALARM', 'Warning')
                                  handleTCPropertyChange('TC_ANIMATION', 'glow')
                                }}
                              >
                                Warning
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="green"
                                variant="outline"
                                onClick={() => {
                                  handleTCPropertyChange('TC_ALARM', 'Success')
                                  handleTCPropertyChange('TC_ANIMATION', 'none')
                                }}
                              >
                                Success
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                                onClick={() => {
                                  handleTCPropertyChange('TC_ALARM', 'Info')
                                  handleTCPropertyChange('TC_ANIMATION', 'flow')
                                }}
                              >
                                Info
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="gray"
                                variant="outline"
                                onClick={() => {
                                  handleTCPropertyChange('TC_ALARM', 'None')
                                  handleTCPropertyChange('TC_ANIMATION', 'none')
                                }}
                              >
                                Reset All
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="gray"
                                variant="outline"
                                onClick={() => {
                                  // Reset all TC properties
                                  applicableTCProperties.forEach(prop => {
                                    handleTCPropertyChange(prop.key, prop.defaultValue)
                                  })
                                }}
                              >
                                Reset All
                              </Button>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>
                    )}
                  </>
                )}
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={4} borderTop="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" color={mutedColor} textAlign="center">
                {Object.keys(allProperties).length + Object.keys(tcProperties).length} properties • {isNode ? 'Node' : 'Edge'} Details
                {showTCProperties && ` • ${Object.keys(tcProperties).length} TC Properties`}
              </Text>
            </Box>
          </MotionBox>

          {/* Modals and Dialogs */}
          <EditPropertyModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingProperty(null)
            }}
            property={editingProperty}
            onSave={handlePropertySave}
          />

          <AddPropertyModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handlePropertyAdd}
            existingKeys={existingKeys}
          />

          <DeleteConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false)
              setDeletingProperty(null)
            }}
            onConfirm={handlePropertyDeleteConfirm}
            propertyKey={deletingProperty || ''}
          />
        </>
      )}
    </AnimatePresence>
  )
}

export default PropertiesPanel
