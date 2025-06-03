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
  Progress
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { AttachmentIcon } from '@chakra-ui/icons'

interface FileUploadProps {
  onUploadSuccess: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const text = await file.text()
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
  }, [onUploadSuccess, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false,
    disabled: uploading
  })

  return (
    <Box>
      <VStack spacing={3}>
        <Box
          {...getRootProps()}
          p={6}
          border="2px dashed"
          borderColor={isDragActive ? 'visium.400' : 'gray.300'}
          borderRadius="lg"
          bg={isDragActive ? 'visium.50' : 'white'}
          cursor={uploading ? 'not-allowed' : 'pointer'}
          transition="all 0.2s"
          _hover={{
            borderColor: uploading ? 'gray.300' : 'visium.400',
            bg: uploading ? 'white' : 'visium.50'
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
                  disabled={uploading}
                >
                  Choose File
                </Button>
              </>
            )}
          </VStack>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md" size="sm">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Upload Error</AlertTitle>
              <AlertDescription fontSize="xs">{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        <Text fontSize="xs" color="gray.500" textAlign="center" maxW="300px">
          Upload a JSON file containing nodes, edges, and stored queries.
        </Text>
      </VStack>
    </Box>
  )
}

export default FileUpload 