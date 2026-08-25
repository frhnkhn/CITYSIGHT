import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CityTrafficMap from '../components/maps/CityTrafficMap';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, heatRes, alertsRes] = await Promise.all([
          fetch('http://localhost:8000/api/analytics/summary'),
          fetch('http://localhost:8000/api/analytics/heatmap'),
          fetch('http://localhost:8000/api/analytics/alerts/recent')
        ]);
        
        setSummary(await sumRes.json());
        setHeatmap(await heatRes.json());
        setAlerts(await alertsRes.json());
      } catch (err) {
        console.warn("Backend not running. Using fallback demo data.", err);
        setSummary({
          total_vehicles_processed: 512,
          vehicle_type_distribution: [
            { type: "car", percentage: 75.5 },
            { type: "truck", percentage: 15.2 },
            { type: "motorcycle", percentage: 9.3 }
          ]
        });
        setHeatmap({
          '12': [
            { camera_id: "CAM01", camera_name: "Highway Alpha", latitude: 30.9010, longitude: 75.8573, volume: 45 },
            { camera_id: "CAM02", camera_name: "Downtown Beta", latitude: 30.9080, longitude: 75.8500, volume: 15 },
          ]
        });
        setAlerts([
          {
            id: 1,
            alert_type: "BLACKLIST",
            severity: "HIGH",
            plate_number: "PB10AB1234",
            camera_name: "Downtown Beta",
            camera_id: "CAM02",
            timestamp: new Date().toISOString(),
            description: "Stolen Vehicle - Armed and Dangerous"
          },
          {
            id: 2,
            alert_type: "ANOMALY",
            severity: "MEDIUM",
            plate_number: "PB11XX9999",
            camera_name: "Highway Alpha",
            camera_id: "CAM01",
            timestamp: new Date(Date.now() - 50000).toISOString(),
            description: "Speeding Anomaly: Calculated speed 140.0 km/h"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-primary)', textAlign: 'center', marginTop: '3rem' }}>Initializing Command Center...</div>;

  // Derive mock cameras from heatmap data for the map
  const activeCameras = (heatmap['12'] || []).map((node: any) => ({
    id: node.camera_id,
    name: node.camera_name,
    latitude: node.latitude,
    longitude: node.longitude,
    status: 'ONLINE',
    traffic: node.volume > 20 ? 'HIGH' : 'MODERATE'
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SYSTEM STATUS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <div className="card">
          <div className="card-title">Cameras Online</div>
          <div className="kpi-value" style={{ color: 'var(--accent-color)' }}>247 <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>/ 250</span></div>
        </div>
        <div className="card">
          <div className="card-title">Vehicles Detected</div>
          <div className="kpi-value">{summary.total_vehicles_processed.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Active Alerts</div>
          <div className="kpi-value" style={{ color: 'var(--danger-color)' }}>{alerts.length}</div>
        </div>
        <div className="card">
          <div className="card-title">Traffic Level</div>
          <div className="kpi-value" style={{ color: 'var(--warning-color)' }}>MODERATE</div>
        </div>
        <div className="card">
          <div className="card-title">Average Speed</div>
          <div className="kpi-value">42 <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>km/h</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* MAIN MAP AREA */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Live GIS Tracking & Intelligence Layer</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Powered by Google Maps</span>
          </div>
          <div style={{ flex: 1 }}>
            <CityTrafficMap cameras={activeCameras} />
          </div>
        </div>

        {/* LIVE ALERTS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-dot danger"></span> Live Critical Alerts
            </h3>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
            {alerts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No recent alerts.</div>
            ) : (
              alerts.map((alert: any) => {
                const isBlacklist = alert.severity === "HIGH";
                const badgeClass = isBlacklist ? 'status-danger' : 'status-warning';
                
                return (
                  <div key={alert.id} style={{ 
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${isBlacklist ? 'var(--danger-color)' : 'var(--warning-color)'}`,
                    backgroundColor: '#fff',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className={`status-badge ${badgeClass}`}>{isBlacklist ? 'CRITICAL' : 'ATTENTION'}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                      {alert.description}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      Plate: <Link to={`/search?plate=${alert.plate_number}`} style={{ fontWeight: 'bold' }}>{alert.plate_number}</Link>
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Location: {alert.camera_name}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
