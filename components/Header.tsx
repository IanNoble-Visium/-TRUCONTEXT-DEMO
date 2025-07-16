import React from 'react'
import { Box, Flex, Heading, Text, IconButton, useColorMode, useColorModeValue, HStack, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { FiMonitor } from 'react-icons/fi'
import Image from 'next/image'

const MotionIconButton = motion(IconButton)

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('visium.500', 'gray.800')
  const textColor = useColorModeValue('white', 'gray.100')

  return (
    <Box bg={bgColor} color={textColor} py={4} px={6} boxShadow="lg">
      <Flex align="center" justify="space-between" w="100%">
        {/* Task #2: Left-aligned Visium logo only - clean, minimal placement */}
        <Box>
          <Image
            src="/images/logo.png"
            alt="Visium Technologies"
            width={103}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </Box>

        {/* Task #3: Right-aligned attribution with monitor icon and controls */}
        <Flex align="center" gap={4}>
          <HStack spacing={2}>
            <Icon as={FiMonitor} boxSize={4} />
            <Text fontSize="sm" opacity={0.8}>
              Powered by TruAI & Neo4J
            </Text>
          </HStack>

          <MotionIconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            color={textColor}
            size="md"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            _hover={{
              bg: useColorModeValue('whiteAlpha.200', 'whiteAlpha.200')
            }}
          />
        </Flex>
      </Flex>
    </Box>
  )
}

export default Header

