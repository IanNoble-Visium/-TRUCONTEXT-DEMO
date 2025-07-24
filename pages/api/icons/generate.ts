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

    // Determine which API to use based on configuration
    const iconGenerationAPI = process.env.ICON_GENERATION_API || 'recraft'
    
    let svgContent: string
    let apiUsed = iconGenerationAPI

    try {
      if (iconGenerationAPI === 'recraft') {
        // Try Recraft.ai API first
        svgContent = await generateIconWithRecraft(nodeType, finalPrompt)
      } else {
        // Use Gemini API
        svgContent = await generateIconWithGemini(nodeType, finalPrompt)
      }
    } catch (primaryError: any) {
      console.warn(`Primary API (${iconGenerationAPI}) failed:`, primaryError.message)
      
      // Fallback to alternative API
      try {
        if (iconGenerationAPI === 'recraft') {
          console.log('Falling back to Gemini API...')
          svgContent = await generateIconWithGemini(nodeType, finalPrompt)
          apiUsed = 'gemini-fallback'
        } else {
          console.log('Falling back to Recraft API...')
          svgContent = await generateIconWithRecraft(nodeType, finalPrompt)
          apiUsed = 'recraft-fallback'
        }
      } catch (fallbackError: any) {
        console.error('Both APIs failed:', { primary: primaryError.message, fallback: fallbackError.message })
        throw new Error(`Icon generation failed: ${primaryError.message}. Fallback also failed: ${fallbackError.message}`)
      }
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
        tags: ['trucontext', 'icons', 'svg', 'ai-generated', apiUsed],
        context: {
          source: `ai-generation-${apiUsed}`,
          nodeType: nodeType,
          description: finalPrompt,
          generated_date: new Date().toISOString(),
          api_used: apiUsed
        }
      }
    )

    console.log(`✅ Successfully generated and uploaded icon using ${apiUsed}: ${nodeType} -> ${uploadResult.secure_url}`)

    res.status(200).json({
      success: true,
      message: `Icon for ${nodeType} generated successfully using ${apiUsed}`,
      iconUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      nodeType: nodeType,
      iconPath: uploadResult.secure_url, // For backward compatibility
      apiUsed: apiUsed
    })

  } catch (error: any) {
    console.error('Icon generation error:', error)
    res.status(500).json({
      error: 'Failed to generate icon',
      details: error.message
    })
  }
}

// Recraft.ai icon generation function
async function generateIconWithRecraft(nodeType: string, description: string): Promise<string> {
  const recraftApiKey = process.env.RECRAFT_API_KEY
  
  if (!recraftApiKey) {
    throw new Error('Recraft API key not configured')
  }

  // Create optimized prompt for cybersecurity/network icons
  const optimizedPrompt = `Flat minimalist ${nodeType} cybersecurity network icon, ${description}. Simple, clean, professional design with clear lines. Suitable for technical diagrams. Vector illustration style with appropriate colors for network security visualization.`

  const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${recraftApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: optimizedPrompt,
      style: 'vector_illustration',
      model: 'recraftv3',
      size: '1024x1024',
      response_format: 'url',
      n: 1
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Recraft API error: ${response.status} - ${errorData}`)
  }

  const data = await response.json()
  
  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('Invalid response from Recraft API')
  }

  const imageUrl = data.data[0].url

  // Download the generated image
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error('Failed to download generated image from Recraft')
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  
  // Convert to SVG format (since Recraft generates raster images, we need to create an SVG wrapper)
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  const mimeType = imageResponse.headers.get('content-type') || 'image/png'
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <image href="data:${mimeType};base64,${base64Image}" x="0" y="0" width="512" height="512"/>
  </svg>`

  return svgContent
}

// Preserved Gemini API function for fallback
async function generateIconWithGemini(nodeType: string, description: string): Promise<string> {
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const aiPrompt = `Create a simple, clean SVG icon for a network/cybersecurity component called "${nodeType}". 
  Description: ${description}
  
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

  // Clean up the SVG content more thoroughly
  svgContent = svgContent.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim()
  
  // Remove any markdown formatting or extra text
  const svgMatch = svgContent.match(/<svg[\s\S]*?<\/svg>/i)
  if (svgMatch) {
    svgContent = svgMatch[0]
  }
  
  // Ensure proper SVG structure
  if (!svgContent.startsWith('<svg')) {
    throw new Error('Generated content is not valid SVG - no SVG tag found')
  }

  // Ensure proper dimensions and viewBox
  if (!svgContent.includes('viewBox')) {
    svgContent = svgContent.replace('<svg', '<svg viewBox="0 0 512 512"')
  }
  if (!svgContent.includes('width=')) {
    svgContent = svgContent.replace('<svg', '<svg width="512" height="512"')
  }

  // Validate that it's properly formed SVG
  if (!svgContent.includes('</svg>')) {
    throw new Error('Generated content is not valid SVG - missing closing tag')
  }

  return svgContent
}

