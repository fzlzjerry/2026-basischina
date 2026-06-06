/**
 * Suspense fallback for lazily-loaded route components (§11).
 */
export function PageLoading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <span
        aria-hidden="true"
        className="motion-safe:animate-spin inline-block h-10 w-10 rounded-full border-2 border-current border-t-transparent text-primary-deep"
      />
    </div>
  );
}
