'use client'

import { Users } from 'lucide-react'
import { Button } from '@/components/ui'
import UserTableContainer from '@/features/users/components/smart/UserTableContainer'

export default function UsersPage() {
  const handleInvite = () => {
    // TODO: Open invite modal or navigate to invitations page
    window.location.href = '/invitations'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Usuarios del Equipo
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona los miembros del equipo interno del ente
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={handleInvite}>
              Invitar Usuario
            </Button>
          </div>
        </div>

        {/* Content */}
        <UserTableContainer />
      </div>
    </div>
  )
}
