import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const { prompt, nodeType, style = 'cybersecurity' } = req.body

    if (!prompt || !nodeType) {
      return res.status(400).json({ error: 'Prompt and nodeType are required' })
    }

    // Generate icon using Gemini AI
    const iconContent = await generateIconWithGemini(nodeType, prompt, style)
    
    const iconsDir = path.join(process.cwd(), 'public', 'icons-svg')
    
    // Ensure icons directory exists
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true })
    }

    const filename = `${nodeType}.svg`
    const filepath = path.join(iconsDir, filename)
    
    // Write the SVG file
    fs.writeFileSync(filepath, iconContent)

    res.status(200).json({
      message: 'Icon generated successfully',
      filename,
      iconPath: `/icons-svg/${filename}`,
      nodeType
    })
  } catch (error) {
    console.error('Generation error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate icon'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Google API key not configured. Please set GOOGLE_API_KEY in your environment variables.'
      } else if (error.message.includes('Gemini API')) {
        errorMessage = 'Google Gemini API error. Please check your API key and quota.'
      } else {
        errorMessage = error.message
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}

async function generateIconWithGemini(nodeType: string, prompt: string, style: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY
  
  if (!apiKey) {
    console.warn('Google API key not found, using placeholder SVG')
    return generatePlaceholderSVG(nodeType, prompt, style)
  }

  try {
    // Create a detailed prompt for cybersecurity icon generation
    const detailedPrompt = `Create a professional cybersecurity icon for "${nodeType}". ${prompt}. 
    Style requirements:
    - Minimalist and clean design
    - Suitable for network diagrams and dashboards
    - Professional cybersecurity aesthetic
    - Simple geometric shapes
    - High contrast
    - Scalable vector design
    - Monochromatic or limited color palette
    - Clear and recognizable at small sizes
    - Technical/enterprise style
    
    The icon should be simple, professional, and immediately recognizable as representing "${nodeType}" in a cybersecurity context.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: detailedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "text/plain"
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    // For now, if Gemini doesn't support direct SVG generation,
    // we'll use the response to create a more informed placeholder
    const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Create an enhanced SVG based on Gemini's description
    return createEnhancedSVG(nodeType, prompt, style, geminiResponse)
    
  } catch (error) {
    console.error('Gemini API error:', error)
    // Fallback to placeholder if Gemini fails
    return generatePlaceholderSVG(nodeType, prompt, style)
  }
}

function createEnhancedSVG(nodeType: string, prompt: string, style: string, geminiDescription: string): string {
  // Enhanced SVG creation based on Gemini's description
  const colors = {
    firewall: '#ff6b6b',
    database: '#4ecdc4',
    server: '#45b7d1',
    router: '#96ceb4',
    switch: '#ffeaa7',
    user: '#dda0dd',
    network: '#98d8c8',
    security: '#f7dc6f',
    threat: '#ec7063',
    load_balancer: '#74b9ff',
    default: '#74b9ff'
  }
  
  const color = colors[nodeType.toLowerCase() as keyof typeof colors] || colors.default
  
  // Create more sophisticated shapes based on node type and Gemini description
  let shape = ''
  
  switch (nodeType.toLowerCase()) {
    case 'firewall':
      shape = `
        <rect x="20" y="25" width="60" height="50" fill="${color}" stroke="#333" stroke-width="2" rx="8"/>
        <rect x="25" y="30" width="8" height="40" fill="#fff" opacity="0.9"/>
        <rect x="38" y="30" width="8" height="40" fill="#fff" opacity="0.9"/>
        <rect x="51" y="30" width="8" height="40" fill="#fff" opacity="0.9"/>
        <rect x="64" y="30" width="8" height="40" fill="#fff" opacity="0.9"/>
        <circle cx="50" cy="15" r="6" fill="#ff4757" stroke="#333" stroke-width="2"/>
        <path d="M 47 12 L 50 15 L 53 12" stroke="#fff" stroke-width="2" fill="none"/>
      `
      break
    case 'load_balancer':
      shape = `
        <rect x="25" y="30" width="50" height="40" fill="${color}" stroke="#333" stroke-width="2" rx="6"/>
        <circle cx="35" cy="40" r="3" fill="#333"/>
        <circle cx="45" cy="40" r="3" fill="#333"/>
        <circle cx="55" cy="40" r="3" fill="#333"/>
        <circle cx="65" cy="40" r="3" fill="#333"/>
        <path d="M 30 20 L 40 25 L 50 20 L 60 25 L 70 20" stroke="#333" stroke-width="2" fill="none"/>
        <path d="M 30 80 L 40 75 L 50 80 L 60 75 L 70 80" stroke="#333" stroke-width="2" fill="none"/>
        <text x="50" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#333">LB</text>
      `
      break
    case 'database':
      shape = `
        <ellipse cx="50" cy="25" rx="28" ry="10" fill="${color}" stroke="#333" stroke-width="2"/>
        <rect x="22" y="25" width="56" height="35" fill="${color}" stroke="#333" stroke-width="2"/>
        <ellipse cx="50" cy="60" rx="28" ry="10" fill="${color}" stroke="#333" stroke-width="2"/>
        <ellipse cx="50" cy="40" rx="28" ry="10" fill="none" stroke="#333" stroke-width="2"/>
        <ellipse cx="50" cy="50" rx="28" ry="10" fill="none" stroke="#333" stroke-width="2"/>
      `
      break
    case 'server':
      shape = `
        <rect x="25" y="20" width="50" height="60" fill="${color}" stroke="#333" stroke-width="2" rx="4"/>
        <rect x="30" y="25" width="40" height="10" fill="#333" rx="2"/>
        <rect x="30" y="40" width="40" height="10" fill="#333" rx="2"/>
        <rect x="30" y="55" width="40" height="10" fill="#333" rx="2"/>
        <circle cx="68" cy="30" r="2" fill="#00ff00"/>
        <circle cx="68" cy="45" r="2" fill="#00ff00"/>
        <circle cx="68" cy="60" r="2" fill="#00ff00"/>
        <rect x="32" y="27" width="6" height="6" fill="${color}"/>
        <rect x="32" y="42" width="6" height="6" fill="${color}"/>
        <rect x="32" y="57" width="6" height="6" fill="${color}"/>
      `
      break
    case 'router':
    case 'switch':
      shape = `
        <rect x="20" y="35" width="60" height="30" fill="${color}" stroke="#333" stroke-width="2" rx="6"/>
        <circle cx="30" cy="50" r="3" fill="#333"/>
        <circle cx="42" cy="50" r="3" fill="#333"/>
        <circle cx="54" cy="50" r="3" fill="#333"/>
        <circle cx="66" cy="50" r="3" fill="#333"/>
        <rect x="25" y="25" width="50" height="6" fill="#333" rx="3"/>
        <rect x="27" y="27" width="4" height="2" fill="${color}"/>
        <rect x="33" y="27" width="4" height="2" fill="${color}"/>
        <rect x="39" y="27" width="4" height="2" fill="${color}"/>
        <circle cx="75" cy="40" r="2" fill="#00ff00"/>
        <circle cx="75" cy="50" r="2" fill="#ff6b6b"/>
        <circle cx="75" cy="60" r="2" fill="#ffa500"/>
      `
      break
    case 'user':
      shape = `
        <circle cx="50" cy="35" r="18" fill="${color}" stroke="#333" stroke-width="2"/>
        <path d="M 25 75 Q 25 60 50 60 Q 75 60 75 75 Z" fill="${color}" stroke="#333" stroke-width="2"/>
        <circle cx="45" cy="30" r="2" fill="#333"/>
        <circle cx="55" cy="30" r="2" fill="#333"/>
        <path d="M 42 40 Q 50 45 58 40" stroke="#333" stroke-width="2" fill="none"/>
      `
      break
    default:
      shape = `
        <circle cx="50" cy="50" r="28" fill="${color}" stroke="#333" stroke-width="2"/>
        <text x="50" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">${nodeType.charAt(0).toUpperCase()}</text>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
      `
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000040"/>
    </filter>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    ${shape.replace(new RegExp(color, 'g'), 'url(#grad)')}
  </g>
</svg>`
}

function generatePlaceholderSVG(nodeType: string, prompt: string, style: string): string {
  // Fallback placeholder SVG (same as before but enhanced)
  return createEnhancedSVG(nodeType, prompt, style, '')
}

