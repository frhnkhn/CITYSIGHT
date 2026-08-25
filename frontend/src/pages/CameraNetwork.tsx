export default function CameraNetwork() {
  const cameras = [
    { id: 'CAM-001', location: 'Sector 17 Junction', status: 'ONLINE', heartbeat: new Date().toLocaleTimeString(), vehicles: 127, traffic: 'HIGH', dir: 'NORTH' },
    { id: 'CAM-002', location: 'Highway Alpha', status: 'ONLINE', heartbeat: new Date().toLocaleTimeString(), vehicles: 45, traffic: 'LOW', dir: 'EAST' },
    { id: 'CAM-003', location: 'Downtown Beta', status: 'WARNING', heartbeat: new Date().toLocaleTimeString(), vehicles: 89, traffic: 'MODERATE', dir: 'WEST' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Camera Network Status</h2>
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
