import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VehicleSearch from './pages/VehicleSearch';
import TrafficAnalytics from './pages/TrafficAnalytics';
import LiveMonitoring from './pages/LiveMonitoring';
import CameraNetwork from './pages/CameraNetwork';
import Reports from './pages/Reports';
import VehicleIntelligence from './pages/VehicleIntelligence';

function SidebarNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="sidebar-nav">
      <Link to="/" className={`sidebar-link ${path === '/' ? 'active' : ''}`}>Dashboard</Link>
      <Link to="/live" className={`sidebar-link ${path === '/live' ? 'active' : ''}`}>Live Monitoring</Link>
      <Link to="/search" className={`sidebar-link ${path === '/search' ? 'active' : ''}`}>Global Search</Link>
      <Link to="/intelligence" className={`sidebar-link ${path === '/intelligence' ? 'active' : ''}`}>Vehicle Intelligence</Link>
      <Link to="/analytics" className={`sidebar-link ${path === '/analytics' ? 'active' : ''}`}>Traffic Analytics</Link>
      <Link to="/cameras" className={`sidebar-link ${path === '/cameras' ? 'active' : ''}`}>Camera Network</Link>
      <Link to="/reports" className={`sidebar-link ${path === '/reports' ? 'active' : ''}`}>Reports</Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>GOVERNMENT OF STATE</h1>
            <div className="subtitle">Traffic Intelligence System</div>
          </div>
          <SidebarNav />
          <div className="sidebar-footer">
            <div>Data Classification:</div>
            <div style={{ color: '#fff', fontWeight: 600, marginTop: '0.25rem' }}>RESTRICTED</div>
            <div style={{ marginTop: '0.25rem' }}>Authorized Access Only</div>
          </div>
        </aside>

        {/* Main Wrapper */}
        <div className="main-wrapper">
          <header className="topbar">
            <div className="topbar-left">
              <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>CITYSIGHT COMMAND CENTER</strong>
              <span className="status-badge status-success">
                <span className="status-dot success"></span> OPERATIONAL
              </span>
            </div>
            <div className="topbar-right">
              <div>Last Sync: {new Date().toLocaleTimeString()} IST</div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Officer Farhan</span> (Admin)
              </div>
            </div>
          </header>
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live" element={<LiveMonitoring />} />
              <Route path="/search" element={<VehicleSearch />} />
              <Route path="/intelligence" element={<VehicleIntelligence />} />
              <Route path="/analytics" element={<TrafficAnalytics />} />
              <Route path="/cameras" element={<CameraNetwork />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
