/**
 * Event Detail Page
 *
 * Public event detail page (simplified for MVP).
 */

import Link from 'next/link'

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Detalle del Evento</h1>
        <p className="text-gray-600">
          Vista de detalle para evento ID: {id}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          (Implementación completa en próxima iteración)
        </p>
        <Link
          href="/calendar"
          className="inline-block mt-6 text-blue-600 hover:underline"
        >
          ← Volver al calendario
        </Link>
      </div>
    </div>
  )
}
