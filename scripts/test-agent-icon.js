#!/usr/bin/env node

/**
 * Quick test script to regenerate just the agent icon with blue-only colors
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

async function testAgentIcon() {
  console.log('🧪 Testing agent icon generation with blue-only colors...')
  
  try {
    const response = await fetch('http://localhost:3000/api/icons/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nodeType: 'agent',
        description: 'Software agent or automated system component in cybersecurity infrastructure. Should represent an intelligent software entity with modern, tech-focused design using ONLY blue and teal colors.',
        prompt: 'Software agent or automated system component in cybersecurity infrastructure. Should represent an intelligent software entity with modern, tech-focused design using ONLY blue and teal colors.'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Successfully generated blue-only agent icon')
      console.log(`🔗 Cloudinary URL: ${result.iconUrl}`)
      console.log(`🤖 API Used: ${result.apiUsed}`)
      console.log('\n🎉 Test completed! Check the Icon Management view to see the new agent icon.')
    } else {
      throw new Error(result.error || 'Unknown error')
    }
  } catch (error) {
    console.error('❌ Failed to generate agent icon:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the development server is running with: npm run dev')
    }
  }
}

// Run the test
testAgentIcon()
