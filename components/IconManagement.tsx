import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  GridItem,
  Button,
  IconButton,
  Image,
  Badge,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Divider,
  Tooltip,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DeleteIcon,
  AddIcon,
  DownloadIcon,
  AttachmentIcon,
  EditIcon,
  ViewIcon,
  SearchIcon,
  SettingsIcon,
  InfoIcon,
  WarningIcon,
  CheckIcon
} from '@chakra-ui/icons'
import { useDropzone } from 'react-dropzone'

const MotionBox = motion(Box)
const MotionGrid = motion(Grid)

interface IconData {
  name: string
  path: string
  size: number
  lastModified: Date
  isUsed: boolean
  nodeType?: string
  description?: string
  metadata?: {
    width?: number
    height?: number
    viewBox?: string
  }
}

interface IconManagementProps {
  nodes?: any[]
  edges?: any[]
}

const IconManagement: React.FC<IconManagementProps> = ({ nodes = [], edges = [] }) => {
  // State management
  const [icons, setIcons] = useState<IconData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'used' | 'unused'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewIcon, setPreviewIcon] = useState<IconData | null>(null)
  const [editingIcon, setEditingIcon] = useState<IconData | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  // Modal controls
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()
  const { isOpen: isGenerateOpen, onOpen: onGenerateOpen, onClose: onGenerateClose } = useDisclosure()
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure()
  
  // Form states
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [generateNodeType, setGenerateNodeType] = useState('')
  
  // UI states
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    uploading: false,
    generating: false,
    deleting: false,
    exporting: false
  })
  
  const toast = useToast()
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const cardBg = useColorModeValue('gray.50', 'gray.700')
  
  // Load icons from the server
  const loadIcons = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/icons')
      if (response.ok) {
        const iconData = await response.json()
        setIcons(iconData)
      } else {
        throw new Error('Failed to load icons')
      }
    } catch (error) {
      console.error('Error loading icons:', error)
      toast({
        title: 'Error loading icons',
        description: 'Failed to load icon data from server',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])
  
  // Load icons on component mount
  useEffect(() => {
    loadIcons()
  }, [loadIcons])
  
  // Filter and search icons
  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (icon.nodeType && icon.nodeType.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'used' && icon.isUsed) ||
                         (filterType === 'unused' && !icon.isUsed)
    
    return matchesSearch && matchesFilter
  })
  
  // Bulk operations handlers
  const handleSelectAll = () => {
    if (selectedIcons.size === filteredIcons.length) {
      setSelectedIcons(new Set())
    } else {
      setSelectedIcons(new Set(filteredIcons.map(icon => icon.name)))
    }
  }
  
  const handleSelectIcon = (iconName: string) => {
    const newSelected = new Set(selectedIcons)
    if (newSelected.has(iconName)) {
      newSelected.delete(iconName)
    } else {
      newSelected.add(iconName)
    }
    setSelectedIcons(newSelected)
  }
  
  const handleBulkDelete = async () => {
    if (selectedIcons.size === 0) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/icons/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          iconNames: Array.from(selectedIcons)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete icons')
      }
      
      toast({
        title: 'Icons deleted successfully',
        description: `${selectedIcons.size} icon(s) deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      setSelectedIcons(new Set())
      loadIcons()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete selected icons',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
      onBulkClose()
    }
  }
  
  const handleExportAll = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/icons/export')
      
      if (!response.ok) {
        throw new Error('Failed to export icons')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'trucontext-icons.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Export successful',
        description: 'All icons exported as ZIP file',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export icons',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleExportSelected = async () => {
    if (selectedIcons.size === 0) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/icons/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          iconNames: Array.from(selectedIcons)
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to export selected icons')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'trucontext-selected-icons.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Export successful',
        description: `${selectedIcons.size} selected icon(s) exported`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      setSelectedIcons(new Set())
    } catch (error) {
      console.error('Export selected error:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export selected icons',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
      onBulkClose()
    }
  }

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => 
      file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg'
    )
    
    if (validFiles.length > 0) {
      // Auto-open upload modal with files
      setUploadFiles(validFiles)
      onUploadOpen()
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please drop SVG, PNG, or JPEG files only',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  
  const handleSelectAllIcons = useCallback(() => {
    if (selectedIcons.size === filteredIcons.length) {
      setSelectedIcons(new Set())
    } else {
      setSelectedIcons(new Set(filteredIcons.map(icon => icon.name)))
    }
  }, [selectedIcons.size, filteredIcons])

  const handlePreviewIcon = (icon: IconData) => {
    setPreviewIcon(icon)
    onPreviewOpen()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'u':
            e.preventDefault()
            onUploadOpen()
            break
          case 'g':
            e.preventDefault()
            onGenerateOpen()
            break
          case 'a':
            e.preventDefault()
            handleSelectAllIcons()
            break
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedIcons(new Set())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUploadOpen, onGenerateOpen, handleSelectAllIcons])
  
  // Handle icon deletion
  const handleDeleteIcon = async (iconName: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/icons/${iconName}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadIcons()
        toast({
          title: 'Icon deleted',
          description: `${iconName} has been deleted and replaced with unknown.svg fallback`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error('Failed to delete icon')
      }
    } catch (error) {
      console.error('Error deleting icon:', error)
      toast({
        title: 'Error deleting icon',
        description: 'Failed to delete the icon',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
  
  if (loading) {
    return (
      <Box p={6} display="flex" alignItems="center" justifyContent="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading icon management...</Text>
        </VStack>
      </Box>
    )
  }
  
  return (
    <MotionBox
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      position="relative"
      height="calc(100vh - 2rem)"
      maxHeight="calc(100vh - 2rem)"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      _before={isDragOver ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'blue.50',
        border: '2px dashed',
        borderColor: 'blue.300',
        borderRadius: 'lg',
        zIndex: 1,
        pointerEvents: 'none'
      } : {}}
    >
      {isDragOver && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={2}
          textAlign="center"
          pointerEvents="none"
        >
          <Icon as={AttachmentIcon} boxSize={12} color="blue.500" mb={2} />
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            Drop files here to upload
          </Text>
          <Text fontSize="sm" color="blue.500">
            SVG, PNG, or JPEG files supported
          </Text>
        </Box>
      )}
      {/* Header */}
      <VStack spacing={6} align="stretch" flex={1} overflowY="auto" pb={4}>
        <Box>
          <Heading size="lg" mb={2}>Icon Management</Heading>
          <Text color={textColor}>
            Manage SVG icons for node types in the TruContext application
          </Text>
        </Box>
        
        {/* Stats and Controls */}
        <Flex wrap="wrap" gap={4} align="center">
          <HStack spacing={4}>
            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
              {icons.length} Total Icons
            </Badge>
            <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
              {icons.filter(i => i.isUsed).length} Used
            </Badge>
            <Badge colorScheme="orange" fontSize="sm" px={2} py={1}>
              {icons.filter(i => !i.isUsed).length} Unused
            </Badge>
          </HStack>
          
          <Spacer />
          
          <HStack spacing={2}>
            <Tooltip label="Upload icons (Ctrl+U)" placement="bottom">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                onClick={onUploadOpen}
                isLoading={loadingStates.uploading}
              >
                Upload
              </Button>
            </Tooltip>
            <Tooltip label="Generate with AI (Ctrl+G)" placement="bottom">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="purple"
                size="sm"
                onClick={onGenerateOpen}
                isLoading={loadingStates.generating}
              >
                Generate
              </Button>
            </Tooltip>
            <Tooltip label="Bulk operations for selected icons" placement="bottom">
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="green"
                size="sm"
                onClick={onBulkOpen}
                isDisabled={selectedIcons.size === 0}
              >
                Bulk Actions
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
        
        {/* Search and Filter */}
        <HStack spacing={4} justify="space-between">
          <HStack spacing={4}>
            <InputGroup size="sm" maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'used' | 'unused')}
              size="sm"
              maxW="150px"
            >
              <option value="all">All Icons</option>
              <option value="used">Used Only</option>
              <option value="unused">Unused Only</option>
            </Select>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip 
              label={
                <VStack spacing={1} align="start" fontSize="xs">
                  <Text fontWeight="bold">Keyboard Shortcuts:</Text>
                  <Text>Ctrl+U - Upload</Text>
                  <Text>Ctrl+G - Generate</Text>
                  <Text>Ctrl+A - Select All</Text>
                  <Text>Esc - Clear Selection</Text>
                </VStack>
              } 
              placement="bottom-end"
            >
              <IconButton
                icon={<InfoIcon />}
                size="sm"
                variant="ghost"
                aria-label="Help"
              />
            </Tooltip>
            <Button
              leftIcon={viewMode === 'grid' ? <ViewIcon /> : <ViewIcon />}
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </HStack>
        </HStack>       {selectedIcons.size > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <HStack spacing={4} flex={1}>
              <Text>
                {selectedIcons.size} icon{selectedIcons.size !== 1 ? 's' : ''} selected
              </Text>
              <Spacer />
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={onBulkOpen}
              >
                Bulk Actions
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIcons(new Set())}
              >
                Clear Selection
              </Button>
            </HStack>
          </Alert>
        )}
        
        {/* Add Select All button */}
        {filteredIcons.length > 0 && (
          <HStack justify="space-between">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAllIcons}
            >
              {selectedIcons.size === filteredIcons.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Text fontSize="sm" color="gray.600">
              {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
            </Text>
          </HStack>
        )}
        
        <Divider />
        
        {/* Icon Grid/List */}
        <Box>
          {filteredIcons.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text color={textColor} fontSize="lg">
                {searchTerm || filterType !== 'all' 
                  ? 'No icons match your search criteria'
                  : 'No icons found'
                }
              </Text>
            </Box>
          ) : (
            <MotionGrid
              templateColumns={viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr'}
              gap={4}
              variants={containerVariants}
            >
              {filteredIcons.map((icon) => (
                <IconCard
                  key={icon.name}
                  icon={icon}
                  isSelected={selectedIcons.has(icon.name)}
                  onSelect={() => handleSelectIcon(icon.name)}
                  onPreview={() => handlePreviewIcon(icon)}
                  onDelete={() => handleDeleteIcon(icon.name)}
                  viewMode={viewMode}
                  variants={itemVariants}
                />
              ))}
            </MotionGrid>
          )}
        </Box>
      </VStack>
      
      {/* Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={onUploadClose} 
        onUploadSuccess={loadIcons} 
      />
      
      <GenerateModal 
        isOpen={isGenerateOpen} 
        onClose={onGenerateClose} 
        onGenerateSuccess={loadIcons} 
      />
      
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={onPreviewClose} 
        icon={previewIcon} 
      />
      
      <BulkActionsModal
        isOpen={isBulkOpen}
        onClose={onBulkClose}
        selectedCount={selectedIcons.size}
        onBulkDelete={handleBulkDelete}
        onExportSelected={handleExportSelected}
        onExportAll={handleExportAll}
        isProcessing={isProcessing}
      />
    </MotionBox>
  )
}

// Icon Card Component
interface IconCardProps {
  icon: IconData
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
  onDelete: () => void
  viewMode: 'grid' | 'list'
  variants: any
}

const IconCard: React.FC<IconCardProps> = ({
  icon,
  isSelected,
  onSelect,
  onPreview,
  onDelete,
  viewMode,
  variants
}) => {
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.600')
  
  return (
    <MotionBox
      variants={variants}
      bg={cardBg}
      border="2px solid"
      borderColor={isSelected ? 'blue.500' : borderColor}
      borderRadius="lg"
      p={4}
      cursor="pointer"
      _hover={{ bg: hoverBg, transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      onClick={onSelect}
    >
      {viewMode === 'grid' ? (
        <VStack spacing={3} align="center">
          <Box
            w="80px"
            h="80px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.50"
            borderRadius="md"
          >
            <Image
              src={icon.path}
              alt={icon.name}
              maxW="60px"
              maxH="60px"
              fallback={<Text fontSize="xs">SVG</Text>}
            />
          </Box>
          
          <VStack spacing={1} align="center">
            <Text fontSize="sm" fontWeight="medium" textAlign="center" noOfLines={2}>
              {icon.name}
            </Text>
            {icon.nodeType && (
              <Badge size="sm" colorScheme={icon.isUsed ? 'green' : 'gray'}>
                {icon.nodeType}
              </Badge>
            )}
            {!icon.isUsed && (
              <Badge size="sm" colorScheme="orange">
                Unused
              </Badge>
            )}
          </VStack>
          
          <HStack spacing={1}>
            <Tooltip label="Preview">
              <IconButton
                aria-label="Preview icon"
                icon={<ViewIcon />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview()
                }}
              />
            </Tooltip>
            <Tooltip label="Delete">
              <IconButton
                aria-label="Delete icon"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              />
            </Tooltip>
          </HStack>
        </VStack>
      ) : (
        <HStack spacing={4} align="center">
          <Box
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.50"
            borderRadius="md"
            flexShrink={0}
          >
            <Image
              src={icon.path}
              alt={icon.name}
              maxW="30px"
              maxH="30px"
              fallback={<Text fontSize="xs">SVG</Text>}
            />
          </Box>
          
          <VStack spacing={1} align="start" flex={1}>
            <Text fontSize="sm" fontWeight="medium">
              {icon.name}
            </Text>
            <HStack spacing={2}>
              {icon.nodeType && (
                <Badge size="sm" colorScheme={icon.isUsed ? 'green' : 'gray'}>
                  {icon.nodeType}
                </Badge>
              )}
              {!icon.isUsed && (
                <Badge size="sm" colorScheme="orange">
                  Unused
                </Badge>
              )}
            </HStack>
          </VStack>
          
          <HStack spacing={1}>
            <Tooltip label="Preview">
              <IconButton
                aria-label="Preview icon"
                icon={<ViewIcon />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview()
                }}
              />
            </Tooltip>
            <Tooltip label="Delete">
              <IconButton
                aria-label="Delete icon"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              />
            </Tooltip>
          </HStack>
        </HStack>
      )}
    </MotionBox>
  )
}

// Upload Modal Component
interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: () => void
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const toast = useToast()
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type === 'image/svg+xml' || file.type === 'image/png' || file.type === 'image/jpeg'
    )
    setUploadedFiles(validFiles)
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: true
  })
  
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('nodeType', file.name.replace(/\.(svg|png|jpe?g)$/i, ''))
        
        const response = await fetch('/api/icons/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100)
      }
      
      toast({
        title: 'Upload successful',
        description: `${uploadedFiles.length} icon(s) uploaded successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      onUploadSuccess()
      onClose()
      setUploadedFiles([])
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload one or more icons',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Icons</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text color="gray.600">
              Upload SVG, PNG, or JPEG files. PNG and JPEG files will be automatically converted to SVG.
            </Text>
            
            <Box
              {...getRootProps()}
              border="2px dashed"
              borderColor={isDragActive ? 'blue.500' : 'gray.300'}
              borderRadius="lg"
              p={8}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500' }}
              bg={isDragActive ? 'blue.50' : 'gray.50'}
            >
              <input {...getInputProps()} />
              <VStack spacing={2}>
                <AttachmentIcon boxSize="40px" color="gray.500" />
                <Text>
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop files here, or click to select files'
                  }
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Supports SVG, PNG, JPEG files
                </Text>
              </VStack>
            </Box>
            
            {uploadedFiles.length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Selected Files ({uploadedFiles.length}):
                </Text>
                <VStack spacing={1} align="stretch">
                  {uploadedFiles.map((file, index) => (
                    <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm">{file.name}</Text>
                      <Badge colorScheme="blue">{file.type}</Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
            
            {isUploading && (
              <Box>
                <Text fontSize="sm" mb={2}>Uploading... {Math.round(uploadProgress)}%</Text>
                <Progress value={uploadProgress} colorScheme="blue" />
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isUploading}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleUpload}
            isLoading={isUploading}
            isDisabled={uploadedFiles.length === 0}
          >
            Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Generate Modal Component
interface GenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerateSuccess: () => void
}

const GenerateModal: React.FC<GenerateModalProps> = ({ isOpen, onClose, onGenerateSuccess }) => {
  const [prompt, setPrompt] = useState('')
  const [nodeType, setNodeType] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null)
  const toast = useToast()
  
  const handleGenerate = async () => {
    if (!prompt.trim() || !nodeType.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/icons/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `Create a cybersecurity icon for ${nodeType}: ${prompt}. Style: minimalist, professional, suitable for network diagrams`,
          nodeType: nodeType.toLowerCase().replace(/\s+/g, '_'),
          style: 'cybersecurity'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      setGeneratedIcon(result.iconPath)
      
      toast({
        title: 'Icon generated successfully',
        description: `New icon created for ${nodeType}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      onGenerateSuccess()
    } catch (error) {
      console.error('Generation error:', error)
      
      let errorMessage = 'Failed to generate icon using AI'
      if (error instanceof Error) {
        if (error.message.includes('Google API key')) {
          errorMessage = 'AI generation requires Google API key. Using placeholder icon instead.'
        } else if (error.message.includes('overloaded')) {
          errorMessage = '🤖 The AI service is currently overloaded. Please try again in a few minutes.'
        } else if (error.message.includes('quota')) {
          errorMessage = 'AI service quota exceeded. Please try again later.'
        } else if (error.message.includes('Server error')) {
          errorMessage = `Server error: ${error.message}`
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: 'Generation failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleSave = () => {
    onClose()
    setPrompt('')
    setNodeType('')
    setGeneratedIcon(null)
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Generate Icon with AI</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Node Type</FormLabel>
              <Input
                placeholder="e.g., firewall, database, server"
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value)}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe the icon you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </FormControl>
            
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                AI will generate a cybersecurity-themed icon based on your description. 
                The icon will be optimized for network diagrams and dashboard use.
              </AlertDescription>
            </Alert>
            
            {generatedIcon && (
              <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
                <Text mb={2} fontWeight="medium">Generated Icon:</Text>
                <Image
                  src={generatedIcon}
                  alt="Generated icon"
                  maxW="100px"
                  maxH="100px"
                  mx="auto"
                />
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          {generatedIcon ? (
            <Button colorScheme="green" onClick={handleSave}>
              Save Icon
            </Button>
          ) : (
            <Button 
              colorScheme="purple" 
              onClick={handleGenerate}
              isLoading={isGenerating}
              isDisabled={!prompt.trim() || !nodeType.trim()}
            >
              Generate
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Preview Modal Component
interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  icon: IconData | null
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, icon }) => {
  if (!icon) return null
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{icon.name} Preview</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="center">
            <Box textAlign="center">
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                {icon.nodeType || icon.name}
              </Text>
              
              <VStack spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>Small (32px)</Text>
                  <Image src={icon.path} alt={icon.name} w="32px" h="32px" />
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>Medium (64px)</Text>
                  <Image src={icon.path} alt={icon.name} w="64px" h="64px" />
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>Large (128px)</Text>
                  <Image src={icon.path} alt={icon.name} w="128px" h="128px" />
                </Box>
              </VStack>
            </Box>
            
            <Divider />
            
            <VStack spacing={2} align="stretch" w="full">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">File Size:</Text>
                <Text fontSize="sm">{(icon.size / 1024).toFixed(1)} KB</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Status:</Text>
                <Badge colorScheme={icon.isUsed ? 'green' : 'orange'}>
                  {icon.isUsed ? 'Used' : 'Unused'}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Last Modified:</Text>
                <Text fontSize="sm">{new Date(icon.lastModified).toLocaleDateString()}</Text>
              </HStack>
              
              {icon.metadata && (
                <>
                  {icon.metadata.viewBox && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">ViewBox:</Text>
                      <Text fontSize="sm" fontFamily="mono">{icon.metadata.viewBox}</Text>
                    </HStack>
                  )}
                  
                  {icon.metadata.width && icon.metadata.height && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Dimensions:</Text>
                      <Text fontSize="sm">{icon.metadata.width} × {icon.metadata.height}</Text>
                    </HStack>
                  )}
                </>
              )}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Bulk Actions Modal Component
interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  onBulkDelete: () => void
  onExportSelected: () => void
  onExportAll: () => void
  isProcessing: boolean
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onBulkDelete,
  onExportSelected,
  onExportAll,
  isProcessing
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bulk Actions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text color="gray.600">
              Choose an action to perform on the selected icons or all icons.
            </Text>
            
            {selectedCount > 0 && (
              <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                <Text fontWeight="medium" color="blue.800">
                  {selectedCount} icon(s) selected
                </Text>
              </Box>
            )}
            
            <Divider />
            
            <VStack spacing={3} align="stretch">
              <Text fontWeight="medium" fontSize="lg">Export Options</Text>
              
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={onExportAll}
                isLoading={isProcessing}
                size="lg"
              >
                Export All Icons
              </Button>
              
              {selectedCount > 0 && (
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  onClick={onExportSelected}
                  isLoading={isProcessing}
                  size="lg"
                >
                  Export Selected ({selectedCount})
                </Button>
              )}
            </VStack>
            
            {selectedCount > 0 && (
              <>
                <Divider />
                
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="medium" fontSize="lg" color="red.600">Destructive Actions</Text>
                  
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Deleted icons will be replaced with unknown.svg fallback. This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                  
                  <Button
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    variant="outline"
                    onClick={onBulkDelete}
                    isLoading={isProcessing}
                    size="lg"
                  >
                    Delete Selected ({selectedCount})
                  </Button>
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} isDisabled={isProcessing}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default IconManagement

