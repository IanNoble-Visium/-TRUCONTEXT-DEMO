import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Tooltip,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  Divider,
  Progress,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { 
  PlayIcon, 
  PauseIcon, 
  RepeatIcon, 
  ViewIcon,
  TimeIcon,
  WarningIcon
} from '@chakra-ui/icons'
import { ThreatPathScenario } from '../types/threatPath'

interface ThreatPathVisualizationProps {
  threatPaths: ThreatPathScenario[]
  nodes: any[]
  edges: any[]
  selectedPath: ThreatPathScenario | null
  onPathSelect: (path: ThreatPathScenario | null) => void
  onNodeHighlight: (nodeIds: string[]) => void
  onEdgeHighlight: (edgeIds: string[]) => void
}

interface AnimationState {
  isPlaying: boolean
  currentStep: number
  speed: number
  autoPlay: boolean
}

interface VisualizationSettings {
  showSeverityColors: boolean
  showRiskScores: boolean
  showTimeline: boolean
  highlightMode: 'path' | 'hops' | 'simultaneous'
  colorScheme: 'severity' | 'likelihood' | 'impact'
}

const ThreatPathVisualization: React.FC<ThreatPathVisualizationProps> = ({
  threatPaths,
  nodes,
  edges,
  selectedPath,
  onPathSelect,
  onNodeHighlight,
  onEdgeHighlight
}) => {
  const [animation, setAnimation] = useState<AnimationState>({
    isPlaying: false,
    currentStep: 0,
    speed: 1000, // milliseconds
    autoPlay: false
  })
  
  const [settings, setSettings] = useState<VisualizationSettings>({
    showSeverityColors: true,
    showRiskScores: true,
    showTimeline: true,
    highlightMode: 'hops',
    colorScheme: 'severity'
  })
  
  const [hoveredPath, setHoveredPath] = useState<ThreatPathScenario | null>(null)
  const [pathProgress, setPathProgress] = useState<{ [pathId: string]: number }>({})
  
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  // Animation control
  useEffect(() => {
    if (animation.isPlaying && selectedPath) {
      animationRef.current = setInterval(() => {
        setAnimation(prev => {
          const nextStep = prev.currentStep + 1
          if (nextStep >= selectedPath.pathDetails.length) {
            if (prev.autoPlay) {
              return { ...prev, currentStep: 0 }
            } else {
              return { ...prev, isPlaying: false, currentStep: 0 }
            }
          }
          return { ...prev, currentStep: nextStep }
        })
      }, animation.speed)
      
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current)
        }
      }
    }
  }, [animation.isPlaying, animation.speed, animation.autoPlay, selectedPath])
  
  // Update highlights based on current animation step
  useEffect(() => {
    if (selectedPath && animation.isPlaying) {
      const currentNodes = selectedPath.path.slice(0, animation.currentStep + 1)
      onNodeHighlight(currentNodes)
      
      // Highlight edges in the path
      const currentEdges: string[] = []
      for (let i = 0; i < animation.currentStep; i++) {
        const fromNode = selectedPath.path[i]
        const toNode = selectedPath.path[i + 1]
        if (fromNode && toNode) {
          currentEdges.push(`${fromNode}-${toNode}`)
        }
      }
      onEdgeHighlight(currentEdges)
    }
  }, [animation.currentStep, animation.isPlaying, selectedPath, onNodeHighlight, onEdgeHighlight])
  
  // Path highlighting for hover effects
  useEffect(() => {
    const pathToHighlight = hoveredPath || selectedPath
    if (pathToHighlight && !animation.isPlaying) {
      if (settings.highlightMode === 'path') {
        onNodeHighlight(pathToHighlight.path)
      } else if (settings.highlightMode === 'simultaneous') {
        onNodeHighlight(pathToHighlight.path)
        const pathEdges = pathToHighlight.path.slice(0, -1).map((nodeId, index) => 
          `${nodeId}-${pathToHighlight.path[index + 1]}`
        )
        onEdgeHighlight(pathEdges)
      }
    }
  }, [hoveredPath, selectedPath, settings.highlightMode, animation.isPlaying, onNodeHighlight, onEdgeHighlight])
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'red'
      case 'High': return 'orange'
      case 'Medium': return 'yellow'
      case 'Low': return 'green'
      default: return 'gray'
    }
  }
  
  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 0.8) return 'red'
    if (likelihood >= 0.6) return 'orange'
    if (likelihood >= 0.4) return 'yellow'
    return 'green'
  }
  
  const getImpactColor = (impact: number) => {
    if (impact >= 8) return 'red'
    if (impact >= 6) return 'orange'
    if (impact >= 4) return 'yellow'
    return 'green'
  }
  
  const getPathColor = (path: ThreatPathScenario) => {
    switch (settings.colorScheme) {
      case 'severity':
        return getSeverityColor(path.severity)
      case 'likelihood':
        return getLikelihoodColor(path.likelihood)
      case 'impact':
        return getImpactColor(path.impact)
      default:
        return 'blue'
    }
  }
  
  const handlePlayPause = () => {
    setAnimation(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }
  
  const handleReset = () => {
    setAnimation(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
  }
  
  const handleStepChange = (step: number) => {
    setAnimation(prev => ({ ...prev, currentStep: step, isPlaying: false }))
  }
  
  const handleSpeedChange = (speed: number) => {
    setAnimation(prev => ({ ...prev, speed: 2000 - speed })) // Invert for intuitive slider
  }
  
  const renderPathList = () => (
    <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
      {threatPaths.slice(0, 10).map((path, index) => (
        <Card
          key={path.id}
          size="sm"
          cursor="pointer"
          onClick={() => onPathSelect(path)}
          onMouseEnter={() => setHoveredPath(path)}
          onMouseLeave={() => setHoveredPath(null)}
          bg={selectedPath?.id === path.id ? getPathColor(path) + '.50' : bgColor}
          borderColor={selectedPath?.id === path.id ? getPathColor(path) + '.300' : borderColor}
          borderWidth={selectedPath?.id === path.id ? '2px' : '1px'}
          _hover={{ 
            shadow: 'md',
            borderColor: getPathColor(path) + '.400'
          }}
          transition="all 0.2s"
        >
          <CardBody p={3}>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Badge colorScheme={getPathColor(path)} size="sm">
                    {path.severity}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {path.path.length} hops
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {path.name}
                </Text>
                
                <HStack spacing={3} fontSize="xs" color="gray.500">
                  <HStack>
                    <TimeIcon />
                    <Text>{path.estimatedDwellTime}</Text>
                  </HStack>
                  <HStack>
                    <WarningIcon />
                    <Text>{path.detectionDifficulty}</Text>
                  </HStack>
                </HStack>
              </VStack>
              
              <VStack align="end" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color={getPathColor(path) + '.500'}>
                  {path.riskScore}
                </Text>
                <Progress 
                  value={path.likelihood * 100} 
                  size="sm" 
                  colorScheme={getPathColor(path)}
                  width="60px"
                />
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  )
  
  const renderAnimationControls = () => {
    if (!selectedPath) return null
    
    return (
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold">Path Animation</Text>
            
            <HStack spacing={4} width="100%">
              <IconButton
                icon={animation.isPlaying ? <PauseIcon /> : <PlayIcon />}
                onClick={handlePlayPause}
                colorScheme="blue"
                aria-label={animation.isPlaying ? 'Pause' : 'Play'}
              />
              
              <IconButton
                icon={<RepeatIcon />}
                onClick={handleReset}
                variant="outline"
                aria-label="Reset"
              />
              
              <Box flex={1}>
                <Text fontSize="sm" mb={1}>
                  Step: {animation.currentStep + 1} / {selectedPath.pathDetails.length}
                </Text>
                <Slider
                  value={animation.currentStep}
                  min={0}
                  max={selectedPath.pathDetails.length - 1}
                  onChange={handleStepChange}
                  colorScheme={getPathColor(selectedPath)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            </HStack>
            
            <HStack width="100%">
              <Text fontSize="sm">Speed:</Text>
              <Slider
                value={2000 - animation.speed}
                min={100}
                max={1900}
                onChange={handleSpeedChange}
                flex={1}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontSize="sm">Fast</Text>
            </HStack>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="auto-play" mb="0" fontSize="sm">
                Auto-repeat
              </FormLabel>
              <Switch
                id="auto-play"
                isChecked={animation.autoPlay}
                onChange={(e) => setAnimation(prev => ({ ...prev, autoPlay: e.target.checked }))}
              />
            </FormControl>
            
            {selectedPath && animation.currentStep < selectedPath.pathDetails.length && (
              <Box width="100%" p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Current Step: {selectedPath.pathDetails[animation.currentStep]?.action}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {selectedPath.pathDetails[animation.currentStep]?.nodeName}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {selectedPath.pathDetails[animation.currentStep]?.technique}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    )
  }
  
  const renderVisualizationSettings = () => (
    <Card>
      <CardBody>
        <VStack spacing={4}>
          <Text fontWeight="bold">Visualization Settings</Text>
          
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="severity-colors" mb="0" fontSize="sm">
              Show severity colors
            </FormLabel>
            <Switch
              id="severity-colors"
              isChecked={settings.showSeverityColors}
              onChange={(e) => setSettings(prev => ({ ...prev, showSeverityColors: e.target.checked }))}
            />
          </FormControl>
          
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="risk-scores" mb="0" fontSize="sm">
              Show risk scores
            </FormLabel>
            <Switch
              id="risk-scores"
              isChecked={settings.showRiskScores}
              onChange={(e) => setSettings(prev => ({ ...prev, showRiskScores: e.target.checked }))}
            />
          </FormControl>
          
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="timeline" mb="0" fontSize="sm">
              Show timeline
            </FormLabel>
            <Switch
              id="timeline"
              isChecked={settings.showTimeline}
              onChange={(e) => setSettings(prev => ({ ...prev, showTimeline: e.target.checked }))}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Highlight Mode</FormLabel>
            <Select
              size="sm"
              value={settings.highlightMode}
              onChange={(e) => setSettings(prev => ({ ...prev, highlightMode: e.target.value as any }))}
            >
              <option value="path">Full Path</option>
              <option value="hops">Step by Step</option>
              <option value="simultaneous">Simultaneous</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Color Scheme</FormLabel>
            <Select
              size="sm"
              value={settings.colorScheme}
              onChange={(e) => setSettings(prev => ({ ...prev, colorScheme: e.target.value as any }))}
            >
              <option value="severity">Severity</option>
              <option value="likelihood">Likelihood</option>
              <option value="impact">Impact</option>
            </Select>
          </FormControl>
        </VStack>
      </CardBody>
    </Card>
  )
  
  const renderPathTimeline = () => {
    if (!selectedPath || !settings.showTimeline) return null
    
    return (
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold">Attack Timeline</Text>
            
            <HStack spacing={2} align="start" overflowX="auto" width="100%">
              {selectedPath.timeline.map((stage, index) => (
                <VStack
                  key={index}
                  spacing={2}
                  align="center"
                  minW="120px"
                  p={2}
                  bg={animation.currentStep >= index ? getPathColor(selectedPath) + '.100' : 'gray.50'}
                  borderRadius="md"
                  border="1px"
                  borderColor={animation.currentStep >= index ? getPathColor(selectedPath) + '.300' : 'gray.200'}
                  transition="all 0.3s"
                >
                  <Box
                    w={6}
                    h={6}
                    borderRadius="full"
                    bg={animation.currentStep >= index ? getPathColor(selectedPath) + '.500' : 'gray.300'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {index + 1}
                  </Box>
                  
                  <Text fontSize="xs" fontWeight="bold" textAlign="center" noOfLines={2}>
                    {stage.stage}
                  </Text>
                  
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    {stage.timeframe}
                  </Text>
                  
                  <Progress
                    value={animation.currentStep >= index ? 100 : 0}
                    size="sm"
                    colorScheme={getPathColor(selectedPath)}
                    width="80px"
                  />
                </VStack>
              ))}
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    )
  }
  
  const renderPathMetrics = () => {
    if (!selectedPath) return null
    
    return (
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold">Path Metrics</Text>
            
            <HStack spacing={4} width="100%">
              <VStack spacing={1} flex={1}>
                <Text fontSize="xs" color="gray.500">Risk Score</Text>
                <Text fontSize="lg" fontWeight="bold" color={getPathColor(selectedPath) + '.500'}>
                  {selectedPath.riskScore}/10
                </Text>
              </VStack>
              
              <VStack spacing={1} flex={1}>
                <Text fontSize="xs" color="gray.500">Likelihood</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {Math.round(selectedPath.likelihood * 100)}%
                </Text>
              </VStack>
              
              <VStack spacing={1} flex={1}>
                <Text fontSize="xs" color="gray.500">Impact</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {selectedPath.impact}/10
                </Text>
              </VStack>
            </HStack>
            
            <Divider />
            
            <VStack spacing={2} width="100%">
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm">Detection Difficulty:</Text>
                <Badge colorScheme={selectedPath.detectionDifficulty === 'Very Hard' ? 'red' : 'orange'}>
                  {selectedPath.detectionDifficulty}
                </Badge>
              </HStack>
              
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm">Dwell Time:</Text>
                <Text fontSize="sm" color="gray.600">{selectedPath.estimatedDwellTime}</Text>
              </HStack>
              
              <HStack justify="space-between" width="100%">
                <Text fontSize="sm">Path Length:</Text>
                <Text fontSize="sm" color="gray.600">{selectedPath.path.length} hops</Text>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    )
  }
  
  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="xl" fontWeight="bold">
            Threat Path Visualization
          </Text>
          <HStack>
            <Button
              size="sm"
              leftIcon={<ViewIcon />}
              onClick={() => onPathSelect(null)}
              variant="outline"
            >
              Clear Selection
            </Button>
          </HStack>
        </HStack>
        
        {/* Main Content */}
        <HStack align="start" spacing={6}>
          {/* Left Panel - Path List */}
          <VStack spacing={4} width="300px" flexShrink={0}>
            <Card width="100%">
              <CardBody>
                <Text fontWeight="bold" mb={3}>
                  Threat Paths ({threatPaths.length})
                </Text>
                {threatPaths.length === 0 ? (
                  <Alert status="info" size="sm">
                    <AlertIcon />
                    No threat paths available
                  </Alert>
                ) : (
                  renderPathList()
                )}
              </CardBody>
            </Card>
            
            {/* Visualization Settings */}
            {renderVisualizationSettings()}
          </VStack>
          
          {/* Right Panel - Controls and Details */}
          <VStack spacing={4} flex={1}>
            {/* Animation Controls */}
            {renderAnimationControls()}
            
            {/* Path Timeline */}
            {renderPathTimeline()}
            
            {/* Path Metrics */}
            {renderPathMetrics()}
            
            {/* Selected Path Info */}
            {selectedPath && (
              <Card width="100%">
                <CardBody>
                  <VStack spacing={3} align="start">
                    <HStack>
                      <Text fontWeight="bold">Selected Path:</Text>
                      <Badge colorScheme={getPathColor(selectedPath)}>
                        {selectedPath.severity}
                      </Badge>
                    </HStack>
                    
                    <Text fontSize="sm" fontWeight="bold">
                      {selectedPath.name}
                    </Text>
                    
                    <Text fontSize="sm" color="gray.600">
                      {selectedPath.description}
                    </Text>
                    
                    <HStack spacing={4} fontSize="sm">
                      <Text><strong>Attacker:</strong> {selectedPath.attackerProfile.type}</Text>
                      <Text><strong>Sophistication:</strong> {selectedPath.attackerProfile.sophistication}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </HStack>
      </VStack>
    </Box>
  )
}

export default ThreatPathVisualization

