import StatusBadge from './StatusBadge';

export default function SubmissionStatusPanel({ members, showProgress = true }) {
  if (!members?.length) {
    return (
      <div className="card p-8 text-center text-slate-400 text-sm">
        No team members found
      </div>
    );
  }

  const submitted = members.filter((m) => m.status === 'submitted').length;
  const pending = members.filter((m) => m.status === 'pending').length;
  const late = members.filter((m) => m.status === 'late').length;
  const total = members.length;
  const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div className="card overflow-hidden">
      {showProgress && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Submission Compliance</h3>
            <span className="text-sm font-bold text-primary-600">{submitted}/{total} submitted ({rate}%)</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> {submitted} submitted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> {pending} pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> {late} late
            </span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-100">
        {members.map((m) => (
          <div key={m.userId || m._id} className="bg-white px-4 py-3 flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{m.name}</span>
            <StatusBadge status={m.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
