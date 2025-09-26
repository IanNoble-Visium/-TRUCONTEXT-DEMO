import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Select,
  Input,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  Heading,
  List,
  ListItem,
  ListIcon,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, DeleteIcon, CheckCircleIcon, ViewIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { REGIONS, getRegionById, getRandomCityFromRegion } from '../lib/regions'

const MotionBox = motion(Box)

interface Node {
  uid: string
  type: string
  showname: string
  properties: Record<string, any>
}

interface DeviceGroup {
  id: string
  name: string
  nodeUids: string[]
  regionId?: string
}

interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<StepProps>
}

interface StepProps {
  nodes: Node[]
  groups: DeviceGroup[]
  setGroups: (groups: DeviceGroup[]) => void
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

interface GeoCoordinateWizardProps {
  isOpen: boolean
  onClose: () => void
  nodes: Node[]
  onApplyCoordinates?: (nodeUpdates: Array<{ uid: string; latitude: number; longitude: number }>) => Promise<void>
}

// Step 1: Introduction
const IntroductionStep: React.FC<StepProps> = ({ onNext, isFirstStep, isLastStep }) => (
  <VStack spacing={6} align="stretch">
    <Box textAlign="center">
      <IconButton
        icon={<ViewIcon />}
        size="lg"
        colorScheme="blue"
        isRound
        aria-label="Geographic coordinates"
        mb={4}
      />
      <Heading size="lg" mb={2}>Geographic Coordinate Assignment</Heading>
      <Text color="gray.600">
        Assign geographical coordinates to your devices for map visualization.
        This wizard will guide you through grouping devices and assigning them to regions.
      </Text>
    </Box>

    <Alert status="info">
      <AlertIcon />
      <Box>
        <Text fontWeight="bold">What this wizard does:</Text>
        <List spacing={1} mt={2}>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            Groups devices by category or selection
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            Assigns groups to geographical regions
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            Assigns coordinates from major cities in each region
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            Updates both the current dataset and database
          </ListItem>
        </List>
      </Box>
    </Alert>

    <Box>
      <Button colorScheme="blue" onClick={onNext} width="full" size="lg">
        Get Started
      </Button>
    </Box>
  </VStack>
)

// Step 2: Group Creation
const GroupCreationStep: React.FC<StepProps> = ({
  nodes,
  groups,
  setGroups,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep
}) => {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [newGroupName, setNewGroupName] = useState('')

  const availableNodes = nodes.filter(node => !groups.some(group => group.nodeUids.includes(node.uid)))

  const createGroup = () => {
    if (!newGroupName.trim() || selectedNodes.size === 0) return

    const newGroup: DeviceGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      nodeUids: Array.from(selectedNodes)
    }

    setGroups([...groups, newGroup])
    setSelectedNodes(new Set())
    setNewGroupName('')
  }

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
  }

  const canProceed = groups.length > 0 && groups.every(g => g.nodeUids.length > 0)

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={2}>Create Device Groups</Heading>
        <Text color="gray.600">
          Group your devices by category, location, or any other criteria. Each group will be assigned to a geographical region.
        </Text>
      </Box>

      {/* Create New Group */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Input
                placeholder="Group name (e.g., 'US Servers', 'EU Databases')"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                flex={1}
              />
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={createGroup}
                isDisabled={!newGroupName.trim() || selectedNodes.size === 0}
              >
                Create Group
              </Button>
            </HStack>

            {availableNodes.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Select devices for this group:</Text>
                <Wrap spacing={2}>
                  {availableNodes.map(node => (
                    <WrapItem key={node.uid}>
                      <Tag
                        size="md"
                        variant={selectedNodes.has(node.uid) ? "solid" : "outline"}
                        colorScheme={selectedNodes.has(node.uid) ? "blue" : "gray"}
                        cursor="pointer"
                        onClick={() => {
                          const newSelected = new Set(selectedNodes)
                          if (newSelected.has(node.uid)) {
                            newSelected.delete(node.uid)
                          } else {
                            newSelected.add(node.uid)
                          }
                          setSelectedNodes(newSelected)
                        }}
                      >
                        <TagLabel>{node.showname} ({node.type})</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Existing Groups */}
      {groups.length > 0 && (
        <Box>
          <Text fontWeight="bold" mb={3}>Created Groups:</Text>
          <VStack spacing={3} align="stretch">
            {groups.map(group => (
              <Card key={group.id}>
                <CardBody>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="bold">{group.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {group.nodeUids.length} devices: {group.nodeUids.map(uid => {
                          const node = nodes.find(n => n.uid === uid)
                          return node?.showname || uid
                        }).join(', ')}
                      </Text>
                    </Box>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Remove group"
                      onClick={() => removeGroup(group.id)}
                    />
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </Box>
      )}

      {!canProceed && (
        <Alert status="warning">
          <AlertIcon />
          Create at least one group with devices to continue.
        </Alert>
      )}
    </VStack>
  )
}

// Step 3: Region Assignment
const RegionAssignmentStep: React.FC<StepProps> = ({
  groups,
  setGroups,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep
}) => {
  const assignRegion = (groupId: string, regionId: string) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, regionId }
        : group
    ))
  }

  const canProceed = groups.every(g => g.regionId)

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={2}>Assign Regions to Groups</Heading>
        <Text color="gray.600">
          Assign each device group to a geographical region. Devices in each group will be assigned coordinates from major cities in the selected region.
        </Text>
      </Box>

      <VStack spacing={4} align="stretch">
        {groups.map(group => (
          <Card key={group.id}>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{group.name}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {group.nodeUids.length} devices
                    </Text>
                  </Box>
                  {group.regionId && (
                    <Badge colorScheme="green">
                      {getRegionById(group.regionId)?.name}
                    </Badge>
                  )}
                </HStack>

                <Select
                  placeholder="Select a region"
                  value={group.regionId || ''}
                  onChange={(e) => assignRegion(group.id, e.target.value)}
                >
                  {REGIONS.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name} ({region.cities.length} cities)
                    </option>
                  ))}
                </Select>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {!canProceed && (
        <Alert status="warning">
          <AlertIcon />
          Assign a region to each group to continue.
        </Alert>
      )}
    </VStack>
  )
}

// Step 4: Review and Confirm
const ReviewStep: React.FC<StepProps> = ({
  nodes,
  groups,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep
}) => {
  const assignments = groups.flatMap(group => {
    const region = getRegionById(group.regionId!)
    if (!region) return []

    return group.nodeUids.map((uid, index) => {
      const node = nodes.find(n => n.uid === uid)
      const city = region.cities[index % region.cities.length]
      return {
        node: node!,
        region: region,
        city: city
      }
    })
  })

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={2}>Review Assignments</Heading>
        <Text color="gray.600">
          Review the coordinate assignments before applying them to your dataset.
        </Text>
      </Box>

      <VStack spacing={4} align="stretch">
        {groups.map(group => {
          const region = getRegionById(group.regionId!)
          return (
            <Card key={group.id}>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{group.name}</Text>
                    <Badge colorScheme="blue">{region?.name}</Badge>
                  </HStack>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Device Assignments:</Text>
                    <VStack spacing={1} align="stretch">
                      {group.nodeUids.map((uid, index) => {
                        const node = nodes.find(n => n.uid === uid)
                        const city = region?.cities[index % (region?.cities.length || 1)]
                        return (
                          <HStack key={uid} justify="space-between">
                            <Text fontSize="sm">{node?.showname} ({node?.type})</Text>
                            <Text fontSize="sm" color="gray.600">
                              → {city?.name} ({city?.latitude.toFixed(4)}, {city?.longitude.toFixed(4)})
                            </Text>
                          </HStack>
                        )
                      })}
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )
        })}
      </VStack>

      <Alert status="info">
        <AlertIcon />
        <Text>
          Clicking &ldquo;Apply Coordinates&rdquo; will update {assignments.length} devices with geographical coordinates
          and save the changes to both the current dataset and database.
        </Text>
      </Alert>
    </VStack>
  )
}

const STEPS: WizardStep[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Learn about coordinate assignment',
    component: IntroductionStep
  },
  {
    id: 'groups',
    title: 'Create Groups',
    description: 'Group your devices by category',
    component: GroupCreationStep
  },
  {
    id: 'regions',
    title: 'Assign Regions',
    description: 'Assign groups to geographical regions',
    component: RegionAssignmentStep
  },
  {
    id: 'review',
    title: 'Review & Confirm',
    description: 'Review assignments before applying',
    component: ReviewStep
  }
]

const GeoCoordinateWizard: React.FC<GeoCoordinateWizardProps> = ({
  isOpen,
  onClose,
  nodes,
  onApplyCoordinates
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [groups, setGroups] = useState<DeviceGroup[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setGroups([])
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleApply = async () => {
    if (!onApplyCoordinates) {
      toast({
        title: 'Error',
        description: 'Coordinate update functionality not available',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsApplying(true)
    try {
      const assignments = groups.flatMap(group => {
        const region = getRegionById(group.regionId!)
        if (!region) return []

        return group.nodeUids.map((uid, index) => {
          const city = region.cities[index % region.cities.length]
          return {
            uid,
            latitude: city.latitude,
            longitude: city.longitude
          }
        })
      })

      await onApplyCoordinates(assignments)

      toast({
        title: 'Success',
        description: `Assigned coordinates to ${assignments.length} devices`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply coordinates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsApplying(false)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100
  const CurrentStepComponent = STEPS[currentStep].component
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={!isApplying}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack spacing={2} align="stretch">
            <Text>Geographic Coordinate Assignment Wizard</Text>
            <Progress value={progress} size="sm" colorScheme="blue" />
            <HStack spacing={4} justify="center">
              {STEPS.map((step, index) => (
                <VStack key={step.id} spacing={1} flex={1}>
                  <Badge
                    colorScheme={index <= currentStep ? "blue" : "gray"}
                    variant={index === currentStep ? "solid" : "outline"}
                  >
                    {index + 1}
                  </Badge>
                  <Text fontSize="xs" textAlign="center">{step.title}</Text>
                </VStack>
              ))}
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalBody>
          <MotionBox
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              nodes={nodes}
              groups={groups}
              setGroups={setGroups}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={currentStep === 0}
              isLastStep={isLastStep}
            />
          </MotionBox>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isApplying}>
              Cancel
            </Button>

            <Spacer />

            <Button
              leftIcon={<ChevronLeftIcon />}
              variant="outline"
              onClick={handlePrevious}
              isDisabled={currentStep === 0 || isApplying}
            >
              Previous
            </Button>

            {isLastStep ? (
              <Button
                colorScheme="green"
                onClick={handleApply}
                isLoading={isApplying}
                loadingText="Applying..."
              >
                Apply Coordinates
              </Button>
            ) : (
              <Button
                rightIcon={<ChevronRightIcon />}
                colorScheme="blue"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GeoCoordinateWizard