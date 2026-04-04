export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-12 w-64 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="h-5 w-80 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse"
            />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="h-7 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 flex-1 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
