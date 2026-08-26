import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Car, AlertTriangle, TrendingUp } from 'lucide-react';

const flowData = [
  { time: '08:00', density: 65, speed: 45 },
  { time: '09:00', density: 85, speed: 30 },
  { time: '10:00', density: 70, speed: 40 },
  { time: '11:00', density: 55, speed: 50 },
  { time: '12:00', density: 60, speed: 48 },
  { time: '13:00', density: 75, speed: 35 },
  { time: '14:00', density: 80, speed: 32 },
  { time: '15:00', density: 65, speed: 42 },
];

const classData = [
  { name: 'Private Cars', value: 4500 },
  { name: 'Commercial Trucks', value: 850 },
  { name: 'Buses', value: 320 },
  { name: 'Two-Wheelers', value: 2100 },
];

const mockIncidentData = [
  { name: 'Accidents', value: 12 },
  { name: 'Breakdowns', value: 25 },
  { name: 'Roadworks', value: 8 },
  { name: 'Congestion', value: 45 },
];

const COLORS = ['#1e40af', '#15803d', '#b45309', '#b91c1c', '#6b21a8'];

export default function TrafficAnalytics() {
  const [incidentData, setIncidentData] = useState(mockIncidentData);
  const [activeIncidents, setActiveIncidents] = useState(90);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
    if (!apiKey) return;

    // Bounding Box for Mumbai: minLon, minLat, maxLon, maxLat
    const bbox = '72.775,18.89,73.0,19.27';
    const fetchIncidents = async () => {
      try {
        const res = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields={incidents{properties{iconCategory}}}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const incidents = data.incidents || [];
        setActiveIncidents(incidents.length);
        setIsLive(true);

        // Group by TomTom iconCategory
        // 0: Unknown, 1: Accident, 2: Fog, 3: Dangerous Conditions, 4: Rain, 5: Ice, 6: Jam, 7: Lane Closed, 8: Road Closed, 9: Road Works, 10: Wind, 11: Flooding, 14: Broken Down Vehicle
        const categoryMap: Record<number, string> = {
          1: 'Accidents',
          6: 'Jams/Congestion',
          9: 'Road Works',
          14: 'Breakdowns'
        };

        const counts: Record<string, number> = {};
        incidents.forEach((inc: any) => {
          const category = categoryMap[inc.properties.iconCategory] || 'Other';
          counts[category] = (counts[category] || 0) + 1;
        });

        const newChartData = Object.keys(counts).map(key => ({
          name: key,
          value: counts[key]
        }));
        
        if (newChartData.length > 0) {
          setIncidentData(newChartData);
        }

      } catch (err) {
        console.error('Failed to fetch TomTom incidents:', err);
      }
    };

    fetchIncidents();
    // Refresh every 5 minutes
    const interval = setInterval(fetchIncidents, 300000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Traffic Analytics & Insights</h2>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '50%', color: '#3730a3' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="card-title" style={{ margin: 0 }}>Avg. Traffic Density</div>
            <div className="kpi-value">68%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 600 }}>↓ 4% vs yesterday</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#166534' }}>
            <Car size={24} />
          </div>
          <div>
            <div className="card-title" style={{ margin: 0 }}>Total Flow (24h)</div>
            <div className="kpi-value">7,770</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 600 }}>↑ 12% vs yesterday</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%', color: '#92400e' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="card-title" style={{ margin: 0 }}>Average Speed</div>
            <div className="kpi-value">42 km/h</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--danger-color)', fontWeight: 600 }}>↓ 5 km/h vs avg</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: '#991b1b' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="card-title" style={{ margin: 0 }}>Active Incidents</div>
            <div className="kpi-value">{activeIncidents}</div>
            <div style={{ fontSize: '0.8rem', color: isLive ? 'var(--success-color)' : 'var(--text-secondary)' }}>
              {isLive ? '● Live Data (Mumbai)' : 'Mock Data (API Key needed)'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Line Chart */}
        <div className="card">
          <h3 className="card-title">Traffic Density vs. Speed (Today)</h3>
          <div style={{ height: '300px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="density" name="Density (%)" stroke="#1e40af" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="speed" name="Speed (km/h)" stroke="#b45309" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="card-title">Incident Breakdown</h3>
          <div style={{ height: '300px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incidentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card">
        <h3 className="card-title">Vehicle Classification by Volume</h3>
        <div style={{ height: '300px', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="value" name="Volume" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
