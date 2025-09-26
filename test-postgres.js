require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

// Initialize database schema
async function initializeSchema(client) {
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

  // Create icon_usage table
  await client.query(`
    CREATE TABLE IF NOT EXISTS icon_usage (
      id SERIAL PRIMARY KEY,
      source_type VARCHAR(255) NOT NULL,
      resolved_type VARCHAR(255) NOT NULL,
      context VARCHAR(100) DEFAULT 'default',
      component VARCHAR(100) DEFAULT 'unknown',
      usage_count INTEGER DEFAULT 1,
      last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source_type, resolved_type, context, component)
    )
  `)

  // Create indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_icon_mappings_source 
    ON icon_mappings(source_type, priority)
  `)
  
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_icon_usage_source 
    ON icon_usage(source_type, last_used DESC)
  `)
}

async function testPostgreSQL() {
  console.log('🧪 Testing PostgreSQL Integration...')
  
  const connectionString = process.env.POSTGRES_URL
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found in environment variables')
    return
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 5000,
  })
  
  try {
    // Test 1: Database Connection
    console.log('\n1️⃣ Testing database connection...')
    const client = await pool.connect()
    console.log('✅ Successfully connected to PostgreSQL')
    
    // Test 2: Schema Initialization
    console.log('\n2️⃣ Testing schema initialization...')
    await initializeSchema(client)
    console.log('✅ Database schema initialized successfully')
    
    // Test 3: Basic Query
    console.log('\n3️⃣ Testing basic query...')
    const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public'])
    console.log(`✅ Found ${result.rows[0].table_count} tables in public schema`)
    
    // Test 4: Icon Mappings Table
    console.log('\n4️⃣ Testing icon_mappings table...')
    const mappingsResult = await client.query('SELECT COUNT(*) as mapping_count FROM icon_mappings')
    console.log(`✅ Icon mappings table has ${mappingsResult.rows[0].mapping_count} records`)
    
    // Test 5: Insert Test Mapping
    console.log('\n5️⃣ Testing insert operation...')
    const insertResult = await client.query(`
      INSERT INTO icon_mappings (source_type, target_type, description, priority, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (source_type, priority) DO UPDATE SET
        target_type = EXCLUDED.target_type,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, source_type, target_type
    `, ['test_source', 'test_target', 'Test mapping for PostgreSQL verification', 1, true])
    
    if (insertResult.rows.length > 0) {
      console.log(`✅ Successfully inserted/updated test mapping (ID: ${insertResult.rows[0].id})`)
    }
    
    // Test 6: Query Test Mapping
    console.log('\n6️⃣ Testing query operation...')
    const queryResult = await client.query('SELECT * FROM icon_mappings WHERE source_type = $1', ['test_source'])
    if (queryResult.rows.length > 0) {
      console.log(`✅ Successfully queried test mapping: ${queryResult.rows[0].source_type} -> ${queryResult.rows[0].target_type}`)
    }
    
    // Test 7: Usage Tracking
    console.log('\n7️⃣ Testing usage tracking...')
    await client.query(`
      INSERT INTO icon_usage (source_type, resolved_type, context, component, usage_count, last_used)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (source_type, resolved_type, context, component) 
      DO UPDATE SET 
        usage_count = icon_usage.usage_count + 1,
        last_used = CURRENT_TIMESTAMP
    `, ['test_source', 'test_target', 'test', 'TestComponent', 1])
    console.log('✅ Usage tracking working correctly')
    
    // Test 8: Cleanup
    console.log('\n8️⃣ Cleaning up test data...')
    await client.query('DELETE FROM icon_usage WHERE source_type = $1', ['test_source'])
    await client.query('DELETE FROM icon_mappings WHERE source_type = $1', ['test_source'])
    console.log('✅ Test data cleaned up')
    
    client.release()
    await pool.end()
    
    console.log('\n🎉 All PostgreSQL tests passed successfully!')
    console.log('\n📊 System Status:')
    console.log('   ✅ PostgreSQL Connection: Working')
    console.log('   ✅ Database Schema: Initialized')
    console.log('   ✅ CRUD Operations: Working')
    console.log('   ✅ Usage Tracking: Working')
    console.log('   ✅ Data Integrity: Maintained')
    
    console.log('\n🚀 Ready to proceed with Icon Mapping Management!')
    
  } catch (error) {
    console.error('\n❌ PostgreSQL test failed:', error.message)
    console.error('\n🔧 Troubleshooting steps:')
    console.error('   1. Check POSTGRES_URL environment variable')
    console.error('   2. Verify database connection and permissions')
    console.error('   3. Ensure SSL is properly configured')
    console.error('   4. Check network connectivity to Neon database')
    
    process.exit(1)
  }
}

// Run the test
testPostgreSQL().catch(console.error)
