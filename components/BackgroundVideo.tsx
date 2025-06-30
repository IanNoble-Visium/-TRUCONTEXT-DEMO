import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
  IconButton,
  Collapse,
  useColorModeValue,
  Badge,
  Divider
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { SettingsIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)

// Animated pulse indicator component
const PulseIndicator: React.FC = () => (
  <motion.div
    style={{
      width: '8px',
      height: '8px',
      backgroundColor: '#3182ce', // blue.400
      borderRadius: '50%'
    }}
    animate={{
      opacity: [1, 0.5, 1]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)

interface BackgroundVideoProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  selectedVideo?: string
  opacity?: number
  className?: string
}

interface VideoOption {
  value: string
  label: string
  description: string
  file: string
}

const VIDEO_OPTIONS: VideoOption[] = [
  {
    value: 'neural_data_flow',
    label: 'Neural Data Flow',
    description: 'Flowing streams of data particles through neural pathways',
    file: '/videos/neural_data_flow.mp4'
  },
  {
    value: 'threat_propagation',
    label: 'Threat Propagation',
    description: 'Visualization of cybersecurity threats moving through networks',
    file: '/videos/threat_propagation.mp4'
  },
  {
    value: 'temporal_evolution',
    label: 'Temporal Evolution',
    description: 'Time-lapse view of network topology evolution and growth',
    file: '/videos/temporal_evolution.mp4'
  },
  {
    value: 'system_health_pulse',
    label: 'System Health Pulse',
    description: 'Ambient monitoring with heartbeat-like health indicators',
    file: '/videos/system_health_pulse.mp4'
  },
  {
    value: 'quantum_resonance',
    label: 'Quantum Resonance',
    description: 'Wave interference patterns representing quantum network states',
    file: '/videos/quantum_resonance.mp4'
  },
  {
    value: 'digital_dna_anomaly_scanner',
    label: 'Digital DNA Anomaly Scanner',
    description: 'Network traffic visualized as genetic sequences with malware mutations and defensive antibody particles',
    file: '/videos/dna_anomaly_scanner.mp4'
  },
  {
    value: 'gravitational_anomaly_detection',
    label: 'Gravitational Anomaly Detection',
    description: 'Data flows following spacetime curvature with gravitational anomalies representing security threats',
    file: '/videos/gravitational_anomaly.mp4'
  },
  {
    value: 'ecosystem_predator_prey_dynamics',
    label: 'Ecosystem Predator-Prey Dynamics',
    description: 'Living ecosystem visualization where data packets swim as fish while threats stalk as predators',
    file: '/videos/ecosystem_predator_prey.mp4'
  },
  {
    value: 'quantum_entanglement_breach_detection',
    label: 'Quantum Entanglement Breach Detection',
    description: 'Quantum physics visualization with entangled particles showing secure relationships and breach detection',
    file: '/videos/quantum_entanglement_breach.mp4'
  },
  {
    value: 'neural_synaptic_firing_patterns',
    label: 'Neural Synaptic Firing Patterns',
    description: 'Brain neural network visualization showing network activity as synaptic firing patterns',
    file: '/videos/neural_synaptic_patterns.mp4'
  }
]

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  isEnabled,
  onToggle,
  selectedVideo: propSelectedVideo = VIDEO_OPTIONS[0].value,
  opacity: propOpacity = 20,
  className = ''
}) => {
  const [selectedVideo, setSelectedVideo] = useState(propSelectedVideo)
  const [opacity, setOpacity] = useState(propOpacity) // 20% default opacity
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const performanceRef = useRef<{ lastFrameTime: number }>({ lastFrameTime: 0 })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Sync props with local state
  useEffect(() => {
    setSelectedVideo(propSelectedVideo)
  }, [propSelectedVideo])

  useEffect(() => {
    setOpacity(propOpacity)
  }, [propOpacity])

  // Get current video option with memoization to prevent unnecessary re-renders
  const currentVideoOption = useMemo(() =>
    VIDEO_OPTIONS.find(option => option.value === selectedVideo) || VIDEO_OPTIONS[0],
    [selectedVideo]
  )

  // Handle video loading with performance optimizations
  useEffect(() => {
    if (videoRef.current && isEnabled) {
      setIsLoading(true)
      setHasError(false)

      const video = videoRef.current
      let isCurrentEffect = true // Flag to prevent race conditions

      const handleLoadStart = () => {
        if (isCurrentEffect) setIsLoading(true)
      }
      const handleCanPlay = () => {
        if (isCurrentEffect) {
          setIsLoading(false)
          // Ensure video is properly configured for performance
          video.playbackRate = 1.0
          video.volume = 0 // Ensure muted for performance
        }
      }
      const handleError = (event: Event) => {
        if (isCurrentEffect) {
          setIsLoading(false)
          setHasError(true)
          console.error('Background video failed to load:', {
            file: currentVideoOption.file,
            label: currentVideoOption.label,
            error: event,
            videoElement: video
          })
        }
      }

      // Performance optimization: preload metadata only
      video.preload = 'metadata'
      video.addEventListener('loadstart', handleLoadStart)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)

      // Check if video file exists before loading
      console.log('Loading background video:', {
        file: currentVideoOption.file,
        label: currentVideoOption.label,
        isEnabled
      })

      // Load and play the video with error handling
      video.load()

      // Use requestAnimationFrame for smoother playback start
      requestAnimationFrame(() => {
        if (isCurrentEffect && video.readyState >= 2) { // HAVE_CURRENT_DATA
          video.play().catch(error => {
            console.warn('Background video autoplay failed:', error)
            // This is expected in some browsers due to autoplay policies
            // Video will still be available for manual play
          })
        }
      })

      return () => {
        isCurrentEffect = false // Mark this effect as stale
        video.removeEventListener('loadstart', handleLoadStart)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
        // Pause video when component unmounts or disabled
        video.pause()
      }
    } else if (videoRef.current && !isEnabled) {
      // Pause video when disabled to save resources
      videoRef.current.pause()
    }
  }, [selectedVideo, isEnabled, currentVideoOption.file])

  // Handle video selection change
  const handleVideoChange = (value: string) => {
    setSelectedVideo(value)
  }

  // Handle opacity change
  const handleOpacityChange = (value: number) => {
    setOpacity(value)
  }

  // Cleanup on unmount for memory management
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const video = videoRef.current
        video.pause()
        video.src = ''
        video.load() // This helps free up memory
      }
    }
  }, [])



  return (
    <>
      {/* Background Video Element */}
      {isEnabled && !prefersReducedMotion && (
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          overflow="hidden"
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity / 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          pointerEvents="none"

        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(0.5px)', // Subtle blur for better integration
              mixBlendMode: 'multiply', // CSS blend mode for better integration
              willChange: 'transform', // Optimize for animations
              backfaceVisibility: 'hidden', // Performance optimization
              transform: 'translateZ(0)' // Force hardware acceleration
            }}
          >
            <source src={currentVideoOption.file} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Loading overlay */}
          {isLoading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" fontSize="sm">
                Loading ambient video...
              </Text>
            </Box>
          )}
          
          {/* Error overlay */}
          {hasError && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="red.300" fontSize="sm">
                Video unavailable
              </Text>
            </Box>
          )}
        </MotionBox>
      )}

      {/* Reduced Motion Notice */}
      {isEnabled && prefersReducedMotion && (
        <MotionBox
          position="absolute"
          top={4}
          right={4}
          bg="blackAlpha.700"
          color="white"
          px={3}
          py={2}
          borderRadius="md"
          fontSize="xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Video disabled (reduced motion)
        </MotionBox>
      )}
    </>
  )
}

// Video Controls Component (for integration into graph controls)
interface VideoControlsProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  selectedVideo: string
  onVideoChange: (video: string) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
  isExpanded: boolean
  onToggleExpanded: () => void
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isEnabled,
  onToggle,
  selectedVideo,
  onVideoChange,
  opacity,
  onOpacityChange,
  isExpanded,
  onToggleExpanded
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const hoverBg = useColorModeValue('gray.100', 'gray.600')

  const currentVideoOption = VIDEO_OPTIONS.find(option => option.value === selectedVideo) || VIDEO_OPTIONS[0]

  // Collapsed state - show minimal indicator regardless of video enabled state
  if (!isExpanded) {
    return (
      <Tooltip
        label={`Ambient Video: ${isEnabled ? 'Active' : 'Disabled'} - Click to expand controls`}
        placement="bottom"
      >
        <Box
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={2}
          cursor="pointer"
          onClick={onToggleExpanded}
          _hover={{ bg: hoverBg }}
          transition="all 0.2s"
        >
          <HStack spacing={2} justify="center">
            <SettingsIcon boxSize={3} color={textColor} />
            <Text fontSize="xs" fontWeight="medium" color={textColor}>
              Video
            </Text>
            {/* Only show pulsing indicator when video is actually enabled */}
            {isEnabled && <PulseIndicator />}
          </HStack>
        </Box>
      </Tooltip>
    )
  }

  // Expanded state - show full controls regardless of video enabled state
  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={3}
    >
      <VStack spacing={3} align="stretch">
        {/* Header with collapse button and video toggle */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Tooltip label="Collapse video controls">
              <IconButton
                icon={<ViewOffIcon />}
                size="xs"
                variant="ghost"
                onClick={onToggleExpanded}
                aria-label="Collapse video controls"
              />
            </Tooltip>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              Ambient Video
            </Text>
            {isEnabled && (
              <Badge colorScheme="blue" size="sm">
                Active
              </Badge>
            )}
          </HStack>
          <Switch
            size="sm"
            isChecked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            colorScheme="blue"
          />
        </HStack>

        {/* Video configuration controls - always show when expanded */}
        <Collapse in={true} animateOpacity>
          <VStack spacing={3} align="stretch">
            <Divider />

            {/* Video selection */}
            <FormControl>
              <FormLabel fontSize="xs" color={mutedColor}>
                Video Theme
              </FormLabel>
              <Select
                size="sm"
                value={selectedVideo}
                onChange={(e) => onVideoChange(e.target.value)}
                isDisabled={!isEnabled}
                opacity={isEnabled ? 1 : 0.6}
              >
                {VIDEO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Text fontSize="xs" color={mutedColor} mt={1}>
                {currentVideoOption.description}
              </Text>
            </FormControl>

            {/* Opacity control */}
            <FormControl>
              <FormLabel fontSize="xs" color={mutedColor}>
                Opacity: {opacity}%
              </FormLabel>
              <Slider
                value={opacity}
                onChange={onOpacityChange}
                min={5}
                max={50}
                step={5}
                size="sm"
                isDisabled={!isEnabled}
                opacity={isEnabled ? 1 : 0.6}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontSize="xs" color={mutedColor} mt={1}>
                Recommended: 15-25% for optimal visibility
              </Text>
            </FormControl>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  )
}

export default BackgroundVideo
