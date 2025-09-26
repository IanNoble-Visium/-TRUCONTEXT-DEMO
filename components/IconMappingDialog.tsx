import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  Code
} from '@chakra-ui/react'
import { 
  EditIcon, 
  DeleteIcon, 
  AddIcon, 
  SearchIcon, 
  DownloadIcon, 
  CheckIcon
} from '@chakra-ui/icons'

interface IconMappingDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface IconMapping {
  id: number
  source_type: string
  target_type: string
  description?: string
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const IconMappingDialog: React.FC<IconMappingDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [mappings, setMappings] = useState<IconMapping[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  // Form state
  const [searchTerm, setSearchTerm] = useState('')
  const [editingMapping, setEditingMapping] = useState<Partial<IconMapping> | null>(null)
  const [formData, setFormData] = useState({
    source_type: '',
    target_type: '',
    description: '',
    priority: 1,
    is_active: true
  })

  // Test state
  const [testSourceType, setTestSourceType] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMappings()
    }
  }, [isOpen])

  const loadMappings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/icon-mappings')
      if (!response.ok) throw new Error('Failed to load mappings')
      const data = await response.json()
      setMappings(data.mappings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast({
        title: 'Error loading mappings',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMapping = async () => {
    if (!formData.source_type || !formData.target_type) {
      toast({
        title: 'Validation Error',
        description: 'Source type and target type are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      const method = editingMapping ? 'PUT' : 'POST'
      const url = editingMapping 
        ? `/api/icon-mappings?id=${editingMapping.id}`
        : '/api/icon-mappings'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save mapping')
      }

      toast({
        title: editingMapping ? 'Mapping Updated' : 'Mapping Created',
        description: `Successfully ${editingMapping ? 'updated' : 'created'} mapping for ${formData.source_type}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Reset form and reload mappings
      setFormData({
        source_type: '',
        target_type: '',
        description: '',
        priority: 1,
        is_active: true
      })
      setEditingMapping(null)
      loadMappings()
    } catch (err) {
      toast({
        title: 'Error saving mapping',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMapping = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/icon-mappings?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete mapping')

      toast({
        title: 'Mapping Deleted',
        description: 'Successfully deleted mapping',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      loadMappings()
    } catch (err) {
      toast({
        title: 'Error deleting mapping',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestMapping = async () => {
    if (!testSourceType) {
      toast({
        title: 'Validation Error',
        description: 'Source type is required for testing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setTestLoading(true)
    try {
      const response = await fetch('/api/icon-mappings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: testSourceType,
          test_type: 'resolution'
        })
      })

      if (!response.ok) throw new Error('Test failed')

      const data = await response.json()
      setTestResults(data)
    } catch (err) {
      toast({
        title: 'Test Error',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/icon-mappings/bulk?include_usage=true')
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `icon-mappings-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Export Successful',
        description: 'Icon mappings exported successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: 'Export Error',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const filteredMappings = mappings.filter(mapping => 
    !searchTerm || 
    mapping.source_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.target_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Icon Mapping Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto">
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Mappings</Tab>
              <Tab>Editor</Tab>
              <Tab>Test</Tab>
              <Tab>Export</Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Mapping List */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Input
                      placeholder="Search mappings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={() => setActiveTab(1)}
                    >
                      Add Mapping
                    </Button>
                  </HStack>

                  {loading ? (
                    <Box textAlign="center" py={8}>
                      <Spinner size="lg" />
                    </Box>
                  ) : error ? (
                    <Alert status="error">
                      <AlertIcon />
                      {error}
                    </Alert>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Source Type</Th>
                            <Th>Target Type</Th>
                            <Th>Priority</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredMappings.map((mapping) => (
                            <Tr key={mapping.id}>
                              <Td><Code>{mapping.source_type}</Code></Td>
                              <Td><Code>{mapping.target_type}</Code></Td>
                              <Td>{mapping.priority}</Td>
                              <Td>
                                <Badge colorScheme={mapping.is_active ? 'green' : 'red'}>
                                  {mapping.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack>
                                  <IconButton
                                    aria-label="Edit mapping"
                                    icon={<EditIcon />}
                                    size="sm"
                                    onClick={() => {
                                      setEditingMapping(mapping)
                                      setFormData({
                                        source_type: mapping.source_type,
                                        target_type: mapping.target_type,
                                        description: mapping.description || '',
                                        priority: mapping.priority,
                                        is_active: mapping.is_active
                                      })
                                      setActiveTab(1)
                                    }}
                                  />
                                  <IconButton
                                    aria-label="Delete mapping"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleDeleteMapping(mapping.id)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 2: Editor */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">
                    {editingMapping ? 'Edit Mapping' : 'Create New Mapping'}
                  </Text>

                  <FormControl isRequired>
                    <FormLabel>Source Type</FormLabel>
                    <Input
                      value={formData.source_type}
                      onChange={(e) => setFormData({...formData, source_type: e.target.value})}
                      placeholder="e.g., threatactor, workstation"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Target Type</FormLabel>
                    <Input
                      value={formData.target_type}
                      onChange={(e) => setFormData({...formData, target_type: e.target.value})}
                      placeholder="e.g., actor, client"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Optional description"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <NumberInput
                      value={formData.priority}
                      onChange={(_, value) => setFormData({...formData, priority: value || 1})}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Active</FormLabel>
                    <Switch
                      isChecked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                  </FormControl>

                  <HStack>
                    <Button
                      colorScheme="blue"
                      onClick={handleSaveMapping}
                      isLoading={loading}
                    >
                      {editingMapping ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingMapping(null)
                        setFormData({
                          source_type: '',
                          target_type: '',
                          description: '',
                          priority: 1,
                          is_active: true
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>

              {/* Tab 3: Test */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">Test Icon Resolution</Text>

                  <FormControl isRequired>
                    <FormLabel>Source Type</FormLabel>
                    <Input
                      value={testSourceType}
                      onChange={(e) => setTestSourceType(e.target.value)}
                      placeholder="e.g., threatactor"
                    />
                  </FormControl>

                  <Button
                    colorScheme="blue"
                    onClick={handleTestMapping}
                    isLoading={testLoading}
                    leftIcon={<CheckIcon />}
                  >
                    Test Resolution
                  </Button>

                  {testResults && (
                    <Box>
                      <Text fontSize="md" fontWeight="bold" mb={2}>Test Results</Text>
                      <Box bg="gray.50" p={4} borderRadius="md">
                        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(testResults, null, 2)}
                        </pre>
                      </Box>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab 4: Export */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">Export & Import</Text>
                  
                  <Button 
                    leftIcon={<DownloadIcon />} 
                    onClick={handleExport}
                    colorScheme="green"
                  >
                    Export All Mappings
                  </Button>

                  <Text fontSize="sm" color="gray.600">
                    Export includes all mappings, usage statistics, and validation data in JSON format.
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
