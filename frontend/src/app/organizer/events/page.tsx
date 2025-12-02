/**
 * Legacy Organizer Events Page - Redirects to Dashboard
 *
 * This page is deprecated (Dec 2, 2025).
 * All event management is now consolidated in /organizer/dashboard.
 */

import { redirect } from 'next/navigation'

export default function OrganizerEventsPage() {
  redirect('/organizer/dashboard')
}
