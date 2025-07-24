#!/usr/bin/env node

/**
 * Icon Display Test Script
 * 
 * This script tests that icons display correctly across all application views
 * by making requests to the Cloudinary URLs and verifying SVG format.
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

console.log('🎨 Starting Icon Display Test...\n')

// Load environment variables
require('dotenv').config()

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

// Common node types used in the application
const testNodeTypes = [
  'actor', 'agent', 'application', 'attack', 'attacker', 'client', 'cpe',
  'cvss', 'cvssseverity', 'cvsssmetrics', 'cwe', 'database', 'device', 'dmz',
  'domain', 'entity', 'event', 'exploit', 'externalentry', 'firewall',
  'machine', 'network', 'references', 'router', 'server', 'software',
  'storage', 'switch', 'threatactor', 'traffic', 'unknown', 'user',
  'vulnerability', 'workstation', 'load_balancer', 'proxy_server'
]

const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

function addResult(nodeType, status, message, details = '') {
  testResults.details.push({ nodeType, status, message, details })
  testResults.total++
  if (status === 'PASS') testResults.passed++
  else testResults.failed++
  
  const emoji = status === 'PASS' ? '✅' : '❌'
  console.log(`${emoji} ${nodeType}: ${message}`)
  if (details) console.log(`   ${details}`)
}

// Test if a Cloudinary URL returns valid SVG content
function testCloudinaryIcon(nodeType) {
  return new Promise((resolve) => {
    const iconUrl = `${baseUrl}/f_auto,q_auto/${nodeType}.svg`
    
    https.get(iconUrl, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Check if response is valid SVG
          if (data.includes('<svg') && data.includes('</svg>')) {
            // Check for proper dimensions
            const hasViewBox = data.includes('viewBox') || data.includes('width=') || data.includes('height=')
            if (hasViewBox) {
              addResult(nodeType, 'PASS', 'Icon loads correctly with proper SVG format')
            } else {
              addResult(nodeType, 'PASS', 'Icon loads but may lack proper dimensions', 'Missing viewBox or dimensions')
            }
          } else {
            addResult(nodeType, 'FAIL', 'Response is not valid SVG format', `Content type: ${res.headers['content-type']}`)
          }
        } else if (res.statusCode === 404) {
          addResult(nodeType, 'FAIL', 'Icon not found in Cloudinary', `HTTP ${res.statusCode}`)
        } else {
          addResult(nodeType, 'FAIL', 'HTTP error loading icon', `HTTP ${res.statusCode}`)
        }
        resolve()
      })
    }).on('error', (err) => {
      addResult(nodeType, 'FAIL', 'Network error loading icon', err.message)
      resolve()
    })
  })
}

// Test unknown icon fallback
function testUnknownIconFallback() {
  return new Promise((resolve) => {
    const unknownUrl = `${baseUrl}/f_auto,q_auto/unknown.svg`
    
    console.log('🔍 Testing unknown icon fallback...')
    
    https.get(unknownUrl, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('<svg')) {
          addResult('unknown', 'PASS', 'Fallback icon loads correctly')
        } else {
          addResult('unknown', 'FAIL', 'Fallback icon not available', `HTTP ${res.statusCode}`)
        }
        resolve()
      })
    }).on('error', (err) => {
      addResult('unknown', 'FAIL', 'Network error loading fallback icon', err.message)
      resolve()
    })
  })
}

// Test different icon sizes and formats
function testIconVariations() {
  return new Promise((resolve) => {
    const testIcon = 'firewall' // Use a common icon for testing
    const variations = [
      { url: `${baseUrl}/w_64,h_64,c_fit,f_auto,q_auto/${testIcon}.svg`, name: 'Small (64x64)' },
      { url: `${baseUrl}/w_512,h_512,c_fit,f_auto,q_auto/${testIcon}.svg`, name: 'Medium (512x512)' },
      { url: `${baseUrl}/w_1024,h_1024,c_fit,f_svg,q_100/${testIcon}.svg`, name: 'Large (1024x1024)' }
    ]
    
    console.log('📏 Testing icon size variations...')
    
    let completed = 0
    variations.forEach(({ url, name }) => {
      https.get(url, (res) => {
        if (res.statusCode === 200) {
          addResult(`${testIcon}-${name}`, 'PASS', 'Size variation loads correctly')
        } else {
          addResult(`${testIcon}-${name}`, 'FAIL', 'Size variation failed to load', `HTTP ${res.statusCode}`)
        }
        
        completed++
        if (completed === variations.length) {
          resolve()
        }
      }).on('error', (err) => {
        addResult(`${testIcon}-${name}`, 'FAIL', 'Network error', err.message)
        completed++
        if (completed === variations.length) {
          resolve()
        }
      })
    })
  })
}

// Main test function
async function runIconDisplayTest() {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.error('❌ CLOUDINARY_CLOUD_NAME environment variable not set!')
    console.error('Please ensure your .env.local file contains the Cloudinary configuration.')
    process.exit(1)
  }
  
  console.log(`🌤️ Testing icons from Cloudinary: ${CLOUDINARY_CLOUD_NAME}\n`)
  
  // Test unknown icon fallback first
  await testUnknownIconFallback()
  
  // Test icon size variations
  await testIconVariations()
  
  // Test all common node types
  console.log('🎯 Testing common node type icons...')
  for (const nodeType of testNodeTypes) {
    await testCloudinaryIcon(nodeType)
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('🎨 ICON DISPLAY TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📋 Total Tests: ${testResults.total}`)
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1)
  console.log(`📊 Success Rate: ${successRate}%`)
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All icon display tests passed! Icons are loading correctly from Cloudinary.')
  } else {
    console.log('\n🚨 Some icons failed to load. This may indicate missing icons in Cloudinary.')
    console.log('💡 Consider running the migration script to upload missing icons.')
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../icon-display-test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    cloudinaryCloudName: CLOUDINARY_CLOUD_NAME,
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      total: testResults.total,
      successRate: parseFloat(successRate)
    },
    details: testResults.details
  }, null, 2))
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  
  return testResults.failed === 0
}

// Run the test
runIconDisplayTest().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Icon display test failed with error:', error)
  process.exit(1)
})
