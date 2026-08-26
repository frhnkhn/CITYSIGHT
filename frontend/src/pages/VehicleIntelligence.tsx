import { useState } from 'react';
import { Search, AlertTriangle, Clock, MapPin, CheckCircle, XCircle, Info, Database } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons for trajectory points
const createCameraIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const CAMERA_LOCATIONS: Record<string, [number, number]> = {
  'CAM01': [28.6304, 77.2177],
  'CAM03': [28.6350, 77.2200],
  'CAM05': [28.6400, 77.2250],
  'CAM07': [28.6450, 77.2300],
};

export default function VehicleIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setVehicleData(null);

    try {
      const normalizedQuery = searchQuery.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const response = await fetch(`http://localhost:8000/api/vehicles/${normalizedQuery}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setError(errorData.detail?.message || 'Vehicle not found in demo database.');
        } else {
          setError('Failed to fetch vehicle intelligence data.');
        }
        return;
      }

      const data = await response.json();
      setVehicleData(data);
    } catch (err) {
      console.error(err);
      setError('Database unavailable. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Vehicle Intelligence</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Database size={14} />
            <strong>DEMO VEHICLE REGISTRATION DATABASE</strong>
            <span style={{ color: '#94a3b8' }}>| Future integration: Authorized VAHAN/RTO Data Provider</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
            <input
              type="text"
              placeholder="ENTER VEHICLE REGISTRATION NUMBER (e.g. PB10AB1234)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                textTransform: 'uppercase'
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '0 1.5rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </form>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <XCircle color="#dc2626" />
          <span style={{ color: '#991b1b', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {vehicleData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
          
          {/* Left Column: RTO Data & Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {vehicleData.alert && (
              <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <AlertTriangle color="#dc2626" size={28} />
                  <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.1rem' }}>CRITICAL VEHICLE ALERT</h3>
                </div>
                <div style={{ color: '#7f1d1d', fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  BLACKLISTED VEHICLE DETECTED
                </div>
                <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>
                  <strong>Reason:</strong> {vehicleData.alert.reason_code} <br/>
                  <strong>Priority:</strong> {vehicleData.alert.priority}
                </div>
              </div>
            )}

            <div className="card">
              <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Registration Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InfoField label="Registration Number" value={vehicleData.registration_number} highlight />
                <InfoField label="Registration Status" value={vehicleData.registration_status} />
                <InfoField label="Registration State" value={vehicleData.registration_state} />
                <InfoField label="Registration Authority" value={vehicleData.registration_authority} />
                <InfoField label="Vehicle Type" value={`${vehicleData.vehicle_class} - ${vehicleData.vehicle_type}`} />
                <InfoField label="Make & Model" value={`${vehicleData.manufacturer} ${vehicleData.model}`} />
                <InfoField label="Fuel Type" value={vehicleData.fuel_type} />
                <InfoField label="Colour" value={vehicleData.color} />
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>ANPR Intelligence</h3>
              
              {vehicleData.anpr_history && vehicleData.anpr_history.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <InfoField label="First Seen" value={new Date(vehicleData.anpr_history[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                  <InfoField label="Last Seen" value={new Date(vehicleData.anpr_history[vehicleData.anpr_history.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                  <InfoField label="Total Detections" value={vehicleData.anpr_history.length} />
                  <InfoField label="Avg OCR Confidence" value={`${Math.round((vehicleData.anpr_history.reduce((acc: number, curr: any) => acc + curr.ocr_confidence, 0) / vehicleData.anpr_history.length) * 100)}%`} />
                  <InfoField label="Estimated Avg Speed" value="42 km/h" /> {/* Mock calculation for demo */}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No ANPR history found for this vehicle.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Trajectory */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>Vehicle Trajectory Map</h3>
            
            {vehicleData.anpr_history && vehicleData.anpr_history.length > 0 ? (
              <div style={{ flex: 1, minHeight: '400px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <MapContainer 
                  center={CAMERA_LOCATIONS[vehicleData.anpr_history[0].camera_id] || [28.6304, 77.2177]} 
                  zoom={14} 
                  style={{ width: '100%', height: '100%' }}
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

                  {/* Draw Trajectory Line */}
                  <Polyline 
                    positions={vehicleData.anpr_history.map((h: any) => CAMERA_LOCATIONS[h.camera_id] || [28.63, 77.21])} 
                    color="#2563eb" 
                    weight={4} 
                    dashArray="5, 10" 
                  />

                  {/* Draw Camera Nodes */}
                  {vehicleData.anpr_history.map((h: any, index: number) => {
                    const coords = CAMERA_LOCATIONS[h.camera_id];
                    if (!coords) return null;
                    return (
                      <Marker key={index} position={coords} icon={createCameraIcon(index === vehicleData.anpr_history.length - 1 ? '#dc2626' : '#2563eb')}>
                        <Popup>
                          <div style={{ fontSize: '0.85rem' }}>
                            <strong>{h.camera_id}</strong><br/>
                            Time: {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br/>
                            Confidence: {Math.round(h.ocr_confidence * 100)}%
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                Trajectory map unavailable (No detections)
              </div>
            )}

            {/* Sequence Timeline */}
            {vehicleData.anpr_history && vehicleData.anpr_history.length > 0 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>SEQUENCE:</span>
                {vehicleData.anpr_history.map((h: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {h.camera_id}
                    </div>
                    {i < vehicleData.anpr_history.length - 1 && <span style={{ color: '#cbd5e1' }}>→</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: highlight ? '1.1rem' : '0.95rem', fontWeight: highlight ? 700 : 500, color: 'var(--text-primary)' }}>{value || 'N/A'}</span>
    </div>
  );
}
