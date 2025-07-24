import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    })

    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const nodeType = Array.isArray(fields.nodeType) ? fields.nodeType[0] : fields.nodeType

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const iconsDir = path.join(process.cwd(), 'public', 'icons-svg')
    
    // Ensure icons directory exists
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true })
    }

    // Determine output filename
    const outputName = nodeType || file.originalFilename?.replace(/\.(png|jpe?g|svg)$/i, '') || 'new_icon'
    const outputPath = path.join(iconsDir, `${outputName}.svg`)

    // Handle different file types
    if (file.mimetype === 'image/svg+xml') {
      // Direct copy for SVG files
      fs.copyFileSync(file.filepath, outputPath)
    } else if (file.mimetype?.startsWith('image/')) {
      // Convert PNG/JPEG to SVG (simplified conversion)
      // In a real implementation, you'd use a proper image-to-SVG converter
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <image href="data:${file.mimetype};base64,${fs.readFileSync(file.filepath).toString('base64')}" width="100" height="100"/>
</svg>`
      fs.writeFileSync(outputPath, svgContent)
    } else {
      return res.status(400).json({ error: 'Unsupported file type' })
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath)

    res.status(200).json({
      message: 'File uploaded successfully',
      filename: `${outputName}.svg`,
      path: `/icons-svg/${outputName}.svg`,
      nodeType: outputName
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
}

