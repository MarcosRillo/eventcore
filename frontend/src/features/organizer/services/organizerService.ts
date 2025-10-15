/**
 * Organizer Service
 * API service for organizer-specific operations
 */

import { apiClient } from '@/lib/api';
import type { Event } from '@/types/event.types';
import type {
  OrganizerDashboardStats,
  OrganizerEventsResponse,
  OrganizerEventFilters,
  CreateEventDto,
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
  getEvent: async (id: number): Promise<Event> => {
    const response = await apiClient.get<Event>(
      `/organizer/events/${id}`
    );
    return response;
  },

  /**
   * Create new event
   */
  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await apiClient.post<{ message: string; event: Event }>(
      '/organizer/events',
      data
    );
    return response.event;
  },

  /**
   * Update existing event
   */
  updateEvent: async (id: number, data: CreateEventDto): Promise<Event> => {
    const response = await apiClient.put<{ message: string; event: Event }>(
      `/organizer/events/${id}`,
      data
    );
    return response.event;
  },
};
