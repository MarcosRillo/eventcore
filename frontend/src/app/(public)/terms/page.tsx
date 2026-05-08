import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de la Plataforma de eventcore',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Términos y Condiciones</h1>
      <div className="prose prose-neutral max-w-none">
        <p className="text-neutral-600 mb-4">
          Próximamente se publicarán los términos y condiciones de uso de la Plataforma de eventcore.
        </p>
        <p className="text-neutral-600">
          Para consultas, contactá al equipo del Demo Organization.
        </p>
      </div>
    </div>
  )
}
