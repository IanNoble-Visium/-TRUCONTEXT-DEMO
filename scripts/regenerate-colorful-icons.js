#!/usr/bin/env node

/**
 * Script to regenerate specific icons with enhanced colorful settings
 * This script will regenerate actor, agent, and exploit icons to be more vibrant and colorful
 */

const path = require('path')
const fs = require('fs')

// Simple environment variable loader
const loadEnv = () => {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    lines.forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
  } catch (error) {
    console.warn('Could not load .env.local file')
  }
}

loadEnv()

// Icon definitions with enhanced descriptions for colorful generation
const iconsToRegenerate = [
  {
    nodeType: 'actor',
    description: 'Human figure representing a cybersecurity actor, person, or user in network security context. Should show a stylized person icon with vibrant colors, professional appearance suitable for security diagrams.'
  },
  {
    nodeType: 'agent',
    description: 'Software agent or automated system component in cybersecurity infrastructure. Should represent an intelligent software entity with modern, tech-focused design using rich colors and clear visual elements.'
  },
  {
    nodeType: 'exploit',
    description: 'Security vulnerability exploitation tool or attack vector. Should convey danger/warning with bold colors while maintaining professional appearance for security analysis diagrams.'
  }
]

async function regenerateIcon(nodeType, description) {
  console.log(`\n🎨 Regenerating colorful icon for: ${nodeType}`)
  console.log(`📝 Description: ${description}`)
  
  try {
    const response = await fetch('http://localhost:3000/api/icons/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nodeType,
        description,
        prompt: description
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Successfully generated colorful ${nodeType} icon`)
      console.log(`🔗 Cloudinary URL: ${result.iconUrl}`)
      console.log(`🤖 API Used: ${result.apiUsed}`)
      return result
    } else {
      throw new Error(result.error || 'Unknown error')
    }
  } catch (error) {
    console.error(`❌ Failed to regenerate ${nodeType} icon:`, error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Starting colorful icon regeneration process...')
  console.log(`📊 Regenerating ${iconsToRegenerate.length} icons: ${iconsToRegenerate.map(i => i.nodeType).join(', ')}`)
  
  // Check if the development server is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/icons')
    if (!healthCheck.ok) {
      throw new Error('API not accessible')
    }
  } catch (error) {
    console.error('❌ Cannot connect to the development server at http://localhost:3000')
    console.error('Please make sure the Next.js development server is running with: npm run dev')
    process.exit(1)
  }

  const results = []
  
  for (const iconConfig of iconsToRegenerate) {
    const result = await regenerateIcon(iconConfig.nodeType, iconConfig.description)
    results.push({
      nodeType: iconConfig.nodeType,
      success: result !== null,
      result
    })
    
    // Add a small delay between requests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Summary
  console.log('\n📋 REGENERATION SUMMARY:')
  console.log('=' .repeat(50))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`)
  successful.forEach(r => {
    console.log(`   • ${r.nodeType}: ${r.result.iconUrl}`)
  })
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${results.length}`)
    failed.forEach(r => {
      console.log(`   • ${r.nodeType}`)
    })
  }
  
  console.log('\n🎉 Colorful icon regeneration process completed!')
  console.log('💡 The new colorful icons should now be visible in all application views.')
  console.log('🔄 If you don\'t see the changes immediately, try refreshing your browser or clearing the cache.')
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
}

module.exports = { regenerateIcon, iconsToRegenerate }
