import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Spinner,
  Progress,
  Textarea,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { AttachmentIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons'
import { validateJSONDataset, DatasetValidationResult } from '../lib/jsonValidator'
import JSONErrorDisplay from './JSONErrorDisplay'

interface FileUploadProps {
  onUploadSuccess: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<DatasetValidationResult | null>(null)
  const [jsonContent, setJsonContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<string>('')
  const toast = useToast()

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const validateAndProcessJSON = useCallback((content: string) => {
    const validation = validateJSONDataset(content)
    setValidationResult(validation)
    setJsonContent(content)

    if (!validation.isValid) {
      setError('JSON validation failed. Please fix the errors below.')
      return false
    }

    setError(null)
    return true
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file')
      setValidationResult(null)
      return
    }

    setUploading(true)
    setError(null)
    setValidationResult(null)

    try {
      const text = await file.text()

      // Validate JSON before attempting upload
      if (!validateAndProcessJSON(text)) {
        setUploading(false)
        return
      }

      const data = JSON.parse(text)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Upload Successful',
        description: `Imported ${result.nodes} nodes and ${result.edges} edges`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Clear validation state on success
      setValidationResult(null)
      setJsonContent('')
      onUploadSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess, toast, validateAndProcessJSON])

  const handleEditJSON = useCallback(() => {
    setEditedContent(jsonContent)
    setIsEditing(true)
  }, [jsonContent])

  const handleSaveEdit = useCallback(() => {
    if (validateAndProcessJSON(editedContent)) {
      setJsonContent(editedContent)
      setIsEditing(false)
    }
  }, [editedContent, validateAndProcessJSON])

  const handleCancelEdit = useCallback(() => {
    setEditedContent('')
    setIsEditing(false)
  }, [])

  const handleRetryUpload = useCallback(async () => {
    if (!jsonContent || !validationResult?.isValid) return

    setUploading(true)
    setError(null)

    try {
      const data = JSON.parse(jsonContent)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Upload Successful',
        description: `Imported ${result.nodes} nodes and ${result.edges} edges`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Clear validation state on success
      setValidationResult(null)
      setJsonContent('')
      onUploadSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
    }
  }, [jsonContent, validationResult, onUploadSuccess, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false,
    disabled: uploading || isEditing
  })

  return (
    <Box>
      <VStack spacing={4}>
        {/* File Upload Area */}
        {!validationResult && (
          <Box
            {...getRootProps()}
            p={6}
            border="2px dashed"
            borderColor={isDragActive ? 'visium.400' : 'gray.300'}
            borderRadius="lg"
            bg={isDragActive ? 'visium.50' : 'white'}
            cursor={uploading || isEditing ? 'not-allowed' : 'pointer'}
            transition="all 0.2s"
            _hover={{
              borderColor: uploading || isEditing ? 'gray.300' : 'visium.400',
              bg: uploading || isEditing ? 'white' : 'visium.50'
            }}
            textAlign="center"
            minW="300px"
          >
            <input {...getInputProps()} />
            <VStack spacing={2}>
              <AttachmentIcon boxSize={6} color={uploading ? 'gray.400' : 'visium.500'} />
              {uploading ? (
                <>
                  <Spinner color="visium.500" size="sm" />
                  <Text color="gray.600" fontSize="sm">
                    Uploading and processing...
                  </Text>
                  <Progress size="sm" isIndeterminate colorScheme="blue" width="150px" />
                </>
              ) : (
                <>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    {isDragActive
                      ? 'Drop your JSON file here'
                      : 'Drag & drop JSON file here'
                    }
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    or click to select a file
                  </Text>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    disabled={uploading || isEditing}
                  >
                    Choose File
                  </Button>
                </>
              )}
            </VStack>
          </Box>
        )}

        {/* JSON Editor */}
        {isEditing && (
          <Box w="100%" maxW="600px">
            <VStack spacing={3}>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Edit JSON Content
                </Text>
                <HStack spacing={2}>
                  <Tooltip label="Save changes">
                    <IconButton
                      aria-label="Save changes"
                      icon={<CheckIcon />}
                      size="sm"
                      colorScheme="green"
                      onClick={handleSaveEdit}
                    />
                  </Tooltip>
                  <Tooltip label="Cancel editing">
                    <IconButton
                      aria-label="Cancel editing"
                      icon={<CloseIcon />}
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    />
                  </Tooltip>
                </HStack>
              </HStack>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Paste or edit your JSON content here..."
                rows={15}
                fontFamily="mono"
                fontSize="sm"
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
                resize="vertical"
              />
            </VStack>
          </Box>
        )}

        {/* Validation Results */}
        {validationResult && !isEditing && (
          <Box w="100%" maxW="600px">
            <VStack spacing={3}>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Validation Results
                </Text>
                <HStack spacing={2}>
                  {!validationResult.isValid && (
                    <Tooltip label="Edit JSON content">
                      <IconButton
                        aria-label="Edit JSON"
                        icon={<EditIcon />}
                        size="sm"
                        variant="outline"
                        onClick={handleEditJSON}
                      />
                    </Tooltip>
                  )}
                  {validationResult.isValid && (
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={handleRetryUpload}
                      isLoading={uploading}
                      loadingText="Uploading..."
                    >
                      Upload Dataset
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setValidationResult(null)
                      setJsonContent('')
                      setError(null)
                    }}
                  >
                    Upload New File
                  </Button>
                </HStack>
              </HStack>

              <JSONErrorDisplay
                validationResult={validationResult}
                jsonContent={jsonContent}
              />
            </VStack>
          </Box>
        )}

        {/* Simple Error Display for non-validation errors */}
        {error && !validationResult && (
          <Alert status="error" borderRadius="md" size="sm" maxW="600px">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Upload Error</AlertTitle>
              <AlertDescription fontSize="xs">{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Help Text */}
        {!validationResult && !isEditing && (
          <Text fontSize="xs" color="gray.500" textAlign="center" maxW="400px">
            Upload a JSON file containing nodes, edges, and stored queries to visualize your network topology.
          </Text>
        )}
      </VStack>
    </Box>
  )
}

export default FileUpload 