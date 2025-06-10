// Shared SVG icon utilities for all views
// This module provides consistent SVG icon loading and rendering across the application

import React from 'react'

// SVG cache to avoid repeated network requests
const svgCache = new Map<string, string>()

// Fallback mappings for common node types
const fallbackMappings: Record<string, string> = {
  'user': 'actor',
  'person': 'actor',
  'host': 'server',
  'machine': 'server',
  'computer': 'device',
  'laptop': 'device',
  'mobile': 'device',
  'phone': 'device',
  'tablet': 'device',
  'router': 'network',
  'switch': 'network',
  'hub': 'network',
  'gateway': 'network',
  'endpoint': 'device',
  'workstation': 'device',
  'file': 'storage',
  'folder': 'storage',
  'directory': 'storage',
  'disk': 'storage',
  'volume': 'storage',
  'application': 'agent',
  'service': 'agent',
  'process': 'agent',
  'software': 'agent',
  'program': 'agent',
  'threat': 'vulnerability',
  'risk': 'vulnerability',
  'attack': 'vulnerability',
  'malware': 'vulnerability',
  'virus': 'vulnerability',
  'log': 'event',
  'alert': 'event',
  'incident': 'event',
  'notification': 'event',
  'message': 'communication',
  'email': 'communication',
  'chat': 'communication',
  'call': 'communication'
}

// Check if an icon file exists
const checkIconExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Dynamic icon path resolution with fallback
export const getNodeIconPath = async (nodeType: string): Promise<string> => {
  if (!nodeType) return '/icons-svg/unknown.svg'

  // Convert type to lowercase for filename matching
  const filename = nodeType.toLowerCase()
  const primaryPath = `/icons-svg/${filename}.svg`

  // Check if primary icon exists
  const primaryExists = await checkIconExists(primaryPath)
  if (primaryExists) {
    console.log(`✓ Found icon for ${nodeType}: ${primaryPath}`)
    return primaryPath
  }

  // Try fallback mappings
  const fallbackType = fallbackMappings[filename]
  if (fallbackType) {
    const fallbackPath = `/icons-svg/${fallbackType}.svg`
    const fallbackExists = await checkIconExists(fallbackPath)
    if (fallbackExists) {
      console.log(`✓ Using fallback icon for ${nodeType}: ${fallbackPath}`)
      return fallbackPath
    }
  }

  console.warn(`⚠ No icon found for ${nodeType}, using unknown.svg`)
  return '/icons-svg/unknown.svg'
}

// Function to load SVG content with caching and error handling
export const loadSVGContent = async (iconPath: string): Promise<string> => {
  if (svgCache.has(iconPath)) {
    return svgCache.get(iconPath)!
  }

  try {
    const response = await fetch(iconPath)
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.status}`)
    }
    const svgText = await response.text()
    svgCache.set(iconPath, svgText)
    return svgText
  } catch (error) {
    console.warn(`⚠ Failed to load SVG from ${iconPath}:`, error)
    // Try to load fallback
    if (iconPath !== '/icons-svg/unknown.svg') {
      return loadSVGContent('/icons-svg/unknown.svg')
    }
    // Return a simple fallback SVG if even unknown.svg fails
    const fallbackSVG = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#666"/>
      <text x="10" y="14" text-anchor="middle" font-size="12" fill="white">?</text>
    </svg>`
    svgCache.set(iconPath, fallbackSVG)
    return fallbackSVG
  }
}

// Extract PNG data from SVG with embedded images
const extractPNGFromSVG = (svgContent: string): string | null => {
  const imageMatch = svgContent.match(/<image[^>]*href="([^"]*)"[^>]*>/i) ||
                     svgContent.match(/<image[^>]*xlink:href="([^"]*)"[^>]*>/i)
  
  if (imageMatch && imageMatch[1] && imageMatch[1].startsWith('data:image/png;base64,')) {
    return imageMatch[1]
  }
  return null
}

// Generate icon HTML for different view contexts
export const generateIconHTML = async (
  nodeType: string, 
  size: number = 20,
  className: string = ''
): Promise<string> => {
  try {
    const iconPath = await getNodeIconPath(nodeType)
    const rawSVG = await loadSVGContent(iconPath)
    
    // Check if SVG contains embedded PNG data
    const pngDataUrl = extractPNGFromSVG(rawSVG)
    
    if (pngDataUrl) {
      // Use background image approach for embedded PNG data
      return `
        <div class="node-icon ${className}" style="
          width: ${size}px;
          height: ${size}px;
          background-image: url('${pngDataUrl}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          display: inline-block;
          vertical-align: middle;
        "></div>
      `
    } else {
      // Process pure SVG content
      const cleanSVG = rawSVG
        .replace(/width="[^"]*"/g, `width="${size}"`)
        .replace(/height="[^"]*"/g, `height="${size}"`)
        .replace(/xmlns="[^"]*"/g, '')
        .replace(/xmlns:xlink="[^"]*"/g, '')
        .replace(/<\?xml[^>]*\?>/g, '')
        .trim()
      
      return `<div class="node-icon ${className}" style="display: inline-block; vertical-align: middle;">${cleanSVG}</div>`
    }
  } catch (error) {
    console.error(`Failed to generate icon HTML for ${nodeType}:`, error)
    // Return fallback icon
    return `
      <div class="node-icon ${className}" style="
        width: ${size}px;
        height: ${size}px;
        background-color: #666;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${Math.floor(size * 0.6)}px;
        font-weight: bold;
      ">?</div>
    `
  }
}

// React component wrapper for icons
export const createIconComponent = (nodeType: string, size: number = 20) => {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: '' },
    ref: async (element: HTMLDivElement | null) => {
      if (element && !element.hasAttribute('data-icon-loaded')) {
        const iconHTML = await generateIconHTML(nodeType, size)
        element.innerHTML = iconHTML
        element.setAttribute('data-icon-loaded', 'true')
      }
    }
  })
}

// Clear the SVG cache (useful for development/testing)
export const clearIconCache = () => {
  svgCache.clear()
}

// Get cache statistics
export const getIconCacheStats = () => {
  return {
    size: svgCache.size,
    keys: Array.from(svgCache.keys())
  }
}
