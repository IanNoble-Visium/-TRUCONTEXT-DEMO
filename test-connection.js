require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

async function testConnection() {
  console.log('🔗 Testing PostgreSQL Connection...')
  
  const connectionString = process.env.POSTGRES_URL
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found in environment variables')
    return
  }
  
  console.log('📡 Connection string found, attempting connection...')
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5000,
  })
  
  try {
    const client = await pool.connect()
    console.log('✅ Successfully connected to PostgreSQL!')
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version')
    console.log('⏰ Database time:', result.rows[0].current_time)
    console.log('🗄️ PostgreSQL version:', result.rows[0].pg_version.split(' ')[0])
    
    client.release()
    await pool.end()
    
    console.log('🎉 Connection test successful!')
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testConnection()
