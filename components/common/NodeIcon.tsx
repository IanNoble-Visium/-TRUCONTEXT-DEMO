import React, { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { getNodeIconPath, loadSVGContent } from '../../utils/iconUtils'

interface NodeIconProps {
  nodeType: string
  size?: number
  className?: string
  style?: React.CSSProperties
  fallbackColor?: string
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

const NodeIcon: React.FC<NodeIconProps> = ({ 
  nodeType, 
  size = 20, 
  className = '', 
  style = {},
  fallbackColor = '#666'
}) => {
  const [iconContent, setIconContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadIcon = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const iconPath = await getNodeIconPath(nodeType)
        const rawSVG = await loadSVGContent(iconPath)
        
        if (!isMounted) return

        // Check if SVG contains embedded PNG data
        const pngDataUrl = extractPNGFromSVG(rawSVG)
        
        if (pngDataUrl) {
          // Use background image approach for embedded PNG data
          setIconContent(`
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-image: url('${pngDataUrl}');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              display: inline-block;
              vertical-align: middle;
            "></div>
          `)
        } else {
          // Process pure SVG content
          const cleanSVG = rawSVG
            .replace(/width="[^"]*"/g, `width="${size}"`)
            .replace(/height="[^"]*"/g, `height="${size}"`)
            .replace(/xmlns="[^"]*"/g, '')
            .replace(/xmlns:xlink="[^"]*"/g, '')
            .replace(/<\?xml[^>]*\?>/g, '')
            .trim()
          
          setIconContent(cleanSVG)
        }
      } catch (err) {
        console.error(`Failed to load icon for ${nodeType}:`, err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          // Set fallback icon
          setIconContent(`
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-color: ${fallbackColor};
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${Math.floor(size * 0.6)}px;
              font-weight: bold;
            ">?</div>
          `)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadIcon()

    return () => {
      isMounted = false
    }
  }, [nodeType, size, fallbackColor])

  if (isLoading) {
    return (
      <Box
        width={`${size}px`}
        height={`${size}px`}
        bg="gray.200"
        borderRadius="50%"
        display="inline-block"
        className={className}
        style={style}
      />
    )
  }

  if (error || !iconContent) {
    return (
      <Box
        width={`${size}px`}
        height={`${size}px`}
        bg={fallbackColor}
        borderRadius="50%"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontSize={`${Math.floor(size * 0.6)}px`}
        fontWeight="bold"
        className={className}
        style={style}
      >
        ?
      </Box>
    )
  }

  return (
    <Box
      display="inline-block"
      verticalAlign="middle"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: iconContent }}
    />
  )
}

export default NodeIcon
