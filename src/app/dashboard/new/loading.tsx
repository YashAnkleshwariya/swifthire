export default function NewJobLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-10 w-72 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="h-5 w-96 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>

        {/* Form card skeleton */}
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 p-6 border-b border-gray-100 dark:border-slate-600">
            <div className="h-7 w-40 bg-gray-200 dark:bg-slate-600 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
          </div>

          {/* Form fields */}
          <div className="p-8 space-y-8">
            {/* Textarea */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            </div>
            {/* Input */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
            {/* Select */}
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
            {/* Slider */}
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
            </div>
            {/* Submit button */}
            <div className="h-14 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
