/** Lightweight spinner while lazy route chunks load (avoids blank main area). */
export default function RouteFallback() {
  return (
    <div className="mt-8 flex min-h-[50vh] flex-col items-center justify-center gap-4 pb-16 text-muted-foreground">
      <div
        className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden
      />
      <span className="text-sm">Loading…</span>
    </div>
  );
}
