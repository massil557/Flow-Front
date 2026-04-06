
const SkeletonCard = () => {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 w-16 rounded bg-slate-200"></div>
          <div className="mt-2 h-6 w-20 rounded bg-slate-200"></div>
        </div>
        <div className="h-6 w-12 rounded bg-slate-200"></div>
      </div>
      <div className="mt-4 h-12 w-full rounded bg-slate-100"></div>
    </div>
  );
};

export default SkeletonCard;