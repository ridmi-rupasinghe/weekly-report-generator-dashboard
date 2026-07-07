export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="card p-5">
      <SkeletonLine className="h-3 w-24 mb-3" />
      <SkeletonLine className="h-8 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card p-5">
      <SkeletonLine className="h-4 w-40 mb-4" />
      <SkeletonLine className="h-[280px] w-full rounded-lg" />
    </div>
  );
}

export function ReportListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
