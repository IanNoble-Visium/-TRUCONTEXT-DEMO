import { NextApiRequest, NextApiResponse } from 'next'
import { getAllGraphData } from '../../lib/neo4j'
import { saveDataset, getDatasetIdByName, initializeDatabase } from '../../lib/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Initialize database schema
    await initializeDatabase()

    const graphData = await getAllGraphData()

    // Check if 'default' dataset exists, if not create it
    const defaultDatasetId = await getDatasetIdByName('default')
    if (!defaultDatasetId && graphData.nodes.length > 0) {
      console.log('Creating default dataset for Neo4j data...')

      // Transform Cytoscape format to PostgreSQL format
      const transformedNodes = graphData.nodes.map((node: any) => ({
        uid: node.data.id,
        type: node.data.type,
        showname: node.data.label,
        properties: {
          ...node.data.properties,
          // Include other data properties as well
          timestamp: node.data.timestamp,
          latitude: node.data.latitude,
          longitude: node.data.longitude,
          color: node.data.color
        },
        icon: node.data.icon
      }))

      const transformedEdges = graphData.edges.map((edge: any) => ({
        from: edge.data.source,
        to: edge.data.target,
        type: edge.data.type,
        properties: {
          ...edge.data.properties,
          // Include other data properties as well
          timestamp: edge.data.timestamp
        }
      }))

      await saveDataset(
        'default',
        'Auto-created dataset for Neo4j data',
        transformedNodes,
        transformedEdges
      )
      console.log('Default dataset created successfully')
    }

    res.status(200).json({
      ...graphData,
      currentDatasetName: 'default' // Include dataset name for client-side storage
    })
  } catch (error) {
    console.error('Graph data error:', error)
    res.status(500).json({
      error: 'Failed to fetch graph data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}