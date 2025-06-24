import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Code,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Tooltip
} from '@chakra-ui/react'
import { WarningIcon, InfoIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { JSONValidationError, DatasetValidationResult } from '../lib/jsonValidator'

interface JSONErrorDisplayProps {
  validationResult: DatasetValidationResult
  jsonContent?: string
}

const JSONErrorDisplay: React.FC<JSONErrorDisplayProps> = ({ 
  validationResult, 
  jsonContent 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const codeBackground = useColorModeValue('gray.50', 'gray.900')
  const errorLineColor = useColorModeValue('red.50', 'red.900')
  const warningLineColor = useColorModeValue('yellow.50', 'yellow.900')
  const suggestionBg = useColorModeValue('blue.50', 'blue.900')

  const { errors, warnings } = validationResult

  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  const renderErrorIcon = (error: JSONValidationError) => {
    switch (error.type) {
      case 'syntax':
        return <WarningIcon color="red.500" />
      case 'structure':
        return <InfoIcon color="orange.500" />
      case 'reference':
        return <ChevronRightIcon color="purple.500" />
      default:
        return <WarningIcon color="red.500" />
    }
  }

  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case 'syntax':
        return 'JSON Syntax'
      case 'structure':
        return 'Data Structure'
      case 'reference':
        return 'Reference Error'
      default:
        return 'Error'
    }
  }

  const renderErrorContext = (error: JSONValidationError) => {
    if (!error.context || !jsonContent) return null

    const lines = jsonContent.split('\n')
    const errorLine = error.line || 1
    const startLine = Math.max(1, errorLine - 2)
    const endLine = Math.min(lines.length, errorLine + 2)

    return (
      <Box
        mt={3}
        p={3}
        bg={codeBackground}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
        fontSize="sm"
        fontFamily="mono"
      >
        <Text fontSize="xs" color="gray.500" mb={2}>
          Context around line {errorLine}:
        </Text>
        <VStack spacing={1} align="stretch">
          {Array.from({ length: endLine - startLine + 1 }, (_, i) => {
            const lineNum = startLine + i
            const lineContent = lines[lineNum - 1] || ''
            const isErrorLine = lineNum === errorLine
            
            return (
              <HStack
                key={lineNum}
                spacing={3}
                bg={isErrorLine ? errorLineColor : 'transparent'}
                px={2}
                py={1}
                borderRadius="sm"
              >
                <Text
                  color={isErrorLine ? 'red.600' : 'gray.500'}
                  fontWeight={isErrorLine ? 'bold' : 'normal'}
                  minW="30px"
                  textAlign="right"
                >
                  {lineNum}
                </Text>
                <Text
                  color={isErrorLine ? 'red.700' : 'gray.700'}
                  fontWeight={isErrorLine ? 'medium' : 'normal'}
                  whiteSpace="pre"
                  overflow="hidden"
                >
                  {isErrorLine && '>>> '}
                  {lineContent}
                </Text>
              </HStack>
            )
          })}
        </VStack>
        {error.column && (
          <HStack mt={2} spacing={2}>
            <Text fontSize="xs" color="gray.500">
              Error at column {error.column}
            </Text>
            {error.position && (
              <Text fontSize="xs" color="gray.500">
                (position {error.position})
              </Text>
            )}
          </HStack>
        )}
      </Box>
    )
  }

  const renderSuggestion = (suggestion: string) => (
    <Box
      mt={2}
      p={3}
      bg={suggestionBg}
      borderLeft="4px solid"
      borderLeftColor="blue.400"
      borderRadius="md"
    >
      <HStack spacing={2}>
        <Icon as={InfoIcon} color="blue.500" boxSize={4} />
        <Text fontSize="sm" color="blue.700" fontWeight="medium">
          How to fix:
        </Text>
      </HStack>
      <Text fontSize="sm" color="blue.600" mt={1}>
        {suggestion}
      </Text>
    </Box>
  )

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Summary */}
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">
              JSON Validation Failed
            </AlertTitle>
            <AlertDescription fontSize="xs">
              Found {errors.length} error{errors.length !== 1 ? 's' : ''} 
              {warnings.length > 0 && ` and ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`}
              {' '}in your JSON file. Please fix these issues before uploading.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Errors */}
        {errors.length > 0 && (
          <Box>
            <Text fontSize="md" fontWeight="bold" color="red.600" mb={3}>
              Errors ({errors.length})
            </Text>
            <Accordion allowMultiple defaultIndex={[0]}>
              {errors.map((error, index) => (
                <AccordionItem key={index} border="1px solid" borderColor="red.200">
                  <AccordionButton bg="red.50" _hover={{ bg: 'red.100' }}>
                    <Box flex="1" textAlign="left">
                      <HStack spacing={3}>
                        {renderErrorIcon(error)}
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Badge colorScheme="red" size="sm">
                              {getErrorTypeLabel(error.type)}
                            </Badge>
                            {error.line && (
                              <Badge variant="outline" size="sm">
                                Line {error.line}
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" fontWeight="medium">
                            {error.message}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    {error.suggestion && renderSuggestion(error.suggestion)}
                    {renderErrorContext(error)}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <Box>
            <Text fontSize="md" fontWeight="bold" color="orange.600" mb={3}>
              Warnings ({warnings.length})
            </Text>
            <Accordion allowMultiple>
              {warnings.map((warning, index) => (
                <AccordionItem key={index} border="1px solid" borderColor="orange.200">
                  <AccordionButton bg="orange.50" _hover={{ bg: 'orange.100' }}>
                    <Box flex="1" textAlign="left">
                      <HStack spacing={3}>
                        <WarningIcon color="orange.500" />
                        <VStack align="start" spacing={1}>
                          <Badge colorScheme="orange" size="sm">
                            {getErrorTypeLabel(warning.type)}
                          </Badge>
                          <Text fontSize="sm" fontWeight="medium">
                            {warning.message}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    {warning.suggestion && renderSuggestion(warning.suggestion)}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        )}

        {/* Dataset Summary */}
        {validationResult.nodeCount !== undefined && validationResult.edgeCount !== undefined && (
          <Box>
            <Divider />
            <HStack spacing={4} mt={3}>
              <Badge colorScheme="blue">
                {validationResult.nodeCount} nodes
              </Badge>
              <Badge colorScheme="green">
                {validationResult.edgeCount} edges
              </Badge>
              {validationResult.missingReferences && validationResult.missingReferences.length > 0 && (
                <Tooltip label={`Missing: ${validationResult.missingReferences.join(', ')}`}>
                  <Badge colorScheme="red">
                    {validationResult.missingReferences.length} missing references
                  </Badge>
                </Tooltip>
              )}
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default JSONErrorDisplay
