'use client'

import { Building2 } from 'lucide-react'
import OrganizationTableContainer from '@/features/organizations/components/smart/OrganizationTableContainer'

const OrganizationsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Organizaciones
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona las organizaciones vinculadas que pueden crear
                  eventos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <OrganizationTableContainer />
      </div>
    </div>
  )
}

export default OrganizationsPage
