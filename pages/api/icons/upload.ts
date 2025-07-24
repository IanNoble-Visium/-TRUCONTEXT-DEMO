import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import fs from 'fs'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const nodeType = Array.isArray(fields.nodeType) ? fields.nodeType[0] : fields.nodeType
    if (!nodeType) {
      return res.status(400).json({ error: 'Node type is required' })
    }

    // Read the file content
    const fileContent = fs.readFileSync(uploadedFile.filepath)
    const originalName = uploadedFile.originalFilename || 'unknown'
    const fileExtension = originalName.split('.').pop()?.toLowerCase()

    let uploadResult

    if (fileExtension === 'svg') {
      // Upload SVG directly
      uploadResult = await cloudinary.uploader.upload(
        `data:image/svg+xml;base64,${fileContent.toString('base64')}`,
        {
          public_id: `trucontext-icons/${nodeType}`,
          folder: 'trucontext-icons',
          resource_type: 'image',
          format: 'svg',
          overwrite: true,
          tags: ['trucontext', 'icons', 'svg', 'uploaded'],
          context: {
            source: 'upload',
            nodeType: nodeType,
            original_filename: originalName,
            upload_date: new Date().toISOString()
          }
        }
      )
    } else if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg') {
      // Upload image and convert to SVG format
      uploadResult = await cloudinary.uploader.upload(uploadedFile.filepath, {
        public_id: `trucontext-icons/${nodeType}`,
        folder: 'trucontext-icons',
        resource_type: 'image',
        format: 'svg', // Convert to SVG
        overwrite: true,
        tags: ['trucontext', 'icons', 'svg', 'uploaded', 'converted'],
        transformation: [
          { width: 512, height: 512, crop: 'fit', background: 'transparent' }
        ],
        context: {
          source: 'upload-converted',
          nodeType: nodeType,
          original_filename: originalName,
          original_format: fileExtension,
          upload_date: new Date().toISOString()
        }
      })
    } else {
      // Clean up temp file
      fs.unlinkSync(uploadedFile.filepath)
      return res.status(400).json({ error: 'Only SVG, PNG, and JPG files are supported' })
    }

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath)

    console.log(`✅ Successfully uploaded icon: ${nodeType} -> ${uploadResult.secure_url}`)

    res.status(200).json({
      success: true,
      message: `Icon for ${nodeType} uploaded successfully`,
      iconUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      nodeType: nodeType,
      path: uploadResult.secure_url // For backward compatibility
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: 'Failed to upload icon',
      details: error.message
    })
  }
}

