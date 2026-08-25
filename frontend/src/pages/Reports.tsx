export default function Reports() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>System Reports</h2>
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button>GENERATE DAILY REPORT</button>
          <button className="btn-secondary">EXPORT PDF</button>
          <button className="btn-secondary">EXPORT CSV</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select a report type to export raw telemetry and analytics data.</p>
      </div>
    </div>
  );
}
