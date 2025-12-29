/**
 * EventSubtype Service
 * API service functions for event subtype CRUD operations
 *
 * ARCHITECTURE RULES:
 * - All single item operations (CREATE, READ, UPDATE, DELETE) use ApiResponse<T> wrapper
 * - Collection operations (INDEX) use Laravel Resource Collection structure directly
 * - Consistent error handling across all methods
 * - TypeScript safety with proper typing
 *
 * Created: December 2, 2025
 */

import { AxiosResponse, AxiosError } from 'axios';

import apiClient from '@/services/apiClient';
import { ApiResponse, ApiError } from '@/types/api-response.types';
import {
  EventSubtype,
  EventSubtypePagination,
  CreateEventSubtypeData,
  UpdateEventSubtypeData,
  EventSubtypeQueryParams,
} from '@/types/eventType.types';

/**
 * Fetch paginated event subtypes for a specific event type
 * Returns Laravel Resource Collection with pagination metadata
 * @param eventTypeId
 * @param params
 */
export const getEventSubtypes = async (
  eventTypeId: number,
  params: EventSubtypeQueryParams = {}
): Promise<EventSubtypePagination> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', String(params.page));
  if (params.per_page) searchParams.append('per_page', String(params.per_page));
  if (params.search) searchParams.append('search', params.search);
  if (params.active !== undefined)
    searchParams.append('active', String(params.active));

  const response = await apiClient.get<EventSubtypePagination>(
    `/event-types/${eventTypeId}/subtypes?${searchParams.toString()}`
  );
  return response.data;
};

/**
 * Get a single event subtype by ID
 * Returns EventSubtype data directly
 * @param eventTypeId
 * @param id
 */
export const getEventSubtype = async (
  eventTypeId: number,
  id: number
): Promise<EventSubtype> => {
  const response = await apiClient.get<EventSubtype>(
    `/event-types/${eventTypeId}/subtypes/${id}`
  );
  return response.data;
};

/**
 * Create a new event subtype
 * Returns ApiResponse<EventSubtype> wrapper structure
 * @param eventTypeId
 * @param subtypeData
 */
export const createEventSubtype = async (
  eventTypeId: number,
  subtypeData: CreateEventSubtypeData
): Promise<EventSubtype> => {
  const response: AxiosResponse<ApiResponse<EventSubtype>> = await apiClient.post(
    `/event-types/${eventTypeId}/subtypes`,
    {
      name: subtypeData.name,
      is_active:
        subtypeData.is_active !== undefined ? subtypeData.is_active : true,
    }
  );

  return response.data.data;
};

/**
 * Update an existing event subtype
 * Returns ApiResponse<EventSubtype> wrapper structure
 * @param eventTypeId
 * @param id
 * @param subtypeData
 */
export const updateEventSubtype = async (
  eventTypeId: number,
  id: number,
  subtypeData: UpdateEventSubtypeData
): Promise<EventSubtype> => {
  const response: AxiosResponse<ApiResponse<EventSubtype>> = await apiClient.put(
    `/event-types/${eventTypeId}/subtypes/${id}`,
    {
      name: subtypeData.name,
      is_active: subtypeData.is_active,
    }
  );

  return response.data.data;
};

/**
 * Delete an event subtype
 * Returns success message only
 * @param eventTypeId
 * @param id
 */
export const deleteEventSubtype = async (
  eventTypeId: number,
  id: number
): Promise<void> => {
  try {
    await apiClient.delete(`/event-types/${eventTypeId}/subtypes/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    // Enhanced error handling for permission, not found, and constraint errors
    if (axiosError.response?.status === 404) {
      throw new Error('El subtipo de evento no existe o ya fue eliminado.');
    }
    if (axiosError.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar este subtipo de evento.');
    }
    if (axiosError.response?.status === 409) {
      throw new Error(
        'No se puede eliminar el subtipo porque tiene eventos asociados.'
      );
    }

    // For other errors, provide a user-friendly message
    const errorMessage =
      axiosError.response?.data?.message ||
      'Error al eliminar el subtipo de evento. Inténtalo de nuevo.';
    throw new Error(errorMessage);
  }
};

/**
 * Toggle event subtype active status
 * Returns ApiResponse<EventSubtype> wrapper structure
 * @param eventTypeId
 * @param id
 */
export const toggleEventSubtypeStatus = async (
  eventTypeId: number,
  id: number
): Promise<EventSubtype> => {
  const response: AxiosResponse<ApiResponse<EventSubtype>> =
    await apiClient.patch(`/event-types/${eventTypeId}/subtypes/${id}/toggle-status`);

  return response.data.data;
};

/**
 * Get active subtypes for a specific event type (useful for dropdowns/selects)
 * Returns array of EventSubtype
 * @param eventTypeId
 */
export const getActiveEventSubtypes = async (
  eventTypeId: number
): Promise<EventSubtype[]> => {
  const response: AxiosResponse<ApiResponse<EventSubtype[]>> =
    await apiClient.get(`/event-types/${eventTypeId}/subtypes/active`);

  // Handle both formats (array direct or wrapped in .data)
  const subtypes = Array.isArray(response.data)
    ? response.data
    : response.data.data;

  return subtypes;
};

/**
 * Search event subtypes by name within a specific event type
 * Convenience method using getEventSubtypes with search parameter
 * @param eventTypeId
 * @param query
 * @param page
 */
export const searchEventSubtypes = async (
  eventTypeId: number,
  query: string,
  page: number = 1
): Promise<EventSubtypePagination> => {
  return getEventSubtypes(eventTypeId, {
    search: query,
    page,
    per_page: 15,
  });
};

/**
 * Validate event subtype data before submission
 * Client-side validation to reduce server round trips
 * @param data
 */
export const validateEventSubtypeData = (
  data: CreateEventSubtypeData | UpdateEventSubtypeData
): string[] => {
  const errors: string[] = [];

  if ('name' in data && data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre del subtipo es obligatorio');
    } else if (data.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (data.name.trim().length > 255) {
      errors.push('El nombre no puede exceder 255 caracteres');
    }
  }

  return errors;
};

/**
 * Export default object with all service functions
 */
const eventSubtypeService = {
  getEventSubtypes,
  getEventSubtype,
  createEventSubtype,
  updateEventSubtype,
  deleteEventSubtype,
  toggleEventSubtypeStatus,
  getActiveEventSubtypes,
  searchEventSubtypes,
  validateEventSubtypeData,
};

export default eventSubtypeService;
