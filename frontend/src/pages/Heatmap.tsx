import { useState, useEffect } from 'react';
import CityTrafficMap from '../components/maps/CityTrafficMap';

export default function Heatmap() {
  const [heatmap, setHeatmap] = useState<any>({});
  const [hour, setHour] = useState<number>(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/analytics/heatmap');
        setHeatmap(await res.json());
      } catch (err) {
        console.warn("Backend not running, using mock heatmap data");
        setHeatmap({
          '12': [
            { camera_id: "CAM01", camera_name: "Highway Alpha", latitude: 30.9010, longitude: 75.8573, volume: 45 },
            { camera_id: "CAM02", camera_name: "Downtown Beta", latitude: 30.9080, longitude: 75.8500, volume: 15 },
          ]
        });
      }
    };
    fetchData();
  }, []);

  const activeCameras = (heatmap[hour.toString()] || []).map((node: any) => ({
    id: node.camera_id,
    name: node.camera_name,
    latitude: node.latitude,
    longitude: node.longitude,
    status: 'ONLINE',
    traffic: node.volume > 20 ? 'HIGH' : (node.volume > 10 ? 'MODERATE' : 'LOW')
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Traffic Density Heatmap</h2>
      <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Time: {hour}:00</div>
        <input 
          type="range" 
          min="0" 
          max="23" 
          value={hour} 
          onChange={(e) => setHour(parseInt(e.target.value))} 
          style={{ flex: 1, accentColor: 'var(--accent-color)' }}
        />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          * ANPR-Derived Traffic Density (Simulated)
        </div>
      </div>
      
      <div className="card" style={{ flex: 1, padding: 0, minHeight: '500px' }}>
        <CityTrafficMap cameras={activeCameras} />
      </div>
    </div>
  );
}
