// Shared SVG icon utilities for all views
// This module provides consistent SVG icon loading and rendering across the application
// Updated to use Cloudinary as the primary icon source

import React from 'react'
import { getCloudinaryIconUrl, getUnknownIconUrl, checkIconExists as checkCloudinaryIconExists } from './cloudinary-icons'

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

// Dynamic icon URL resolution with Cloudinary fallback
export const getNodeIconPath = async (nodeType: string): Promise<string> => {
  if (!nodeType) return getUnknownIconUrl()

  // First try to get from Cloudinary
  try {
    const iconExists = await checkCloudinaryIconExists(nodeType)
    if (iconExists) {
      console.log(`✓ Found Cloudinary icon for ${nodeType}`)
      return getCloudinaryIconUrl(nodeType, false)
    }

    // Try fallback mappings in Cloudinary
    const filename = nodeType.toLowerCase()
    const fallbackType = fallbackMappings[filename]
    if (fallbackType) {
      const fallbackExists = await checkCloudinaryIconExists(fallbackType)
      if (fallbackExists) {
        console.log(`✓ Using Cloudinary fallback icon for ${nodeType}: ${fallbackType}`)
        return getCloudinaryIconUrl(fallbackType, false)
      }
    }
  } catch (error) {
    console.warn(`⚠ Error checking Cloudinary icons for ${nodeType}:`, error)
  }

  console.warn(`⚠ No Cloudinary icon found for ${nodeType}, using unknown fallback`)
  return getUnknownIconUrl()
}

// Function to load SVG content with caching and error handling
// Now supports both Cloudinary URLs and local paths for backward compatibility
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
    
    // If it's a Cloudinary URL that failed, try the unknown icon
    if (iconPath.includes('cloudinary.com')) {
      const unknownUrl = getUnknownIconUrl()
      if (unknownUrl !== iconPath) {
        return loadSVGContent(unknownUrl)
      }
    }
    
    // Fallback for non-Cloudinary paths - convert to Cloudinary unknown icon
    if (!iconPath.includes('cloudinary.com')) {
      const unknownUrl = getUnknownIconUrl()
      return loadSVGContent(unknownUrl)
    }
    
    // Return a simple fallback SVG if all else fails
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
// Now uses Cloudinary URLs directly for better performance
export const generateIconHTML = async (
  nodeType: string, 
  size: number = 20,
  className: string = ''
): Promise<string> => {
  try {
    // Get Cloudinary URL directly instead of loading SVG content
    const iconUrl = await getNodeIconPath(nodeType)
    
    // For Cloudinary URLs, use img tag for better performance
    if (iconUrl.includes('cloudinary.com')) {
      return `
        <img class="node-icon ${className}" 
             src="${iconUrl}" 
             alt="${nodeType} icon"
             width="${size}" 
             height="${size}"
             style="display: inline-block; vertical-align: middle; object-fit: contain;"
             onerror="this.src='${getUnknownIconUrl()}'"
        />
      `
    }
    
    // Legacy SVG processing for non-Cloudinary URLs
    const rawSVG = await loadSVGContent(iconUrl)
    
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
    // Return fallback icon using Cloudinary unknown icon
    const unknownUrl = getUnknownIconUrl()
    return `
      <img class="node-icon ${className}" 
           src="${unknownUrl}" 
           alt="Unknown icon"
           width="${size}" 
           height="${size}"
           style="display: inline-block; vertical-align: middle; object-fit: contain;"
      />
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
