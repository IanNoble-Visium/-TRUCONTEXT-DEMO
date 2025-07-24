import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    // Check if Google API key is configured
    const googleApiKey = process.env.GOOGLE_API_KEY
    if (!googleApiKey) {
      // Return a fallback response with placeholder icon
      const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <rect width="512" height="512" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
        <text x="256" y="256" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24" fill="#666">${nodeType}</text>
      </svg>`
      
      return res.status(200).json({
        success: false,
        error: 'AI generation requires Google API key. Using placeholder icon instead.',
        iconUrl: null,
        placeholderSvg: placeholderSvg,
        nodeType: nodeType
      })
    }

    // Generate SVG using Gemini AI
    const genAI = new GoogleGenerativeAI(googleApiKey)
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
    
    let errorMessage = 'Failed to generate icon'
    let statusCode = 500
    
    if (error.message?.includes('API key')) {
      errorMessage = 'AI generation requires Google API key. Please configure GOOGLE_API_KEY in environment variables.'
      statusCode = 400
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = 'AI service quota exceeded. Please try again later.'
      statusCode = 429
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      errorMessage = 'Network error connecting to AI service. Please try again.'
      statusCode = 503
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: error.message
    })
  }
}

