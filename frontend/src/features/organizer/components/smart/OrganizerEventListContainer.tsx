'use client'

import { useRouter } from 'next/navigation'
import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'
import { OrganizerEventList } from '@/features/organizer/components/dumb/OrganizerEventList'

export const OrganizerEventListContainer = () => {
  const router = useRouter()
  const {
    events,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    statusFilter,
    isDeleting,
    handlePageChange,
    handleStatusFilter,
    handleDelete,
    retry
  } = useOrganizerEvents()

  const handleEdit = (id: number) => {
    router.push(`/organizer/events/${id}/edit`)
  }

  const handleView = (id: number) => {
    router.push(`/organizer/events/${id}`)
  }

  return (
    <OrganizerEventList
      events={events}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      total={total}
      statusFilter={statusFilter}
      isDeleting={isDeleting}
      onPageChange={handlePageChange}
      onStatusFilter={handleStatusFilter}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      onRetry={retry}
    />
  )
}
