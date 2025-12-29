import Link from 'next/link'

/**
 *
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-neutral-700 mb-4">
        Página no encontrada
      </h2>
      <p className="text-neutral-600 mb-8">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
