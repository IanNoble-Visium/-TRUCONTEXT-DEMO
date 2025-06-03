import React from 'react'
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react'

const Header: React.FC = () => {
  return (
    <Box bg="visium.500" color="white" py={4} px={6} boxShadow="lg">
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        <Flex align="center">
          <Image 
            src="/images/logo.png" 
            alt="Visium Technologies" 
            height="40px" 
            width="auto" 
            mr={4}
          />
          <Box>
            <Heading size="lg" fontWeight="bold">
              TruContext Demo
            </Heading>
            <Text fontSize="sm" opacity={0.9}>
              Graph Analytics Platform
            </Text>
          </Box>
        </Flex>
        <Text fontSize="sm" opacity={0.8}>
          Powered by Neo4j & Cytoscape.js
        </Text>
      </Flex>
    </Box>
  )
}

export default Header
