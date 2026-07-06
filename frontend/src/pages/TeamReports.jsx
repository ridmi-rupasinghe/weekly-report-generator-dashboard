import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatWeekRange, toDateInput, getCurrentWeek } from '../utils/dates';

export default function TeamReports() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    weekStart: toDateInput(getCurrentWeek().weekStart),
    weekEnd: toDateInput(getCurrentWeek().weekEnd),
    userId: '',
    projectId: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/auth/users'),
      api.get('/projects'),
    ]).then(([usersRes, projectsRes]) => {
      setUsers(usersRes.data.users.filter((u) => u.role === 'team_member'));
      setProjects(projectsRes.data.projects);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.weekStart) params.weekStart = filters.weekStart;
    if (filters.weekEnd) params.weekEnd = filters.weekEnd;
    if (filters.userId) params.userId = filters.userId;
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.status) params.status = filters.status;

    api.get('/reports/team', { params }).then(({ data }) => {
      setReports(data.reports);
      setLoading(false);
    });
  }, [filters]);

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const memberStatus = users.map((user) => {
    const userReports = reports.filter((r) => r.user._id === user._id || r.user === user._id);
    const hasSubmitted = userReports.some((r) => r.status === 'submitted');
    const weekEnd = new Date(filters.weekEnd);
    const isLate = !hasSubmitted && new Date() > weekEnd;
    return { ...user, status: hasSubmitted ? 'submitted' : isLate ? 'late' : 'pending' };
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team Reports</h2>

      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">Week Start</label>
            <input type="date" name="weekStart" className="input" value={filters.weekStart} onChange={handleFilter} />
          </div>
          <div>
            <label className="label">Week End</label>
            <input type="date" name="weekEnd" className="input" value={filters.weekEnd} onChange={handleFilter} />
          </div>
          <div>
            <label className="label">Team Member</label>
            <select name="userId" className="input" value={filters.userId} onChange={handleFilter}>
              <option value="">All members</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Project</label>
            <select name="projectId" className="input" value={filters.projectId} onChange={handleFilter}>
              <option value="">All projects</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" value={filters.status} onChange={handleFilter}>
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-sm">Submission Status</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
          {memberStatus.map((m) => (
            <div key={m._id} className="bg-white px-4 py-3 flex items-center justify-between">
              <span className="text-sm">{m.name}</span>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No reports match your filters</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{report.user?.name}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {report.project?.name} · {formatWeekRange(report.weekStart, report.weekEnd)}
                  </p>
                </div>
                {report.hoursWorked && <span className="text-sm text-slate-500">{report.hoursWorked}h</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-slate-600 mb-1">Completed</p>
                  <p className="text-slate-500 whitespace-pre-line">{report.tasksCompleted}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-600 mb-1">Planned</p>
                  <p className="text-slate-500 whitespace-pre-line">{report.tasksPlanned}</p>
                </div>
              </div>
              {report.blockers && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  <span className="font-medium">Blockers: </span>{report.blockers}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
