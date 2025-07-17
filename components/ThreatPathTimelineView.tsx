import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Tooltip,
  IconButton,
  useColorModeValue,
  Divider,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Grid,
  GridItem
} from '@chakra-ui/react'
import {
  PlayIcon,
  PauseIcon,
  RepeatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TimeIcon,
  WarningIcon,
  InfoIcon,
  ViewIcon
} from '@chakra-ui/icons'
import { ThreatPathScenario } from '../types/threatPath'

interface ThreatPathTimelineViewProps {
  threatPaths: ThreatPathScenario[]
  selectedPath: ThreatPathScenario | null
  onPathSelect: (path: ThreatPathScenario) => void
  onStepSelect: (pathId: string, stepIndex: number) => void
}

interface TimelineState {
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number
  selectedTimeRange: [number, number]
  showAllPaths: boolean
  groupByStage: boolean
}

interface TimelineEvent {
  pathId: string
  pathName: string
  stepIndex: number
  startTime: number
  endTime: number
  stage: string
  action: string
  technique: string
  severity: string
  nodeId: string
  nodeName: string
  indicators: string[]
}

const ThreatPathTimelineView: React.FC<ThreatPathTimelineViewProps> = ({
  threatPaths,
  selectedPath,
  onPathSelect,
  onStepSelect
}) => {
  const [timeline, setTimeline] = useState<TimelineState>({
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    selectedTimeRange: [0, 100],
    showAllPaths: true,
    groupByStage: false
  })
  
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<TimelineEvent[]>([])
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const timelineColor = useColorModeValue('gray.100', 'gray.700')
  
  // Convert threat paths to timeline events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = []
    const pathsToProcess = timeline.showAllPaths ? threatPaths : (selectedPath ? [selectedPath] : [])
    
    pathsToProcess.forEach(path => {
      let cumulativeTime = 0
      
      path.pathDetails.forEach((detail, index) => {
        const stepDuration = parseTimeEstimate(detail.timeEstimate)
        const startTime = cumulativeTime
        const endTime = cumulativeTime + stepDuration
        
        events.push({
          pathId: path.id,
          pathName: path.name,
          stepIndex: index,
          startTime,
          endTime,
          stage: path.timeline[Math.min(index, path.timeline.length - 1)]?.stage || 'Unknown',
          action: detail.action,
          technique: detail.technique,
          severity: path.severity,
          nodeId: detail.nodeId,
          nodeName: detail.nodeName,
          indicators: path.timeline[Math.min(index, path.timeline.length - 1)]?.indicators || []
        })
        
        cumulativeTime = endTime
      })
    })
    
    return events.sort((a, b) => a.startTime - b.startTime)
  }, [threatPaths, selectedPath, timeline.showAllPaths])
  
  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    if (timelineEvents.length === 0) return { min: 0, max: 100 }
    
    const maxTime = Math.max(...timelineEvents.map(e => e.endTime))
    return { min: 0, max: maxTime }
  }, [timelineEvents])
  
  // Filter events by time range
  const visibleEvents = useMemo(() => {
    const [startPercent, endPercent] = timeline.selectedTimeRange
    const startTime = (startPercent / 100) * timelineBounds.max
    const endTime = (endPercent / 100) * timelineBounds.max
    
    return timelineEvents.filter(event => 
      event.startTime <= endTime && event.endTime >= startTime
    )
  }, [timelineEvents, timeline.selectedTimeRange, timelineBounds])
  
  // Group events by stage if enabled
  const groupedEvents = useMemo(() => {
    if (!timeline.groupByStage) {
      return { 'All Events': visibleEvents }
    }
    
    const groups: { [stage: string]: TimelineEvent[] } = {}
    visibleEvents.forEach(event => {
      if (!groups[event.stage]) {
        groups[event.stage] = []
      }
      groups[event.stage].push(event)
    })
    
    return groups
  }, [visibleEvents, timeline.groupByStage])
  
  // Animation control
  useEffect(() => {
    let animationFrame: number
    
    if (timeline.isPlaying) {
      const animate = () => {
        setTimeline(prev => {
          const newTime = prev.currentTime + (prev.playbackSpeed * 0.1)
          if (newTime >= timelineBounds.max) {
            return { ...prev, currentTime: 0, isPlaying: false }
          }
          return { ...prev, currentTime: newTime }
        })
        animationFrame = requestAnimationFrame(animate)
      }
      animationFrame = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [timeline.isPlaying, timeline.playbackSpeed, timelineBounds.max])
  
  // Helper functions
  const parseTimeEstimate = (estimate: string): number => {
    // Convert time estimates to minutes for timeline calculation
    if (estimate.includes('hour')) {
      const hours = parseFloat(estimate.match(/(\d+)/)?.[1] || '1')
      return hours * 60
    } else if (estimate.includes('day')) {
      const days = parseFloat(estimate.match(/(\d+)/)?.[1] || '1')
      return days * 24 * 60
    } else if (estimate.includes('week')) {
      const weeks = parseFloat(estimate.match(/(\d+)/)?.[1] || '1')
      return weeks * 7 * 24 * 60
    } else if (estimate.includes('minute')) {
      const minutes = parseFloat(estimate.match(/(\d+)/)?.[1] || '30')
      return minutes
    }
    return 60 // Default 1 hour
  }
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    } else if (minutes < 24 * 60) {
      return `${Math.round(minutes / 60)}h`
    } else {
      return `${Math.round(minutes / (24 * 60))}d`
    }
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'red'
      case 'High': return 'orange'
      case 'Medium': return 'yellow'
      case 'Low': return 'green'
      default: return 'gray'
    }
  }
  
  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'reconnaissance': return 'blue'
      case 'initial access': return 'orange'
      case 'persistence': return 'purple'
      case 'lateral movement': return 'cyan'
      case 'privilege escalation': return 'pink'
      case 'data exfiltration': return 'red'
      default: return 'gray'
    }
  }
  
  const handlePlayPause = () => {
    setTimeline(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }
  
  const handleReset = () => {
    setTimeline(prev => ({ ...prev, currentTime: 0, isPlaying: false }))
  }
  
  const handleTimeChange = (time: number) => {
    setTimeline(prev => ({ ...prev, currentTime: time, isPlaying: false }))
  }
  
  const handleEventClick = (event: TimelineEvent) => {
    onStepSelect(event.pathId, event.stepIndex)
    setTimeline(prev => ({ ...prev, currentTime: event.startTime }))
  }
  
  const renderTimelineControls = () => (
    <Card>
      <CardHeader>
        <Text fontWeight="bold">Timeline Controls</Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4}>
          {/* Playback Controls */}
          <HStack spacing={4} width="100%">
            <IconButton
              icon={timeline.isPlaying ? <PauseIcon /> : <PlayIcon />}
              onClick={handlePlayPause}
              colorScheme="blue"
              aria-label={timeline.isPlaying ? 'Pause' : 'Play'}
            />
            
            <IconButton
              icon={<RepeatIcon />}
              onClick={handleReset}
              variant="outline"
              aria-label="Reset"
            />
            
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>
                Current Time: {formatTime(timeline.currentTime)}
              </Text>
              <Slider
                value={timeline.currentTime}
                min={timelineBounds.min}
                max={timelineBounds.max}
                onChange={handleTimeChange}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </HStack>
          
          {/* Speed Control */}
          <HStack width="100%">
            <Text fontSize="sm" minW="60px">Speed:</Text>
            <Slider
              value={timeline.playbackSpeed}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(value) => setTimeline(prev => ({ ...prev, playbackSpeed: value }))}
              flex={1}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text fontSize="sm" minW="30px">{timeline.playbackSpeed}x</Text>
          </HStack>
          
          {/* View Options */}
          <VStack spacing={2} width="100%">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="show-all-paths" mb="0" fontSize="sm">
                Show all paths
              </FormLabel>
              <Switch
                id="show-all-paths"
                isChecked={timeline.showAllPaths}
                onChange={(e) => setTimeline(prev => ({ ...prev, showAllPaths: e.target.checked }))}
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="group-by-stage" mb="0" fontSize="sm">
                Group by stage
              </FormLabel>
              <Switch
                id="group-by-stage"
                isChecked={timeline.groupByStage}
                onChange={(e) => setTimeline(prev => ({ ...prev, groupByStage: e.target.checked }))}
              />
            </FormControl>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
  
  const renderTimelineEvent = (event: TimelineEvent, index: number) => {
    const isActive = timeline.currentTime >= event.startTime && timeline.currentTime <= event.endTime
    const isPast = timeline.currentTime > event.endTime
    const isFuture = timeline.currentTime < event.startTime
    
    const eventWidth = Math.max(((event.endTime - event.startTime) / timelineBounds.max) * 100, 2)
    const eventLeft = (event.startTime / timelineBounds.max) * 100
    
    return (
      <Tooltip
        key={`${event.pathId}-${event.stepIndex}`}
        label={
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">{event.action}</Text>
            <Text fontSize="sm">{event.nodeName}</Text>
            <Text fontSize="xs">{event.technique}</Text>
            <Text fontSize="xs">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </Text>
          </VStack>
        }
        placement="top"
      >
        <Box
          position="absolute"
          left={`${eventLeft}%`}
          width={`${eventWidth}%`}
          height="20px"
          bg={isActive ? getSeverityColor(event.severity) + '.500' : 
              isPast ? getSeverityColor(event.severity) + '.300' : 
              getSeverityColor(event.severity) + '.100'}
          borderRadius="sm"
          border="1px"
          borderColor={getSeverityColor(event.severity) + '.400'}
          cursor="pointer"
          onClick={() => handleEventClick(event)}
          onMouseEnter={() => setHoveredEvent(event)}
          onMouseLeave={() => setHoveredEvent(null)}
          _hover={{
            transform: 'scaleY(1.2)',
            zIndex: 10
          }}
          transition="all 0.2s"
          zIndex={isActive ? 5 : 1}
        />
      </Tooltip>
    )
  }
  
  const renderTimelineTrack = (events: TimelineEvent[], trackName: string, trackIndex: number) => (
    <Box key={trackName} mb={4}>
      <HStack mb={2}>
        <Badge colorScheme={getStageColor(trackName)} variant="outline">
          {trackName}
        </Badge>
        <Text fontSize="sm" color="gray.600">
          {events.length} events
        </Text>
      </HStack>
      
      <Box
        position="relative"
        height="30px"
        bg={timelineColor}
        borderRadius="md"
        border="1px"
        borderColor={borderColor}
      >
        {events.map((event, index) => renderTimelineEvent(event, index))}
        
        {/* Current time indicator */}
        <Box
          position="absolute"
          left={`${(timeline.currentTime / timelineBounds.max) * 100}%`}
          top="0"
          bottom="0"
          width="2px"
          bg="red.500"
          zIndex={20}
        />
      </Box>
    </Box>
  )
  
  const renderTimelineAxis = () => {
    const tickCount = 10
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const time = (i / tickCount) * timelineBounds.max
      return {
        position: (i / tickCount) * 100,
        label: formatTime(time)
      }
    })
    
    return (
      <Box position="relative" height="30px" mb={4}>
        {ticks.map((tick, index) => (
          <Box
            key={index}
            position="absolute"
            left={`${tick.position}%`}
            top="0"
            transform="translateX(-50%)"
          >
            <Box width="1px" height="20px" bg="gray.400" />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {tick.label}
            </Text>
          </Box>
        ))}
      </Box>
    )
  }
  
  const renderEventDetails = () => {
    const eventToShow = hoveredEvent || (selectedEvents.length > 0 ? selectedEvents[0] : null)
    if (!eventToShow) return null
    
    return (
      <Card>
        <CardHeader>
          <Text fontWeight="bold">Event Details</Text>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack>
              <Badge colorScheme={getSeverityColor(eventToShow.severity)}>
                {eventToShow.severity}
              </Badge>
              <Badge colorScheme={getStageColor(eventToShow.stage)} variant="outline">
                {eventToShow.stage}
              </Badge>
            </HStack>
            
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{eventToShow.action}</Text>
              <Text fontSize="sm" color="gray.600">{eventToShow.pathName}</Text>
              <Text fontSize="sm">{eventToShow.nodeName}</Text>
            </VStack>
            
            <Divider />
            
            <VStack align="start" spacing={1}>
              <Text fontSize="sm"><strong>Technique:</strong> {eventToShow.technique}</Text>
              <Text fontSize="sm">
                <strong>Duration:</strong> {formatTime(eventToShow.startTime)} - {formatTime(eventToShow.endTime)}
              </Text>
              <Text fontSize="sm">
                <strong>Step:</strong> {eventToShow.stepIndex + 1}
              </Text>
            </VStack>
            
            {eventToShow.indicators.length > 0 && (
              <>
                <Divider />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">Indicators:</Text>
                  {eventToShow.indicators.map((indicator, index) => (
                    <Text key={index} fontSize="xs" color="gray.600">
                      • {indicator}
                    </Text>
                  ))}
                </VStack>
              </>
            )}
            
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => handleEventClick(eventToShow)}
            >
              Jump to Event
            </Button>
          </VStack>
        </CardBody>
      </Card>
    )
  }
  
  if (timelineEvents.length === 0) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          No timeline events available. Select a threat path to view its timeline.
        </Alert>
      </Box>
    )
  }
  
  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">
              Threat Path Timeline
            </Text>
            <Text color="gray.600">
              Interactive timeline visualization of attack progression
            </Text>
          </VStack>
          
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Total Duration: {formatTime(timelineBounds.max)}
            </Text>
          </HStack>
        </HStack>
        
        {/* Main Content */}
        <Grid templateColumns="300px 1fr 300px" gap={6}>
          {/* Left Panel - Controls */}
          <GridItem>
            {renderTimelineControls()}
          </GridItem>
          
          {/* Center Panel - Timeline */}
          <GridItem>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Timeline Axis */}
                  {renderTimelineAxis()}
                  
                  {/* Timeline Tracks */}
                  <Box maxH="400px" overflowY="auto">
                    {Object.entries(groupedEvents).map(([groupName, events], index) =>
                      renderTimelineTrack(events, groupName, index)
                    )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          
          {/* Right Panel - Event Details */}
          <GridItem>
            {renderEventDetails()}
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  )
}

export default ThreatPathTimelineView

