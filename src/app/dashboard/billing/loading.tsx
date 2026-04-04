export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-10 w-56 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="h-5 w-72 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>

        {/* Balance card skeleton */}
        <div className="h-36 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse mb-8" />

        {/* Pricing cards skeleton */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
              <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Credits pack skeleton */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
