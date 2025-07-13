import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  Button,
  useColorModeValue,
  Icon,
  Tooltip
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiEye, FiMaximize2, FiActivity } from 'react-icons/fi'

const MotionCard = motion(Card)
const MotionBox = motion(Box)

interface NetworkTopologyPreviewProps {
  graphData?: {
    nodes: any[]
    edges: any[]
  }
  onViewFullTopology?: () => void
}

const NetworkTopologyPreview: React.FC<NetworkTopologyPreviewProps> = ({
  graphData,
  onViewFullTopology
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  // Simplified network visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !graphData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Set up colors
    const nodeColor = accentColor
    const edgeColor = useColorModeValue('#E2E8F0', '#4A5568')
    const highlightColor = useColorModeValue('#3182CE', '#63B3ED')

    // Create simplified node positions
    const nodes = graphData.nodes.slice(0, 20) // Limit for preview
    const nodePositions = nodes.map((_, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      const radius = Math.min(width, height) * 0.3
      return {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        radius: 4
      }
    })

    // Animation frame
    let animationFrame: number
    let time = 0

    const animate = () => {
      if (!isAnimating) return
      
      ctx.clearRect(0, 0, width, height)
      
      // Draw edges with animation
      ctx.strokeStyle = edgeColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.6
      
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          if (Math.random() > 0.7) { // Random connections for preview
            const pulse = Math.sin(time * 0.01 + i * 0.1) * 0.5 + 0.5
            ctx.globalAlpha = 0.3 + pulse * 0.3
            
            ctx.beginPath()
            ctx.moveTo(nodePositions[i].x, nodePositions[i].y)
            ctx.lineTo(nodePositions[j].x, nodePositions[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes with pulse animation
      nodePositions.forEach((pos, index) => {
        const pulse = Math.sin(time * 0.02 + index * 0.2) * 0.3 + 0.7
        const radius = pos.radius * pulse
        
        // Node glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2)
        gradient.addColorStop(0, highlightColor + '80')
        gradient.addColorStop(1, highlightColor + '00')
        
        ctx.fillStyle = gradient
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius * 2, 0, 2 * Math.PI)
        ctx.fill()
        
        // Node core
        ctx.fillStyle = nodeColor
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        ctx.fill()
      })

      time++
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [graphData, isAnimating, accentColor, useColorModeValue])

  const handleMouseEnter = () => setIsAnimating(true)
  const handleMouseLeave = () => setIsAnimating(false)

  if (!graphData || !graphData.nodes.length) {
    return (
      <MotionCard
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        h="300px"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader>
          <HStack>
            <Icon as={FiActivity} color={accentColor} />
            <Heading size="md" color={textColor}>Network Topology</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack justify="center" h="200px">
            <Text color={useColorModeValue('gray.500', 'gray.400')}>
              No network data available
            </Text>
            <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.500')}>
              Load a dataset to see topology preview
            </Text>
          </VStack>
        </CardBody>
      </MotionCard>
    )
  }

  return (
    <MotionCard
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      h="300px"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      cursor="pointer"
      _hover={{
        borderColor: accentColor,
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
      onClick={onViewFullTopology}
    >
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Icon as={FiActivity} color={accentColor} />
            <Heading size="md" color={textColor}>Network Topology</Heading>
          </HStack>
          <HStack>
            <Badge colorScheme="blue" variant="subtle">
              {graphData.nodes.length} nodes
            </Badge>
            <Tooltip label="View Full Topology" placement="top">
              <Button size="sm" variant="ghost" onClick={onViewFullTopology}>
                <Icon as={FiMaximize2} />
              </Button>
            </Tooltip>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <MotionBox
          position="relative"
          h="200px"
          borderRadius="md"
          overflow="hidden"
          bg={useColorModeValue('gray.50', 'gray.900')}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '6px'
            }}
          />
          
          {/* Overlay with stats */}
          <Box
            position="absolute"
            top={2}
            right={2}
            bg={cardBg}
            px={2}
            py={1}
            borderRadius="md"
            boxShadow="sm"
            opacity={0.9}
          >
            <VStack spacing={0} align="end">
              <Text fontSize="xs" fontWeight="bold" color={textColor}>
                {graphData.edges.length} connections
              </Text>
              <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                Live preview
              </Text>
            </VStack>
          </Box>

          {/* Click to expand hint */}
          <Box
            position="absolute"
            bottom={2}
            left={2}
            right={2}
            textAlign="center"
          >
            <Text
              fontSize="xs"
              color={useColorModeValue('gray.500', 'gray.400')}
              opacity={0.8}
            >
              Click to explore full topology
            </Text>
          </Box>
        </MotionBox>
      </CardBody>
    </MotionCard>
  )
}

export default NetworkTopologyPreview

