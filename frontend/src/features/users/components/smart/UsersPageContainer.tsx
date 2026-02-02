'use client'

/**
 * Users Page Container
 * Handles the users page layout and navigation
 */

import { Users } from 'lucide-react'
import Link from 'next/link'

import UserTableContainer from '@/features/users/components/smart/UserTableContainer'
import { Button } from '@/shared/components/form'

export function UsersPageContainer() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Usuarios del Equipo
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Gestiona los miembros del equipo interno del ente
                </p>
              </div>
            </div>
            <Link href="/invitations">
              <Button variant="primary">
                Invitar Usuario
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <UserTableContainer />
      </div>
    </div>
  )
}
