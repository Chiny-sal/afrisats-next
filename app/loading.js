export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      <p className="text-sm text-muted">Loading AfriSats…</p>
    </div>
  );
}
