import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { nodeType, prompt, description } = req.body

    if (!nodeType || (!prompt && !description)) {
      return res.status(400).json({ error: 'Node type and prompt/description are required' })
    }

    const finalPrompt = prompt || description

    // Generate SVG using Gemini AI
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const aiPrompt = `Create a simple, clean SVG icon for a network/cybersecurity component called "${nodeType}". 
    Description: ${finalPrompt}
    
    Requirements:
    - Return ONLY the SVG code, no explanations
    - Use a 512x512 viewBox
    - Use simple, professional design with clean lines
    - Use colors appropriate for cybersecurity/network diagrams
    - Make it scalable and recognizable at small sizes
    - Include proper SVG structure with xmlns attribute
    
    Example format:
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <!-- SVG content here -->
    </svg>`

    const result = await model.generateContent(aiPrompt)
    const response = await result.response
    let svgContent = response.text()

    // Clean up the SVG content
    svgContent = svgContent.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Ensure proper SVG structure
    if (!svgContent.startsWith('<svg')) {
      throw new Error('Generated content is not valid SVG')
    }

    // Ensure proper dimensions and viewBox
    if (!svgContent.includes('viewBox')) {
      svgContent = svgContent.replace('<svg', '<svg viewBox="0 0 512 512"')
    }
    if (!svgContent.includes('width=')) {
      svgContent = svgContent.replace('<svg', '<svg width="512" height="512"')
    }

    // Upload SVG directly to Cloudinary from memory
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`,
      {
        public_id: `trucontext-icons/${nodeType}`,
        folder: 'trucontext-icons',
        resource_type: 'image',
        format: 'svg',
        overwrite: true,
        tags: ['trucontext', 'icons', 'svg', 'ai-generated'],
        context: {
          source: 'ai-generation',
          nodeType: nodeType,
          description: finalPrompt,
          generated_date: new Date().toISOString()
        }
      }
    )

    console.log(`✅ Successfully generated and uploaded icon: ${nodeType} -> ${uploadResult.secure_url}`)

    res.status(200).json({
      success: true,
      message: `Icon for ${nodeType} generated successfully`,
      iconUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      nodeType: nodeType,
      iconPath: uploadResult.secure_url // For backward compatibility
    })

  } catch (error: any) {
    console.error('Icon generation error:', error)
    res.status(500).json({
      error: 'Failed to generate icon',
      details: error.message
    })
  }
}

