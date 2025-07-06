import neo4j, { Driver, Session } from 'neo4j-driver'

let driver: Driver | null = null

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI || '',
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME || '',
        process.env.NEO4J_PASSWORD || ''
      )
    )
  }
  return driver
}

export async function getSession(): Promise<Session> {
  const driver = getDriver()
  return driver.session({ database: process.env.NEO4J_DATABASE })
}

export async function clearDatabase(): Promise<void> {
  const session = await getSession()
  try {
    await session.run('MATCH (n) DETACH DELETE n')
  } finally {
    await session.close()
  }
}

export interface NodeData {
  uid: string
  type: string
  showname: string
  properties: Record<string, any>
  icon?: string
}

export interface EdgeData {
  from: string
  to: string
  type: string
  properties: Record<string, any>
}

export interface StoredQuery {
  query: string
  lang: string
  description: string
}

export interface DatasetStructure {
  nodes: NodeData[]
  edges: EdgeData[]
  storedQueries: StoredQuery[]
}

export function addMissingProperties(data: DatasetStructure): DatasetStructure {
  const timeRange = {
    start: new Date('2023-12-30T00:00:00.000Z').getTime(),
    end: new Date('2023-12-31T23:59:59.999Z').getTime()
  }

  // Process nodes
  const processedNodes = data.nodes.map(node => {
    const updatedProperties = { ...node.properties }
    
    // Add timestamp if missing
    if (!updatedProperties.timestamp) {
      const randomTime = Math.floor(Math.random() * (timeRange.end - timeRange.start)) + timeRange.start
      updatedProperties.timestamp = new Date(randomTime).toISOString()
    }
    
    // Add geolocation if missing
    if (!updatedProperties.longitude) {
      updatedProperties.longitude = Math.random() * 360 - 180 // -180 to 180
    }
    if (!updatedProperties.latitude) {
      updatedProperties.latitude = Math.random() * 180 - 90 // -90 to 90
    }
    
    return {
      ...node,
      properties: updatedProperties
    }
  })

  // Process edges
  const processedEdges = data.edges.map(edge => {
    const updatedProperties = { ...edge.properties }
    
    // Add timestamp if missing
    if (!updatedProperties.timestamp) {
      const randomTime = Math.floor(Math.random() * (timeRange.end - timeRange.start)) + timeRange.start
      updatedProperties.timestamp = new Date(randomTime).toISOString()
    }
    
    return {
      ...edge,
      properties: updatedProperties
    }
  })

  return {
    nodes: processedNodes,
    edges: processedEdges,
    storedQueries: data.storedQueries
  }
}

export async function importDataset(data: DatasetStructure): Promise<void> {
  const session = await getSession()
  
  try {
    // Import nodes
    for (const node of data.nodes) {
      const query = `
        CREATE (n:${node.type} {
          uid: $uid,
          showname: $showname,
          ${Object.keys(node.properties).map(key => `${key}: $${key}`).join(', ')}
        })
      `
      const parameters = {
        uid: node.uid,
        showname: node.showname,
        ...node.properties
      }
      await session.run(query, parameters)
    }

    // Import edges
    for (const edge of data.edges) {
      const query = `
        MATCH (from {uid: $from})
        MATCH (to {uid: $to})
        CREATE (from)-[r:${edge.type} {
          ${Object.keys(edge.properties).map(key => `${key}: $${key}`).join(', ')}
        }]->(to)
      `
      const parameters = {
        from: edge.from,
        to: edge.to,
        ...edge.properties
      }
      await session.run(query, parameters)
    }
  } finally {
    await session.close()
  }
}

export async function getAllGraphData(): Promise<{ nodes: any[], edges: any[] }> {
  const session = await getSession()
  
  try {
    const result = await session.run(`
      MATCH (n)-[r]->(m) 
      RETURN n, r, m
      UNION
      MATCH (n) WHERE NOT (n)--()
      RETURN n, null as r, null as m
    `)

    const nodes: any[] = []
    const edges: any[] = []
    const nodeIds = new Set()

    result.records.forEach(record => {
      const n = record.get('n')
      const r = record.get('r')
      const m = record.get('m')

      // Add source node
      if (n && !nodeIds.has(n.properties.uid)) {
        nodes.push({
          data: {
            id: n.properties.uid,
            label: n.properties.showname || n.properties.uid,
            type: n.labels[0],
            ...n.properties
          }
        })
        nodeIds.add(n.properties.uid)
      }

      // Add target node
      if (m && !nodeIds.has(m.properties.uid)) {
        nodes.push({
          data: {
            id: m.properties.uid,
            label: m.properties.showname || m.properties.uid,
            type: m.labels[0],
            ...m.properties
          }
        })
        nodeIds.add(m.properties.uid)
      }

      // Add edge
      if (r) {
        edges.push({
          data: {
            id: `${n.properties.uid}-${m.properties.uid}`,
            source: n.properties.uid,
            target: m.properties.uid,
            label: r.type,
            type: r.type,
            ...r.properties
          }
        })
      }
    })

    return { nodes, edges }
  } finally {
    await session.close()
  }
}

// Threat Path Calculation Functions

export interface ThreatPathNode {
  uid: string
  type: string
  showname: string
  properties: Record<string, any>
}

export interface ThreatPathEdge {
  from: string
  to: string
  type: string
  properties: Record<string, any>
}

export interface ThreatPathResult {
  nodes: ThreatPathNode[]
  edges: ThreatPathEdge[]
  pathLength: number
  pathExists: boolean
}

/**
 * Calculate the shortest path between two nodes using Neo4j
 * @param startNodeUid - UID of the starting node
 * @param endNodeUid - UID of the destination node
 * @returns Promise<ThreatPathResult> - The shortest path result
 */
export async function calculateShortestPath(
  startNodeUid: string,
  endNodeUid: string
): Promise<ThreatPathResult> {
  const session = await getSession()

  try {
    // Use Neo4j's shortestPath function to find the shortest path
    const result = await session.run(`
      MATCH (start {uid: $startUid}), (end {uid: $endUid})
      MATCH path = shortestPath((start)-[*]-(end))
      RETURN path
    `, {
      startUid: startNodeUid,
      endUid: endNodeUid
    })

    if (result.records.length === 0) {
      return {
        nodes: [],
        edges: [],
        pathLength: 0,
        pathExists: false
      }
    }

    const path = result.records[0].get('path')
    const nodes: ThreatPathNode[] = []
    const edges: ThreatPathEdge[] = []
    const nodeUids = new Set<string>()

    // Extract nodes from the path
    path.segments.forEach((segment: any) => {
      // Add start node if not already added
      if (!nodeUids.has(segment.start.properties.uid)) {
        nodes.push({
          uid: segment.start.properties.uid,
          type: segment.start.labels[0],
          showname: segment.start.properties.showname || segment.start.properties.uid,
          properties: segment.start.properties
        })
        nodeUids.add(segment.start.properties.uid)
      }

      // Add end node if not already added
      if (!nodeUids.has(segment.end.properties.uid)) {
        nodes.push({
          uid: segment.end.properties.uid,
          type: segment.end.labels[0],
          showname: segment.end.properties.showname || segment.end.properties.uid,
          properties: segment.end.properties
        })
        nodeUids.add(segment.end.properties.uid)
      }

      // Add edge
      edges.push({
        from: segment.start.properties.uid,
        to: segment.end.properties.uid,
        type: segment.relationship.type,
        properties: segment.relationship.properties
      })
    })

    return {
      nodes,
      edges,
      pathLength: path.length,
      pathExists: true
    }
  } finally {
    await session.close()
  }
}

/**
 * Get all available nodes for threat path selection
 * @returns Promise<Array<{uid: string, showname: string, type: string}>>
 */
export async function getAvailableNodes(): Promise<Array<{uid: string, showname: string, type: string}>> {
  const session = await getSession()

  try {
    const result = await session.run(`
      MATCH (n)
      RETURN n.uid as uid, n.showname as showname, labels(n)[0] as type
      ORDER BY n.showname, n.uid
    `)

    return result.records.map(record => ({
      uid: record.get('uid'),
      showname: record.get('showname') || record.get('uid'),
      type: record.get('type')
    }))
  } finally {
    await session.close()
  }
}