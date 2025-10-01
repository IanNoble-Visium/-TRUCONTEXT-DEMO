import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Textarea,
  Tag,
  Wrap,
  WrapItem,
  useDisclosure,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useToast,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Link,
  Select,
  IconButton,
  Tooltip,
  Editable,
  EditableInput,
  EditablePreview
} from '@chakra-ui/react'
import { AddIcon, WarningIcon, ChevronUpIcon, ChevronDownIcon, DeleteIcon, EditIcon, StarIcon, InfoIcon, CopyIcon } from '@chakra-ui/icons'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import cytoscape from 'cytoscape'

interface AIDashboardsViewProps {
  nodes: any[]
  edges: any[]
  selectedNodes: string[]
  onNodeSelect?: (nodeId: string) => void
}

// Card shape from AI
interface AICard {
  id: string
  title: string
  viz_type: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
  cypher: string // Legacy field - kept for backward compatibility
  cypherAggregation?: string // For chart/table visualizations (returns aggregated data)
  cypherGraph?: string // For mini-topology visualization (returns nodes and relationships)
  options?: any
  data?: {
    columns: string[]
    rows: any[]
    graphData?: { nodes: any[], edges: any[] } // For mini-topology visualization
  }
  originalPrompt?: string // The natural language prompt that generated this card
}

// Suggested card with visualization type selection
interface SuggestedCard {
  prompt: string
  viz_type: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
}

const AIDashboardsView: React.FC<AIDashboardsViewProps> = ({ nodes, edges }) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const [prompt, setPrompt] = useState('')
  const [cards, setCards] = useState<AICard[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [saveName, setSaveName] = useState('')
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isLoadOpen, setIsLoadOpen] = useState(false)
  const [dashboardList, setDashboardList] = useState<any[]>([])
  const [currentDashboardId, setCurrentDashboardId] = useState<number | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  // Builder mode state
  const [builderMode, setBuilderMode] = useState(false)
  const [builderCards, setBuilderCards] = useState<AICard[]>([])
  const [suggestedCards, setSuggestedCards] = useState<SuggestedCard[]>([])
  const [selectedVizTypes, setSelectedVizTypes] = useState<Record<string, 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'>>({})

  const toast = useToast()

  // All useColorModeValue hooks must be at the top level (before any conditional logic)
  const bg = useColorModeValue('white', 'gray.800')
  const subtle = useColorModeValue('gray.600', 'gray.300')
  const border = useColorModeValue('gray.200', 'gray.700')
  const selectedPromptBg = useColorModeValue('blue.50', 'blue.900')
  const editableHoverBg = useColorModeValue('gray.100', 'gray.700')

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'Prompt copied successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }).catch((err) => {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    })
  }

  useEffect(() => {
    // Load AI suggestions based on current graph
    fetch('/api/ai-dashboards/suggestions')
      .then(r => r.json())
      .then(d => {
        const rawSuggestions = d.suggestions || []
        setSuggestions(rawSuggestions)

        // Initialize suggested cards with default viz types
        const initialSuggestedCards: SuggestedCard[] = rawSuggestions.map((s: string) => ({
          prompt: s,
          viz_type: 'bar' as const // Default to bar chart
        }))
        setSuggestedCards(initialSuggestedCards)

        // Initialize selected viz types
        const initialVizTypes: Record<string, 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'> = {}
        rawSuggestions.forEach((s: string) => {
          initialVizTypes[s] = 'bar'
        })
        setSelectedVizTypes(initialVizTypes)

        // Check if we got fallback suggestions due to missing API key
        if (d.fallback) {
          setApiKeyMissing(true)
          if (d.message) {
            console.warn('AI Dashboards:', d.message)
          }
        }
      })
      .catch((e) => {
        setSuggestions([])
        setApiKeyMissing(true)
      })
  }, [])

  async function onCreate() {
    // DUPLICATE PREVENTION: Check if already loading
    if (loading) {
      console.warn('AIDashboards: onCreate() called while already loading - ignoring duplicate call')
      return
    }

    console.log('AIDashboards: onCreate() called', { prompt, builderMode, existingCards: builderCards.length })

    try {
      setLoading(true)
      setLastError(null)

      // Get selected viz type for the current prompt
      const selectedVizType = selectedVizTypes[prompt] || 'bar'

      console.log('AIDashboards: Fetching AI generation...', { prompt, selectedVizType })

      const resp = await fetch('/api/ai-dashboards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, viz_type: selectedVizType })
      })
      const result = await resp.json()
      if (!resp.ok) {
        // Check for specific error types
        if (result.code === 'MISSING_API_KEY' || result.code === 'INVALID_API_KEY') {
          setApiKeyMissing(true)
          setLastError(result.details || 'API key configuration issue')
          throw new Error(result.error || 'AI service not configured')
        }
        if (result.code === 'QUOTA_EXCEEDED') {
          setLastError(result.details || 'API quota exceeded')
          throw new Error(result.error || 'API quota exceeded')
        }
        throw new Error(result.error || 'Failed to generate')
      }
      const gen = result.dashboard

      console.log('AIDashboards: AI generation response:', { cardCount: gen.cards?.length, cards: gen.cards })

      // Generate unique IDs with timestamp and random component to prevent collisions
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 9)
      const mapped: AICard[] = (gen.cards || []).map((c: any, idx: number) => ({
        id: `card-${timestamp}-${randomSuffix}-${idx}`,
        title: c.title || `Card ${idx + 1}`,
        viz_type: c.viz_type || selectedVizType || 'table',
        cypher: c.cypher || 'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count LIMIT 10',
        cypherAggregation: c.cypherAggregation,
        cypherGraph: c.cypherGraph,
        options: c.options || {},
        originalPrompt: prompt // Capture the original natural language prompt
      }))

      console.log('AIDashboards: Mapped cards:', { count: mapped.length, ids: mapped.map(c => c.id) })

      // Check if we're already in builder mode (adding another card)
      if (builderMode) {
        console.log('AIDashboards: Appending to existing builder cards', { existing: builderCards.length, new: mapped.length })
        // Append new cards to existing builder cards
        setBuilderCards(prev => {
          const updated = [...prev, ...mapped]
          console.log('AIDashboards: Builder cards updated', { previousCount: prev.length, newCount: updated.length, newIds: updated.map(c => c.id) })
          return updated
        })
      } else {
        console.log('AIDashboards: Entering builder mode with new cards', { count: mapped.length })
        // Enter builder mode with the first card
        setBuilderMode(true)
        setBuilderCards(mapped)
      }

      setApiKeyMissing(false) // Success, so API key is working
      onClose()

      toast({
        title: 'Dashboard card created',
        description: 'Add more cards or save your dashboard',
        status: 'success',
        duration: 3000
      })
    } catch (e: any) {
      const errorMsg = lastError || e.message
      toast({
        title: 'Generation failed',
        description: errorMsg,
        status: 'error',
        duration: 8000,
        isClosable: true
      })
    } finally {
      setLoading(false)
      console.log('AIDashboards: onCreate() completed')
    }
  }

  async function enhancePrompt() {
    if (!prompt || prompt.trim().length === 0) {
      return
    }

    try {
      setEnhancing(true)
      setLastError(null)

      const resp = await fetch('/api/ai-dashboards/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })

      const result = await resp.json()

      if (!resp.ok) {
        // Check for specific error types
        if (result.code === 'MISSING_API_KEY' || result.code === 'INVALID_API_KEY') {
          setApiKeyMissing(true)
          setLastError(result.details || 'API key configuration issue')
          throw new Error(result.error || 'AI service not configured')
        }
        if (result.code === 'QUOTA_EXCEEDED') {
          setLastError(result.details || 'API quota exceeded')
          throw new Error(result.error || 'API quota exceeded')
        }
        throw new Error(result.error || 'Failed to enhance prompt')
      }

      // Update prompt with enhanced version
      setPrompt(result.enhancedPrompt)
      setApiKeyMissing(false)

      toast({
        title: 'Prompt enhanced',
        description: 'Your prompt has been enhanced with schema-aware details',
        status: 'success',
        duration: 3000
      })
    } catch (e: any) {
      const errorMsg = lastError || e.message
      toast({
        title: 'Enhancement failed',
        description: errorMsg,
        status: 'error',
        duration: 8000,
        isClosable: true
      })
    } finally {
      setEnhancing(false)
    }
  }

  async function runCard(index: number) {
    try {
      const cardList = builderMode ? builderCards : cards
      const c = cardList[index]

      // Select the appropriate query based on visualization type
      let queryToExecute: string
      if (c.viz_type === 'mini-topology') {
        // For mini-topology, prefer cypherGraph, fallback to cypher
        queryToExecute = c.cypherGraph || c.cypher
        if (!c.cypherGraph && c.cypher) {
          console.warn(`Card "${c.title}": Using legacy cypher field for mini-topology. Consider migrating to cypherGraph.`)
        }
      } else {
        // For charts/tables, prefer cypherAggregation, fallback to cypher
        queryToExecute = c.cypherAggregation || c.cypher
        if (!c.cypherAggregation && c.cypher) {
          console.warn(`Card "${c.title}": Using legacy cypher field for ${c.viz_type}. Consider migrating to cypherAggregation.`)
        }
      }

      if (!queryToExecute) {
        throw new Error(`No ${c.viz_type === 'mini-topology' ? 'graph' : 'aggregation'} query available for this visualization type`)
      }

      const resp = await fetch('/api/ai-dashboards/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cypher: queryToExecute })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Query failed')

      if (builderMode) {
        const updated = [...builderCards]
        updated[index] = { ...c, data: data }
        setBuilderCards(updated)
      } else {
        const updated = [...cards]
        updated[index] = { ...c, data: data }
        setCards(updated)
      }
    } catch (e: any) {
      toast({ title: 'Query error', description: e.message, status: 'error' })
    }
  }

  async function addAnotherCard() {
    // Reset prompt and reopen modal to add another card
    setPrompt('')
    onOpen()
  }

  function removeBuilderCard(cardId: string) {
    setBuilderCards(prev => prev.filter(c => c.id !== cardId))
  }

  function moveBuilderCard(cardId: string, direction: 'up' | 'down') {
    setBuilderCards(prev => {
      const idx = prev.findIndex(c => c.id === cardId)
      if (idx === -1) return prev
      if (direction === 'up' && idx === 0) return prev
      if (direction === 'down' && idx === prev.length - 1) return prev

      const newCards = [...prev]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      ;[newCards[idx], newCards[targetIdx]] = [newCards[targetIdx], newCards[idx]]
      return newCards
    })
  }

  function updateBuilderCardVizType(cardId: string, vizType: 'table' | 'bar' | 'pie' | 'line' | 'mini-topology') {
    setBuilderCards(prev => prev.map(c => {
      if (c.id !== cardId) return c

      // Check if the appropriate query exists for the new viz type
      const needsGraph = vizType === 'mini-topology'
      const needsAggregation = vizType !== 'mini-topology'

      if (needsGraph && !c.cypherGraph && !c.cypher) {
        toast({
          title: 'No graph query available',
          description: 'This card does not have a graph-returning query. The visualization may not work correctly.',
          status: 'warning',
          duration: 5000
        })
      } else if (needsAggregation && !c.cypherAggregation && !c.cypher) {
        toast({
          title: 'No aggregation query available',
          description: 'This card does not have an aggregation query. The visualization may not work correctly.',
          status: 'warning',
          duration: 5000
        })
      }

      return { ...c, viz_type: vizType }
    }))
  }

  function updateBuilderCardTitle(cardId: string, title: string) {
    setBuilderCards(prev => prev.map(c => c.id === cardId ? { ...c, title } : c))
  }

  async function saveDashboardFromBuilder() {
    try {
      setSaving(true)
      const resp = await fetch('/api/ai-dashboards', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName || 'AI Dashboard', prompt, cards: builderCards })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Save failed')
      setCurrentDashboardId(data.dashboard.id)
      setCards(builderCards)
      setBuilderMode(false)
      setBuilderCards([])
      setIsSaveOpen(false)
      toast({ title: 'Saved', description: 'Dashboard saved successfully', status: 'success' })
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function saveDashboard() {
    try {
      setSaving(true)
      const resp = await fetch('/api/ai-dashboards', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName || 'AI Dashboard', prompt, cards })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Save failed')
      setCurrentDashboardId(data.dashboard.id)
      setIsSaveOpen(false)
      toast({ title: 'Saved', description: 'Dashboard saved', status: 'success' })
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function loadDashboards() {
    const resp = await fetch('/api/ai-dashboards')
    const data = await resp.json()
    setDashboardList(data.dashboards || [])
  }

  async function loadDashboard(id: number) {
    const resp = await fetch(`/api/ai-dashboards/${id}`)
    const data = await resp.json()
    const mapped: AICard[] = (data.cards || []).map((c: any) => ({
      id: `card-${c.id}`,
      title: c.title,
      viz_type: c.viz_type,
      cypher: c.cypher,
      cypherAggregation: c.cypher_aggregation,
      cypherGraph: c.cypher_graph,
      options: c.options,
      originalPrompt: c.original_prompt // Load the original prompt from database
    }))
    setCards(mapped)
    setCurrentDashboardId(id)
    setIsLoadOpen(false)
  }

  return (
    <Box minH="100%" w="100%">
      {/* Header row */}
      <HStack justify="space-between" mb={3}>
        <Text fontSize="lg" fontWeight="semibold">AI Dashboards</Text>
        <HStack>
          <Button onClick={() => { setIsLoadOpen(true); loadDashboards() }} size="sm" variant="outline">Load</Button>
          <Button onClick={() => setIsSaveOpen(true)} size="sm" variant="outline">Save</Button>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
            size="sm"
            isDisabled={apiKeyMissing}
          >
            Create with AI
          </Button>
        </HStack>
      </HStack>

      <Text fontSize="sm" color={subtle} mb={4}>
        Describe the dashboard you want in natural language. Prompts are converted to Cypher-backed cards using Gemini, mirroring Neo4j Aura AI Dashboards.
      </Text>

      {/* API Key Missing Warning */}
      {apiKeyMissing && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>AI Service Not Configured</AlertTitle>
            <AlertDescription>
              <VStack align="start" spacing={2}>
                <Text>
                  To use AI-powered dashboard generation, add your OpenAI API key to your environment:
                </Text>
                <Code p={2} borderRadius="md" fontSize="sm">
                  OPENAI_API_KEY=your_api_key_here
                </Code>
                <Text fontSize="sm">
                  Add this to your <Code>.env.local</Code> file and restart the development server.{' '}
                  <Link href="https://platform.openai.com/api-keys" isExternal color="blue.500">
                    Get an API key →
                  </Link>
                </Text>
              </VStack>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Builder Mode Banner */}
      {builderMode && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Dashboard Builder Mode</AlertTitle>
            <AlertDescription>
              Add more cards to your dashboard or save it when you&apos;re done.
            </AlertDescription>
          </Box>
          <HStack>
            <Button size="sm" colorScheme="blue" leftIcon={<AddIcon />} onClick={addAnotherCard}>
              Add Another Card
            </Button>
            <Button size="sm" colorScheme="green" onClick={() => setIsSaveOpen(true)}>
              Save Dashboard
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setBuilderMode(false)
              setBuilderCards([])
            }}>
              Cancel
            </Button>
          </HStack>
        </Alert>
      )}

      {/* Content area */}
      {!builderMode && cards.length === 0 ? (
          <Box bg={bg} borderRadius="md" border="1px solid" borderColor={border} p={6} display="flex" alignItems="center" justifyContent="center" minHeight="300px">
            <VStack spacing={4}>
              <Text color={subtle}>No AI dashboard yet.</Text>
              <Button
                colorScheme="blue"
                onClick={onOpen}
                isDisabled={apiKeyMissing}
              >
                Create with AI
              </Button>
              {apiKeyMissing && (
                <Text fontSize="sm" color="orange.500" textAlign="center">
                  <WarningIcon mr={1} />
                  Configure OpenAI API key to enable AI generation
                </Text>
              )}
            </VStack>
          </Box>
        ) : builderMode ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} pb={4}>
          {builderCards.map((card, idx) => (
            <Card key={card.id} variant="outline" borderColor="blue.300" borderWidth="2px">
              <CardHeader>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between" align="center">
                    <Editable
                      value={card.title}
                      onChange={(value) => updateBuilderCardTitle(card.id, value)}
                      fontSize="md"
                      fontWeight="semibold"
                      flex={1}
                      placeholder="Enter card title..."
                    >
                      <Tooltip label="Click to edit title" placement="top" hasArrow>
                        <EditablePreview
                          cursor="pointer"
                          _hover={{
                            bg: editableHoverBg,
                            borderRadius: 'md',
                            px: 2
                          }}
                          px={2}
                          py={1}
                        />
                      </Tooltip>
                      <EditableInput px={2} py={1} />
                    </Editable>
                    {card.originalPrompt && (
                      <HStack spacing={0}>
                        <Tooltip
                          label={
                            <Box>
                              <Text fontWeight="bold" mb={1}>Generated from prompt:</Text>
                              <Text fontSize="sm">{card.originalPrompt}</Text>
                            </Box>
                          }
                          placement="top"
                          hasArrow
                        >
                          <IconButton
                            aria-label="View original prompt"
                            icon={<InfoIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                          />
                        </Tooltip>
                        <Tooltip label="Copy prompt to clipboard" placement="top">
                          <IconButton
                            aria-label="Copy prompt to clipboard"
                            icon={<CopyIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => copyToClipboard(card.originalPrompt!)}
                          />
                        </Tooltip>
                      </HStack>
                    )}
                    <HStack spacing={1}>
                      <Tooltip label="Move up">
                        <IconButton
                          aria-label="Move up"
                          icon={<ChevronUpIcon />}
                          size="xs"
                          onClick={() => moveBuilderCard(card.id, 'up')}
                          isDisabled={idx === 0}
                        />
                      </Tooltip>
                      <Tooltip label="Move down">
                        <IconButton
                          aria-label="Move down"
                          icon={<ChevronDownIcon />}
                          size="xs"
                          onClick={() => moveBuilderCard(card.id, 'down')}
                          isDisabled={idx === builderCards.length - 1}
                        />
                      </Tooltip>
                      <Tooltip label="Remove card">
                        <IconButton
                          aria-label="Remove"
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          onClick={() => removeBuilderCard(card.id)}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                  <HStack>
                    <Select
                      size="sm"
                      value={card.viz_type}
                      onChange={(e) => updateBuilderCardVizType(card.id, e.target.value as any)}
                      width="150px"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="table">Table</option>
                      <option value="line">Line Chart</option>
                      <option value="mini-topology">Mini Topology</option>
                    </Select>
                    <Badge>Cypher</Badge>
                    <Button size="xs" onClick={() => runCard(idx)}>Run</Button>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    {card.data ? (
                      <ChartPreview card={card} nodes={nodes} edges={edges} />
                    ) : (
                      <Text fontSize="sm" color={subtle}>Click Run to preview results.</Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={subtle} mb={1}>
                      Edit Cypher {card.viz_type === 'mini-topology' ? '(Graph Query)' : '(Aggregation Query)'}
                    </Text>
                    <Input
                      value={card.viz_type === 'mini-topology' ? (card.cypherGraph || card.cypher) : (card.cypherAggregation || card.cypher)}
                      onChange={(e) => {
                        const v = e.target.value
                        setBuilderCards(prev => prev.map((c) => {
                          if (c.id !== card.id) return c
                          // Update the appropriate query field based on viz_type
                          if (c.viz_type === 'mini-topology') {
                            return { ...c, cypherGraph: v, cypher: v } // Update both for backward compatibility
                          } else {
                            return { ...c, cypherAggregation: v, cypher: v } // Update both for backward compatibility
                          }
                        }))
                      }}
                      size="sm"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} pb={4}>
            {cards.map((card, idx) => (
              <Card key={card.id} variant="outline">
                <CardHeader>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Text fontWeight="semibold">{card.title}</Text>
                        {card.originalPrompt && (
                          <HStack spacing={0}>
                            <Tooltip
                              label={
                                <Box>
                                  <Text fontWeight="bold" mb={1}>Generated from prompt:</Text>
                                  <Text fontSize="sm">{card.originalPrompt}</Text>
                                </Box>
                              }
                              placement="top"
                              hasArrow
                            >
                              <IconButton
                                aria-label="View original prompt"
                                icon={<InfoIcon />}
                                size="xs"
                                variant="ghost"
                                colorScheme="blue"
                              />
                            </Tooltip>
                            <Tooltip label="Copy prompt to clipboard" placement="top">
                              <IconButton
                                aria-label="Copy prompt to clipboard"
                                icon={<CopyIcon />}
                                size="xs"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => copyToClipboard(card.originalPrompt!)}
                              />
                            </Tooltip>
                          </HStack>
                        )}
                      </HStack>
                      <HStack>
                        <Badge>{card.viz_type}</Badge>
                        <Badge>Cypher</Badge>
                      </HStack>
                    </VStack>
                    <Button size="xs" onClick={() => runCard(idx)}>Run</Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      {card.data ? (
                        <ChartPreview card={card} nodes={nodes} edges={edges} />
                      ) : (
                        <Text fontSize="sm" color={subtle}>Click Run to preview results.</Text>
                      )}
                    </Box>

                    {/* Inline editor for a card's Cypher */}
                    <Box>
                      <Text fontSize="xs" color={subtle} mb={1}>
                        Edit Cypher {card.viz_type === 'mini-topology' ? '(Graph Query)' : '(Aggregation Query)'}
                      </Text>
                      <Input
                        value={card.viz_type === 'mini-topology' ? (card.cypherGraph || card.cypher) : (card.cypherAggregation || card.cypher)}
                        onChange={(e) => {
                          const v = e.target.value
                          setCards(prev => prev.map((c, i) => {
                            if (i !== idx) return c
                            // Update the appropriate query field based on viz_type
                            if (c.viz_type === 'mini-topology') {
                              return { ...c, cypherGraph: v, cypher: v } // Update both for backward compatibility
                            } else {
                              return { ...c, cypherAggregation: v, cypher: v } // Update both for backward compatibility
                            }
                          }))
                        }}
                        size="sm"
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

      {/* Create with AI modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create with AI</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color={subtle}>
                Neo4j AI will generate a dashboard for your graph. Guide it with a prompt, or receive a generic dashboard based on your database schema.
              </Text>

              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Natural language</Tab>
                  <Tab>Cypher</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <VStack align="stretch" spacing={2}>
                      <Textarea
                        placeholder="Optional: Describe a focus, e.g., 'product sales in the last 30 days'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                      />
                      <HStack justify="flex-end">
                        <Tooltip
                          label="Use AI to enhance your prompt with schema-aware details"
                          placement="top"
                        >
                          <Button
                            size="sm"
                            leftIcon={enhancing ? <Spinner size="xs" /> : <StarIcon />}
                            onClick={enhancePrompt}
                            isDisabled={!prompt || prompt.trim().length === 0 || enhancing}
                            isLoading={enhancing}
                            colorScheme="purple"
                            variant="outline"
                          >
                            {enhancing ? 'Enhancing...' : 'Enhance Prompt'}
                          </Button>
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </TabPanel>
                  <TabPanel px={0}>
                    <Text fontSize="sm" color={subtle} mb={2}>Paste or craft a Cypher query that should power a card.</Text>
                    <Textarea rows={6} placeholder="MATCH (n) RETURN count(n) AS NodeCount" />
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Divider />

              <Box>
                <Text fontSize="sm" mb={2} fontWeight="semibold">Suggested prompts</Text>
                <Text fontSize="xs" color={subtle} mb={3}>
                  Click a suggestion to use it, and select a visualization type before creating
                </Text>
                <VStack align="stretch" spacing={2}>
                  {suggestions.map((sp) => (
                    <HStack key={sp} spacing={2} p={2} borderRadius="md" border="1px solid" borderColor={border}>
                      <Tag
                        onClick={() => setPrompt(sp)}
                        cursor="pointer"
                        colorScheme="blue"
                        variant="subtle"
                        flex={1}
                        size="md"
                      >
                        {sp}
                      </Tag>
                      <Select
                        size="sm"
                        width="180px"
                        value={selectedVizTypes[sp] || 'bar'}
                        onChange={(e) => {
                          const newType = e.target.value as 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
                          setSelectedVizTypes(prev => ({ ...prev, [sp]: newType }))
                          // If this suggestion is currently selected, update the prompt's viz type too
                          if (prompt === sp) {
                            setSelectedVizTypes(prev => ({ ...prev, [prompt]: newType }))
                          }
                        }}
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="table">Table</option>
                        <option value="line">Line Chart</option>
                        <option value="mini-topology">Mini Topology</option>
                      </Select>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {prompt && (
                <Box p={3} bg={selectedPromptBg} borderRadius="md">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="semibold">Selected prompt:</Text>
                      <Text fontSize="sm">{prompt}</Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="xs" color={subtle}>Visualization:</Text>
                      <Select
                        size="sm"
                        width="150px"
                        value={selectedVizTypes[prompt] || 'bar'}
                        onChange={(e) => {
                          const newType = e.target.value as 'table' | 'bar' | 'pie' | 'line' | 'mini-topology'
                          setSelectedVizTypes(prev => ({ ...prev, [prompt]: newType }))
                        }}
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="table">Table</option>
                        <option value="line">Line Chart</option>
                        <option value="mini-topology">Mini Topology</option>
                      </Select>
                    </VStack>
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <VStack spacing={2} align="stretch">
              {apiKeyMissing && (
                <Alert status="error" size="sm" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    OpenAI API key required. Add OPENAI_API_KEY to your .env.local file.
                  </AlertDescription>
                </Alert>
              )}
              <HStack spacing={3} justify="space-between">
                <Text fontSize="xs" color={subtle}>AI can make mistakes — validate and refine your dashboard after it is created.</Text>
                <HStack spacing={2}>
                  <Button variant="ghost" onClick={onClose} isDisabled={loading}>Cancel</Button>
                  <Button
                    colorScheme="blue"
                    onClick={onCreate}
                    isLoading={loading}
                    isDisabled={!prompt.trim() || apiKeyMissing || loading}
                    loadingText="Creating..."
                  >
                    Create
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Save modal */}
      <Modal isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Dashboard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              {builderMode && (
                <Alert status="info" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Saving {builderCards.length} card{builderCards.length !== 1 ? 's' : ''} to your dashboard
                  </Text>
                </Alert>
              )}
              <InputGroup>
                <Input placeholder="Dashboard Name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={builderMode ? saveDashboardFromBuilder : saveDashboard}
                    isLoading={saving}
                  >
                    Save
                  </Button>
                </InputRightElement>
              </InputGroup>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Load modal */}
      <Modal isOpen={isLoadOpen} onClose={() => setIsLoadOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Load Dashboard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={2}>
              {dashboardList.map(d => (
                <HStack key={d.id} justify="space-between" borderBottom="1px solid" borderColor={border} py={2}>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{d.name || 'Untitled'}</Text>
                    <Text fontSize="xs" color={subtle}>{d.prompt?.slice(0, 100)}</Text>
                  </VStack>
                  <Button size="sm" onClick={() => loadDashboard(d.id)}>Load</Button>
                </HStack>
              ))}
              {dashboardList.length === 0 && <Text color={subtle}>No saved dashboards yet.</Text>}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// Mini Topology Component for graph visualization
function MiniTopology({ data, graphData, nodes, edges }: {
  data: any[],
  graphData?: { nodes: any[], edges: any[] },
  nodes?: any[],
  edges?: any[]
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const cyRef = React.useRef<any>(null)
  const bg = useColorModeValue('#ffffff', '#1a202c')
  const nodeBg = useColorModeValue('#3182ce', '#63b3ed')
  const edgeColor = useColorModeValue('#718096', '#a0aec0')
  const subtle = useColorModeValue('gray.600', 'gray.400')

  useEffect(() => {
    if (!containerRef.current) return

    // Priority 1: Use graphData from API response (for queries that return nodes/relationships)
    let graphNodes: any[] = []
    let graphEdges: any[] = []

    if (graphData && graphData.nodes && graphData.nodes.length > 0) {
      console.log('MiniTopology: Using graphData from API', graphData)

      // Create a Set of valid node IDs for fast lookup
      // IMPORTANT: We need to track BOTH the actual Cytoscape ID and all possible source IDs
      const validNodeIds = new Set<string>()
      const nodeIdMapping = new Map<string, string>() // Maps source ID formats to Cytoscape ID

      // Convert API graph data to Cytoscape format
      graphNodes = graphData.nodes.map((node: any) => {
        // Determine the Cytoscape ID (same logic as before)
        const cytoscapeId = node.id || node.elementId || `node-${Math.random()}`

        // Add the Cytoscape ID to valid IDs
        validNodeIds.add(cytoscapeId)

        // Also add all possible ID formats that might be used in edge source/target
        // and map them to the Cytoscape ID
        if (node.id) {
          validNodeIds.add(node.id)
          nodeIdMapping.set(node.id, cytoscapeId)
        }
        if (node.elementId) {
          validNodeIds.add(node.elementId)
          nodeIdMapping.set(node.elementId, cytoscapeId)
        }
        if (node.properties?.uid) {
          validNodeIds.add(node.properties.uid)
          nodeIdMapping.set(node.properties.uid, cytoscapeId)
        }

        return {
          data: {
            id: cytoscapeId,
            label: node.properties?.showname || node.properties?.name || node.id || 'Node',
            type: node.labels?.[0] || 'Node',
            ...node.properties
          }
        }
      })

      console.log('MiniTopology: Valid node IDs:', Array.from(validNodeIds).slice(0, 5), '... (total:', validNodeIds.size, ')')
      console.log('MiniTopology: Node ID mapping sample:', Array.from(nodeIdMapping.entries()).slice(0, 3))

      // Filter edges to only include those with valid source and target nodes
      // IMPORTANT: Map edge source/target IDs to Cytoscape node IDs
      const allEdges = (graphData.edges || []).map((edge: any, idx: number) => {
        // Map source and target to Cytoscape IDs if they exist in the mapping
        const mappedSource = nodeIdMapping.get(edge.source) || edge.source
        const mappedTarget = nodeIdMapping.get(edge.target) || edge.target

        return {
          data: {
            id: edge.id || `edge-${idx}`,
            source: mappedSource,
            target: mappedTarget,
            label: edge.type || 'RELATED',
            ...edge.properties
          }
        }
      })

      // Debug: Log first edge to see ID format
      if (allEdges.length > 0) {
        console.log('MiniTopology: Sample edge:', allEdges[0].data)
        console.log('MiniTopology: Sample edge from API:', graphData.edges[0])
      }

      // Validate edges and filter out orphaned ones
      graphEdges = allEdges.filter(edge => {
        const hasValidSource = validNodeIds.has(edge.data.source)
        const hasValidTarget = validNodeIds.has(edge.data.target)

        if (!hasValidSource || !hasValidTarget) {
          console.warn(`MiniTopology: Filtering out orphaned edge ${edge.data.id}`, {
            source: edge.data.source,
            target: edge.data.target,
            hasValidSource,
            hasValidTarget,
            availableNodeIds: Array.from(validNodeIds).slice(0, 10)
          })
          return false
        }
        return true
      })

      console.log(`MiniTopology: Validated ${graphEdges.length}/${allEdges.length} edges`)
    } else {
      // Priority 2: Extract from raw query results (fallback)
      console.log('MiniTopology: Extracting from raw data', data)
      const nodeMap = new Map()
      const tempEdges: any[] = []

      data.forEach((row, idx) => {
        Object.values(row).forEach((value: any) => {
          // Check if value is a Neo4j node
          if (value && typeof value === 'object' && value.labels && value.properties) {
            const nodeId = value.id || value.elementId || value.properties.uid || `node-${idx}`
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, true)
              graphNodes.push({
                data: {
                  id: nodeId,
                  label: value.properties.showname || value.properties.name || nodeId,
                  type: value.labels[0] || 'Node',
                  ...value.properties
                }
              })
            }
          }
          // Check if value is a Neo4j relationship
          if (value && typeof value === 'object' && value.type && (value.source || value.start)) {
            const edgeId = value.id || value.elementId || `edge-${tempEdges.length}`
            const source = value.source || value.start
            const target = value.target || value.end

            if (source && target) {
              tempEdges.push({
                data: {
                  id: edgeId,
                  source: source,
                  target: target,
                  label: value.type,
                  ...value.properties
                }
              })
            }
          }
        })
      })

      // Validate edges against collected nodes
      const validNodeIds = new Set(graphNodes.map(n => n.data.id))
      graphEdges = tempEdges.filter(edge => {
        const hasValidSource = validNodeIds.has(edge.data.source)
        const hasValidTarget = validNodeIds.has(edge.data.target)

        if (!hasValidSource || !hasValidTarget) {
          console.warn(`MiniTopology: Filtering out orphaned edge ${edge.data.id}`, {
            source: edge.data.source,
            target: edge.data.target,
            hasValidSource,
            hasValidTarget
          })
          return false
        }
        return true
      })

      console.log(`MiniTopology: Validated ${graphEdges.length}/${tempEdges.length} edges from raw data`)

      // Priority 3: Create simple visualization from tabular data (last resort)
      if (graphNodes.length === 0 && data.length > 0) {
        console.log('MiniTopology: Creating simple visualization from tabular data')
        data.slice(0, 10).forEach((row, idx) => {
          const keys = Object.keys(row)
          if (keys.length >= 1) {
            const nodeId = `node-${idx}`
            graphNodes.push({
              data: {
                id: nodeId,
                label: String(row[keys[0]]).slice(0, 20),
                type: 'Data'
              }
            })
          }
        })
      }
    }

    console.log('MiniTopology: Final graph data', { nodes: graphNodes.length, edges: graphEdges.length })

    if (cyRef.current) {
      cyRef.current.destroy()
    }

    if (graphNodes.length === 0) {
      console.warn('MiniTopology: No nodes to display')
      return
    }

    try {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: [...graphNodes, ...graphEdges],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': nodeBg,
              'label': 'data(label)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'width': '30px',
              'height': '30px',
              'text-wrap': 'wrap',
              'text-max-width': '60px'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': edgeColor,
              'target-arrow-color': edgeColor,
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '8px',
              'text-rotation': 'autorotate',
              'color': edgeColor
            }
          }
        ],
        layout: {
          name: graphEdges.length > 0 ? 'cose' : 'circle',
          animate: false,
          padding: 10
        }
      })
    } catch (error) {
      console.error('MiniTopology: Failed to initialize Cytoscape', error)
      console.error('MiniTopology: Graph data that caused error:', {
        nodes: graphNodes,
        edges: graphEdges
      })
      // Don't throw - just log the error and leave the component empty
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
      }
    }
  }, [data, graphData, nodeBg, edgeColor])

  // Check if we have any data to display
  const hasData = (graphData && graphData.nodes && graphData.nodes.length > 0) ||
                  (data && data.length > 0)

  return (
    <Box position="relative" height="220px" width="100%">
      <Box
        ref={containerRef}
        height="100%"
        width="100%"
        bg={bg}
        borderRadius="md"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      />
      {!hasData && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
          color={subtle}
        >
          <Text fontSize="sm">No graph data available</Text>
          <Text fontSize="xs" mt={1}>Query must return nodes and relationships</Text>
        </Box>
      )}
    </Box>
  )
}

function ChartPreview({ card, nodes, edges }: { card: AICard, nodes?: any[], edges?: any[] }) {
  const subtle = useColorModeValue('gray.600', 'gray.300')

  // Ensure all data values are properly serialized for React rendering
  const rawData = card.data?.rows || []
  const data = rawData.map(row => {
    const serializedRow: Record<string, any> = {}
    Object.entries(row).forEach(([key, value]) => {
      // Convert any remaining Neo4j objects to primitive values
      if (value && typeof value === 'object' && 'low' in value && 'high' in value) {
        // Handle any remaining Neo4j Integer objects
        serializedRow[key] = typeof value.low === 'number' ? value.low : Number(value.low) || 0
      } else if (value && typeof value === 'object' && value.toString) {
        // Handle other Neo4j objects by converting to string
        serializedRow[key] = value.toString()
      } else {
        serializedRow[key] = value
      }
    })
    return serializedRow
  })

  const cols = card.data?.columns || (data.length > 0 ? Object.keys(data[0]) : [])

  // Mini Topology visualization
  if (card.viz_type === 'mini-topology') {
    return <MiniTopology data={rawData} graphData={card.data?.graphData} nodes={nodes} edges={edges} />
  }

  // Bar chart
  if (card.viz_type === 'bar' && cols.length >= 2) {
    const xKey = cols[0], yKey = cols[1]
    return (
      <Box height="220px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <RTooltip />
            <Bar dataKey={yKey} fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Pie chart
  if (card.viz_type === 'pie' && cols.length >= 2) {
    const nameKey = cols[0], valueKey = cols[1]
    return (
      <Box height="220px">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey={valueKey} data={data} nameKey={nameKey} outerRadius={80}>
              {data.map((_: any, i: number) => <Cell key={i} fill={['#3182ce','#63b3ed','#9ae6b4','#f6ad55','#fc8181'][i%5]} />)}
            </Pie>
            <RTooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Line chart
  if (card.viz_type === 'line' && cols.length >= 2) {
    const xKey = cols[0], yKey = cols[1]
    return (
      <Box height="220px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <RTooltip />
            <Line type="monotone" dataKey={yKey} stroke="#3182ce" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Table fallback
  return (
    <VStack align="stretch" spacing={1}>
      <HStack fontWeight="semibold">
        {cols.map(c => <Box key={c} flex={1}>{c}</Box>)}
      </HStack>
      {data.slice(0, 10).map((row: any, i: number) => (
        <HStack key={i}>
          {cols.map(c => {
            const value = row[c]
            // Ensure safe string conversion for React rendering
            const displayValue = value === null || value === undefined ? '' :
              typeof value === 'object' ? JSON.stringify(value) : String(value)
            return (
              <Box key={c} flex={1}>
                <Text fontSize="sm" color={subtle}>{displayValue}</Text>
              </Box>
            )
          })}
        </HStack>
      ))}
      {data.length === 0 && <Text fontSize="sm" color={subtle}>No data</Text>}
    </VStack>
  )
}

export default AIDashboardsView
