import { useState, useEffect } from 'react';
import { FileCheck, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { formatWeekRange, toDateInput, getCurrentWeek } from '../utils/dates';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [weekStart, setWeekStart] = useState(toDateInput(getCurrentWeek().weekStart));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard/stats', { params: { weekStart } }).then(({ data: d }) => {
      setData(d);
      setLoading(false);
    });
  }, [weekStart]);

  if (loading || !data) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  const { summary, submissionStatus, tasksTrend, projectDistribution, recentActivity } = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Team Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">
            {formatWeekRange(data.weekStart, data.weekEnd)}
          </p>
        </div>
        <div>
          <label className="label">Week Start</label>
          <input
            type="date"
            className="input w-auto"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Reports Submitted" value={`${summary.totalSubmitted}/${summary.totalMembers}`} icon={FileCheck} color="primary" />
        <MetricCard title="Compliance Rate" value={`${summary.complianceRate}%`} icon={TrendingUp} color="green" />
        <MetricCard title="Open Blockers" value={summary.openBlockers} icon={AlertTriangle} color="red" />
        <MetricCard title="Team Members" value={summary.totalMembers} icon={Users} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Tasks Completed Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tasksTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="teamTotal" stroke="#6366f1" strokeWidth={2} name="Team Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Submission Status by Member</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={submissionStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'Yes' : 'No')} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v, _n, props) => [props.payload.status, 'Status']} />
              <Bar dataKey={(d) => (d.status === 'submitted' ? 1 : 0)} fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {submissionStatus.map((s) => (
              <div key={s.userId} className="flex items-center gap-1 text-xs">
                <span>{s.name}</span>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Workload by Project</h3>
          {projectDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={projectDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {projectDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No submitted reports for this week</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((r) => (
                <div key={r._id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{r.user?.name}</p>
                    <p className="text-xs text-slate-500">{r.project?.name} · {formatWeekRange(r.weekStart, r.weekEnd)}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{r.tasksCompleted.split('\n')[0]}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
