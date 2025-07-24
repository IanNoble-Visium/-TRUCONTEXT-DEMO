import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

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
    const { nodeType, prompt, description, advancedSettings } = req.body

    if (!nodeType || (!prompt && !description)) {
      return res.status(400).json({ error: 'Node type and prompt/description are required' })
    }

    const finalPrompt = prompt || description
    
    // Extract advanced settings with defaults
    const settings = {
      model: advancedSettings?.model || 'recraftv3',
      style: advancedSettings?.style || 'vector_illustration',
      substyle: advancedSettings?.substyle || undefined,
      size: advancedSettings?.size || '1024x1024',
      response_format: advancedSettings?.response_format || 'url'
    }

    // Determine which API to use based on configuration
    const iconGenerationAPI = process.env.ICON_GENERATION_API || 'recraft'
    
    let svgContent: string
    let apiUsed = iconGenerationAPI

    try {
      if (iconGenerationAPI === 'recraft') {
        // Try Recraft.ai API first with advanced settings
        svgContent = await generateIconWithRecraft(nodeType, finalPrompt, settings)
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

// Load icon style configuration
let iconStyleConfig: any = null

const loadIconStyleConfig = () => {
  if (!iconStyleConfig) {
    try {
      const configPath = path.join(process.cwd(), 'config', 'icon-styles.json')
      const configData = fs.readFileSync(configPath, 'utf8')
      iconStyleConfig = JSON.parse(configData)
    } catch (error) {
      console.warn('⚠️ Could not load icon-styles.json, using fallback configuration')
      // Fallback configuration
      iconStyleConfig = {
        colorPalettes: {
          actor: { primary: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'] },
          agent: { primary: ['#059669', '#0891B2', '#3B82F6', '#6366F1'] },
          exploit: { primary: ['#DC2626', '#EA580C', '#F59E0B', '#EF4444'] },
          default: { primary: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'] }
        },
        styleConfigurations: {
          actor: { style: 'vector_illustration', substyle: 'colorful_outline', colorMode: 'vibrant' },
          agent: { style: 'vector_illustration', substyle: 'isometric', colorMode: 'rich' },
          exploit: { style: 'vector_illustration', substyle: 'pictogram', colorMode: 'bold' },
          default: { style: 'vector_illustration', substyle: 'flat_design', colorMode: 'vibrant' }
        },
        promptTemplates: {
          colorful: 'Vibrant colorful {nodeType} cybersecurity network icon, {description}. Professional design with rich colors using palette: {colors}. Modern {substyle} style with bold, saturated colors. High contrast, visually striking, suitable for technical diagrams. Emphasize color richness and visual appeal while maintaining clarity.'
        }
      }
    }
  }
  return iconStyleConfig
}

// Enhanced color palettes for different node types
const getColorPaletteForNodeType = (nodeType: string): string[] => {
  const config = loadIconStyleConfig()
  const nodeTypeKey = nodeType.toLowerCase()
  const palette = config.colorPalettes[nodeTypeKey] || config.colorPalettes.default
  return palette.primary || palette
}

// Get enhanced style configuration for vibrant icons
const getStyleConfigForNodeType = (nodeType: string) => {
  const config = loadIconStyleConfig()
  const nodeTypeKey = nodeType.toLowerCase()
  return config.styleConfigurations[nodeTypeKey] || config.styleConfigurations.default
}

// Enhanced Recraft.ai icon generation function with color support and advanced settings
async function generateIconWithRecraft(nodeType: string, description: string, settings?: any): Promise<string> {
  const recraftApiKey = process.env.RECRAFT_API_KEY
  
  if (!recraftApiKey) {
    throw new Error('Recraft API key not configured')
  }

  // Use advanced settings if provided, otherwise fall back to defaults
  const finalSettings = {
    model: settings?.model || 'recraftv3',
    style: settings?.style || 'vector_illustration',
    substyle: settings?.substyle,
    size: settings?.size || '1024x1024',
    response_format: settings?.response_format || 'url'
  }
  
  // Get color palette and style configuration for this node type (for backward compatibility)
  const colorPalette = getColorPaletteForNodeType(nodeType)
  const styleConfig = getStyleConfigForNodeType(nodeType)
  
  // Create prompt using Recraft V3 recommended format
  const config = loadIconStyleConfig()
  const avoidColors = 'professional blue and teal colors only, no red'
  
  // Use Perplexity AI recommended format: "simple [type] cybersecurity icon, [description], vector, flat, modern, minimal, color"
  const optimizedPrompt = `simple ${nodeType} cybersecurity icon, ${description}, vector, flat, modern, minimal, color, ${avoidColors}`

  // Prepare the API request with advanced parameters
  const requestBody: any = {
    prompt: optimizedPrompt,
    style: finalSettings.style,
    model: finalSettings.model,
    size: finalSettings.size,
    response_format: finalSettings.response_format,
    n: 1
  }
  
  // Add substyle if specified
  if (finalSettings.substyle) {
    requestBody.substyle = finalSettings.substyle
  }

  // Note: Removed colors and style_modifiers parameters as they may not be supported
  // and could be causing the API to ignore our color specifications in the prompt

  console.log(`🎨 Generating ${finalSettings.model} ${nodeType} icon with ${finalSettings.style} style (${finalSettings.size}): ${optimizedPrompt}`)

  const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${recraftApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
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

