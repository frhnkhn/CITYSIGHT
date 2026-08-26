import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create a custom icon for cameras
const cameraIcon = L.divIcon({
  className: 'custom-camera-icon',
  html: `<div style="background-color: #2563eb; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function CameraNetwork() {
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

  const cameras = [
    { id: 'CAM-001', location: 'Delhi - Connaught Place', coords: [28.6304, 77.2177], status: 'ONLINE', heartbeat: new Date().toLocaleTimeString(), vehicles: 127, traffic: 'HIGH', dir: 'NORTH' },
    { id: 'CAM-002', location: 'Mumbai - Western Express Hwy', coords: [19.0896, 72.8656], status: 'ONLINE', heartbeat: new Date().toLocaleTimeString(), vehicles: 342, traffic: 'SEVERE', dir: 'EAST' },
    { id: 'CAM-003', location: 'Bangalore - Silk Board', coords: [12.9172, 77.6228], status: 'WARNING', heartbeat: new Date().toLocaleTimeString(), vehicles: 120, traffic: 'MODERATE', dir: 'WEST' },
    { id: 'CAM-004', location: 'Pune - Hinjewadi', coords: [18.5913, 73.7389], status: 'ONLINE', heartbeat: new Date().toLocaleTimeString(), vehicles: 45, traffic: 'LOW', dir: 'SOUTH' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Camera Network Status</h2>
      
      {/* TomTom Map Integration */}
      <div className="card" style={{ padding: 0, height: '400px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <MapContainer 
          center={[20.5937, 78.9629]} // Center of India
          zoom={5} 
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        >
          {/* Always render a reliable base map */}
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Overlay TomTom Traffic if API key is present */}
          {apiKey && (
            <TileLayer url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}`} />
          )}

          {cameras.map(cam => (
            <Marker key={cam.id} position={cam.coords as [number, number]} icon={cameraIcon}>
              <Popup>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>{cam.id}</strong><br/>
                  {cam.location}<br/>
                  Status: {cam.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {!apiKey && (
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
            No TomTom API Key found
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Last Heartbeat</th>
              <th>Vehicles/min</th>
              <th>Traffic Level</th>
              <th>Direction</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map(cam => (
              <tr key={cam.id}>
                <td style={{ fontWeight: 600 }}>{cam.id}</td>
                <td>{cam.location}</td>
                <td>
                  <span className={`status-badge ${cam.status === 'ONLINE' ? 'status-success' : 'status-warning'}`}>
                    <span className={`status-dot ${cam.status === 'ONLINE' ? 'success' : 'warning'}`}></span> {cam.status}
                  </span>
                </td>
                <td>{cam.heartbeat}</td>
                <td>{cam.vehicles}</td>
                <td>{cam.traffic}</td>
                <td>{cam.dir}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
