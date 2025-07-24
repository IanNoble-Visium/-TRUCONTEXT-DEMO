import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Icon name is required' })
  }

  if (req.method === 'GET') {
    try {
      // Get icon details from Cloudinary
      const publicId = `trucontext-icons/trucontext-icons/${name}`
      
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'image'
      })

      const iconData = {
        name: name,
        nodeType: name,
        path: result.secure_url,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
        updatedAt: result.created_at,
        isUsed: true,
        metadata: {
          width: result.width,
          height: result.height,
          viewBox: result.format === 'svg' ? '0 0 512 512' : undefined
        }
      }

      res.status(200).json(iconData)

    } catch (error: any) {
      if (error.http_code === 404) {
        return res.status(404).json({ error: 'Icon not found' })
      }
      
      console.error('Error fetching icon:', error)
      res.status(500).json({
        error: 'Failed to fetch icon',
        details: error.message
      })
    }

  } else if (req.method === 'DELETE') {
    try {
      const publicId = `trucontext-icons/trucontext-icons/${name}`
      
      // Delete from Cloudinary
      const deleteResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image'
      })

      if (deleteResult.result === 'ok') {
        console.log(`✅ Successfully deleted icon: ${name}`)
        res.status(200).json({
          success: true,
          message: `Icon ${name} deleted successfully`
        })
      } else {
        console.warn(`⚠️ Failed to delete icon: ${name} - ${deleteResult.result}`)
        res.status(400).json({
          error: 'Failed to delete icon',
          details: deleteResult.result
        })
      }

    } catch (error: any) {
      console.error('Delete error:', error)
      res.status(500).json({
        error: 'Failed to delete icon',
        details: error.message
      })
    }

  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

