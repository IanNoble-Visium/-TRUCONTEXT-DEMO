import React, { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { getCloudinaryIconUrl, getUnknownIconUrl, checkIconExists } from '../../utils/cloudinary-icons'

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
  const [iconUrl, setIconUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadIcon = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!nodeType) {
          if (isMounted) {
            setIconUrl(getUnknownIconUrl())
            setIsLoading(false)
          }
          return
        }

        // Check if the specific icon exists in Cloudinary
        const iconExists = await checkIconExists(nodeType)
        
        if (!isMounted) return

        if (iconExists) {
          setIconUrl(getCloudinaryIconUrl(nodeType, false))
        } else {
          console.warn(`Icon not found for node type: ${nodeType}, using fallback`)
          setIconUrl(getUnknownIconUrl())
        }
      } catch (err) {
        console.error(`Failed to load icon for ${nodeType}:`, err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setIconUrl(getUnknownIconUrl())
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

  if (error || !iconUrl) {
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
    >
      <img
        src={iconUrl}
        alt={`${nodeType} icon`}
        width={size}
        height={size}
        style={{
          display: 'block',
          objectFit: 'contain'
        }}
        onError={(e) => {
          console.warn(`Failed to load Cloudinary icon for ${nodeType}, using fallback`)
          const target = e.target as HTMLImageElement
          target.src = getUnknownIconUrl()
        }}
      />
    </Box>
  )
}

export default NodeIcon
