/**
 * Admin Events Page
 *
 * Main page for entity_admin and entity_staff to manage and approve events.
 * Uses the AdminDashboardContainer which provides:
 * - Statistics grid
 * - Quick filters
 * - Event table
 * - Event management modal with approval workflow
 *
 * Stats are fetched server-side for faster initial render.
 */

import type { Metadata } from 'next';

import { AdminDashboardContainer } from '@/features/entity-admin/components/smart/AdminDashboardContainer';
import { adminStatsService } from '@/features/entity-admin/services';

export const metadata: Metadata = {
  title: 'Gestión de Eventos - Admin',
  description: 'Panel de gestión y aprobación de eventos',
  robots: { index: false, follow: false }
};

export default async function EventsPage() {
  // Fetch stats server-side to avoid waterfall
  const initialStats = await adminStatsService.getApprovalStats().catch(() => null);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminDashboardContainer initialStats={initialStats} />
      </div>
    </div>
  );
}
