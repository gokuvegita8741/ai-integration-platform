export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-5 w-28 rounded bg-zinc-800" />
        <div className="h-9 w-80 rounded bg-zinc-800" />
        <div className="h-4 w-64 rounded bg-zinc-800" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-zinc-900 border border-zinc-800"
          />
        ))}
      </div>

      {/* Content */}
      <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-zinc-900 border border-zinc-800" />
        <div className="h-80 rounded-xl bg-zinc-900 border border-zinc-800" />
      </div>
    </div>
  );
}