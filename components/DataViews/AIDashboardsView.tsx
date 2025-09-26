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
  Link
} from '@chakra-ui/react'
import { AddIcon, WarningIcon } from '@chakra-ui/icons'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, PieChart, Pie, Cell } from 'recharts'

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
  viz_type: 'table' | 'bar' | 'pie' | 'graph'
  cypher: string
  options?: any
  data?: { columns: string[]; rows: any[] }
}

const AIDashboardsView: React.FC<AIDashboardsViewProps> = ({ nodes, edges }) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const [prompt, setPrompt] = useState('')
  const [cards, setCards] = useState<AICard[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [saveName, setSaveName] = useState('')
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isLoadOpen, setIsLoadOpen] = useState(false)
  const [dashboardList, setDashboardList] = useState<any[]>([])
  const [currentDashboardId, setCurrentDashboardId] = useState<number | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const toast = useToast()

  const bg = useColorModeValue('white', 'gray.800')
  const subtle = useColorModeValue('gray.600', 'gray.300')
  const border = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // Load AI suggestions based on current graph
    fetch('/api/ai-dashboards/suggestions')
      .then(r => r.json())
      .then(d => {
        setSuggestions(d.suggestions || [])
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
    try {
      setLoading(true)
      setLastError(null)
      const resp = await fetch('/api/ai-dashboards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
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
      const mapped: AICard[] = (gen.cards || []).map((c: any, idx: number) => ({
        id: `card-${idx}`,
        title: c.title || `Card ${idx + 1}`,
        viz_type: c.viz_type || 'table',
        cypher: c.cypher || 'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count LIMIT 10',
        options: c.options || {}
      }))
      setCards(mapped)
      setApiKeyMissing(false) // Success, so API key is working
      onClose()
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
    }
  }

  async function runCard(index: number) {
    try {
      const c = cards[index]
      const resp = await fetch('/api/ai-dashboards/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cypher: c.cypher })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Query failed')
      const updated = [...cards]
      updated[index] = { ...c, data: data }
      setCards(updated)
    } catch (e: any) {
      toast({ title: 'Query error', description: e.message, status: 'error' })
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
      options: c.options
    }))
    setCards(mapped)
    setCurrentDashboardId(id)
    setIsLoadOpen(false)
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
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

      {/* Content area */}
      {cards.length === 0 ? (
        <Box flex="1" bg={bg} borderRadius="md" border="1px solid" borderColor={border} p={6} display="flex" alignItems="center" justifyContent="center">
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
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {cards.map((card, idx) => (
            <Card key={card.id} variant="outline">
              <CardHeader>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{card.title}</Text>
                    <HStack>
                      <Badge colorScheme="teal">{card.viz_type}</Badge>
                      <Badge>Cypher</Badge>
                    </HStack>
                  </VStack>
                  <HStack>
                    <Button size="xs" onClick={() => runCard(idx)}>Run</Button>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    {card.data ? (
                      <ChartPreview card={card} />
                    ) : (
                      <Text fontSize="sm" color={subtle}>Click Run to preview results.</Text>
                    )}
                  </Box>

                  {/* Inline editor for a card's Cypher */}
                  <Box>
                    <Text fontSize="xs" color={subtle} mb={1}>Edit Cypher</Text>
                    <Input
                      value={card.cypher}
                      onChange={(e) => {
                        const v = e.target.value
                        setCards(prev => prev.map((c, i) => i === idx ? { ...c, cypher: v } : c))
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
                    <Textarea
                      placeholder="Optional: Describe a focus, e.g., 'product sales in the last 30 days'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                    />
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
                <Wrap>
                  {suggestions.map((sp) => (
                    <WrapItem key={sp}>
                      <Tag
                        onClick={() => setPrompt(sp)}
                        cursor="pointer"
                        colorScheme="blue"
                        variant="subtle"
                      >
                        {sp}
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
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
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button
                    colorScheme="blue"
                    onClick={onCreate}
                    isLoading={loading}
                    isDisabled={!prompt.trim() || apiKeyMissing}
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
            <InputGroup>
              <Input placeholder="Name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={saveDashboard} isLoading={saving}>
                  Save
                </Button>
              </InputRightElement>
            </InputGroup>
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

function ChartPreview({ card }: { card: AICard }) {
  const subtle = useColorModeValue('gray.600', 'gray.300')
  const data = card.data?.rows || []
  const cols = card.data?.columns || (data.length > 0 ? Object.keys(data[0]) : [])
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
  // Table fallback
  return (
    <VStack align="stretch" spacing={1}>
      <HStack fontWeight="semibold">
        {cols.map(c => <Box key={c} flex={1}>{c}</Box>)}
      </HStack>
      {data.slice(0, 10).map((row: any, i: number) => (
        <HStack key={i}>
          {cols.map(c => <Box key={c} flex={1}><Text fontSize="sm" color={subtle}>{String(row[c])}</Text></Box>)}
        </HStack>
      ))}
      {data.length === 0 && <Text fontSize="sm" color={subtle}>No data</Text>}
    </VStack>
  )
}

export default AIDashboardsView
