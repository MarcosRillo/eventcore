/**
 * Admin Stats Service
 *
 * Service for fetching approval statistics from the backend.
 * Used by entity_admin and entity_staff to view approval workflow metrics.
 */

import type { AdminApprovalStats, AdminStatCardData } from '@/features/entity-admin/types';
import apiClient from '@/services/apiClient';

interface StatsResponse {
  data: AdminApprovalStats;
}

/**
 * Service for admin approval statistics
 */
export const adminStatsService = {
  /**
   * Fetch approval statistics from the backend
   * GET /events/approval/statistics
   */
  getApprovalStats: async (): Promise<AdminApprovalStats> => {
    const response = await apiClient.get<StatsResponse>('/events/approval/statistics');
    return response.data.data;
  },

  /**
   * Transform raw stats into card data for dashboard display
   * @param stats - Raw statistics from backend
   * @returns Array of stat card data for rendering
   */
  transformStatsToCardData: (stats: AdminApprovalStats): AdminStatCardData[] => {
    return [
      {
        key: 'pending_internal_approval',
        label: 'Pend. Interno',
        value: stats.pending_internal_approval,
        color: 'warning',
        statusFilter: 'pending_internal_approval',
      },
      {
        key: 'pending_public_approval',
        label: 'Pend. Público',
        value: stats.pending_public_approval,
        color: 'warning',
        statusFilter: 'pending_public_approval',
      },
      {
        key: 'approved_internal',
        label: 'Aprobado Interno',
        value: stats.approved_internal,
        color: 'primary',
        statusFilter: 'approved_internal',
      },
      {
        key: 'published',
        label: 'Publicados',
        value: stats.published,
        color: 'success',
        statusFilter: 'published',
      },
      {
        key: 'requires_changes',
        label: 'Req. Cambios',
        value: stats.requires_changes,
        color: 'error',
        statusFilter: 'requires_changes',
      },
      {
        key: 'rejected',
        label: 'Rechazados',
        value: stats.rejected,
        color: 'error',
        statusFilter: 'rejected',
      },
    ];
  },
};

export default adminStatsService;
