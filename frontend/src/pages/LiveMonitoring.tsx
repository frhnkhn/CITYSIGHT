import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Bounding boxes and center coordinates for each location
const INITIAL_FEEDS = [
  { id: 1, center: [28.6304, 77.2177], bbox: '77.20,28.62,77.23,28.64', traffic: 'LOADING', vehicles: 215, location: 'Delhi - Connaught Place' },
  { id: 2, center: [19.0896, 72.8656], bbox: '72.84,19.08,72.87,19.11', traffic: 'LOADING', vehicles: 342, location: 'Mumbai - Western Express Hwy' },
  { id: 3, center: [12.9172, 77.6228], bbox: '77.61,12.91,77.63,12.93', traffic: 'LOADING', vehicles: 120, location: 'Bangalore - Silk Board' },
  { id: 4, center: [18.5913, 73.7389], bbox: '73.72,18.58,73.75,18.60', traffic: 'LOADING', vehicles: 45, location: 'Pune - Hinjewadi' },
];

export default function LiveMonitoring() {
  const [time, setTime] = useState(new Date());
  const [feeds, setFeeds] = useState<any[]>(INITIAL_FEEDS);
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!apiKey) {
      // Fallback if no API key
      setFeeds(prev => prev.map(f => ({ ...f, traffic: 'HIGH' })));
      return;
    }

    const fetchAllFeeds = async () => {
      const updatedFeeds = await Promise.all(
        INITIAL_FEEDS.map(async (feed) => {
          try {
            const res = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${feed.bbox}`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            const incidentCount = (data.incidents || []).length;
            
            let trafficStatus = 'LOW';
            if (incidentCount > 5) trafficStatus = 'SEVERE';
            else if (incidentCount >= 3) trafficStatus = 'HIGH';
            else if (incidentCount > 0) trafficStatus = 'MODERATE';
            
            return { ...feed, traffic: trafficStatus };
          } catch (error) {
            console.error(`Failed to fetch traffic for ${feed.location}:`, error);
            return { ...feed, traffic: 'UNKNOWN' };
          }
        })
      );
      setFeeds(updatedFeeds);
    };

    fetchAllFeeds();
    const pollInterval = setInterval(fetchAllFeeds, 300000); // Poll every 5 minutes
    return () => clearInterval(pollInterval);
  }, [apiKey]);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Live Traffic Map Feeds</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {feeds.map((feed) => (
          <div key={feed.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            
            {/* Map Feed Container */}
            <div style={{ 
              position: 'relative', 
              height: '240px', 
              backgroundColor: '#e2e8f0', 
              borderBottom: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              {/* Map Container */}
              <MapContainer 
                center={feed.center as [number, number]} 
                zoom={14} 
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
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
              </MapContainer>
              
              {!apiKey && (
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                  No TomTom API Key
                </div>
              )}

              {/* Scanline Overlay to keep the CCTV feel */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
                backgroundSize: '100% 4px, 3px 100%',
                pointerEvents: 'none',
                zIndex: 10
              }}></div>

              {/* Camera UI Overlay - Top Left */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
                  MAP-00{feed.id}
                </div>
                {apiKey && (
                  <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.9)', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', animation: 'pulse 2s infinite' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                    LIVE
                  </div>
                )}
              </div>

              {/* Camera UI Overlay - Bottom Right (Timestamp) */}
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace', zIndex: 10 }}>
                {time.toISOString().replace('T', ' ').substring(0, 19)}
              </div>
            </div>
            
            {/* Metadata Footer */}
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{feed.location}</strong>
                <span className={`status-badge ${apiKey ? 'status-success' : 'status-warning'}`}>
                  <span className={`status-dot ${apiKey ? 'success' : 'warning'}`}></span> {apiKey ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  Traffic: <span style={{ fontWeight: 600, color: feed.traffic === 'SEVERE' || feed.traffic === 'HIGH' ? 'var(--danger-color)' : feed.traffic === 'MODERATE' ? 'var(--warning-color)' : feed.traffic === 'LOW' ? 'var(--success-color)' : 'var(--text-primary)' }}>{feed.traffic}</span>
                </span>
                <span>Vehicles: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{feed.vehicles}/min</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
