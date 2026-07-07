import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Trash2 } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';
import { getCurrentWeek, toDateInput, weekEndFromStart } from '../utils/dates';

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
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'weekStart') {
      setForm({ ...form, weekStart: value, weekEnd: weekEndFromStart(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

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
      showToast(submit ? 'Report submitted successfully!' : 'Report saved successfully!', 'success');
      navigate('/reports');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save report';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/reports/${id}`);
      showToast('Report deleted', 'info');
      navigate('/reports');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete report', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="card p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-slate-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const isSubmitted = form.status === 'submitted';
  const taskCount = form.tasksCompleted.split('\n').filter((t) => t.trim()).length;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Report' : 'New Weekly Report'}
        subtitle="All team members use the same report format. You can edit before or after submission."
        breadcrumb="Team Member / Reports"
        action={isEdit && <StatusBadge status={form.status} />}
      />
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="flex justify-between items-center mb-1">
            <label className="label mb-0">Tasks Completed</label>
            <span className="text-xs text-slate-400">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
          </div>
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

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {isSubmitted ? (
            <button onClick={() => save(false)} className="btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <>
              <button onClick={() => save(false)} className="btn-secondary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button onClick={() => save(true)} className="btn-primary" disabled={saving}>
                <Send size={16} /> Submit Report
              </button>
            </>
          )}
          {isEdit && !isSubmitted && (
            <button onClick={() => setShowDeleteModal(true)} className="btn-danger sm:ml-auto">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Draft Report"
        message="This draft report will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </div>
  );
}
