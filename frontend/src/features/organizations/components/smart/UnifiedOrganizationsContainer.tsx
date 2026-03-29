'use client'

/**
 * Unified Organizations Container - Smart Component
 * Consolidates Organizations, Registration Requests and Invitations into a tabbed view.
 */

import { Building2, FileText, Mail } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'

import { useAuth } from '@/context/AuthContext'
import InvitationTableContainer from '@/features/invitations/components/smart/InvitationTableContainer'
import type { InvitationsListResponse } from '@/features/invitations/types/invitation.types'
import { OrganizationTableContainer } from '@/features/organizations/components/smart/OrganizationTableContainer'
import type { OrganizationsResponse } from '@/features/organizations/types/organization.types'
import { RegistrationRequestsContainer } from '@/features/registration-requests/components/smart/RegistrationRequestsContainer'
import type { RegistrationRequestsResponse } from '@/features/registration-requests/types/registration-request.types'
import { apiFetcher, invitationKeys, organizationKeys, registrationRequestKeys } from '@/lib/swr'
import { cn } from '@/lib/utils'

type TabKey = 'organizations' | 'requests' | 'invitations'

interface Tab {
  key: TabKey
  label: string
  icon: React.ElementType
  count: number
}

export const UnifiedOrganizationsContainer = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('organizations')
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const isReady = isAuthenticated && !authLoading

  // Lightweight SWR calls — keys match what child containers use,
  // so data is served from cache once the child mounts. No duplicate requests.
  const { data: orgsData } = useSWR<OrganizationsResponse>(
    isReady ? organizationKeys.list('') : null,
    apiFetcher,
    { keepPreviousData: true }
  )

  const { data: requestsData } = useSWR<RegistrationRequestsResponse>(
    isReady ? registrationRequestKeys.list('') : null,
    apiFetcher
  )

  const { data: invitationsData } = useSWR<InvitationsListResponse>(
    isReady ? invitationKeys.list : null,
    apiFetcher
  )

  const orgsCount = orgsData?.pagination?.total ?? 0
  const requestsPendingCount =
    requestsData?.data?.filter((r) => r.status === 'pending').length ?? 0
  const invitationsCount = invitationsData?.data?.length ?? 0

  const tabs: Tab[] = [
    {
      key: 'organizations',
      label: 'Organizaciones',
      icon: Building2,
      count: orgsCount,
    },
    {
      key: 'requests',
      label: 'Solicitudes',
      icon: FileText,
      count: requestsPendingCount,
    },
    {
      key: 'invitations',
      label: 'Invitaciones',
      icon: Mail,
      count: invitationsCount,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <tab.icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'organizations' && <OrganizationTableContainer />}
      {activeTab === 'requests' && <RegistrationRequestsContainer />}
      {activeTab === 'invitations' && <InvitationTableContainer />}
    </div>
  )
}

export default UnifiedOrganizationsContainer
