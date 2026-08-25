import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface RouteStop {
  camera_id: string;
  camera_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface HeatmapNode {
  camera_id: string;
  camera_name: string;
  latitude: number;
  longitude: number;
  volume: number;
}

interface MapProps {
  route?: RouteStop[];
  heatmapData?: HeatmapNode[];
}

// Helper component to auto-fit bounds
function FitBounds({ route, heatmapData }: { route?: RouteStop[], heatmapData?: HeatmapNode[] }) {
  const map = useMap();
  useEffect(() => {
    let bounds;
    if (route && route.length > 0) {
      bounds = L.latLngBounds(route.map(r => [r.latitude, r.longitude]));
    } else if (heatmapData && heatmapData.length > 0) {
      bounds = L.latLngBounds(heatmapData.map(h => [h.latitude, h.longitude]));
    }
    
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, heatmapData, map]);
  return null;
}

// Helper for dynamic coloring based on volume
function getHeatmapColor(volume: number) {
  if (volume > 20) return '#f85149'; // Red (High)
  if (volume > 10) return '#d29922'; // Yellow (Medium)
  return '#2ea043'; // Green (Low)
}

export default function Map({ route = [], heatmapData = [] }: MapProps) {
  // Default center
  const defaultCenter: [number, number] = [30.9010, 75.8573]; 
  
  const polylinePositions = route.map(r => [r.latitude, r.longitude] as [number, number]);

  return (
    <div style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <MapContainer 
        center={route.length > 0 ? [route[0].latitude, route[0].longitude] : defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        
        {/* Render Trajectory Markers */}
        {route.map((stop, i) => (
          <Marker key={`route-${i}`} position={[stop.latitude, stop.longitude]}>
            <Popup>
              <strong>{stop.camera_name} ({stop.camera_id})</strong><br/>
              Hit: {new Date(stop.timestamp).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}

        {/* Render Trajectory Line */}
        {route.length > 1 && (
          <Polyline 
            positions={polylinePositions} 
            pathOptions={{ color: 'var(--accent-color)', weight: 4, opacity: 0.7 }} 
          />
        )}
        
        {/* Render Heatmap Nodes */}
        {heatmapData.map((node, i) => (
          <CircleMarker 
            key={`heat-${i}`}
            center={[node.latitude, node.longitude]}
            radius={Math.max(10, Math.min(node.volume * 2, 40))} // Dynamic radius based on volume
            pathOptions={{ 
              color: getHeatmapColor(node.volume),
              fillColor: getHeatmapColor(node.volume),
              fillOpacity: 0.6,
              weight: 2
            }}
          >
            <Popup>
              <strong>{node.camera_name} ({node.camera_id})</strong><br/>
              Vehicles per hour: {node.volume}
            </Popup>
          </CircleMarker>
        ))}
        
        <FitBounds route={route} heatmapData={heatmapData} />
      </MapContainer>
    </div>
  );
}
