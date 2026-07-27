export default function BookCardSkeleton({ variant = "grid" }) {
  if (variant === "list") {
    return (
      <article
        className="book-card mx-auto grid w-full max-w-sm grid-cols-[4rem_minmax(0,1fr)] gap-3 p-2.5 sm:max-w-none sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center"
        aria-hidden="true"
      >
        <div className="h-24 rounded-md skeleton-shimmer sm:h-28" />

        <div className="min-w-0 self-center space-y-2.5">
          <div className="h-3 w-28 rounded-full skeleton-shimmer" />
          <div className="h-5 w-4/5 rounded-full skeleton-shimmer" />
          <div className="h-3 w-2/3 rounded-full skeleton-shimmer" />
          <div className="flex gap-1">
            <div className="h-5 w-16 rounded-full skeleton-shimmer" />
            <div className="h-5 w-20 rounded-full skeleton-shimmer" />
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-2 sm:col-span-1">
          <div className="h-9 w-20 rounded-lg skeleton-shimmer" />
          <div className="h-9 w-24 rounded-lg skeleton-shimmer" />
        </div>
      </article>
    );
  }

  return (
    <article
      className="book-card mx-auto flex h-full w-full max-w-sm flex-col sm:max-w-none"
      aria-hidden="true"
    >
      <div className="relative aspect-[2/3] shrink-0 overflow-hidden border-b border-borderSoft bg-cream">
        <div className="absolute inset-0 skeleton-shimmer" />
        <div className="absolute left-2 top-2 h-9 w-9 rounded-full skeleton-shimmer" />
        <div className="absolute right-2 top-2 h-6 w-20 rounded-full skeleton-shimmer" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 h-3 w-24 rounded-full skeleton-shimmer" />
        <div className="mb-2 h-5 w-full rounded-full skeleton-shimmer" />
        <div className="mb-3 h-5 w-4/5 rounded-full skeleton-shimmer" />
        <div className="mb-4 h-4 w-2/3 rounded-full skeleton-shimmer" />

        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-3 w-3 rounded-full skeleton-shimmer" />
            ))}
          </div>
          <div className="h-3 w-10 rounded-full skeleton-shimmer" />
        </div>

        <div className="mt-3 h-9 rounded-lg skeleton-shimmer" />

        <div className="mt-3 flex gap-1">
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          <div className="h-5 w-20 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </article>
  );
}
