export default function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    late: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}
