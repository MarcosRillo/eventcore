/**
 * Legacy Event Detail Page - Redirects to /organizer/[id]
 *
 * This page is deprecated (Dec 2, 2025).
 * Event details are now at /organizer/[id].
 */

import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyEventDetailPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/organizer/${id}`)
}
