import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, AlertCircle } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import { ReportListSkeleton } from '../components/Skeleton';
import { formatWeekRange, getCurrentWeek, isCurrentWeek, toDateInput } from '../utils/dates';

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

  const { weekStart: currentStart, weekEnd: currentEnd } = getCurrentWeek();
  const hasCurrentWeekReport = reports.some((r) => isCurrentWeek(r.weekStart));
  const hasSubmittedCurrentWeek = reports.some(
    (r) => isCurrentWeek(r.weekStart) && r.status === 'submitted'
  );

  if (loading) {
    return (
      <div>
        <PageHeader title="My Weekly Reports" subtitle="Create and manage your weekly work reports" />
        <ReportListSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Weekly Reports"
        subtitle="Create and manage your weekly work reports"
        action={
          <Link to="/reports/new" className="btn-primary">
            <Plus size={18} /> New Report
          </Link>
        }
      />

      {!hasCurrentWeekReport && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 text-sm">No report for this week yet</p>
            <p className="text-xs text-amber-700 mt-1">
              Week of {formatWeekRange(currentStart, currentEnd)} — create and submit your report.
            </p>
            <Link to="/reports/new" className="btn-primary mt-3 inline-flex text-xs py-1.5 px-3">
              Create This Week&apos;s Report
            </Link>
          </div>
        </div>
      )}

      {hasCurrentWeekReport && !hasSubmittedCurrentWeek && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            You have a draft for this week. Remember to submit it when ready.
          </p>
        </div>
      )}

      {weeks.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No reports yet</h3>
          <p className="text-sm text-slate-400 mt-1">Create your first weekly report to get started</p>
          <Link to="/reports/new" className="btn-primary mt-4 inline-flex">Create Report</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {weeks.map((week) => {
            const isCurrent = isCurrentWeek(week.weekStart);
            return (
              <div key={week.weekStart} className={`card ${isCurrent ? 'ring-2 ring-primary-200' : ''}`}>
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{formatWeekRange(week.weekStart, week.weekEnd)}</h3>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
                      Current Week
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {week.reports.map((report) => (
                    <Link
                      key={report._id}
                      to={`/reports/${report._id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: report.project?.color || '#6366f1' }} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{report.project?.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{report.tasksCompleted.split('\n')[0]}</p>
                        </div>
                      </div>
                      <StatusBadge status={report.status} />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
