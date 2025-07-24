import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query
  
  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid icon name' })
  }
  
  const iconsDir = path.join(process.cwd(), 'public', 'icons-svg')
  const iconPath = path.join(iconsDir, `${name}.svg`)
  const unknownIconPath = path.join(iconsDir, 'unknown.svg')
  
  if (req.method === 'DELETE') {
    try {
      // Check if icon exists
      if (!fs.existsSync(iconPath)) {
        return res.status(404).json({ error: 'Icon not found' })
      }
      
      // Don't allow deletion of unknown.svg
      if (name === 'unknown') {
        return res.status(400).json({ error: 'Cannot delete unknown.svg fallback icon' })
      }
      
      // Delete the icon file
      fs.unlinkSync(iconPath)
      
      // Ensure unknown.svg exists as fallback
      if (!fs.existsSync(unknownIconPath)) {
        // Create a simple unknown.svg if it doesn't exist
        const unknownSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <text x="50" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">?</text>
</svg>`
        fs.writeFileSync(unknownIconPath, unknownSvg)
      }
      
      res.status(200).json({ 
        message: `Icon ${name} deleted successfully`,
        fallback: 'unknown.svg will be used as fallback'
      })
    } catch (error) {
      console.error('Error deleting icon:', error)
      res.status(500).json({ error: 'Failed to delete icon' })
    }
  } else if (req.method === 'GET') {
    try {
      // Get icon details
      if (!fs.existsSync(iconPath)) {
        return res.status(404).json({ error: 'Icon not found' })
      }
      
      const stats = fs.statSync(iconPath)
      const svgContent = fs.readFileSync(iconPath, 'utf8')
      
      // Extract metadata
      const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/)
      const widthMatch = svgContent.match(/width="([^"]*)"/)
      const heightMatch = svgContent.match(/height="([^"]*)"/)
      
      const iconData = {
        name,
        path: `/icons-svg/${name}.svg`,
        size: stats.size,
        lastModified: stats.mtime,
        content: svgContent,
        metadata: {
          viewBox: viewBoxMatch ? viewBoxMatch[1] : undefined,
          width: widthMatch ? parseInt(widthMatch[1]) : undefined,
          height: heightMatch ? parseInt(heightMatch[1]) : undefined
        }
      }
      
      res.status(200).json(iconData)
    } catch (error) {
      console.error('Error getting icon details:', error)
      res.status(500).json({ error: 'Failed to get icon details' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { description, nodeType, content } = req.body
      
      if (!fs.existsSync(iconPath)) {
        return res.status(404).json({ error: 'Icon not found' })
      }
      
      // If content is provided, update the SVG file
      if (content) {
        fs.writeFileSync(iconPath, content)
      }
      
      // For now, we'll just return success
      // In a real implementation, you'd update metadata in a database
      res.status(200).json({ 
        message: `Icon ${name} updated successfully`,
        description,
        nodeType
      })
    } catch (error) {
      console.error('Error updating icon:', error)
      res.status(500).json({ error: 'Failed to update icon' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE', 'PUT'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

