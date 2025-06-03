import React, { useState } from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  GridItem,
  Divider,
  useBreakpointValue,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Spacer,
  chakra,
  useColorModeValue
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUpIcon, ChevronDownIcon, HamburgerIcon, InfoIcon, AttachmentIcon } from '@chakra-ui/icons'
import Head from 'next/head'
import Header from '../components/Header'
import FileUpload from '../components/FileUpload'
import GraphVisualization from '../components/GraphVisualization'
import PageTransition from '../components/PageTransition'

const MotionBox = motion(chakra.div)
const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)

const HomePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showHeader, setShowHeader] = useState(true)
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()
  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure()
  
  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.600", "gray.300")
  
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    onUploadClose() // Auto-close upload panel after successful upload
  }

  const gridColumns = useBreakpointValue({ base: 1, xl: 2 })
  const containerPadding = useBreakpointValue({ base: 4, md: 6 })
  const isLargeScreen = useBreakpointValue({ base: false, xl: true })
  const drawerSize = useBreakpointValue({ base: 'full', md: 'md', lg: 'lg' })

  // Animation variants
  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
  }

  const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.1 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const slideIn = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 }
  }

  // Staggered animation variants for different sections
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  }

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -30,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        duration: 0.5
      }
    }
  }

  return (
    <>
      <Head>
        <title>TruContext Demo - Graph Analytics Platform</title>
        <meta name="description" content="TruContext graph analytics platform powered by Neo4j and Cytoscape.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageTransition key="home" direction="up" duration={0.5}>
        <Box height="100dvh" bg={bgColor} overflow="hidden">
          {/* Animated Header */}
          <MotionBox variants={headerVariants}>
            <Header />
          </MotionBox>

          {/* Main Graph Area with enhanced animation */}
          <Flex direction="column" height={showHeader ? "calc(100dvh - 80px)" : "100dvh"}>
            {/* Top Toolbar */}
            <MotionBox 
              bg={cardBg} 
              borderBottom="1px solid" 
              borderColor={borderColor} 
              px={4} 
              py={2}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Flex align="center">
                <MotionIconButton
                  icon={showHeader ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  aria-label="Toggle header"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowHeader(!showHeader)}
                  mr={2}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                />
                
                <motion.div variants={slideIn}>
                  <MotionButton
                    leftIcon={<AttachmentIcon />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    onClick={onUploadOpen}
                    mr={2}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    Upload Dataset
                  </MotionButton>
                </motion.div>
                
                <motion.div variants={slideIn}>
                  <MotionButton
                    leftIcon={<InfoIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={onInfoOpen}
                    mr={4}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    Help
                  </MotionButton>
                </motion.div>

                <Spacer />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Text fontSize="sm" color={textColor} fontWeight="medium">
                    Graph Analytics Platform
                  </Text>
                </motion.div>
              </Flex>
            </MotionBox>

            {/* Graph Visualization - Full remaining space */}
            <Box flex={1} p={4}>
              <MotionBox 
                bg={cardBg} 
                borderRadius="lg" 
                shadow="lg" 
                height="100%" 
                overflow="hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ shadow: "xl" }}
              >
                <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Heading size="md" color="visium.500">Interactive Graph Topology</Heading>
                  </motion.div>
                </Box>
                <Box height="calc(100% - 60px)" p={4}>
                  <GraphVisualization refreshTrigger={refreshTrigger} />
                </Box>
              </MotionBox>
            </Box>
          </Flex>

          {/* Upload Drawer */}
          <Drawer isOpen={isUploadOpen} placement="left" onClose={onUploadClose} size={drawerSize}>
            <DrawerOverlay />
            <AnimatePresence initial={false}>
              {isUploadOpen && (
                <MotionBox
                  as={DrawerContent}
                  bg={cardBg}
                  key="upload-drawer"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <DrawerCloseButton />
                  <DrawerHeader bg="visium.500" color="white">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Dataset Upload
                    </motion.div>
                  </DrawerHeader>
                  <DrawerBody>
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <VStack spacing={6} align="stretch" py={4}>
                        <motion.div variants={slideIn}>
                          <Box>
                            <Text fontSize="sm" color={textColor} mb={4}>
                              Upload a JSON file containing nodes, edges, and stored queries to visualize your network topology.
                            </Text>
                            <FileUpload onUploadSuccess={handleUploadSuccess} />
                          </Box>
                        </motion.div>

                        <motion.div variants={slideIn}>
                          <Accordion allowToggle>
                            <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md" mb={2}>
                              <h2>
                                <AccordionButton _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                                  <Box flex="1" textAlign="left" fontWeight="medium">
                                    Dataset Format Requirements
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <VStack align="start" spacing={3} fontSize="sm" color={textColor}>
                                  <Box>
                                    <Text fontWeight="bold" color={useColorModeValue("gray.700", "gray.200")} mb={1}>Nodes Structure:</Text>
                                    <Text>• uid: Unique identifier</Text>
                                    <Text>• type: Node type (Server, Application, Database, etc.)</Text>
                                    <Text>• showname: Display name</Text>
                                    <Text>• properties: Additional metadata</Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold" color={useColorModeValue("gray.700", "gray.200")} mb={1}>Edges Structure:</Text>
                                    <Text>• from: Source node UID</Text>
                                    <Text>• to: Target node UID</Text>
                                    <Text>• type: Relationship type</Text>
                                    <Text>• properties: Additional metadata</Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold" color={useColorModeValue("gray.700", "gray.200")} mb={1}>Auto-Generated:</Text>
                                    <Text>• Timestamps (Dec 30-31, 2023)</Text>
                                    <Text>• Geolocation coordinates</Text>
                                  </Box>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>

                            <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md">
                              <h2>
                                <AccordionButton _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                                  <Box flex="1" textAlign="left" fontWeight="medium">
                                    Sample Dataset
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <Text fontSize="sm" color={textColor} mb={2}>
                                  A sample dataset file (sample-dataset.json) is available in the project root for testing.
                                </Text>
                                <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                                  This sample contains a network topology with servers, applications, databases, and security vulnerabilities.
                                </Text>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        </motion.div>
                      </VStack>
                    </motion.div>
                  </DrawerBody>
                </MotionBox>
              )}
            </AnimatePresence>
          </Drawer>

          {/* Info Drawer */}
          <Drawer isOpen={isInfoOpen} placement="right" onClose={onInfoClose} size={drawerSize}>
            <DrawerOverlay />
            <AnimatePresence initial={false}>
              {isInfoOpen && (
                <MotionBox
                  as={DrawerContent}
                  bg={cardBg}
                  key="info-drawer"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <DrawerCloseButton />
                  <DrawerHeader bg="visium.500" color="white">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Platform Guide
                    </motion.div>
                  </DrawerHeader>
                  <DrawerBody>
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <VStack spacing={6} align="stretch" py={4}>
                        <Accordion allowToggle defaultIndex={0}>
                          <motion.div variants={slideIn}>
                            <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md" mb={2}>
                              <h2>
                                <AccordionButton _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                                  <Box flex="1" textAlign="left" fontWeight="medium">
                                    How to Use
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <VStack align="start" spacing={3} fontSize="sm">
                                  <HStack>
                                    <Box 
                                      bg="visium.500" 
                                      color="white" 
                                      borderRadius="full" 
                                      w={6} 
                                      h={6} 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center" 
                                      fontSize="xs"
                                      fontWeight="bold"
                                    >
                                      1
                                    </Box>
                                    <Text>Click "Upload Dataset" to open the upload panel</Text>
                                  </HStack>
                                  <HStack>
                                    <Box 
                                      bg="visium.500" 
                                      color="white" 
                                      borderRadius="full" 
                                      w={6} 
                                      h={6} 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center" 
                                      fontSize="xs"
                                      fontWeight="bold"
                                    >
                                      2
                                    </Box>
                                    <Text>Drag & drop or select your JSON dataset file</Text>
                                  </HStack>
                                  <HStack>
                                    <Box 
                                      bg="visium.500" 
                                      color="white" 
                                      borderRadius="full" 
                                      w={6} 
                                      h={6} 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center" 
                                      fontSize="xs"
                                      fontWeight="bold"
                                    >
                                      3
                                    </Box>
                                    <Text>View the interactive graph visualization with custom node icons</Text>
                                  </HStack>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          </motion.div>

                          <motion.div variants={slideIn}>
                            <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md">
                              <h2>
                                <AccordionButton _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                                  <Box flex="1" textAlign="left" fontWeight="medium">
                                    Graph Interactions
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <VStack align="start" spacing={2} fontSize="sm" color={textColor}>
                                  <Text>• <strong>Click nodes:</strong> View node details in console</Text>
                                  <Text>• <strong>Click edges:</strong> View relationship details</Text>
                                  <Text>• <strong>Drag nodes:</strong> Reposition in the graph</Text>
                                  <Text>• <strong>Zoom:</strong> Mouse wheel to zoom in/out</Text>
                                  <Text>• <strong>Pan:</strong> Click and drag background to pan</Text>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          </motion.div>

                          <motion.div variants={slideIn}>
                            <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md">
                              <h2>
                                <AccordionButton _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                                  <Box flex="1" textAlign="left" fontWeight="medium">
                                    Technical Stack
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <VStack align="start" spacing={2} fontSize="sm" color={textColor}>
                                  <Text>• <strong>Frontend:</strong> Next.js 14 + Chakra UI</Text>
                                  <Text>• <strong>Database:</strong> Neo4j Aura Cloud</Text>
                                  <Text>• <strong>Visualization:</strong> Cytoscape.js</Text>
                                  <Text>• <strong>Deployment:</strong> Vercel-ready</Text>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          </motion.div>
                        </Accordion>
                      </VStack>
                    </motion.div>
                  </DrawerBody>
                </MotionBox>
              )}
            </AnimatePresence>
          </Drawer>
        </Box>
      </PageTransition>
    </>
  )
}

export default HomePage 