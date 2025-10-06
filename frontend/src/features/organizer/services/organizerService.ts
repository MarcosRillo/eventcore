/**
 * Organizer Service
 * API service for organizer-specific operations
 */

import { apiClient } from '@/lib/api';
import type {
  OrganizerDashboardStats,
  OrganizerEvent,
  OrganizerEventsResponse,
  OrganizerEventFilters,
} from '../types/organizerTypes';

export const organizerService = {
  /**
   * Obtiene estadísticas del dashboard del organizador
   */
  getDashboardStats: async (): Promise<OrganizerDashboardStats> => {
    const response = await apiClient.get<OrganizerDashboardStats>(
      '/organizer/dashboard/stats'
    );
    return response;
  },

  /**
   * Obtiene eventos del organizador con filtros y paginación
   */
  getEvents: async (
    params?: OrganizerEventFilters
  ): Promise<OrganizerEventsResponse> => {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/organizer/events${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<OrganizerEventsResponse>(url);
    return response;
  },

  /**
   * Obtiene un evento específico del organizador
   */
  getEvent: async (id: number): Promise<OrganizerEvent> => {
    const response = await apiClient.get<OrganizerEvent>(
      `/organizer/events/${id}`
    );
    return response;
  },
};
