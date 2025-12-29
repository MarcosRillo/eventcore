/**
 * Admin Events Page
 *
 * Main page for entity_admin and entity_staff to manage and approve events.
 * Uses the AdminDashboardContainer which provides:
 * - Statistics grid
 * - Quick filters
 * - Event table
 * - Event management modal with approval workflow
 */

'use client';

import { AdminDashboardContainer } from '@/features/entity-admin/components/smart/AdminDashboardContainer';

/**
 *
 */
export default function EventsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminDashboardContainer />
      </div>
    </div>
  );
}
