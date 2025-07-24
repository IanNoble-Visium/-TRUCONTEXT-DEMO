import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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
  cloudinaryUrl?: string
  publicId?: string
  format?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get all icons from Cloudinary
      const result = await cloudinary.search
        .expression('folder:trucontext-icons AND resource_type:image')
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute()

      const icons: IconData[] = result.resources.map((resource: any) => {
        // Extract node type from public_id
        const nodeType = resource.public_id.replace('trucontext-icons/trucontext-icons/', '')
        
        return {
          name: nodeType,
          path: resource.secure_url, // Use Cloudinary URL as path
          size: resource.bytes,
          lastModified: new Date(resource.created_at),
          isUsed: true, // We'll determine this based on actual usage
          nodeType: nodeType,
          description: `Icon for ${nodeType} node type`,
          metadata: {
            width: resource.width,
            height: resource.height,
            viewBox: resource.format === 'svg' ? '0 0 512 512' : undefined
          },
          cloudinaryUrl: resource.secure_url,
          publicId: resource.public_id,
          format: resource.format
        }
      })

      // Sort icons alphabetically by name
      icons.sort((a, b) => a.name.localeCompare(b.name))

      res.status(200).json(icons)

    } catch (error: any) {
      console.error('Error fetching icons from Cloudinary:', error)
      res.status(500).json({
        error: 'Failed to fetch icons',
        details: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

