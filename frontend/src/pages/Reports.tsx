import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  date: string;
  type: string;
  size: string;
}

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('daily_traffic');
  const [generatedReports, setGeneratedReports] = useState<Report[]>([
    { id: 'rep-001', name: 'Daily Traffic Volume Report', date: new Date(Date.now() - 86400000).toLocaleString(), type: 'CSV / PDF', size: '45 KB' },
    { id: 'rep-002', name: 'Critical Alerts Summary', date: new Date(Date.now() - 172800000).toLocaleString(), type: 'CSV / PDF', size: '12 KB' },
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const names: Record<string, string> = {
        'daily_traffic': 'Daily Traffic Volume Report',
        'alerts_summary': 'Critical Alerts Summary',
        'anpr_log': 'ANPR Detection Log',
      };
      
      const newReport: Report = {
        id: `rep-00${generatedReports.length + 1}`,
        name: names[reportType],
        date: new Date().toLocaleString(),
        type: 'CSV / PDF',
        size: `${Math.floor(Math.random() * 50) + 10} KB`
      };
      
      setGeneratedReports([newReport, ...generatedReports]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleDownloadCSV = (reportName: string) => {
    // Generate dummy CSV data based on the report type
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Location,Metric,Value\n";
    for(let i=0; i<10; i++) {
      csvContent += `${new Date().toISOString()},Sector ${i+1},Count,${Math.floor(Math.random() * 100)}\n`;
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.replace(/ /g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    // Since real PDF generation from DOM requires heavy libraries (e.g. html2pdf),
    // we use the browser's native print dialog for the demo.
    window.print();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>System Reports & Exports</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Generate, view, and export traffic intelligence and telemetry data.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Generate New Report</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>REPORT TYPE</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="daily_traffic">Daily Traffic Volume</option>
              <option value="alerts_summary">Critical Alerts Summary</option>
              <option value="anpr_log">ANPR Detection Log (Raw)</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DATE RANGE</label>
            <select 
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range...</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              height: '42px',
              opacity: isGenerating ? 0.8 : 1
            }}
          >
            {isGenerating ? <Loader2 size={18} className="spin" /> : <FileText size={18} />}
            {isGenerating ? 'GENERATING...' : 'GENERATE REPORT'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} color="var(--success-color)" />
          <h3 className="card-title" style={{ margin: 0 }}>Generated Reports Archive</h3>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Report Name</th>
              <th>Generated At</th>
              <th>Format</th>
              <th>Size</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {generatedReports.map((report) => (
              <tr key={report.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{report.id}</td>
                <td style={{ fontWeight: 500 }}>{report.name}</td>
                <td>{report.date}</td>
                <td>{report.type}</td>
                <td>{report.size}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleDownloadCSV(report.name)}
                      title="Download CSV"
                      style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#334155', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      <FileSpreadsheet size={14} /> CSV
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      title="Export as PDF"
                      style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#334155', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
