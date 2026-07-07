export default function PageHeader({ title, subtitle, breadcrumb, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <p className="text-xs text-slate-400 mb-1">{breadcrumb}</p>
        )}
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
