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

    // AI Dashboards tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_dashboards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        prompt TEXT NOT NULL,
        dataset_id INTEGER REFERENCES datasets(id) ON DELETE SET NULL,
        metadata JSONB DEFAULT '{}',
        shared_slug VARCHAR(64) UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_dashboard_cards (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER REFERENCES ai_dashboards(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        viz_type VARCHAR(50) NOT NULL,
        cypher TEXT NOT NULL,
        cypher_aggregation TEXT,
        cypher_graph TEXT,
        options JSONB DEFAULT '{}',
        order_index INTEGER DEFAULT 0,
        original_prompt TEXT
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_cards_dashboard ON ai_dashboard_cards(dashboard_id, order_index)
    `)

    // Add new columns if they don't exist (for existing databases)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='ai_dashboard_cards' AND column_name='cypher_aggregation') THEN
          ALTER TABLE ai_dashboard_cards ADD COLUMN cypher_aggregation TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='ai_dashboard_cards' AND column_name='cypher_graph') THEN
          ALTER TABLE ai_dashboard_cards ADD COLUMN cypher_graph TEXT;
        END IF;
      END $$;
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
    const result = await client.query('SELECT * FROM datasets ORDER BY updated_at DESC')
    return result.rows as DatasetRecord[]
  } catch (error) {
    console.error('Error listing datasets:', error)
    throw error
  } finally {
    client.release()
  }
}


// ==== AI Dashboards Persistence ====
export interface AIDashboardRecord {
  id: number
  name?: string | null
  prompt: string
  dataset_id?: number | null
  metadata: Record<string, any>
  shared_slug?: string | null
  created_at: Date
  updated_at: Date
}

export interface AIDashboardCardRecord {
  id: number
  dashboard_id: number
  title: string
  viz_type: string
  cypher: string
  cypher_aggregation?: string
  cypher_graph?: string
  options: Record<string, any>
  order_index: number
  original_prompt?: string
}

function randomSlug(len = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function saveAIDashboard(
  name: string,
  prompt: string,
  cards: Array<{ title: string; viz_type: string; cypher: string; options?: any; originalPrompt?: string }>,
  datasetId?: number | null,
  metadata?: Record<string, any>
): Promise<AIDashboardRecord> {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const dashRes = await client.query(
      `INSERT INTO ai_dashboards (name, prompt, dataset_id, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, prompt, datasetId ?? null, JSON.stringify(metadata || {})]
    )
    const dashboard = dashRes.rows[0] as AIDashboardRecord

    let idx = 0
    for (const c of cards) {
      await client.query(
        `INSERT INTO ai_dashboard_cards (dashboard_id, title, viz_type, cypher, cypher_aggregation, cypher_graph, options, order_index, original_prompt)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          dashboard.id,
          c.title,
          c.viz_type,
          c.cypher,
          (c as any).cypherAggregation || null,
          (c as any).cypherGraph || null,
          JSON.stringify(c.options || {}),
          idx++,
          c.originalPrompt || null
        ]
      )
    }

    await client.query('COMMIT')
    return dashboard
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Error saving AI dashboard:', e)
    throw e
  } finally {
    client.release()
  }
}

export async function listAIDashboards(): Promise<AIDashboardRecord[]> {
  const client = await getClient()
  try {
    const res = await client.query('SELECT * FROM ai_dashboards ORDER BY updated_at DESC')
    return res.rows as AIDashboardRecord[]
  } finally {
    client.release()
  }
}

export async function getAIDashboard(id: number): Promise<{ dashboard: AIDashboardRecord; cards: AIDashboardCardRecord[] }> {
  const client = await getClient()
  try {
    const dres = await client.query('SELECT * FROM ai_dashboards WHERE id = $1', [id])
    if (dres.rows.length === 0) throw new Error('Dashboard not found')
    const cres = await client.query('SELECT * FROM ai_dashboard_cards WHERE dashboard_id = $1 ORDER BY order_index, id', [id])
    return { dashboard: dres.rows[0] as AIDashboardRecord, cards: cres.rows as AIDashboardCardRecord[] }
  } finally {
    client.release()
  }
}

export async function deleteAIDashboard(id: number): Promise<void> {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM ai_dashboard_cards WHERE dashboard_id = $1', [id])
    await client.query('DELETE FROM ai_dashboards WHERE id = $1', [id])
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function publishAIDashboard(id: number): Promise<string> {
  const client = await getClient()
  try {
    const slug = randomSlug(24)
    const res = await client.query(
      `UPDATE ai_dashboards SET shared_slug = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING shared_slug`,
      [slug, id]
    )
    if (res.rows.length === 0) throw new Error('Dashboard not found')
    return res.rows[0].shared_slug as string
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
