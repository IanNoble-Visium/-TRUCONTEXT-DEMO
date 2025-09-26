#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Setting up Icon Mapping Management System...')

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('✅ Created data directory:', dataDir)
} else {
  console.log('✅ Data directory already exists:', dataDir)
}

// Check if SQLite dependencies are installed
try {
  require('sqlite')
  require('sqlite3')
  console.log('✅ SQLite dependencies are installed')
} catch (error) {
  console.log('❌ SQLite dependencies not found. Please run:')
  console.log('   npm install sqlite sqlite3')
  process.exit(1)
}

// Create a sample icon mapping configuration
const sampleConfig = {
  mappings: [
    {
      source_type: 'threatactor',
      target_type: 'actor',
      description: 'Map threat actor to actor icon',
      priority: 1,
      is_active: true
    },
    {
      source_type: 'workstation',
      target_type: 'client',
      description: 'Map workstation to client icon',
      priority: 1,
      is_active: true
    },
    {
      source_type: 'cvssmetrics',
      target_type: 'cvsssmetrics',
      description: 'Fix CVSS metrics icon name',
      priority: 1,
      is_active: true
    }
  ],
  metadata: {
    version: '1.0.0',
    created: new Date().toISOString(),
    description: 'Sample icon mapping configuration'
  }
}

const sampleConfigPath = path.join(dataDir, 'sample-icon-mappings.json')
if (!fs.existsSync(sampleConfigPath)) {
  fs.writeFileSync(sampleConfigPath, JSON.stringify(sampleConfig, null, 2))
  console.log('✅ Created sample configuration:', sampleConfigPath)
} else {
  console.log('✅ Sample configuration already exists:', sampleConfigPath)
}

console.log('')
console.log('🎉 Icon Mapping Management System setup complete!')
console.log('')
console.log('Next steps:')
console.log('1. Start your development server: npm run dev')
console.log('2. Navigate to http://localhost:3000')
console.log('3. Click the orange settings icon (⚙️) in the toolbar')
console.log('4. Configure your icon mappings in the dialog')
console.log('')
console.log('Features available:')
console.log('• 📋 View and manage all icon mappings')
console.log('• ✏️ Create and edit mappings with validation')
console.log('• 🧪 Test icon resolution without saving')
console.log('• 📊 View usage statistics and analytics')
console.log('• 📦 Import/export configurations')
console.log('• 🔍 System diagnostics and health monitoring')
console.log('')
console.log('For troubleshooting, see: ICON_MAPPING_MIGRATION.md')
