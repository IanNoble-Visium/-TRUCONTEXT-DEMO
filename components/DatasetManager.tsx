import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue
} from '@chakra-ui/react'
import { DeleteIcon, DownloadIcon, AddIcon, TimeIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface Dataset {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  node_count: number
  edge_count: number
}

interface DatasetManagerProps {
  onDatasetLoaded: () => void
  currentGraphData?: { nodes: any[], edges: any[] }
}

const DatasetManager: React.FC<DatasetManagerProps> = ({ onDatasetLoaded, currentGraphData }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingDataset, setLoadingDataset] = useState<number | null>(null)
  const [deletingDataset, setDeletingDataset] = useState<number | null>(null)
  const [saveForm, setSaveForm] = useState({ name: '', description: '' })
  const [saveErrors, setSaveErrors] = useState<{ name?: string }>({})
  
  const { isOpen: isSaveOpen, onOpen: onSaveOpen, onClose: onSaveClose } = useDisclosure()
  const toast = useToast()
  
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  const loadDatasets = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/datasets')
      if (!response.ok) {
        throw new Error('Failed to load datasets')
      }
      const data = await response.json()
      setDatasets(data)
    } catch (error) {
      console.error('Error loading datasets:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved datasets',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load datasets on component mount
  useEffect(() => {
    loadDatasets()
  }, [loadDatasets])

  const saveCurrentDataset = async () => {
    if (!currentGraphData || !currentGraphData.nodes.length) {
      toast({
        title: 'No Data',
        description: 'Please load a dataset first before saving',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    // Validate form
    const errors: { name?: string } = {}
    if (!saveForm.name.trim()) {
      errors.name = 'Dataset name is required'
    }
    setSaveErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: saveForm.name.trim(),
          description: saveForm.description.trim() || undefined,
          nodes: currentGraphData.nodes,
          edges: currentGraphData.edges
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save dataset')
      }

      // Store current dataset name in localStorage for property persistence
      localStorage.setItem('currentDatasetName', saveForm.name.trim())

      toast({
        title: 'Success',
        description: `Dataset "${saveForm.name}" saved successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Reset form and close modal
      setSaveForm({ name: '', description: '' })
      setSaveErrors({})
      onSaveClose()

      // Reload datasets list
      loadDatasets()
    } catch (error) {
      console.error('Error saving dataset:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save dataset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const loadDataset = async (datasetId: number) => {
    setLoadingDataset(datasetId)
    try {
      const response = await fetch(`/api/datasets/load/${datasetId}`, {
        method: 'POST'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load dataset')
      }

      // Store current dataset name in localStorage for property persistence
      if (result.currentDatasetName) {
        localStorage.setItem('currentDatasetName', result.currentDatasetName)
      }

      toast({
        title: 'Success',
        description: `Dataset "${result.dataset.name}" loaded successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      onDatasetLoaded()
    } catch (error) {
      console.error('Error loading dataset:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load dataset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingDataset(null)
    }
  }

  const deleteDataset = async (datasetId: number, datasetName: string) => {
    if (!confirm(`Are you sure you want to delete "${datasetName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingDataset(datasetId)
    try {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete dataset')
      }

      toast({
        title: 'Success',
        description: `Dataset "${datasetName}" deleted successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Reload datasets list
      loadDatasets()
    } catch (error) {
      console.error('Error deleting dataset:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete dataset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setDeletingDataset(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Save Current Dataset Button */}
      <Button
        leftIcon={<AddIcon />}
        colorScheme="green"
        onClick={onSaveOpen}
        isDisabled={!currentGraphData || !currentGraphData.nodes.length}
      >
        Save Current Dataset
      </Button>

      <Divider />

      {/* Saved Datasets List */}
      <Box>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="bold">
            Saved Datasets
          </Text>
          <Button size="sm" variant="outline" onClick={loadDatasets} isLoading={loading}>
            Refresh
          </Button>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" />
            <Text mt={2} color="gray.500">Loading datasets...</Text>
          </Box>
        ) : datasets.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No saved datasets found. Save your current dataset to get started.
          </Alert>
        ) : (
          <VStack spacing={3} align="stretch">
            {datasets.map((dataset) => (
              <MotionBox
                key={dataset.id}
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                bg={bgColor}
                _hover={{ bg: hoverBg }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {dataset.name}
                      </Text>
                      {dataset.description && (
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {dataset.description}
                        </Text>
                      )}
                    </VStack>
                    <HStack spacing={2}>
                      <Tooltip label="Load Dataset">
                        <IconButton
                          icon={loadingDataset === dataset.id ? <Spinner size="sm" /> : <DownloadIcon />}
                          aria-label="Load dataset"
                          size="sm"
                          colorScheme="blue"
                          onClick={() => loadDataset(dataset.id)}
                          isLoading={loadingDataset === dataset.id}
                        />
                      </Tooltip>
                      <Tooltip label="Delete Dataset">
                        <IconButton
                          icon={deletingDataset === dataset.id ? <Spinner size="sm" /> : <DeleteIcon />}
                          aria-label="Delete dataset"
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => deleteDataset(dataset.id, dataset.name)}
                          isLoading={deletingDataset === dataset.id}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                  
                  <HStack spacing={4} fontSize="sm" color="gray.500">
                    <HStack spacing={1}>
                      <Badge colorScheme="blue" variant="subtle">
                        {dataset.node_count} nodes
                      </Badge>
                      <Badge colorScheme="green" variant="subtle">
                        {dataset.edge_count} edges
                      </Badge>
                    </HStack>
                    <HStack spacing={1}>
                      <TimeIcon boxSize={3} />
                      <Text>{formatDate(dataset.updated_at)}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </MotionBox>
            ))}
          </VStack>
        )}
      </Box>

      {/* Save Dataset Modal */}
      <Modal isOpen={isSaveOpen} onClose={onSaveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Current Dataset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!saveErrors.name}>
                <FormLabel>Dataset Name</FormLabel>
                <Input
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  placeholder="Enter a unique name for this dataset"
                />
                <FormErrorMessage>{saveErrors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                  placeholder="Describe this dataset..."
                  rows={3}
                />
              </FormControl>

              {currentGraphData && (
                <Alert status="info" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    This will save {currentGraphData.nodes.length} nodes and {currentGraphData.edges.length} edges.
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSaveClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={saveCurrentDataset}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Dataset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default DatasetManager
