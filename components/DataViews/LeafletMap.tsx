import React, { useEffect, useRef, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Box, Portal, Button, ButtonGroup, VStack, Text, useColorModeValue } from '@chakra-ui/react'
import { NodeTooltip, EdgeTooltip } from '../GraphTooltip'

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

interface GeoNode {
  id: string
  uid: string
  showname: string
  type: string
  latitude: number
  longitude: number
  color: string
  properties: any
  isSelected: boolean
}

interface GeoEdge {
  from: string
  to: string
  type: string
  properties: any
}

interface LeafletMapProps {
  geoNodes: GeoNode[]
  geoEdges: GeoEdge[]
  onNodeSelect: (nodeId: string) => void
  height: string
}

interface TooltipData {
  type: 'node' | 'edge'
  data: any
  position: { x: number; y: number }
}

// SVG content cache to avoid repeated fetches
const svgCache = new Map<string, string>()

// Cache for icon existence checks
const iconExistsCache = new Map<string, boolean>()

// Helper function to check if an icon file exists
const checkIconExists = async (iconPath: string): Promise<boolean> => {
  if (iconExistsCache.has(iconPath)) {
    return iconExistsCache.get(iconPath)!
  }

  try {
    const response = await fetch(iconPath, { method: 'HEAD' })
    const exists = response.ok
    iconExistsCache.set(iconPath, exists)
    return exists
  } catch (error) {
    console.warn(`Failed to check icon existence: ${iconPath}`, error)
    iconExistsCache.set(iconPath, false)
    return false
  }
}

// Dynamic icon path resolution with fallback
const getNodeIconPath = async (nodeType: string): Promise<string> => {
  if (!nodeType) return '/icons-svg/unknown.svg'

  // Convert type to lowercase for filename matching
  const filename = nodeType.toLowerCase()
  const primaryPath = `/icons-svg/${filename}.svg`

  // Check if the primary icon exists
  const exists = await checkIconExists(primaryPath)
  if (exists) {
    console.log(`✓ Found icon for ${nodeType}: ${primaryPath}`)
    return primaryPath
  }

  // Fallback mappings for common variations
  const fallbackMappings: { [key: string]: string } = {
    'threatactor': 'actor',
    'workstation': 'client',
  }

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

// Function to load SVG content with better error handling
const loadSVGContent = async (iconPath: string): Promise<string> => {
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
    console.log(`✓ Successfully loaded SVG: ${iconPath}`)
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
    console.log(`✓ Using fallback SVG for ${iconPath}`)
    return fallbackSVG
  }
}

// Get color for node type with better color mapping
const getNodeColor = (node: GeoNode) => {
  // Use the color from the dataset if available and it's not the default gray
  if (node.color && node.color !== '#666666' && node.color !== '#666') {
    return node.color
  }

  // Enhanced color scheme based on type with more vibrant colors
  switch (node.type.toLowerCase()) {
    case 'server': return '#2563eb'        // Blue
    case 'application': return '#059669'   // Green
    case 'database': return '#7c3aed'      // Purple
    case 'user': return '#ea580c'          // Orange
    case 'vulnerability': return '#dc2626' // Red
    case 'firewall': return '#ca8a04'      // Yellow
    case 'network': return '#0891b2'       // Cyan
    case 'storage': return '#9333ea'       // Violet
    case 'laptop': return '#7c2d12'        // Brown
    case 'malware': return '#1f2937'       // Dark gray
    case 'attack': return '#991b1b'        // Dark red
    case 'traffic': return '#374151'       // Gray
    case 'router': return '#0d9488'        // Teal
    case 'switch': return '#4338ca'        // Indigo
    case 'workstation': return '#be185d'   // Pink
    default: return '#6b7280'              // Default gray
  }
}

// Icon size configuration with optimized scaling
const getIconSizeConfig = (sizeOption: 'small' | 'medium' | 'large', isSelected: boolean) => {
  const sizeMultiplier = isSelected ? 1.3 : 1.0  // Reduced from 1.4 to 1.3 for better proportions

  // Base container sizes
  const baseSizes = {
    small: 24,   // Increased from 20 for better visibility
    medium: 32,  // Increased from 28 for better proportions
    large: 42    // Increased from 36 for more noticeable difference
  }

  switch (sizeOption) {
    case 'small':
      return Math.round(baseSizes.small * sizeMultiplier)
    case 'medium':
      return Math.round(baseSizes.medium * sizeMultiplier)
    case 'large':
      return Math.round(baseSizes.large * sizeMultiplier)
    default:
      return Math.round(baseSizes.medium * sizeMultiplier)
  }
}

// Custom marker icon based on node properties with SVG support
const createCustomIcon = async (node: GeoNode, iconSizeOption: 'small' | 'medium' | 'large' = 'medium') => {
  if (typeof window === 'undefined') return null

  const L = require('leaflet')
  const color = getNodeColor(node)
  const size = getIconSizeConfig(iconSizeOption, node.isSelected)
  const borderColor = node.isSelected ? '#ffffff' : '#000000'
  const borderWidth = node.isSelected ? 3 : 2

  // Add special styling for high-risk nodes
  const isHighRisk = node.properties.cvss_score && parseFloat(node.properties.cvss_score) > 7
  const riskIndicator = isHighRisk ? `
    <div style="
      position: absolute;
      top: -3px;
      right: -3px;
      width: 10px;
      height: 10px;
      background-color: #dc2626;
      border: 2px solid white;
      border-radius: 50%;
      z-index: 1000;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    "></div>
  ` : ''

  // Load SVG content for the node type
  const iconPath = await getNodeIconPath(node.type)
  let svgContent = ''

  try {
    console.log(`🔍 Attempting to load SVG for ${node.type} from ${iconPath}`)
    const rawSVG = await loadSVGContent(iconPath)
    console.log(`✅ Loaded SVG for ${node.type} from ${iconPath}:`, rawSVG.substring(0, 200) + '...')

    // For SVGs with embedded images, we need to handle them specially
    if (rawSVG.includes('<svg')) {
      // Calculate optimal icon size - use 85% of container for better visibility while leaving room for borders
      const iconSize = Math.floor(size * 0.85)

      // Extract viewBox dimensions from the SVG
      const viewBoxMatch = rawSVG.match(/viewBox="([^"]*)"/)
      let viewBox = '0 0 512 512' // default
      if (viewBoxMatch) {
        viewBox = viewBoxMatch[1]
      } else {
        // Try to extract from width/height
        const widthMatch = rawSVG.match(/width="([^"]*)"/)
        const heightMatch = rawSVG.match(/height="([^"]*)"/)
        if (widthMatch && heightMatch) {
          const w = widthMatch[1]
          const h = heightMatch[1]
          viewBox = `0 0 ${w} ${h}`
        }
      }

      // Extract the base64 PNG data from the SVG
      const imageMatch = rawSVG.match(/xlink:href="data:image\/png;base64,([^"]+)"/)

      if (imageMatch && imageMatch[1]) {
        // Use the extracted PNG data directly as an image
        const pngDataUrl = `data:image/png;base64,${imageMatch[1]}`

        // Use background image approach for better circular clipping
        svgContent = `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${iconSize}px;
            height: ${iconSize}px;
            background-image: url('${pngDataUrl}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 1000;
            pointer-events: none;
            opacity: 1;
          "></div>
        `
        console.log(`✓ Generated background IMG content for ${node.type}:`, svgContent.substring(0, 200) + '...')
      } else {
        // Fallback to SVG embedding if no PNG data found
        let cleanSVG = rawSVG
          .replace(/width="[^"]*"/g, `width="${iconSize}"`)
          .replace(/height="[^"]*"/g, `height="${iconSize}"`)
          .replace(/viewBox="[^"]*"/g, `viewBox="${viewBox}"`)

        // Ensure viewBox is present for proper scaling
        if (!cleanSVG.includes('viewBox')) {
          cleanSVG = cleanSVG.replace('<svg', `<svg viewBox="${viewBox}"`)
        }

        // Add styling directly to the SVG for proper positioning
        cleanSVG = cleanSVG.replace('<svg', `<svg style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          pointer-events: none;
          display: block;
        "`)

        svgContent = cleanSVG
        console.log(`✓ Generated SVG content for ${node.type}:`, cleanSVG.substring(0, 200) + '...')
      }

      console.log(`✓ Successfully processed SVG for ${node.type}, container: ${size}px, icon: ${iconSize}px (${Math.round((iconSize/size)*100)}%), viewBox: ${viewBox}`)
    } else {
      console.warn(`⚠ Invalid SVG content for ${node.type}`)
    }
  } catch (error) {
    console.error(`❌ Failed to load SVG for node ${node.uid} (${node.type}) from ${iconPath}:`, error)
    console.log(`❌ SVG content will be empty, falling back to colored circle`)
  }

  console.log(`✓ Creating icon for node ${node.uid} (${node.type}): color=${color}, size=${size}, selected=${node.isSelected}`)

  // Determine if we should use SVG icon or fallback to colored circle
  const useSVGIcon = svgContent.trim().length > 0
  const backgroundColor = useSVGIcon ? 'transparent' : color

  console.log(`✓ Icon creation summary for ${node.uid}:`, {
    type: node.type,
    useSVGIcon,
    svgContentLength: svgContent.length,
    backgroundColor,
    size
  })

  return L.divIcon({
    className: 'custom-geo-marker',
    html: `
      <div class="geo-marker-container" style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${backgroundColor};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        transition: all 0.2s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      ">
        ${svgContent}
        ${riskIndicator}
      </div>
    `,
    iconSize: [size + borderWidth * 2, size + borderWidth * 2],
    iconAnchor: [(size + borderWidth * 2) / 2, (size + borderWidth * 2) / 2],
    popupAnchor: [0, -(size + borderWidth * 2) / 2]
  })
}

// Get edge color based on type
const getEdgeColor = (edgeType: string) => {
  switch (edgeType.toLowerCase()) {
    case 'attack': return '#dc2626'
    case 'vulnerability': return '#f59e0b'
    case 'connection': return '#3b82f6'
    case 'communication': return '#10b981'
    case 'dependency': return '#8b5cf6'
    default: return '#6b7280'
  }
}

// Get edge weight based on type
const getEdgeWeight = (edgeType: string) => {
  switch (edgeType.toLowerCase()) {
    case 'attack': return 3
    case 'vulnerability': return 2
    default: return 1
  }
}

const LeafletMap: React.FC<LeafletMapProps> = ({ geoNodes, geoEdges = [], onNodeSelect, height }) => {
  const mapRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [customIcons, setCustomIcons] = useState<Map<string, any>>(new Map())
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium')
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Color mode values for the size control - moved before early return to fix hooks order
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Calculate map bounds to fit all nodes
  const bounds = useMemo(() => {
    if (geoNodes.length === 0) return undefined

    const latitudes = geoNodes.map(node => node.latitude)
    const longitudes = geoNodes.map(node => node.longitude)

    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ] as [[number, number], [number, number]]
  }, [geoNodes])

  // Default center if no nodes
  const defaultCenter: [number, number] = [0, 0]
  const defaultZoom = 2

  // Tooltip helper functions
  const clearTooltipTimeout = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
  }

  const clearTooltipWithDelay = () => {
    clearTooltipTimeout()
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipData(null)
    }, 100)
  }

  // Preload icons for all nodes
  useEffect(() => {
    const loadIcons = async () => {
      const iconMap = new Map()
      for (const node of geoNodes) {
        const iconKey = `${node.type}-${node.isSelected}-${iconSize}`
        if (!iconMap.has(iconKey)) {
          const icon = await createCustomIcon(node, iconSize)
          iconMap.set(iconKey, icon)
        }
      }
      setCustomIcons(iconMap)
    }

    if (isClient && geoNodes.length > 0) {
      loadIcons()
    }
  }, [geoNodes, isClient, iconSize])

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true)

    // Add custom styles for geo markers
    if (typeof window !== 'undefined') {

      // Add custom CSS for geo markers
      const style = document.createElement('style')
      style.textContent = `
        .custom-geo-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-geo-marker .geo-marker-container {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden !important;
        }
        .custom-geo-marker:hover .geo-marker-container {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .custom-geo-marker img {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain;
          object-position: center;
          image-rendering: auto;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          display: block;
          filter: contrast(1.1) brightness(1.05);
          transition: filter 0.2s ease;
        }
        .custom-geo-marker:hover img {
          filter: contrast(1.2) brightness(1.1);
        }
        .leaflet-marker-icon {
          border: none !important;
          background: transparent !important;
          overflow: visible !important;
        }
      `
      document.head.appendChild(style)

      // Fix for default markers in react-leaflet
      const L = require('leaflet')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  useEffect(() => {
    // Fit bounds when nodes change
    if (mapRef.current && bounds && isClient) {
      // Check if the map instance has the fitBounds method
      const mapInstance = mapRef.current
      if (mapInstance && typeof mapInstance.fitBounds === 'function') {
        try {
          mapInstance.fitBounds(bounds, { padding: [20, 20] })
        } catch (error) {
          console.warn('Failed to fit bounds:', error)
        }
      }
    }
  }, [bounds, isClient])

  // Don't render on server side
  if (!isClient) {
    return (
      <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading map...
      </div>
    )
  }

  return (
    <Box position="relative" height={height} width="100%">
      {/* Icon Size Control */}
      <Box
        position="absolute"
        top="10px"
        right="10px"
        zIndex={1000}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        p={2}
        boxShadow="md"
      >
        <VStack spacing={2} align="stretch">
          <Text fontSize="xs" fontWeight="bold" textAlign="center">
            Icon Size
          </Text>
          <ButtonGroup size="xs" isAttached variant="outline">
            <Button
              onClick={() => setIconSize('small')}
              colorScheme={iconSize === 'small' ? 'blue' : 'gray'}
              variant={iconSize === 'small' ? 'solid' : 'outline'}
            >
              S
            </Button>
            <Button
              onClick={() => setIconSize('medium')}
              colorScheme={iconSize === 'medium' ? 'blue' : 'gray'}
              variant={iconSize === 'medium' ? 'solid' : 'outline'}
            >
              M
            </Button>
            <Button
              onClick={() => setIconSize('large')}
              colorScheme={iconSize === 'large' ? 'blue' : 'gray'}
              variant={iconSize === 'large' ? 'solid' : 'outline'}
            >
              L
            </Button>
          </ButtonGroup>
        </VStack>
      </Box>

      <MapContainer
      center={bounds ? undefined : defaultCenter}
      zoom={bounds ? undefined : defaultZoom}
      bounds={bounds}
      boundsOptions={{ padding: [20, 20] }}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      worldCopyJump={true}
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
        bounds={[[-90, -180], [90, 180]]}
        minZoom={2}
        maxZoom={18}
      />

      {/* Render edges first so they appear behind markers */}
      {geoEdges.map((edge, index) => {
        const fromNode = geoNodes.find(node => node.uid === edge.from || node.id === edge.from)
        const toNode = geoNodes.find(node => node.uid === edge.to || node.id === edge.to)

        if (!fromNode || !toNode) return null

        return (
          <Polyline
            key={`edge-${index}`}
            positions={[
              [fromNode.latitude, fromNode.longitude],
              [toNode.latitude, toNode.longitude]
            ]}
            pathOptions={{
              color: getEdgeColor(edge.type),
              weight: getEdgeWeight(edge.type),
              opacity: 0.7,
              dashArray: edge.type === 'attack' ? '5, 5' : undefined
            }}
            eventHandlers={{
              mouseover: (event) => {
                const mouseEvent = event.originalEvent
                if (mouseEvent) {
                  clearTooltipTimeout()
                  setTooltipData({
                    type: 'edge',
                    data: {
                      id: `${edge.from}-${edge.to}`,
                      label: edge.type,
                      source: fromNode.showname,
                      target: toNode.showname,
                      type: edge.type,
                      properties: edge.properties
                    },
                    position: { x: mouseEvent.pageX, y: mouseEvent.pageY }
                  })
                }
              },
              mouseout: () => {
                clearTooltipWithDelay()
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                  Connection
                </h4>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Type:</strong> {edge.type}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>From:</strong> {fromNode.showname}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>To:</strong> {toNode.showname}
                </p>
              </div>
            </Popup>
          </Polyline>
        )
      })}

      {/* Render nodes */}
      {geoNodes.map((node) => {
        const iconKey = `${node.type}-${node.isSelected}-${iconSize}`
        const icon = customIcons.get(iconKey)

        if (!icon) return null // Skip if icon not loaded yet

        return (
          <Marker
            key={node.id}
            position={[node.latitude, node.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onNodeSelect(node.uid),
              mouseover: (event) => {
                const mouseEvent = event.originalEvent
                if (mouseEvent) {
                  clearTooltipTimeout()
                  setTooltipData({
                    type: 'node',
                    data: {
                      id: node.uid,
                      label: node.showname,
                      type: node.type,
                      lat: node.latitude,
                      lon: node.longitude,
                      properties: node.properties,
                      timestamp: node.properties.timestamp,
                      showname: node.showname
                    },
                    position: { x: mouseEvent.pageX, y: mouseEvent.pageY }
                  })
                }
              },
              mouseout: () => {
                clearTooltipWithDelay()
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                  {node.showname}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Type:</strong> {node.type}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>ID:</strong> {node.uid}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Location:</strong> {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
                </p>
                {node.properties.cve && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#d63384' }}>
                    <strong>CVE:</strong> {node.properties.cve}
                  </p>
                )}
                {node.properties.cvss_score && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#d63384' }}>
                    <strong>CVSS Score:</strong> {node.properties.cvss_score}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>

    {/* Interactive Tooltip */}
    {tooltipData && (
      <Portal>
        <Box
          position="fixed"
          top={Math.max(10, Math.min(window.innerHeight - 200, tooltipData.position.y - 10))}
          left={Math.max(10, Math.min(window.innerWidth - 300, tooltipData.position.x + 15))}
          zIndex={9999}
          pointerEvents="none"
        >
          {tooltipData.type === 'node' ? (
            <NodeTooltip node={tooltipData.data} />
          ) : (
            <EdgeTooltip edge={tooltipData.data} />
          )}
        </Box>
      </Portal>
    )}
    </Box>
  )
}

export default LeafletMap
