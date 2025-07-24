import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { iconNames } = req.body

    if (!iconNames || !Array.isArray(iconNames) || iconNames.length === 0) {
      return res.status(400).json({ error: 'Icon names array is required' })
    }

    const results = {
      successful: [] as string[],
      failed: [] as { name: string; error: string }[]
    }

    // Delete each icon from Cloudinary
    for (const iconName of iconNames) {
      try {
        const publicId = `trucontext-icons/trucontext-icons/${iconName}`
        
        // Delete from Cloudinary
        const deleteResult = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image'
        })

        if (deleteResult.result === 'ok') {
          results.successful.push(iconName)
          console.log(`✅ Successfully deleted icon: ${iconName}`)
        } else {
          results.failed.push({
            name: iconName,
            error: `Cloudinary deletion failed: ${deleteResult.result}`
          })
          console.warn(`⚠️ Failed to delete icon: ${iconName} - ${deleteResult.result}`)
        }
      } catch (error: any) {
        results.failed.push({
          name: iconName,
          error: error.message
        })
        console.error(`❌ Error deleting icon ${iconName}:`, error)
      }
    }

    const totalRequested = iconNames.length
    const successCount = results.successful.length
    const failCount = results.failed.length

    console.log(`Bulk delete summary: ${successCount}/${totalRequested} successful, ${failCount} failed`)

    res.status(200).json({
      success: true,
      message: `Bulk delete completed: ${successCount}/${totalRequested} icons deleted successfully`,
      results: results,
      summary: {
        total: totalRequested,
        successful: successCount,
        failed: failCount
      }
    })

  } catch (error: any) {
    console.error('Bulk delete error:', error)
    res.status(500).json({
      error: 'Failed to perform bulk delete',
      details: error.message
    })
  }
}

