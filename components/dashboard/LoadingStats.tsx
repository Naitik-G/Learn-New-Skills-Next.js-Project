// components/dashboard/LoadingState.tsx
export function LoadingState() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-live="polite">
      <div className="container-app py-10">
        <div className="mb-8 h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <span className="sr-only">Loading your dashboard...</span>
      </div>
    </div>
  );
}
