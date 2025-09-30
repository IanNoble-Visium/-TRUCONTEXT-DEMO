/**
 * Migration script to add original_prompt column to ai_dashboard_cards table
 * 
 * This script adds the original_prompt column to existing databases
 * to support displaying the natural language prompt that generated each card.
 * 
 * Run with: npx ts-node scripts/migrate-add-original-prompt.ts
 */

import { getClient } from '../lib/postgres'

async function migrate() {
  const client = await getClient()
  
  try {
    console.log('Starting migration: Adding original_prompt column to ai_dashboard_cards...')
    
    // Check if column already exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ai_dashboard_cards' 
      AND column_name = 'original_prompt'
    `)
    
    if (checkResult.rows.length > 0) {
      console.log('✓ Column original_prompt already exists. No migration needed.')
      return
    }
    
    // Add the column
    await client.query(`
      ALTER TABLE ai_dashboard_cards 
      ADD COLUMN original_prompt TEXT
    `)
    
    console.log('✓ Successfully added original_prompt column to ai_dashboard_cards table')
    console.log('Migration complete!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

