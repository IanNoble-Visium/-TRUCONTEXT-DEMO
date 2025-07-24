#!/usr/bin/env node

/**
 * Test script for Recraft V3 vector illustration style
 * Following Perplexity AI recommendations for proper icon generation
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

async function testRecraftV3Icon() {
  console.log('🚀 Testing Recraft V3 vector illustration style...')
  console.log('📋 Using Perplexity AI recommended format for proper icon generation')
  console.log('🎯 Expected: Clean, professional icons with proper form (like the shield example)')
  
  try {
    const response = await fetch('http://localhost:3000/api/icons/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nodeType: 'actor',
        description: 'shield with lock and person, cybersecurity user protection',
        prompt: 'simple actor cybersecurity icon, shield with lock and person, vector, flat, modern, minimal, color, professional blue and teal colors only, no red'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Successfully generated Recraft V3 actor icon')
      console.log(`🔗 Cloudinary URL: ${result.iconUrl}`)
      console.log(`🤖 API Used: ${result.apiUsed}`)
      console.log(`📐 Style: vector_illustration (should have proper form and shape)`)
      console.log('\n🎉 Test completed! Check the Icon Management view to see the new Recraft V3 icon.')
      console.log('💡 This should look more like the shield example from Recraft UI - with proper form and detail!')
    } else {
      throw new Error(result.error || 'Unknown error')
    }
  } catch (error) {
    console.error('❌ Failed to generate Recraft V3 icon:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure the development server is running with: npm run dev')
    }
  }
}

// Test multiple icons
async function testMultipleIcons() {
  const testCases = [
    {
      nodeType: 'actor',
      description: 'shield with lock and person, cybersecurity user protection',
      expected: 'Shield with person icon'
    },
    {
      nodeType: 'agent',
      description: 'chip with circuit lines, automated software system',
      expected: 'Chip/circuit icon'
    },
    {
      nodeType: 'exploit',
      description: 'warning shield with vulnerability symbol, security threat',
      expected: 'Warning/threat icon'
    }
  ]

  console.log(`\n🔄 Testing ${testCases.length} different icon types with Recraft V3...`)
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing ${testCase.nodeType} ---`)
    console.log(`Expected result: ${testCase.expected}`)
    
    try {
      const response = await fetch('http://localhost:3000/api/icons/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nodeType: testCase.nodeType,
          description: testCase.description
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log(`✅ ${testCase.nodeType}: ${result.iconUrl}`)
        } else {
          console.log(`❌ ${testCase.nodeType}: ${result.error}`)
        }
      } else {
        console.log(`❌ ${testCase.nodeType}: HTTP ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${testCase.nodeType}: ${error.message}`)
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n🏁 Batch test completed!')
}

// Run single test first, then batch test if successful
testRecraftV3Icon()
  .then(() => {
    console.log('\n🤔 Would you like to test multiple icon types? (This will take a few minutes)')
    // Uncomment the line below to run batch test
    // return testMultipleIcons()
  })
  .catch(error => {
    console.error('💥 Test failed:', error)
  })
