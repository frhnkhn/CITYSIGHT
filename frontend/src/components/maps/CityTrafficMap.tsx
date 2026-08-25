import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import CameraMarker from './CameraMarker';
import VehicleTrajectory from './VehicleTrajectory';

interface CityTrafficMapProps {
  cameras?: any[];
  route?: any[];
  heatmapData?: any[];
  alerts?: any[];
}

// Fallback Mock Map if API Key is missing
function MockMap() {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Development Map Mode
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        (Google Maps API Key not configured)
      </div>
      {/* Optional: Render simplistic DOM representations of markers if needed for debugging */}
    </div>
  );
}

export default function CityTrafficMap({ cameras = [], route = [] }: CityTrafficMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [selectedCamera, setSelectedCamera] = useState<any>(null);

  const defaultCenter = route.length > 0 ? { lat: route[0].latitude, lng: route[0].longitude } : { lat: 30.9010, lng: 75.8573 };

  if (!apiKey) {
    return <MockMap />;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="CITYSIGHT_DEMO_MAP"
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
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
            <AdvancedMarker key={`route-${idx}`} position={{ lat: stop.latitude, lng: stop.longitude }}>
              <Pin background="#1e40af" borderColor="#1e3a8a" glyphColor="#fff" />
            </AdvancedMarker>
          ))}

          {/* Info Window for Camera */}
          {selectedCamera && (
            <InfoWindow
              position={{ lat: selectedCamera.latitude, lng: selectedCamera.longitude }}
              onCloseClick={() => setSelectedCamera(null)}
            >
              <div style={{ color: '#000', minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{selectedCamera.name}</h4>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>ID: {selectedCamera.id}</div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Status: <strong>{selectedCamera.status}</strong></div>
                <div style={{ fontSize: '0.85rem' }}>Traffic: <strong>{selectedCamera.traffic}</strong></div>
              </div>
            </InfoWindow>
          )}

        </Map>
      </APIProvider>
    </div>
  );
}
