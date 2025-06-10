import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Box, Portal, Button, ButtonGroup, VStack, Text, useColorModeValue, HStack } from '@chakra-ui/react'
import { NodeTooltip, EdgeTooltip } from '../GraphTooltip'
import type { Map as LeafletMapType, LatLngBounds } from 'leaflet'

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
    case 'communication': return '#34c759' // Green
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
  // Refs
  const mapRef = useRef<LeafletMapType | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()
  const isMountedRef = useRef(true)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // State
  const [isClient, setIsClient] = useState(false)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [customIcons, setCustomIcons] = useState<Map<string, any>>(new Map())
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number | null>(null)
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    console.log(`LeafletMap: mapLoaded state CHANGED to: ${mapLoaded}`);
  }, [mapLoaded]);

  useEffect(() => {
    console.log(`LeafletMap: mapReady state CHANGED to: ${mapReady}`);
  }, [mapReady]);

  // Color mode values for the size control
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

  // Handle client-side rendering check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle map instance and resizing correctly
  useEffect(() => {
    if (mapRef.current) {
      console.log('Map instance created:', mapRef.current)
      // Do not attempt to bind event listeners that may not exist
    }
  }, [])

  // Handle window resize with debounce
  const handleResize = useCallback(() => {
    console.log('LeafletMap: Window resized, attempting to update map size');
    if (mapRef.current) {
      try {
        if (typeof (mapRef.current as any).invalidateSize === 'function') {
          (mapRef.current as any).invalidateSize();
          console.log('LeafletMap: invalidateSize() called on map instance via handleResize.');
        } else if (typeof (mapRef.current as any)._onResize === 'function') {
          console.warn('LeafletMap: invalidateSize not found in handleResize, falling back to _onResize.');
          (mapRef.current as any)._onResize();
        } else {
          console.warn('LeafletMap: Neither invalidateSize nor _onResize available in handleResize.');
        }
      } catch (error) {
        console.error('LeafletMap: Error during map resize in handleResize:', error);
      }
    } else {
      console.warn('LeafletMap: mapRef.current is not available in handleResize.');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize() // Initial call to set size

    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [handleResize])

  // Handle map ready state (called by MapContainer's whenReady prop)
  const handleMapReady = useCallback(() => {
    if (!isMountedRef.current) {
      console.log('LeafletMap: handleMapReady called but component not mounted.');
      return;
    }
    
    console.log('LeafletMap: mapEventObject received in handleMapReady:');
    const actualMapInstance = mapRef.current;

    if (!actualMapInstance) {
      console.error('LeafletMap: actualMapInstance (from mapRef.current) is null or undefined.');
      return;
    }

    if (typeof actualMapInstance.invalidateSize !== 'function') {
      console.error('LeafletMap: actualMapInstance.invalidateSize is NOT a function. actualMapInstance:', actualMapInstance);
      try {
        console.log('LeafletMap: Keys of actualMapInstance:', Object.keys(actualMapInstance));
        if (typeof actualMapInstance.getPane === 'function') {
           console.log('LeafletMap: actualMapInstance HAS .getPane() method.');
        } else {
           console.log('LeafletMap: actualMapInstance does NOT have .getPane() method.');
        }
      } catch (e) {
        console.error('LeafletMap: Error while inspecting actualMapInstance keys or .getPane:', e);
      }
      return;
    }

    setMapReady(true); // Indicate map instance is available and core setup is done
    console.log('LeafletMap: setMapReady(true) CALLED in handleMapReady.');
    setMapLoaded(true); // Indicate map tiles and visual elements are ready, for opacity transition
    console.log('LeafletMap: setMapLoaded(true) CALLED in handleMapReady.');

    console.log('LeafletMap: About to call actualMapInstance.invalidateSize().');
    actualMapInstance.invalidateSize();
    console.log('LeafletMap: invalidateSize() called synchronously on actualMapInstance in handleMapReady.');

    // Fit map to bounds or set default view
    if (bounds && geoNodes.length > 0) { // 'bounds' is from useMemo: [[number, number], [number, number]]
      console.log('LeafletMap: Fitting map to memoized bounds:', bounds);
      actualMapInstance.fitBounds(bounds, { padding: [50, 50] });
    } else {
      console.log('LeafletMap: No geoNodes or valid memoized bounds. Setting default map view.');
      actualMapInstance.setView(defaultCenter, defaultZoom);
    }
  }, [isMountedRef, setMapReady, setMapLoaded, bounds, geoNodes, defaultCenter, defaultZoom]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Preload icons for all nodes
  const loadIcons = useCallback(async () => {
    console.log('Loading icons for geo nodes...')
    const iconMap = new Map<string, any>()
    const nodeTypes = Array.from(new Set(geoNodes.map(node => node.type)))

    for (const type of nodeTypes) {
      let iconPath = await getNodeIconPath(type)
      console.log(`Attempting to load icon for ${type}: ${iconPath}`)
      
      try {
        // Try to load the SVG icon
        const response = await fetch(iconPath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const svgText = await response.text()
        console.log(`✅ Loaded SVG for ${type} from ${iconPath}: ${svgText.substring(0, 50)}...`)
        
        // Process SVG and create icon
        const processedIcon = await createCustomIcon({
          id: type,
          uid: type,
          showname: type,
          type,
          latitude: 0,
          longitude: 0,
          color: '',
          properties: {},
          isSelected: false
        }, iconSize)
        if (processedIcon) {
          iconMap.set(type, processedIcon)
        } else {
          console.error(`Failed to process SVG for ${type}`)
          // Fallback to default icon if processing fails
          iconMap.set(type, await createCustomIcon({
            id: type,
            uid: type,
            showname: type,
            type,
            latitude: 0,
            longitude: 0,
            color: '',
            properties: {},
            isSelected: false
          }, iconSize))
        }
      } catch (error) {
        console.error(`Failed to load icon for ${type} from ${iconPath}:`, error)
        // Fallback to default icon if loading fails
        iconMap.set(type, await createCustomIcon({
          id: type,
          uid: type,
          showname: type,
          type,
          latitude: 0,
          longitude: 0,
          color: '',
          properties: {},
          isSelected: false
        }, iconSize))
      }
    }

    setCustomIcons(iconMap)
    console.log(`✓ Icons loaded for ${iconMap.size} types`)
  }, [geoNodes, iconSize])

  useEffect(() => {
    if (isClient && geoNodes.length > 0) {
      loadIcons()
    }
  }, [geoNodes, isClient, iconSize])

  // Ensure the map container has proper dimensions for the parent Box
  const mapContainerStyle = useMemo(() => ({
    height: height || '100%', // Use prop height or fallback
    width: '100%',
    overflow: 'hidden',
    borderRadius: '8px',
    zIndex: 1
  }) as React.CSSProperties, [height]);

  // The useEffect hook that previously handled invalidateSize based on isClient and mapReady has been removed.
  // This logic is now consolidated into handleMapReady and the window resize handler.

  const loadingStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'),
    zIndex: 1000,
    opacity: mapLoaded ? 0 : 1,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease-in-out'
  };

  return (
    <Box position="relative" height={height} width="100%" style={mapContainerStyle}>
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
        boxShadow="md"
        p={2}
      >
        <HStack spacing={2}>
          <Text fontSize="sm" fontWeight="medium">Icon Size</Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button onClick={() => setIconSize('small')} isActive={iconSize === 'small'}>S</Button>
            <Button onClick={() => setIconSize('medium')} isActive={iconSize === 'medium'}>M</Button>
            <Button onClick={() => setIconSize('large')} isActive={iconSize === 'large'}>L</Button>
          </ButtonGroup>
        </HStack>
      </Box>
      <MapContainer
        center={bounds ? undefined : defaultCenter}
        zoom={bounds ? undefined : defaultZoom}
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => handleMapReady()}
        worldCopyJump={true}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
          minZoom={2}
          maxZoom={18}
          tileSize={256}
          zoomOffset={0}
          updateWhenIdle={false}
          updateWhenZooming={false}
          detectRetina={true}
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
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
          const icon = customIcons.get(node.type)
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
