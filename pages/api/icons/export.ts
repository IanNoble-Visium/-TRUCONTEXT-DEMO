import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const iconsDir = path.join(process.cwd(), 'public', 'icons-svg')
    
    if (!fs.existsSync(iconsDir)) {
      return res.status(404).json({ error: 'Icons directory not found' })
    }

    let iconNames: string[] = []
    
    if (req.method === 'POST') {
      // Export selected icons
      const { iconNames: selectedIcons } = req.body
      if (!selectedIcons || !Array.isArray(selectedIcons)) {
        return res.status(400).json({ error: 'iconNames array is required for POST request' })
      }
      iconNames = selectedIcons
    } else {
      // Export all icons
      const files = fs.readdirSync(iconsDir)
      iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''))
    }

    if (iconNames.length === 0) {
      return res.status(404).json({ error: 'No icons found to export' })
    }

    // Set response headers for ZIP download
    const zipName = req.method === 'POST' ? 'trucontext-selected-icons.zip' : 'trucontext-icons.zip'
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`)

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create archive' })
      }
    })

    // Pipe archive to response
    archive.pipe(res)

    // Add icons to archive
    let addedCount = 0
    for (const iconName of iconNames) {
      const iconPath = path.join(iconsDir, `${iconName}.svg`)
      
      if (fs.existsSync(iconPath)) {
        const iconContent = fs.readFileSync(iconPath)
        archive.append(iconContent, { name: `${iconName}.svg` })
        addedCount++
      }
    }

    if (addedCount === 0) {
      archive.destroy()
      return res.status(404).json({ error: 'No valid icon files found' })
    }

    // Create a metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      totalIcons: addedCount,
      exportType: req.method === 'POST' ? 'selected' : 'all',
      iconNames: iconNames.slice(0, addedCount),
      application: 'TruContext Icon Management',
      version: '1.0.0'
    }

    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' })

    // Finalize the archive
    await archive.finalize()

  } catch (error) {
    console.error('Export error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to export icons' })
    }
  }
}

