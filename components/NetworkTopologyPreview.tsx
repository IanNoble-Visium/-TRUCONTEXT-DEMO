import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  Spinner
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiGlobe, FiEye } from 'react-icons/fi'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

interface GraphData {
  nodes: any[]
  edges: any[]
}

interface NetworkTopologyPreviewProps {
  graphData?: GraphData
  onViewDetails?: () => void
}

const NetworkTopologyPreview: React.FC<NetworkTopologyPreviewProps> = ({
  graphData,
  onViewDetails
}) => {
  // All hooks must be called at the top level
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const grayTextColor = useColorModeValue('gray.600', 'gray.400')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const mutedBg = useColorModeValue('gray.100', 'gray.700')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Simple network visualization
  const drawNetwork = () => {
    const canvas = canvasRef.current
    if (!canvas || !graphData?.nodes?.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set colors based on theme
    const nodeColor = '#4299E1'
    const edgeColor = '#E2E8F0'

    // Draw edges first
    if (graphData.edges) {
      ctx.strokeStyle = edgeColor
      ctx.lineWidth = 1
      
      graphData.edges.slice(0, 20).forEach(edge => {
        const sourceIndex = Math.floor(Math.random() * Math.min(graphData.nodes.length, 10))
        const targetIndex = Math.floor(Math.random() * Math.min(graphData.nodes.length, 10))
        
        const sourceX = (sourceIndex / 10) * width + Math.random() * 50
        const sourceY = (sourceIndex / 10) * height + Math.random() * 50
        const targetX = (targetIndex / 10) * width + Math.random() * 50
        const targetY = (targetIndex / 10) * height + Math.random() * 50

        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(targetX, targetY)
        ctx.stroke()
      })
    }

    // Draw nodes
    ctx.fillStyle = nodeColor
    const nodeCount = Math.min(graphData.nodes.length, 15)
    
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() * (width - 40)) + 20
      const y = (Math.random() * (height - 40)) + 20
      const radius = 4 + Math.random() * 3

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  useEffect(() => {
    if (graphData?.nodes?.length) {
      setIsDrawing(true)
      const timer = setTimeout(() => {
        drawNetwork()
        setIsDrawing(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [graphData])

  const hasData = graphData?.nodes && graphData.nodes.length > 0

  return (
    <MotionCard
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CardHeader>
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="md" color={textColor}>Network Topology</Heading>
            <Text fontSize="sm" color={grayTextColor}>
              {hasData ? `${graphData.nodes.length} nodes, ${graphData.edges?.length || 0} edges` : 'No data'}
            </Text>
          </VStack>
          {hasData && onViewDetails && (
            <Button
              size="sm"
              leftIcon={<Icon as={FiEye} />}
              colorScheme="blue"
              variant="outline"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        <Box position="relative" height="200px">
          {isDrawing ? (
            <VStack spacing={4} align="center" justify="center" height="100%">
              <Spinner size="lg" color={accentColor} />
              <Text color={grayTextColor}>Rendering topology...</Text>
            </VStack>
          ) : hasData ? (
            <canvas
              ref={canvasRef}
              width={300}
              height={180}
              style={{
                width: '100%',
                height: '100%',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px'
              }}
            />
          ) : (
            <VStack spacing={4} align="center" justify="center" height="100%">
              <Icon as={FiGlobe} boxSize={12} color={mutedBg} />
              <Text color={grayTextColor} textAlign="center">
                No network data available
              </Text>
              <Text fontSize="sm" color={grayTextColor} textAlign="center">
                Load a dataset to see topology preview
              </Text>
            </VStack>
          )}
        </Box>
      </CardBody>
    </MotionCard>
  )
}

export default NetworkTopologyPreview

