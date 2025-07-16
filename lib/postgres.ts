import { Pool, PoolClient } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
  return pool
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

// Database schema interfaces
export interface DatasetRecord {
  id: number
  name: string
  description?: string
  created_at: Date
  updated_at: Date
  node_count: number
  edge_count: number
}

export interface NodeRecord {
  id: number
  dataset_id: number
  uid: string
  type: string
  showname: string
  properties: Record<string, any>
  icon?: string
}

export interface EdgeRecord {
  id: number
  dataset_id: number
  from_uid: string
  to_uid: string
  type: string
  properties: Record<string, any>
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const client = await getClient()
  
  try {
    // Create datasets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS datasets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        node_count INTEGER DEFAULT 0,
        edge_count INTEGER DEFAULT 0
      )
    `)

    // Create nodes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS nodes (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
        uid VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        showname VARCHAR(255) NOT NULL,
        properties JSONB DEFAULT '{}',
        icon VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(dataset_id, uid)
      )
    `)

    // Create edges table
    await client.query(`
      CREATE TABLE IF NOT EXISTS edges (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE,
        from_uid VARCHAR(255) NOT NULL,
        to_uid VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dataset_id, from_uid) REFERENCES nodes(dataset_id, uid),
        FOREIGN KEY (dataset_id, to_uid) REFERENCES nodes(dataset_id, uid)
      )
    `)

    // Add missing columns to existing tables (migration)
    try {
      await client.query(`
        ALTER TABLE nodes
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      `)
    } catch (error) {
      console.log('Nodes table columns already exist or migration not needed')
    }

    try {
      await client.query(`
        ALTER TABLE edges
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      `)
    } catch (error) {
      console.log('Edges table columns already exist or migration not needed')
    }

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nodes_dataset_id ON nodes(dataset_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nodes_uid ON nodes(uid)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_edges_dataset_id ON edges(dataset_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_edges_from_to ON edges(from_uid, to_uid)
    `)

    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Error initializing database schema:', error)
    throw error
  } finally {
    client.release()
  }
}

// Save dataset to PostgreSQL
export async function saveDataset(
  name: string,
  description: string | undefined,
  nodes: any[],
  edges: any[]
): Promise<DatasetRecord> {
  const client = await getClient()
  
  try {
    await client.query('BEGIN')

    // Insert or update dataset
    const datasetResult = await client.query(`
      INSERT INTO datasets (name, description, node_count, edge_count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) 
      DO UPDATE SET 
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP,
        node_count = EXCLUDED.node_count,
        edge_count = EXCLUDED.edge_count
      RETURNING *
    `, [name, description, nodes.length, edges.length])

    const dataset = datasetResult.rows[0] as DatasetRecord

    // Delete existing nodes and edges for this dataset
    await client.query('DELETE FROM edges WHERE dataset_id = $1', [dataset.id])
    await client.query('DELETE FROM nodes WHERE dataset_id = $1', [dataset.id])

    // Insert nodes
    for (const node of nodes) {
      await client.query(`
        INSERT INTO nodes (dataset_id, uid, type, showname, properties, icon)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        dataset.id,
        node.uid,
        node.type,
        node.showname,
        JSON.stringify(node.properties || {}),
        node.icon
      ])
    }

    // Insert edges
    for (const edge of edges) {
      await client.query(`
        INSERT INTO edges (dataset_id, from_uid, to_uid, type, properties)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        dataset.id,
        edge.from,
        edge.to,
        edge.type,
        JSON.stringify(edge.properties || {})
      ])
    }

    await client.query('COMMIT')
    return dataset
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error saving dataset:', error)
    throw error
  } finally {
    client.release()
  }
}

// Update node properties in PostgreSQL
export async function updateNodeProperties(
  datasetId: number,
  nodeUid: string,
  properties: Record<string, any>
): Promise<void> {
  const client = await getClient()

  try {
    await client.query(`
      UPDATE nodes
      SET properties = $1, updated_at = CURRENT_TIMESTAMP
      WHERE dataset_id = $2 AND uid = $3
    `, [JSON.stringify(properties), datasetId, nodeUid])
  } catch (error) {
    console.error('Error updating node properties:', error)
    throw error
  } finally {
    client.release()
  }
}

// Update edge properties in PostgreSQL
export async function updateEdgeProperties(
  datasetId: number,
  fromUid: string,
  toUid: string,
  properties: Record<string, any>
): Promise<void> {
  const client = await getClient()

  try {
    await client.query(`
      UPDATE edges
      SET properties = $1, updated_at = CURRENT_TIMESTAMP
      WHERE dataset_id = $2 AND from_uid = $3 AND to_uid = $4
    `, [JSON.stringify(properties), datasetId, fromUid, toUid])
  } catch (error) {
    console.error('Error updating edge properties:', error)
    throw error
  } finally {
    client.release()
  }
}

// Get current dataset ID by name (helper function)
export async function getDatasetIdByName(name: string): Promise<number | null> {
  const client = await getClient()

  try {
    const result = await client.query(`
      SELECT id FROM datasets WHERE name = $1
    `, [name])

    return result.rows.length > 0 ? result.rows[0].id : null
  } catch (error) {
    console.error('Error getting dataset ID:', error)
    throw error
  } finally {
    client.release()
  }
}

// Load dataset from PostgreSQL
export async function loadDataset(datasetId: number): Promise<{
  dataset: DatasetRecord
  nodes: any[]
  edges: any[]
}> {
  const client = await getClient()
  
  try {
    // Get dataset info
    const datasetResult = await client.query(
      'SELECT * FROM datasets WHERE id = $1',
      [datasetId]
    )
    
    if (datasetResult.rows.length === 0) {
      throw new Error(`Dataset with id ${datasetId} not found`)
    }
    
    const dataset = datasetResult.rows[0] as DatasetRecord

    // Get nodes
    const nodesResult = await client.query(
      'SELECT * FROM nodes WHERE dataset_id = $1 ORDER BY id',
      [datasetId]
    )
    
    const nodes = nodesResult.rows.map(row => ({
      uid: row.uid,
      type: row.type,
      showname: row.showname,
      properties: row.properties,
      icon: row.icon
    }))

    // Get edges
    const edgesResult = await client.query(
      'SELECT * FROM edges WHERE dataset_id = $1 ORDER BY id',
      [datasetId]
    )
    
    const edges = edgesResult.rows.map(row => ({
      from: row.from_uid,
      to: row.to_uid,
      type: row.type,
      properties: row.properties
    }))

    return { dataset, nodes, edges }
  } catch (error) {
    console.error('Error loading dataset:', error)
    throw error
  } finally {
    client.release()
  }
}

// List all datasets
export async function listDatasets(): Promise<DatasetRecord[]> {
  const client = await getClient()
  
  try {
    const result = await client.query(
      'SELECT * FROM datasets ORDER BY updated_at DESC'
    )
    
    return result.rows as DatasetRecord[]
  } catch (error) {
    console.error('Error listing datasets:', error)
    throw error
  } finally {
    client.release()
  }
}

// Delete dataset
export async function deleteDataset(datasetId: number): Promise<void> {
  const client = await getClient()
  
  try {
    const result = await client.query(
      'DELETE FROM datasets WHERE id = $1',
      [datasetId]
    )
    
    if (result.rowCount === 0) {
      throw new Error(`Dataset with id ${datasetId} not found`)
    }
  } catch (error) {
    console.error('Error deleting dataset:', error)
    throw error
  } finally {
    client.release()
  }
}
