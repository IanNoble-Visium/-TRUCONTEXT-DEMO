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
  Collapse,
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
  Spacer
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, HamburgerIcon, InfoIcon, AttachmentIcon } from '@chakra-ui/icons'
import Head from 'next/head'
import Header from '../components/Header'
import FileUpload from '../components/FileUpload'
import GraphVisualization from '../components/GraphVisualization'

const HomePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showHeader, setShowHeader] = useState(true)
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()
  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure()
  
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    onUploadClose() // Auto-close upload panel after successful upload
  }

  const gridColumns = useBreakpointValue({ base: 1, xl: 2 })
  const containerPadding = useBreakpointValue({ base: 4, md: 6 })
  const isLargeScreen = useBreakpointValue({ base: false, xl: true })
  const drawerSize = useBreakpointValue({ base: 'full', md: 'md', lg: 'lg' })

  return (
    <>
      <Head>
        <title>TruContext Demo - Graph Analytics Platform</title>
        <meta name="description" content="TruContext graph analytics platform powered by Neo4j and Cytoscape.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box height="100vh" bg="gray.50" overflow="hidden">
        {/* Collapsible Header */}
        <Collapse in={showHeader} animateOpacity>
          <Header />
        </Collapse>

        {/* Main Layout */}
        <Flex direction="column" height={showHeader ? "calc(100vh - 80px)" : "100vh"}>
          {/* Top Toolbar */}
          <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={2}>
            <Flex align="center">
              <IconButton
                icon={showHeader ? <ChevronUpIcon /> : <ChevronDownIcon />}
                aria-label="Toggle header"
                size="sm"
                variant="ghost"
                onClick={() => setShowHeader(!showHeader)}
                mr={2}
              />
              
              <Button
                leftIcon={<AttachmentIcon />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={onUploadOpen}
                mr={2}
              >
                Upload Dataset
              </Button>
              
              <Button
                leftIcon={<InfoIcon />}
                variant="ghost"
                size="sm"
                onClick={onInfoOpen}
                mr={4}
              >
                Help
              </Button>

              <Spacer />

              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Graph Analytics Platform
              </Text>
            </Flex>
          </Box>

          {/* Graph Visualization - Full remaining space */}
          <Box flex={1} p={4}>
            <Box bg="white" borderRadius="lg" shadow="lg" height="100%" overflow="hidden">
              <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                <Heading size="md" color="visium.500">Interactive Graph Topology</Heading>
              </Box>
              <Box height="calc(100% - 60px)" p={4}>
                <GraphVisualization refreshTrigger={refreshTrigger} />
              </Box>
            </Box>
          </Box>
        </Flex>

        {/* Upload Drawer */}
        <Drawer isOpen={isUploadOpen} placement="left" onClose={onUploadClose} size={drawerSize}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader bg="visium.500" color="white">
              Dataset Upload
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={6} align="stretch" py={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Upload a JSON file containing nodes, edges, and stored queries to visualize your network topology.
                  </Text>
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                </Box>

                <Accordion allowToggle>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Dataset Format Requirements
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start" spacing={3} fontSize="sm" color="gray.600">
                        <Box>
                          <Text fontWeight="bold" color="gray.700" mb={1}>Nodes Structure:</Text>
                          <Text>• uid: Unique identifier</Text>
                          <Text>• type: Node type (Server, Application, Database, etc.)</Text>
                          <Text>• showname: Display name</Text>
                          <Text>• properties: Additional metadata</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.700" mb={1}>Edges Structure:</Text>
                          <Text>• from: Source node UID</Text>
                          <Text>• to: Target node UID</Text>
                          <Text>• type: Relationship type</Text>
                          <Text>• properties: Additional metadata</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold" color="gray.700" mb={1}>Auto-Generated:</Text>
                          <Text>• Timestamps (Dec 30-31, 2023)</Text>
                          <Text>• Geolocation coordinates</Text>
                        </Box>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Sample Dataset
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        A sample dataset file (sample-dataset.json) is available in the project root for testing.
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        This sample contains a network topology with servers, applications, databases, and security vulnerabilities.
                      </Text>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Info Drawer */}
        <Drawer isOpen={isInfoOpen} placement="right" onClose={onInfoClose} size={drawerSize}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader bg="visium.500" color="white">
              Platform Guide
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={6} align="stretch" py={4}>
                <Accordion allowToggle defaultIndex={0}>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
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
                          <Text>Watch as your data is processed and visualized</Text>
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
                            4
                          </Box>
                          <Text>Interact with nodes and edges in the graph</Text>
                        </HStack>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Graph Interactions
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start" spacing={2} fontSize="sm" color="gray.600">
                        <Text>• <strong>Click nodes:</strong> View node details in console</Text>
                        <Text>• <strong>Click edges:</strong> View relationship details</Text>
                        <Text>• <strong>Drag nodes:</strong> Reposition in the graph</Text>
                        <Text>• <strong>Zoom:</strong> Mouse wheel to zoom in/out</Text>
                        <Text>• <strong>Pan:</strong> Click and drag background to pan</Text>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Technical Stack
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="start" spacing={2} fontSize="sm" color="gray.600">
                        <Text>• <strong>Frontend:</strong> Next.js 14 + Chakra UI</Text>
                        <Text>• <strong>Database:</strong> Neo4j Aura Cloud</Text>
                        <Text>• <strong>Visualization:</strong> Cytoscape.js</Text>
                        <Text>• <strong>Deployment:</strong> Vercel-ready</Text>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  )
}

export default HomePage 