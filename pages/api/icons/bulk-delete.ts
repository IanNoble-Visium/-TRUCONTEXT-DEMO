import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
  
  try {
    const { icons } = req.body
    
    if (!Array.isArray(icons) || icons.length === 0) {
      return res.status(400).json({ error: 'Invalid icons array' })
    }
    
    const iconsDir = path.join(process.cwd(), 'public', 'icons-svg')
    const unknownIconPath = path.join(iconsDir, 'unknown.svg')
    
    const results = {
      deleted: [] as string[],
      failed: [] as string[],
      skipped: [] as string[]
    }
    
    for (const iconName of icons) {
      if (typeof iconName !== 'string') {
        results.failed.push(`Invalid icon name: ${iconName}`)
        continue
      }
      
      // Don't allow deletion of unknown.svg
      if (iconName === 'unknown') {
        results.skipped.push(iconName)
        continue
      }
      
      const iconPath = path.join(iconsDir, `${iconName}.svg`)
      
      try {
        if (fs.existsSync(iconPath)) {
          fs.unlinkSync(iconPath)
          results.deleted.push(iconName)
        } else {
          results.failed.push(`Icon not found: ${iconName}`)
        }
      } catch (error) {
        console.error(`Error deleting icon ${iconName}:`, error)
        results.failed.push(`Failed to delete: ${iconName}`)
      }
    }
    
    // Ensure unknown.svg exists as fallback
    if (!fs.existsSync(unknownIconPath)) {
      const unknownSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <text x="50" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">?</text>
</svg>`
      fs.writeFileSync(unknownIconPath, unknownSvg)
    }
    
    res.status(200).json({
      message: `Bulk delete completed`,
      results,
      summary: {
        total: icons.length,
        deleted: results.deleted.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      }
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    res.status(500).json({ error: 'Failed to perform bulk delete' })
  }
}

