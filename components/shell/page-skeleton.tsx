/**
 * Instant placeholder shown the moment a route is tapped, while the real
 * (dynamic, server-rendered) page streams in behind it. Its whole job is to
 * make navigation feel immediate on a weak link — the switch happens now, the
 * content fills in a beat later. Mirrors the shared page container so there's
 * no layout jump when the real content replaces it.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="bg-secondary h-7 w-44 animate-pulse rounded-lg" />
          <div className="bg-secondary/70 h-4 w-56 animate-pulse rounded" />
        </div>
        <div className="bg-secondary size-10 shrink-0 animate-pulse rounded-full" />
      </div>

      {/* filter / control row */}
      <div className="flex flex-wrap gap-2">
        <div className="bg-secondary h-8 w-16 animate-pulse rounded-full" />
        <div className="bg-secondary h-8 w-20 animate-pulse rounded-full" />
        <div className="bg-secondary h-8 w-16 animate-pulse rounded-full" />
        <div className="bg-secondary/60 ml-auto h-9 w-full animate-pulse rounded-full sm:w-56" />
      </div>

      {/* content rows */}
      <div className="space-y-2.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-secondary/50 h-[68px] animate-pulse rounded-2xl"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
