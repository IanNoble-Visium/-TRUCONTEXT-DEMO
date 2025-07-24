#!/usr/bin/env node

/**
 * Test script to generate an actor icon using the new raw style
 * This should produce cleaner, more professional results similar to the Recraft UI
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

async function testRawStyleIcon() {
  console.log('🎨 Testing raw style icon generation for actor...')
  console.log('📋 This should produce a clean, professional icon similar to the Recraft UI example')
  
  try {
    const response = await fetch('http://localhost:3000/api/icons/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nodeType: 'actor',
        description: 'Human figure representing a cybersecurity actor, person, or user in network security context. Should show a stylized person icon with clean, professional appearance.',
        prompt: 'Clean professional cybersecurity actor icon. Simple human figure with shield and security elements. Raw style with minimal details, clean lines, professional blue colors only.'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Successfully generated raw style actor icon')
      console.log(`🔗 Cloudinary URL: ${result.iconUrl}`)
      console.log(`🤖 API Used: ${result.apiUsed}`)
      console.log(`📏 Style: Raw (should be cleaner and more professional)`)
      console.log('\n🎉 Test completed! Check the Icon Management view to see the new raw style actor icon.')
      console.log('💡 Compare this with the previous vector illustration style - it should be much cleaner!')
    } else {
      throw new Error(result.error || 'Unknown error')
    }
  } catch (error) {
    console.error('❌ Failed to generate raw style icon:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the development server is running with: npm run dev')
    }
  }
}

// Run the test
testRawStyleIcon()
