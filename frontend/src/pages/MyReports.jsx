import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatWeekRange } from '../utils/dates';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/my').then(({ data }) => {
      setReports(data.reports);
      setLoading(false);
    });
  }, []);

  const grouped = reports.reduce((acc, report) => {
    const key = new Date(report.weekStart).toISOString();
    if (!acc[key]) acc[key] = { weekStart: report.weekStart, weekEnd: report.weekEnd, reports: [] };
    acc[key].reports.push(report);
    return acc;
  }, {});

  const weeks = Object.values(grouped).sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Weekly Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Create and manage your weekly work reports</p>
        </div>
        <Link to="/reports/new" className="btn-primary">
          <Plus size={18} /> New Report
        </Link>
      </div>

      {weeks.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No reports yet</h3>
          <p className="text-sm text-slate-400 mt-1">Create your first weekly report to get started</p>
          <Link to="/reports/new" className="btn-primary mt-4 inline-flex">Create Report</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {weeks.map((week) => (
            <div key={week.weekStart} className="card">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h3 className="font-semibold text-sm">{formatWeekRange(week.weekStart, week.weekEnd)}</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {week.reports.map((report) => (
                  <Link
                    key={report._id}
                    to={`/reports/${report._id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: report.project?.color || '#6366f1' }} />
                      <div>
                        <p className="font-medium text-sm">{report.project?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{report.tasksCompleted.split('\n')[0]}</p>
                      </div>
                    </div>
                    <StatusBadge status={report.status} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
