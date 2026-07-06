import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import api from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [assigning, setAssigning] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const load = () => {
    api.get('/projects').then(({ data }) => setProjects(data.projects));
    api.get('/auth/users').then(({ data }) => setUsers(data.users.filter((u) => u.role === 'team_member')));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', color: '#6366f1' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/projects/${editing}`, form);
    } else {
      await api.post('/projects', form);
    }
    resetForm();
    load();
  };

  const handleEdit = (project) => {
    setForm({ name: project.name, description: project.description || '', color: project.color });
    setEditing(project._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  const openAssign = (project) => {
    setAssigning(project._id);
    setSelectedMembers(project.assignedMembers?.map((m) => m._id || m) || []);
  };

  const saveAssign = async () => {
    await api.put(`/projects/${assigning}/members`, { memberIds: selectedMembers });
    setAssigning(null);
    load();
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Projects & Categories</h2>
          <p className="text-slate-500 text-sm mt-1">Manage work categories and team assignments</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus size={18} /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-4">{editing ? 'Edit Project' : 'New Project'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Color</label>
              <input type="color" className="input h-10" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {assigning && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-4">Assign Team Members</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => toggleMember(u._id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedMembers.includes(u._id)
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={saveAssign} className="btn-primary">Save</button>
            <button onClick={() => setAssigning(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: project.color }} />
                <h3 className="font-semibold">{project.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openAssign(project)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded" title="Assign members">
                  <Users size={16} />
                </button>
                <button onClick={() => handleEdit(project)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(project._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {project.description && <p className="text-sm text-slate-500 mt-2">{project.description}</p>}
            {project.assignedMembers?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {project.assignedMembers.map((m) => (
                  <span key={m._id || m} className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                    {m.name || users.find((u) => u._id === m)?.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
