#!/usr/bin/env node

/**
 * Icon System Audit Script
 * 
 * This script audits the TruContext Demo application to ensure:
 * 1. All views use consistent Cloudinary-based icon loading
 * 2. No hardcoded references to local icon directories
 * 3. Proper fallback mechanisms are in place
 * 4. SVG format is maintained across all views
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Starting Icon System Audit...\n')

// Test configurations
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
}

function addResult(test, status, message, details = '') {
  testResults.details.push({ test, status, message, details })
  if (status === 'PASS') testResults.passed++
  else if (status === 'FAIL') testResults.failed++
  else if (status === 'WARN') testResults.warnings++
  
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${emoji} ${test}: ${message}`)
  if (details) console.log(`   ${details}`)
}

// Test 1: Check for hardcoded local icon paths
function testHardcodedPaths() {
  console.log('\n📁 Testing for hardcoded local icon paths...')
  
  try {
    // Search for hardcoded icon paths in source files
    const searchPatterns = [
      '/icons/',
      '/icons-svg/',
      'public/icons',
      'public/icons-svg'
    ]
    
    let foundHardcoded = false
    const foundFiles = []
    
    searchPatterns.forEach(pattern => {
      try {
        const result = execSync(`grep -r "${pattern}" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" components/ utils/ pages/ 2>/dev/null || true`, { encoding: 'utf8' })
        if (result.trim()) {
          // Filter out expected references (migration scripts, utility functions)
          const lines = result.split('\n').filter(line => 
            line.trim() && 
            !line.includes('migrate-icons-to-cloudinary.js') &&
            !line.includes('transformLocalPathToCloudinary') &&
            !line.includes('// Local path like')
          )
          if (lines.length > 0) {
            foundHardcoded = true
            foundFiles.push(...lines)
          }
        }
      } catch (error) {
        // Ignore grep errors (no matches found)
      }
    })
    
    if (foundHardcoded) {
      addResult('Hardcoded Paths', 'FAIL', 'Found hardcoded local icon paths', foundFiles.join('\n   '))
    } else {
      addResult('Hardcoded Paths', 'PASS', 'No hardcoded local icon paths found')
    }
  } catch (error) {
    addResult('Hardcoded Paths', 'WARN', 'Could not complete search', error.message)
  }
}

// Test 2: Verify NodeIcon component usage across views
function testNodeIconUsage() {
  console.log('\n🎯 Testing NodeIcon component usage...')
  
  const dataViewsDir = path.join(__dirname, '../components/DataViews')
  const viewFiles = [
    'TableView.tsx',
    'TimelineView.tsx', 
    'CardsView.tsx',
    'DashboardView.tsx',
    'GeoMapView.tsx'
  ]
  
  let allViewsUseNodeIcon = true
  const viewStatus = []
  
  viewFiles.forEach(file => {
    const filePath = path.join(dataViewsDir, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      const usesNodeIcon = content.includes('NodeIcon') || content.includes('from \'../common/NodeIcon\'')
      const usesLeafletMap = content.includes('LeafletMap') // GeoMapView uses LeafletMap which has proper icon handling
      
      if (usesNodeIcon || (file === 'GeoMapView.tsx' && usesLeafletMap)) {
        viewStatus.push(`${file}: ✅ Uses centralized icon system`)
      } else {
        viewStatus.push(`${file}: ❌ May not use centralized icon system`)
        allViewsUseNodeIcon = false
      }
    } else {
      viewStatus.push(`${file}: ⚠️ File not found`)
    }
  })
  
  if (allViewsUseNodeIcon) {
    addResult('NodeIcon Usage', 'PASS', 'All data views use centralized icon system', viewStatus.join('\n   '))
  } else {
    addResult('NodeIcon Usage', 'FAIL', 'Some views may not use centralized icon system', viewStatus.join('\n   '))
  }
}

// Test 3: Verify Cloudinary integration
function testCloudinaryIntegration() {
  console.log('\n☁️ Testing Cloudinary integration...')
  
  const cloudinaryUtilsPath = path.join(__dirname, '../utils/cloudinary-icons.ts')
  const nodeIconPath = path.join(__dirname, '../components/common/NodeIcon.tsx')
  
  if (!fs.existsSync(cloudinaryUtilsPath)) {
    addResult('Cloudinary Utils', 'FAIL', 'Cloudinary utilities file not found')
    return
  }
  
  if (!fs.existsSync(nodeIconPath)) {
    addResult('NodeIcon Component', 'FAIL', 'NodeIcon component not found')
    return
  }
  
  const cloudinaryContent = fs.readFileSync(cloudinaryUtilsPath, 'utf8')
  const nodeIconContent = fs.readFileSync(nodeIconPath, 'utf8')
  
  // Check for required Cloudinary functions
  const requiredFunctions = [
    'getCloudinaryIconUrl',
    'getUnknownIconUrl', 
    'checkIconExists'
  ]
  
  let missingFunctions = []
  requiredFunctions.forEach(func => {
    if (!cloudinaryContent.includes(func)) {
      missingFunctions.push(func)
    }
  })
  
  if (missingFunctions.length > 0) {
    addResult('Cloudinary Functions', 'FAIL', 'Missing required Cloudinary functions', missingFunctions.join(', '))
  } else {
    addResult('Cloudinary Functions', 'PASS', 'All required Cloudinary functions present')
  }
  
  // Check NodeIcon uses Cloudinary functions
  const usesCloudinary = requiredFunctions.every(func => nodeIconContent.includes(func))
  if (usesCloudinary) {
    addResult('NodeIcon Integration', 'PASS', 'NodeIcon properly integrated with Cloudinary')
  } else {
    addResult('NodeIcon Integration', 'FAIL', 'NodeIcon may not be using Cloudinary functions')
  }
}

// Test 4: Check for proper fallback mechanisms
function testFallbackMechanisms() {
  console.log('\n🛡️ Testing fallback mechanisms...')
  
  const iconUtilsPath = path.join(__dirname, '../utils/iconUtils.ts')
  const leafletMapPath = path.join(__dirname, '../components/DataViews/LeafletMap.tsx')
  
  const filesToCheck = [
    { path: iconUtilsPath, name: 'Icon Utils' },
    { path: leafletMapPath, name: 'Leaflet Map' }
  ]
  
  filesToCheck.forEach(({ path: filePath, name }) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Check for proper fallback to unknown icon
      const hasUnknownFallback = content.includes('getUnknownIconUrl()')
      const hasErrorHandling = content.includes('catch') && content.includes('error')
      
      if (hasUnknownFallback && hasErrorHandling) {
        addResult(`${name} Fallback`, 'PASS', 'Proper fallback mechanism implemented')
      } else {
        addResult(`${name} Fallback`, 'WARN', 'Fallback mechanism may be incomplete')
      }
    } else {
      addResult(`${name} Fallback`, 'WARN', 'File not found for fallback check')
    }
  })
}

// Test 5: Verify SVG format maintenance
function testSVGFormat() {
  console.log('\n📐 Testing SVG format maintenance...')
  
  // Check that the system is configured to maintain SVG format
  const cloudinaryUtilsPath = path.join(__dirname, '../utils/cloudinary-icons.ts')
  
  if (fs.existsSync(cloudinaryUtilsPath)) {
    const content = fs.readFileSync(cloudinaryUtilsPath, 'utf8')
    
    // Check for SVG-specific configurations
    const maintainsSVG = content.includes('.svg') && content.includes('f_svg')
    const has512Dimensions = content.includes('512') || content.includes('w_512,h_512')
    
    if (maintainsSVG && has512Dimensions) {
      addResult('SVG Format', 'PASS', 'SVG format and dimensions properly maintained')
    } else if (maintainsSVG) {
      addResult('SVG Format', 'WARN', 'SVG format maintained but dimensions may vary')
    } else {
      addResult('SVG Format', 'FAIL', 'SVG format maintenance unclear')
    }
  } else {
    addResult('SVG Format', 'WARN', 'Could not verify SVG format maintenance')
  }
}

// Test 6: Check for unused local icon directories
function testUnusedDirectories() {
  console.log('\n🗂️ Testing for unused local icon directories...')
  
  const iconsDir = path.join(__dirname, '../public/icons')
  const iconsSvgDir = path.join(__dirname, '../public/icons-svg')
  
  const directories = [
    { path: iconsDir, name: 'public/icons' },
    { path: iconsSvgDir, name: 'public/icons-svg' }
  ]
  
  directories.forEach(({ path: dirPath, name }) => {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
      const iconFiles = files.filter(f => f.endsWith('.svg') || f.endsWith('.png'))
      
      if (iconFiles.length > 0) {
        addResult(`${name} Directory`, 'WARN', `Directory exists with ${iconFiles.length} icon files - consider removal after migration verification`)
      } else {
        addResult(`${name} Directory`, 'PASS', 'Directory empty or contains no icon files')
      }
    } else {
      addResult(`${name} Directory`, 'PASS', 'Directory does not exist (properly cleaned up)')
    }
  })
}

// Run all tests
async function runAudit() {
  testHardcodedPaths()
  testNodeIconUsage()
  testCloudinaryIntegration()
  testFallbackMechanisms()
  testSVGFormat()
  testUnusedDirectories()
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 ICON SYSTEM AUDIT SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`⚠️  Warnings: ${testResults.warnings}`)
  console.log(`📋 Total Tests: ${testResults.passed + testResults.failed + testResults.warnings}`)
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All critical tests passed! Icon system is properly unified.')
  } else {
    console.log('\n🚨 Some tests failed. Please review the issues above.')
  }
  
  if (testResults.warnings > 0) {
    console.log('💡 Some warnings were found. Consider reviewing them for optimization.')
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../icon-audit-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      total: testResults.passed + testResults.failed + testResults.warnings
    },
    details: testResults.details
  }, null, 2))
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  
  return testResults.failed === 0
}

// Run the audit
runAudit().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Audit failed with error:', error)
  process.exit(1)
})
