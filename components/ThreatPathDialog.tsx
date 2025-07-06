import React, { useState, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Badge,
  Box,
  Divider,
  useToast,
  useColorModeValue
} from '@chakra-ui/react'
import { addThreatPath, validateThreatPath } from '../utils/threatPathUtils'

interface ThreatPathDialogProps {
  isOpen: boolean
  onClose: () => void
  onThreatPathCreated: (threatPathData: {
    threatPathName: string
    startNodeUid: string
    endNodeUid: string
    alarmLevel: string
    animation: string
    pathNodes: string[]
    pathEdges: Array<{ from: string; to: string }>
  }) => void
}

interface AvailableNode {
  uid: string
  showname: string
  type: string
}

interface PathCalculationResult {
  nodes: Array<{
    uid: string
    type: string
    showname: string
    properties: Record<string, any>
  }>
  edges: Array<{
    from: string
    to: string
    type: string
    properties: Record<string, any>
  }>
  pathLength: number
  pathExists: boolean
}

const ThreatPathDialog: React.FC<ThreatPathDialogProps> = ({
  isOpen,
  onClose,
  onThreatPathCreated
}) => {
  const [availableNodes, setAvailableNodes] = useState<AvailableNode[]>([])
  const [startNodeUid, setStartNodeUid] = useState('')
  const [endNodeUid, setEndNodeUid] = useState('')
  const [threatPathName, setThreatPathName] = useState('')
  const [alarmLevel, setAlarmLevel] = useState('Warning')
  const [animation, setAnimation] = useState('pulse')
  const [isLoadingNodes, setIsLoadingNodes] = useState(false)
  const [isCalculatingPath, setIsCalculatingPath] = useState(false)
  const [calculatedPath, setCalculatedPath] = useState<PathCalculationResult | null>(null)
  const [pathError, setPathError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const loadAvailableNodes = useCallback(async () => {
    setIsLoadingNodes(true)
    try {
      const response = await fetch('/api/threat-paths/nodes')
      const result = await response.json()

      if (result.success) {
        setAvailableNodes(result.data)
      } else {
        throw new Error(result.error || 'Failed to load nodes')
      }
    } catch (error) {
      console.error('Error loading nodes:', error)
      toast({
        title: 'Error Loading Nodes',
        description: 'Failed to load available nodes for threat path creation',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setIsLoadingNodes(false)
    }
  }, [toast])

  // Load available nodes when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableNodes()
      // Reset form
      setStartNodeUid('')
      setEndNodeUid('')
      setThreatPathName('')
      setAlarmLevel('Warning')
      setAnimation('pulse')
      setCalculatedPath(null)
      setPathError(null)
      setNameError(null)
    }
  }, [isOpen, loadAvailableNodes])

  const calculatePath = async () => {
    if (!startNodeUid || !endNodeUid) {
      setPathError('Please select both start and end nodes')
      return
    }

    if (startNodeUid === endNodeUid) {
      setPathError('Start and end nodes cannot be the same')
      return
    }

    setIsCalculatingPath(true)
    setPathError(null)
    setCalculatedPath(null)

    try {
      const response = await fetch('/api/threat-paths/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startNodeUid,
          endNodeUid
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setCalculatedPath(result.data)
        if (!result.data.pathExists) {
          setPathError('No path exists between the selected nodes')
        }
      } else {
        throw new Error(result.error || 'Failed to calculate path')
      }
    } catch (error) {
      console.error('Error calculating path:', error)
      setPathError('Failed to calculate path between nodes')
    } finally {
      setIsCalculatingPath(false)
    }
  }

  const validateForm = (): boolean => {
    // Validate threat path name
    const nameValidation = validateThreatPath(threatPathName)
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || 'Invalid threat path name')
      return false
    }
    setNameError(null)

    // Check if path is calculated and valid
    if (!calculatedPath || !calculatedPath.pathExists) {
      setPathError('Please calculate a valid path first')
      return false
    }

    return true
  }

  const handleCreateThreatPath = () => {
    if (!validateForm()) {
      return
    }

    if (!calculatedPath) {
      return
    }

    // Extract node UIDs and edge data from calculated path
    const pathNodes = calculatedPath.nodes.map(node => node.uid)
    const pathEdges = calculatedPath.edges.map(edge => ({
      from: edge.from,
      to: edge.to
    }))

    onThreatPathCreated({
      threatPathName,
      startNodeUid,
      endNodeUid,
      alarmLevel,
      animation,
      pathNodes,
      pathEdges
    })

    onClose()
  }

  const getNodeDisplayName = (uid: string): string => {
    const node = availableNodes.find(n => n.uid === uid)
    return node ? `${node.showname} (${node.type})` : uid
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Create Threat Path</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Threat Path Name */}
            <FormControl isInvalid={!!nameError}>
              <FormLabel>Threat Path Name</FormLabel>
              <Input
                value={threatPathName}
                onChange={(e) => setThreatPathName(e.target.value)}
                placeholder="e.g., THREAT-malware-to-internet"
              />
              {nameError && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {nameError}
                </Text>
              )}
            </FormControl>

            <Divider />

            {/* Node Selection */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="md" fontWeight="semibold">Path Configuration</Text>
              
              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel>Start Node</FormLabel>
                  <Select
                    value={startNodeUid}
                    onChange={(e) => setStartNodeUid(e.target.value)}
                    placeholder="Select start node..."
                    isDisabled={isLoadingNodes}
                  >
                    {availableNodes.map(node => (
                      <option key={node.uid} value={node.uid}>
                        {node.showname} ({node.type})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Destination Node</FormLabel>
                  <Select
                    value={endNodeUid}
                    onChange={(e) => setEndNodeUid(e.target.value)}
                    placeholder="Select destination node..."
                    isDisabled={isLoadingNodes}
                  >
                    {availableNodes.map(node => (
                      <option key={node.uid} value={node.uid}>
                        {node.showname} ({node.type})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <Button
                onClick={calculatePath}
                isLoading={isCalculatingPath}
                loadingText="Calculating..."
                isDisabled={!startNodeUid || !endNodeUid || isLoadingNodes}
                colorScheme="blue"
                size="sm"
              >
                Calculate Shortest Path
              </Button>

              {/* Path Calculation Results */}
              {pathError && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>{pathError}</AlertDescription>
                </Alert>
              )}

              {calculatedPath && calculatedPath.pathExists && (
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Path Found!</AlertTitle>
                    <AlertDescription>
                      Path length: {calculatedPath.pathLength} hops, 
                      {calculatedPath.nodes.length} nodes, 
                      {calculatedPath.edges.length} edges
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>

            <Divider />

            {/* Threat Properties */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="md" fontWeight="semibold">Threat Properties</Text>
              
              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel>Alarm Level</FormLabel>
                  <Select
                    value={alarmLevel}
                    onChange={(e) => setAlarmLevel(e.target.value)}
                  >
                    <option value="Alert">Alert</option>
                    <option value="Warning">Warning</option>
                    <option value="Success">Success</option>
                    <option value="Info">Info</option>
                    <option value="None">None</option>
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Animation</FormLabel>
                  <Select
                    value={animation}
                    onChange={(e) => setAnimation(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="pulse">Pulse</option>
                    <option value="glow">Glow</option>
                    <option value="flash">Flash</option>
                    <option value="strobe">Strobe</option>
                    <option value="flow">Flow</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>

            {/* Loading State */}
            {isLoadingNodes && (
              <HStack justify="center" py={4}>
                <Spinner size="sm" />
                <Text>Loading available nodes...</Text>
              </HStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleCreateThreatPath}
            isDisabled={
              !threatPathName || 
              !calculatedPath || 
              !calculatedPath.pathExists || 
              isCalculatingPath ||
              isLoadingNodes
            }
          >
            Create Threat Path
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ThreatPathDialog
