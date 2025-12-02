'use client'

/**
 * Registration Requests Page
 * Admin panel for managing organizer account requests
 */

import { ClipboardList } from 'lucide-react'
import { RegistrationRequestsContainer } from '@/features/registration-requests/components/smart/RegistrationRequestsContainer'

export default function RegistrationRequestsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-4">
                <ClipboardList className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Solicitudes de Registro
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Gestiona las solicitudes de cuenta de organizadores de eventos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <RegistrationRequestsContainer />
      </div>
    </div>
  )
}
