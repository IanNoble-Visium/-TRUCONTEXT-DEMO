import React, { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

interface LeafletMapProps {
  geoNodes: GeoNode[]
  onNodeSelect: (nodeId: string) => void
  height: string
}

// Custom marker icon based on node color
const createCustomIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 30 : 20
  const opacity = isSelected ? 1.0 : 0.8
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid ${isSelected ? '#fff' : '#333'};
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      opacity: ${opacity};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  })
}

const LeafletMap: React.FC<LeafletMapProps> = ({ geoNodes, onNodeSelect, height }) => {
  const mapRef = useRef<L.Map | null>(null)

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

  useEffect(() => {
    // Fit bounds when nodes change
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [bounds])

  return (
    <MapContainer
      center={bounds ? undefined : defaultCenter}
      zoom={bounds ? undefined : defaultZoom}
      bounds={bounds}
      style={{ height, width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {geoNodes.map((node) => (
        <Marker
          key={node.id}
          position={[node.latitude, node.longitude]}
          icon={createCustomIcon(node.color, node.isSelected)}
          eventHandlers={{
            click: () => onNodeSelect(node.uid)
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
      ))}
    </MapContainer>
  )
}

export default LeafletMap
