/**
 * Loading skeleton for the registration request page
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 bg-neutral-200 rounded-md w-3/4 mx-auto animate-pulse mb-3" />
          <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto animate-pulse" />
        </div>

        <div className="bg-white shadow-sm rounded-xl p-8 space-y-8">
          {/* Section: Datos Personales */}
          <div>
            <div className="h-5 bg-neutral-200 rounded w-40 animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-neutral-200 rounded w-24 animate-pulse mb-1.5" />
                  <div className="h-10 bg-neutral-100 rounded-md animate-pulse" />
                </div>
              ))}
              {/* File upload skeleton */}
              <div>
                <div className="h-4 bg-neutral-200 rounded w-36 animate-pulse mb-1.5" />
                <div className="h-10 bg-neutral-100 rounded-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Section: Datos de la Organización */}
          <div>
            <div className="h-5 bg-neutral-200 rounded w-52 animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-neutral-200 rounded w-28 animate-pulse mb-1.5" />
                  <div className="h-10 bg-neutral-100 rounded-md animate-pulse" />
                </div>
              ))}
              {/* Logo skeleton — full width */}
              <div className="md:col-span-2">
                <div className="h-4 bg-neutral-200 rounded w-48 animate-pulse mb-1.5" />
                <div className="h-10 bg-neutral-100 rounded-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Section: Motivación */}
          <div>
            <div className="h-5 bg-neutral-200 rounded w-28 animate-pulse mb-4" />
            <div className="h-4 bg-neutral-200 rounded w-64 animate-pulse mb-1.5" />
            <div className="h-28 bg-neutral-100 rounded-md animate-pulse" />
            <div className="h-3 bg-neutral-200 rounded w-32 animate-pulse mt-1" />
          </div>

          {/* Terms checkbox skeleton */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-72 animate-pulse" />
            </div>
          </div>

          {/* Submit button skeleton */}
          <div className="pt-4">
            <div className="h-12 bg-primary-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
