import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

interface IconData {
  name: string
  path: string
  size: number
  lastModified: Date
  isUsed: boolean
  nodeType?: string
  description?: string
  metadata?: {
    width?: number
    height?: number
    viewBox?: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const iconsDir = path.join(process.cwd(), 'public', 'icons-svg')
      
      if (!fs.existsSync(iconsDir)) {
        return res.status(404).json({ error: 'Icons directory not found' })
      }
      
      const files = fs.readdirSync(iconsDir, { withFileTypes: true })
      const icons: IconData[] = []
      
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.svg')) {
          const filePath = path.join(iconsDir, file.name)
          const stats = fs.statSync(filePath)
          const iconName = file.name.replace('.svg', '')
          
          // Read SVG content to extract metadata
          let metadata = {}
          try {
            const svgContent = fs.readFileSync(filePath, 'utf8')
            const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/)
            const widthMatch = svgContent.match(/width="([^"]*)"/)
            const heightMatch = svgContent.match(/height="([^"]*)"/)
            
            metadata = {
              viewBox: viewBoxMatch ? viewBoxMatch[1] : undefined,
              width: widthMatch ? parseInt(widthMatch[1]) : undefined,
              height: heightMatch ? parseInt(heightMatch[1]) : undefined
            }
          } catch (error) {
            console.warn(`Failed to parse SVG metadata for ${file.name}:`, error)
          }
          
          // Determine if icon is used (this would typically check against database/node types)
          // For now, we'll assume all icons are potentially used except those in debug folder
          const isUsed = !filePath.includes('/debug/')
          
          icons.push({
            name: iconName,
            path: `/icons-svg/${file.name}`,
            size: stats.size,
            lastModified: stats.mtime,
            isUsed,
            nodeType: iconName, // Assuming icon name matches node type
            description: `Icon for ${iconName} node type`,
            metadata
          })
        }
      }
      
      // Sort icons by name
      icons.sort((a, b) => a.name.localeCompare(b.name))
      
      res.status(200).json(icons)
    } catch (error) {
      console.error('Error loading icons:', error)
      res.status(500).json({ error: 'Failed to load icons' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

