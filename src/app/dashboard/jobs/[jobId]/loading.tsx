export default function JobDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="h-9 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>

        {/* Job summary card skeleton */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-7 w-72 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Progress card skeleton */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl p-6 mb-6">
          <div className="h-5 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-4" />
          <div className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse mb-3" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Results table skeleton */}
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="h-7 w-56 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
