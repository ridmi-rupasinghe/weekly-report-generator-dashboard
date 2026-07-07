import { useState, useEffect } from 'react';
import { FileCheck, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import SubmissionStatusPanel from '../components/SubmissionStatusPanel';
import { MetricSkeleton, ChartSkeleton } from '../components/Skeleton';
import { formatWeekRange, toDateInput, getCurrentWeek } from '../utils/dates';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_COLORS = { submitted: '#10b981', pending: '#f59e0b', late: '#ef4444' };

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
    return (
      <div>
        <PageHeader title="Team Dashboard" subtitle="Loading analytics..." breadcrumb="Manager" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <MetricSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const { summary, submissionStatus, tasksTrend, projectDistribution, recentActivity } = data;

  const statusChartData = submissionStatus.map((s) => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    status: s.status,
    value: s.status === 'submitted' ? 1 : s.status === 'late' ? 0.5 : 0.25,
  }));

  return (
    <div>
      <PageHeader
        title="Team Dashboard"
        subtitle={formatWeekRange(data.weekStart, data.weekEnd)}
        breadcrumb="Manager / Dashboard"
        action={
          <div>
            <label className="label">Week Start</label>
            <input
              type="date"
              className="input w-auto"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Reports Submitted" value={`${summary.totalSubmitted}/${summary.totalMembers}`} icon={FileCheck} color="primary" />
        <MetricCard title="Compliance Rate" value={`${summary.complianceRate}%`} icon={TrendingUp} color="green" />
        <MetricCard title="Open Blockers" value={summary.openBlockers} icon={AlertTriangle} color="red" />
        <MetricCard title="Team Members" value={summary.totalMembers} icon={Users} color="primary" />
      </div>

      <div className="mb-6">
        <SubmissionStatusPanel members={submissionStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Tasks Completed Trend</h3>
          {tasksTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tasksTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="teamTotal" stroke="#6366f1" strokeWidth={2} name="Team Total" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No trend data for this period</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Submission Status Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip formatter={(_v, _n, props) => [props.payload.status, props.payload.fullName]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
                <div key={r._id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
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
