export default function ItemGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="ticket-card animate-pulse">
          <div className="h-8 bg-white/5" />
          <div className="aspect-[4/3] bg-white/5" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 rounded bg-white/5" />
            <div className="h-4 w-1/2 rounded bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-7 w-1/3 rounded bg-white/5" />
            <div className="h-10 w-full rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
