import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CameraMarker from './CameraMarker';
import VehicleTrajectory from './VehicleTrajectory';

// Fix for default Leaflet icon paths
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface CityTrafficMapProps {
  cameras?: any[];
  route?: any[];
  heatmapData?: any[];
  alerts?: any[];
}

export default function CityTrafficMap({ cameras = [], route = [] }: CityTrafficMapProps) {
  const [selectedCamera, setSelectedCamera] = useState<any>(null);

  const defaultCenter: [number, number] = route.length > 0 
    ? [route[0].latitude, route[0].longitude] 
    : [30.9010, 75.8573];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Cameras */}
        {cameras.map((cam, idx) => (
          <CameraMarker 
            key={idx} 
            camera={cam} 
            onClick={() => setSelectedCamera(cam)} 
          />
        ))}

        {/* Render Route Trajectory */}
        {route.length > 0 && <VehicleTrajectory route={route} />}

        {/* Render Route Stops (Markers) */}
        {route.map((stop, idx) => (
          <Marker key={`route-${idx}`} position={[stop.latitude, stop.longitude]} />
        ))}

        {/* Info Window for Camera */}
        {selectedCamera && (
          <Popup
            position={[selectedCamera.latitude, selectedCamera.longitude]}
            onClose={() => setSelectedCamera(null)}
          >
            <div style={{ color: '#000', minWidth: '150px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{selectedCamera.name}</h4>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>ID: {selectedCamera.id}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Status: <strong>{selectedCamera.status}</strong></div>
              <div style={{ fontSize: '0.85rem' }}>Traffic: <strong>{selectedCamera.traffic}</strong></div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
