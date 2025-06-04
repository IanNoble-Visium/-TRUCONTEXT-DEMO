import React from 'react'
import { 
  Box, 
  Text, 
  Badge, 
  VStack, 
  HStack, 
  Divider,
  useColorModeValue 
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface NodeTooltipProps {
  node: {
    id: string
    label: string
    type: string
    [key: string]: any
  }
}

interface EdgeTooltipProps {
  edge: {
    id: string
    label: string
    source: string
    target: string
    [key: string]: any
  }
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({ node }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'server': return 'blue'
      case 'application': return 'purple'
      case 'database': return 'cyan'
      case 'user': return 'green'
      case 'threatactor': return 'red'
      case 'firewall': return 'orange'
      case 'router': return 'yellow'
      case 'switch': return 'teal'
      case 'workstation': return 'indigo'
      case 'client': return 'pink'
      case 'entity': return 'gray'
      case 'group': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <MotionBox
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      shadow="lg"
      maxW="280px"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full">
          <Text fontWeight="bold" color={textColor} fontSize="md">
            {node.label || node.id}
          </Text>
          <Badge colorScheme={getTypeColor(node.type)} size="sm">
            {node.type}
          </Badge>
        </HStack>
        
        <Divider />
        
        <VStack align="start" spacing={2} fontSize="sm">
          <HStack>
            <Text fontWeight="semibold" color={textColor}>ID:</Text>
            <Text color={mutedColor} fontFamily="mono">{node.id}</Text>
          </HStack>
          
          {node.showname && node.showname !== node.label && (
            <HStack>
              <Text fontWeight="semibold" color={textColor}>Name:</Text>
              <Text color={mutedColor}>{node.showname}</Text>
            </HStack>
          )}
          
          {node.timestamp && (
            <HStack>
              <Text fontWeight="semibold" color={textColor}>Created:</Text>
              <Text color={mutedColor}>{new Date(node.timestamp).toLocaleDateString()}</Text>
            </HStack>
          )}
          
          {node.lat && node.lon && (
            <HStack>
              <Text fontWeight="semibold" color={textColor}>Location:</Text>
              <Text color={mutedColor} fontFamily="mono">
                {node.lat.toFixed(4)}, {node.lon.toFixed(4)}
              </Text>
            </HStack>
          )}
          
          {node.properties && Object.keys(node.properties).length > 0 && (
            <>
              <Text fontWeight="semibold" color={textColor} mt={2}>Properties:</Text>
              <VStack align="start" spacing={1} pl={2}>
                {Object.entries(node.properties).slice(0, 3).map(([key, value]) => (
                  <HStack key={key}>
                    <Text fontSize="xs" color={mutedColor}>{key}:</Text>
                    <Text fontSize="xs" color={textColor}>{String(value)}</Text>
                  </HStack>
                ))}
                {Object.keys(node.properties).length > 3 && (
                  <Text fontSize="xs" color={mutedColor} fontStyle="italic">
                    +{Object.keys(node.properties).length - 3} more...
                  </Text>
                )}
              </VStack>
            </>
          )}
        </VStack>
      </VStack>
    </MotionBox>
  )
}

export const EdgeTooltip: React.FC<EdgeTooltipProps> = ({ edge }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <MotionBox
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      shadow="lg"
      maxW="260px"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full">
          <Text fontWeight="bold" color={textColor} fontSize="md">
            {edge.label || 'Connection'}
          </Text>
          <Badge colorScheme="blue" size="sm">
            Edge
          </Badge>
        </HStack>
        
        <Divider />
        
        <VStack align="start" spacing={2} fontSize="sm">
          <HStack>
            <Text fontWeight="semibold" color={textColor}>From:</Text>
            <Text color={mutedColor} fontFamily="mono">{edge.source}</Text>
          </HStack>
          
          <HStack>
            <Text fontWeight="semibold" color={textColor}>To:</Text>
            <Text color={mutedColor} fontFamily="mono">{edge.target}</Text>
          </HStack>
          
          {edge.type && edge.type !== edge.label && (
            <HStack>
              <Text fontWeight="semibold" color={textColor}>Type:</Text>
              <Text color={mutedColor}>{edge.type}</Text>
            </HStack>
          )}
          
          {edge.timestamp && (
            <HStack>
              <Text fontWeight="semibold" color={textColor}>Created:</Text>
              <Text color={mutedColor}>{new Date(edge.timestamp).toLocaleDateString()}</Text>
            </HStack>
          )}
          
          {edge.properties && Object.keys(edge.properties).length > 0 && (
            <>
              <Text fontWeight="semibold" color={textColor} mt={2}>Properties:</Text>
              <VStack align="start" spacing={1} pl={2}>
                {Object.entries(edge.properties).slice(0, 3).map(([key, value]) => (
                  <HStack key={key}>
                    <Text fontSize="xs" color={mutedColor}>{key}:</Text>
                    <Text fontSize="xs" color={textColor}>{String(value)}</Text>
                  </HStack>
                ))}
                {Object.keys(edge.properties).length > 3 && (
                  <Text fontSize="xs" color={mutedColor} fontStyle="italic">
                    +{Object.keys(edge.properties).length - 3} more...
                  </Text>
                )}
              </VStack>
            </>
          )}
        </VStack>
      </VStack>
    </MotionBox>
  )
} 