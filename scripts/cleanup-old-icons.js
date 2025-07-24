#!/usr/bin/env node

/**
 * Cleanup Old Icon Directories Script
 * 
 * This script safely removes the old local icon directories since the application
 * now uses Cloudinary for all icon storage and delivery.
 * 
 * It creates a backup before deletion and provides detailed logging.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧹 Starting cleanup of old icon directories...\n')

const projectRoot = path.join(__dirname, '..')
const iconsDir = path.join(projectRoot, 'public/icons')
const iconsSvgDir = path.join(projectRoot, 'public/icons-svg')
const backupDir = path.join(projectRoot, 'backup-icons')

// Create backup directory
function createBackup() {
  console.log('📦 Creating backup of icon directories...')
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `icons-backup-${timestamp}`)
  fs.mkdirSync(backupPath, { recursive: true })
  
  let backedUpFiles = 0
  
  // Backup icons directory
  if (fs.existsSync(iconsDir)) {
    const iconsBackupPath = path.join(backupPath, 'icons')
    fs.mkdirSync(iconsBackupPath, { recursive: true })
    
    const iconFiles = fs.readdirSync(iconsDir)
    iconFiles.forEach(file => {
      const srcPath = path.join(iconsDir, file)
      const destPath = path.join(iconsBackupPath, file)
      
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath)
        backedUpFiles++
      } else if (fs.statSync(srcPath).isDirectory()) {
        // Copy directory recursively
        copyDirectoryRecursive(srcPath, destPath)
      }
    })
    console.log(`   ✅ Backed up ${iconFiles.length} items from public/icons`)
  }
  
  // Backup icons-svg directory
  if (fs.existsSync(iconsSvgDir)) {
    const iconsSvgBackupPath = path.join(backupPath, 'icons-svg')
    fs.mkdirSync(iconsSvgBackupPath, { recursive: true })
    
    const svgFiles = fs.readdirSync(iconsSvgDir)
    svgFiles.forEach(file => {
      const srcPath = path.join(iconsSvgDir, file)
      const destPath = path.join(iconsSvgBackupPath, file)
      
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath)
        backedUpFiles++
      } else if (fs.statSync(srcPath).isDirectory()) {
        // Copy directory recursively
        copyDirectoryRecursive(srcPath, destPath)
      }
    })
    console.log(`   ✅ Backed up ${svgFiles.length} items from public/icons-svg`)
  }
  
  console.log(`📦 Backup created at: ${backupPath}`)
  console.log(`📊 Total files backed up: ${backedUpFiles}\n`)
  
  return backupPath
}

// Helper function to copy directory recursively
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const items = fs.readdirSync(src)
  items.forEach(item => {
    const srcPath = path.join(src, item)
    const destPath = path.join(dest, item)
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

// Remove directory safely
function removeDirectory(dirPath, dirName) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️ Removing ${dirName}...`)
    
    try {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(`   ✅ Successfully removed ${dirName}`)
      return true
    } catch (error) {
      console.error(`   ❌ Failed to remove ${dirName}:`, error.message)
      return false
    }
  } else {
    console.log(`   ℹ️ ${dirName} does not exist (already cleaned up)`)
    return true
  }
}

// Verify Cloudinary integration is working
function verifyCloudinaryIntegration() {
  console.log('🔍 Verifying Cloudinary integration...')
  
  const cloudinaryUtilsPath = path.join(projectRoot, 'utils/cloudinary-icons.ts')
  const nodeIconPath = path.join(projectRoot, 'components/common/NodeIcon.tsx')
  
  if (!fs.existsSync(cloudinaryUtilsPath)) {
    console.error('❌ Cloudinary utilities not found! Aborting cleanup.')
    return false
  }
  
  if (!fs.existsSync(nodeIconPath)) {
    console.error('❌ NodeIcon component not found! Aborting cleanup.')
    return false
  }
  
  const cloudinaryContent = fs.readFileSync(cloudinaryUtilsPath, 'utf8')
  const nodeIconContent = fs.readFileSync(nodeIconPath, 'utf8')
  
  const hasRequiredFunctions = [
    'getCloudinaryIconUrl',
    'getUnknownIconUrl',
    'checkIconExists'
  ].every(func => cloudinaryContent.includes(func) && nodeIconContent.includes(func))
  
  if (!hasRequiredFunctions) {
    console.error('❌ Cloudinary integration incomplete! Aborting cleanup.')
    return false
  }
  
  console.log('   ✅ Cloudinary integration verified')
  return true
}

// Main cleanup function
async function cleanup() {
  console.log('🔍 Pre-cleanup verification...')
  
  // Verify Cloudinary integration before cleanup
  if (!verifyCloudinaryIntegration()) {
    console.error('💥 Cleanup aborted due to missing Cloudinary integration.')
    process.exit(1)
  }
  
  // Count files before cleanup
  let totalFiles = 0
  if (fs.existsSync(iconsDir)) {
    totalFiles += fs.readdirSync(iconsDir).length
  }
  if (fs.existsSync(iconsSvgDir)) {
    totalFiles += fs.readdirSync(iconsSvgDir).length
  }
  
  if (totalFiles === 0) {
    console.log('✨ No icon directories found to clean up. System is already clean!')
    return
  }
  
  console.log(`📊 Found ${totalFiles} items to clean up\n`)
  
  // Create backup
  const backupPath = createBackup()
  
  // Remove old directories
  console.log('🗑️ Removing old icon directories...')
  const iconsRemoved = removeDirectory(iconsDir, 'public/icons')
  const iconsSvgRemoved = removeDirectory(iconsSvgDir, 'public/icons-svg')
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('🧹 CLEANUP SUMMARY')
  console.log('='.repeat(50))
  
  if (iconsRemoved && iconsSvgRemoved) {
    console.log('✅ Cleanup completed successfully!')
    console.log('📦 Backup available at:', backupPath)
    console.log('🎯 Application now uses Cloudinary exclusively for icons')
    console.log('\n💡 Next steps:')
    console.log('   1. Test the application to ensure icons load correctly')
    console.log('   2. If everything works, you can delete the backup directory')
    console.log('   3. The backup can be restored if needed using:')
    console.log(`      cp -r "${backupPath}/*" "${projectRoot}/public/"`)
  } else {
    console.log('⚠️ Cleanup completed with some issues')
    console.log('📦 Backup available at:', backupPath)
    console.log('🔍 Please review the errors above and retry if needed')
  }
  
  // Create cleanup report
  const reportPath = path.join(projectRoot, 'cleanup-report.json')
  const report = {
    timestamp: new Date().toISOString(),
    backupPath,
    iconsDirectoryRemoved: iconsRemoved,
    iconsSvgDirectoryRemoved: iconsSvgRemoved,
    totalFilesProcessed: totalFiles,
    cloudinaryIntegrationVerified: true
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Cleanup report saved to: ${reportPath}`)
}

// Run cleanup
cleanup().catch(error => {
  console.error('💥 Cleanup failed with error:', error)
  process.exit(1)
})
