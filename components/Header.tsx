import React from 'react'
import { Box, Flex, Heading, Text, IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import Image from 'next/image'

const MotionIconButton = motion(IconButton)

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('visium.500', 'gray.800')
  const textColor = useColorModeValue('white', 'gray.100')

  return (
    <Box bg={bgColor} color={textColor} py={4} px={6} boxShadow="lg">
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        <Flex align="center">
          <Box mr={4}>
            <Image
              src="/images/logo.png"
              alt="Visium Technologies"
              width={103}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box>
            <Heading size="lg" fontWeight="bold">
              TruContext Demo
            </Heading>
            <Text fontSize="sm" opacity={0.9}>
              Graph Analytics Platform
            </Text>
          </Box>
        </Flex>
        
        <Flex align="center" gap={4}>
          <Text fontSize="sm" opacity={0.8}>
            Powered by Neo4j & Cytoscape.js
          </Text>
          
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

