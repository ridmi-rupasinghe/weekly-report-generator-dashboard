import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Trash2 } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { getCurrentWeek, toDateInput } from '../utils/dates';

const emptyForm = () => {
  const { weekStart, weekEnd } = getCurrentWeek();
  return {
    weekStart: toDateInput(weekStart),
    weekEnd: toDateInput(weekEnd),
    project: '',
    tasksCompleted: '',
    tasksPlanned: '',
    blockers: '',
    hoursWorked: '',
    notes: '',
    status: 'draft',
  };
};

export default function ReportForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/projects').then(({ data }) => setProjects(data.projects));
    if (isEdit) {
      api.get(`/reports/${id}`).then(({ data }) => {
        const r = data.report;
        setForm({
          weekStart: toDateInput(r.weekStart),
          weekEnd: toDateInput(r.weekEnd),
          project: r.project._id || r.project,
          tasksCompleted: r.tasksCompleted,
          tasksPlanned: r.tasksPlanned,
          blockers: r.blockers || '',
          hoursWorked: r.hoursWorked ?? '',
          notes: r.notes || '',
          status: r.status,
        });
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (submit = false) => {
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      hoursWorked: form.hoursWorked === '' ? null : Number(form.hoursWorked),
      status: submit ? 'submitted' : form.status,
    };

    try {
      if (isEdit) {
        await api.put(`/reports/${id}`, payload);
      } else {
        await api.post('/reports', payload);
      }
      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this draft report?')) return;
    await api.delete(`/reports/${id}`);
    navigate('/reports');
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  const isSubmitted = form.status === 'submitted';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold">{isEdit ? 'Edit Report' : 'New Weekly Report'}</h2>
        {isEdit && <StatusBadge status={form.status} />}
      </div>
      <p className="text-sm text-slate-500 mb-6">
        All team members use the same report format. You can edit your report before or after submission.
      </p>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Week Start</label>
            <input type="date" name="weekStart" className="input" value={form.weekStart} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Week End</label>
            <input type="date" name="weekEnd" className="input" value={form.weekEnd} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="label">Project / Category</label>
          <select name="project" className="input" value={form.project} onChange={handleChange} required>
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Tasks Completed</label>
          <textarea name="tasksCompleted" className="input min-h-[100px]" value={form.tasksCompleted} onChange={handleChange} placeholder="One task per line" required />
        </div>

        <div>
          <label className="label">Tasks Planned for Next Week</label>
          <textarea name="tasksPlanned" className="input min-h-[100px]" value={form.tasksPlanned} onChange={handleChange} placeholder="One task per line" required />
        </div>

        <div>
          <label className="label">Blockers / Challenges</label>
          <textarea name="blockers" className="input min-h-[80px]" value={form.blockers} onChange={handleChange} placeholder="Any blockers or challenges faced" />
        </div>

        <div>
          <label className="label">Hours Worked (optional)</label>
          <input type="number" name="hoursWorked" className="input" value={form.hoursWorked} onChange={handleChange} min="0" step="0.5" placeholder="e.g. 40" />
        </div>

        <div>
          <label className="label">Notes / Links (optional)</label>
          <textarea name="notes" className="input min-h-[60px]" value={form.notes} onChange={handleChange} placeholder="Additional notes or relevant links" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          {isSubmitted ? (
            <button onClick={() => save(false)} className="btn-primary" disabled={saving}>
              <Save size={16} /> Save Changes
            </button>
          ) : (
            <>
              <button onClick={() => save(false)} className="btn-secondary" disabled={saving}>
                <Save size={16} /> Save Draft
              </button>
              <button onClick={() => save(true)} className="btn-primary" disabled={saving}>
                <Send size={16} /> Submit Report
              </button>
            </>
          )}
          {isEdit && !isSubmitted && (
            <button onClick={handleDelete} className="btn-danger ml-auto">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
