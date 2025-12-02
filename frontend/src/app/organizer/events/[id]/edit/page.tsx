/**
 * Legacy Edit Event Page - Redirects to /organizer/[id]/edit
 *
 * This page is deprecated (Dec 2, 2025).
 * Event editing is now at /organizer/[id]/edit.
 */

import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LegacyEditEventPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/organizer/${id}/edit`)
}
