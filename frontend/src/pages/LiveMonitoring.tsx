export default function LiveMonitoring() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Live Monitoring Feed</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#000', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', borderBottom: '1px solid var(--border-color)' }}>
              DEMO VIDEO FEED - CAM-00{i}
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>CAM-00{i} (Sector {i} Junction)</strong>
                <span className="status-badge status-success">
                  <span className="status-dot success"></span> ONLINE
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Traffic: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>HIGH</span></span>
                <span>Vehicles: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>127/min</span></span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Last Update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
