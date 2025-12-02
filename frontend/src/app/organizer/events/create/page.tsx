/**
 * Legacy Create Event Page - Redirects to /organizer/create
 *
 * This page is deprecated (Dec 2, 2025).
 * Event creation is now at /organizer/create.
 */

import { redirect } from 'next/navigation'

export default function LegacyCreateEventPage() {
  redirect('/organizer/create')
}
