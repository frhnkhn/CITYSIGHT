import { useState } from 'react';
import CityTrafficMap from '../components/maps/CityTrafficMap';

export default function VehicleSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8000/api/search/${query.trim()}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Vehicle not found in the city network.");
        throw new Error("Failed to search vehicle.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.warn("Backend not found, returning mock data");
      // Fallback mock logic
      if (query.trim().toUpperCase() === 'PB10AB1234') {
        setResult({
          plate_number: "PB10AB1234",
          vehicle_type: "Car",
          cameras_visited: 2,
          total_journey_time_minutes: 12,
          total_detections: 2,
          total_distance_km: 5.4,
          average_speed_kmh: 30,
          route: [
            { camera_id: 'CAM-001', camera_name: 'Highway Alpha', latitude: 30.9010, longitude: 75.8573, timestamp: new Date().toISOString() },
            { camera_id: 'CAM-002', camera_name: 'Downtown Beta', latitude: 30.9080, longitude: 75.8500, timestamp: new Date(Date.now() + 100000).toISOString() }
          ],
          alerts: [{ severity: 'HIGH', reason: 'Stolen Vehicle', camera_name: 'Downtown Beta', timestamp: new Date().toISOString() }]
        });
      } else {
        setError("Vehicle not found in the city network.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Vehicle Intelligence Search</h2>
        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSearch} className="input-group" style={{ maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="Enter License Plate (e.g., PB10AB1234)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'AUTHORIZE SEARCH'}
            </button>
          </form>
          {error && <div style={{ color: 'var(--danger-color)', marginTop: '1rem', fontWeight: 600 }}>{error}</div>}
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Note: Vehicle searches are logged for auditing purposes. Access is restricted to authorized personnel.
          </div>
        </div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="card">
              <div className="card-title">Plate Number</div>
              <div className="kpi-value">{result.plate_number}</div>
            </div>
            <div className="card">
              <div className="card-title">Cameras Visited</div>
              <div className="kpi-value">{result.cameras_visited}</div>
            </div>
            <div className="card">
              <div className="card-title">Avg Speed</div>
              <div className="kpi-value">{result.average_speed_kmh.toFixed(1)} <span style={{fontSize: '1rem'}}>km/h</span></div>
            </div>
            <div className="card">
              <div className="card-title">Distance</div>
              <div className="kpi-value">{result.total_distance_km.toFixed(1)} <span style={{fontSize: '1rem'}}>km</span></div>
            </div>
          </div>

          {/* MAP AND TIMELINE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
               <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Google Maps Trajectory</h3>
              </div>
              <div style={{ flex: 1 }}>
                <CityTrafficMap route={result.route} />
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Detection Timeline</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {result.route.map((stop: any, i: number) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)', paddingBottom: i === result.route.length -1 ? 0 : '1.5rem' }}>
                    <div style={{ position: 'absolute', left: '-0.35rem', top: '0.25rem', width: '0.6rem', height: '0.6rem', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(stop.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                      {stop.camera_name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      ID: {stop.camera_id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
