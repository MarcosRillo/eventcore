'use client'

/**
 *
 * @param root0
 * @param root0.reset
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
        No pudimos cargar el evento
      </h2>
      <p className="text-neutral-600 mb-6">
        Por favor, intentá de nuevo más tarde.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
