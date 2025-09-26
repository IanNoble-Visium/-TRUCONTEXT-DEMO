import { Pool, PoolClient } from 'pg'

// PostgreSQL connection pool
let pool: Pool | null = null

// Initialize PostgreSQL connection pool
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required')
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    console.log('✅ PostgreSQL connection pool initialized')
  }

  return pool
}

// Get a database client from the pool
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

// Initialize database schema for icon mappings
export async function initializeDatabase(): Promise<void> {
  const client = await getClient()
  
  try {
    console.log('🔧 Initializing icon mapping database schema...')

    // Create icon_mappings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS icon_mappings (
        id SERIAL PRIMARY KEY,
        source_type VARCHAR(255) NOT NULL,
        target_type VARCHAR(255) NOT NULL,
        description TEXT,
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_type, priority)
      )
    `)

    // Create index for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_icon_mappings_source_active 
      ON icon_mappings(source_type, is_active, priority)
    `)

    // Create usage tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS icon_usage (
        id SERIAL PRIMARY KEY,
        source_type VARCHAR(255) NOT NULL,
        target_type VARCHAR(255) NOT NULL,
        context VARCHAR(255) DEFAULT 'unknown',
        component VARCHAR(255) DEFAULT 'unknown',
        usage_count INTEGER DEFAULT 1,
        first_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_type, target_type, context, component)
      )
    `)

    // Create index for usage queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_icon_usage_lookup 
      ON icon_usage(source_type, context, component, last_used)
    `)

    // Create validation results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS icon_validation (
        id SERIAL PRIMARY KEY,
        mapping_id INTEGER REFERENCES icon_mappings(id) ON DELETE CASCADE,
        is_valid BOOLEAN NOT NULL,
        error_message TEXT,
        checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create mapping chains table for cycle detection
    await client.query(`
      CREATE TABLE IF NOT EXISTS icon_mapping_chains (
        id SERIAL PRIMARY KEY,
        source_type VARCHAR(255) NOT NULL,
        resolved_type VARCHAR(255) NOT NULL,
        chain_path TEXT NOT NULL,
        has_cycle BOOLEAN DEFAULT false,
        chain_length INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_type)
      )
    `)

    // Create trigger to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_icon_mappings_updated_at ON icon_mappings
    `)

    await client.query(`
      CREATE TRIGGER update_icon_mappings_updated_at 
      BEFORE UPDATE ON icon_mappings 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    // Insert some default mappings if table is empty
    const { rows } = await client.query('SELECT COUNT(*) as count FROM icon_mappings')
    const count = parseInt(rows[0].count)

    if (count === 0) {
      console.log('📝 Inserting default icon mappings...')
      
      const defaultMappings = [
        ['threatactor', 'actor', 'Map threat actor to actor icon', 1],
        ['workstation', 'client', 'Map workstation to client icon', 1],
        ['cvssmetrics', 'cvsssmetrics', 'Fix CVSS metrics icon name', 1],
        ['server', 'server', 'Default server mapping', 1],
        ['database', 'database', 'Default database mapping', 1],
        ['network', 'network', 'Default network mapping', 1],
        ['user', 'user', 'Default user mapping', 1],
        ['application', 'application', 'Default application mapping', 1]
      ]

      for (const [source, target, description, priority] of defaultMappings) {
        await client.query(`
          INSERT INTO icon_mappings (source_type, target_type, description, priority, is_active)
          VALUES ($1, $2, $3, $4, true)
          ON CONFLICT (source_type, priority) DO NOTHING
        `, [source, target, description, priority])
      }

      console.log('✅ Default icon mappings inserted')
    }

    console.log('✅ Icon mapping database schema initialized successfully')

  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run database migrations
export async function runMigrations(): Promise<void> {
  const client = await getClient()
  
  try {
    console.log('🔄 Running database migrations...')

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS icon_mapping_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Migration 1: Add indexes if they don't exist
    const migration1 = 'add_performance_indexes_v1'
    const { rows: migration1Check } = await client.query(
      'SELECT COUNT(*) as count FROM icon_mapping_migrations WHERE migration_name = $1',
      [migration1]
    )

    if (parseInt(migration1Check[0].count) === 0) {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_icon_usage_stats 
        ON icon_usage(last_used DESC, usage_count DESC)
      `)
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_icon_validation_mapping 
        ON icon_validation(mapping_id, checked_at DESC)
      `)

      await client.query(
        'INSERT INTO icon_mapping_migrations (migration_name) VALUES ($1)',
        [migration1]
      )

      console.log('✅ Migration 1 completed: Performance indexes added')
    }

    console.log('✅ All migrations completed successfully')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
  }
}

// Create database backup (export data)
export async function createBackup(): Promise<any> {
  const client = await getClient()
  
  try {
    console.log('💾 Creating database backup...')

    const mappings = await client.query('SELECT * FROM icon_mappings ORDER BY id')
    const usage = await client.query('SELECT * FROM icon_usage ORDER BY last_used DESC')
    const validation = await client.query('SELECT * FROM icon_validation ORDER BY checked_at DESC')
    const chains = await client.query('SELECT * FROM icon_mapping_chains ORDER BY source_type')

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {
        icon_mappings: mappings.rows,
        icon_usage: usage.rows,
        icon_validation: validation.rows,
        icon_mapping_chains: chains.rows
      }
    }

    console.log('✅ Database backup created successfully')
    return backup

  } catch (error) {
    console.error('❌ Failed to create backup:', error)
    throw error
  } finally {
    client.release()
  }
}

// Close database connections
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('✅ PostgreSQL connection pool closed')
  }
}

// Health check
export async function healthCheck(): Promise<{ status: string; details: any }> {
  try {
    const client = await getClient()
    
    try {
      const start = Date.now()
      await client.query('SELECT 1')
      const responseTime = Date.now() - start

      const poolStats = {
        totalCount: pool?.totalCount || 0,
        idleCount: pool?.idleCount || 0,
        waitingCount: pool?.waitingCount || 0
      }

      client.release()

      return {
        status: 'healthy',
        details: {
          responseTime: `${responseTime}ms`,
          pool: poolStats,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      client.release()
      throw error
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
}
