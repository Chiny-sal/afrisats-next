"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="mb-4 text-5xl">⚠️</span>
      <h2 className="mb-2 font-display text-xl font-bold">Something went wrong</h2>
      <p className="mb-6 max-w-md text-sm text-muted">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button onClick={() => reset()} className="btn-gold">
        Try Again
      </button>
    </div>
  );
}
