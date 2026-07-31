export default function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 py-16 text-center">
      <span className="mb-4 text-5xl">🔍</span>
      <h3 className="mb-2 font-display text-lg font-semibold text-primary">
        No items found
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      {onClear && (
        <button onClick={onClear} className="btn-jade">
          Clear filters
        </button>
      )}
    </div>
  );
}
