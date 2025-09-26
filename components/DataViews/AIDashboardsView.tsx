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
  InputRightElement
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
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
  const toast = useToast()

  const bg = useColorModeValue('white', 'gray.800')
  const subtle = useColorModeValue('gray.600', 'gray.300')
  const border = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // Load AI suggestions based on current graph
    fetch('/api/ai-dashboards/suggestions')
      .then(r => r.json())
      .then(d => setSuggestions(d.suggestions || []))
      .catch(() => setSuggestions([]))
  }, [])

  async function onCreate() {
    try {
      setLoading(true)
      const resp = await fetch('/api/ai-dashboards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const result = await resp.json()
      if (!resp.ok) throw new Error(result.error || 'Failed to generate')
      const gen = result.dashboard
      const mapped: AICard[] = (gen.cards || []).map((c: any, idx: number) => ({
        id: `card-${idx}`,
        title: c.title || `Card ${idx + 1}`,
        viz_type: c.viz_type || 'table',
        cypher: c.cypher || 'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS count LIMIT 10',
        options: c.options || {}
      }))
      setCards(mapped)
      onClose()
    } catch (e: any) {
      toast({ title: 'Generation failed', description: e.message, status: 'error' })
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
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen} size="sm">
            Create with AI
          </Button>
        </HStack>
      </HStack>

      <Text fontSize="sm" color={subtle} mb={4}>
        Describe the dashboard you want in natural language. This view ships with a local demo generator. In production, connect this UI to Neo4j Aura AI Dashboards to transform prompts into Cypher and visualizations.
      </Text>

      {/* Content area */}
      {cards.length === 0 ? (
        <Box flex="1" bg={bg} borderRadius="md" border="1px solid" borderColor={border} p={6} display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Text color={subtle}>No AI dashboard yet.</Text>
            <Button colorScheme="blue" onClick={onOpen}>Create with AI</Button>
          </VStack>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {cards.map(card => (
            <Card key={card.id} variant="outline">
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{card.title}</Text>
                    {card.description && (
                      <Text fontSize="sm" color={subtle}>{card.description}</Text>
                    )}
                  </VStack>
                  {card.cypher && (
                    <Badge colorScheme="teal">Cypher</Badge>
                  )}
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Box>{card.content}</Box>

                  {/* Inline editor for a card's Cypher placeholder */}
                  {card.cypher !== undefined && (
                    <Box>
                      <Text fontSize="xs" color={subtle} mb={1}>Edit Cypher (placeholder)</Text>
                      <Input
                        value={card.cypher}
                        onChange={(e) => {
                          const v = e.target.value
                          setCards(prev => prev.map(c => c.id === card.id ? { ...c, cypher: v } : c))
                        }}
                        size="sm"
                      />
                    </Box>
                  )}
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
                  {suggestedPrompts.map((sp) => (
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
            <HStack spacing={3}>
              <Text fontSize="xs" color={subtle}>AI can make mistakes — validate and refine your dashboard after it is created.</Text>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={onCreate}>Create</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AIDashboardsView

