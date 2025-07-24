import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import archiver from 'archiver'
import { Readable } from 'stream'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all icons from Cloudinary
    const result = await cloudinary.search
      .expression('folder:trucontext-icons AND resource_type:image')
      .sort_by([['created_at', 'desc']])
      .max_results(100)
      .execute()

    if (result.resources.length === 0) {
      return res.status(404).json({ error: 'No icons found to export' })
    }

    // Set response headers for ZIP download
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename="trucontext-icons.zip"')

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })

    // Pipe archive to response
    archive.pipe(res)

    // Download and add each icon to the ZIP
    for (const resource of result.resources) {
      try {
        const nodeType = resource.public_id.replace('trucontext-icons/trucontext-icons/', '')
        const iconUrl = resource.secure_url
        
        // Fetch the icon content from Cloudinary
        const response = await fetch(iconUrl)
        if (!response.ok) {
          console.warn(`Failed to fetch icon: ${iconUrl}`)
          continue
        }

        const iconContent = await response.text()
        
        // Add to ZIP with proper filename
        archive.append(iconContent, { name: `${nodeType}.svg` })
        
        console.log(`Added to ZIP: ${nodeType}.svg`)
      } catch (error) {
        console.error(`Error processing icon ${resource.public_id}:`, error)
        // Continue with other icons
      }
    }

    // Finalize the archive
    await archive.finalize()

    console.log(`✅ Successfully exported ${result.resources.length} icons as ZIP`)

  } catch (error: any) {
    console.error('Export error:', error)
    
    // If response hasn't been sent yet, send error
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to export icons',
        details: error.message
      })
    }
  }
}

