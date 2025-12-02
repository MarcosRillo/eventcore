/**
 * EventType Service
 * API service functions for event type CRUD operations
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
import {
  EventType,
  EventTypePagination,
  CreateEventTypeData,
  UpdateEventTypeData,
  EventTypeQueryParams,
} from '@/types/eventType.types';
import { ApiResponse, ApiError } from '@/types/api-response.types';

/**
 * Fetch paginated event types
 * Returns Laravel Resource Collection with pagination metadata
 */
export const getEventTypes = async (
  params: EventTypeQueryParams = {}
): Promise<EventTypePagination> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', String(params.page));
  if (params.per_page) searchParams.append('per_page', String(params.per_page));
  if (params.search) searchParams.append('search', params.search);
  if (params.active !== undefined)
    searchParams.append('active', String(params.active));

  const response = await apiClient.get<EventTypePagination>(
    `/event-types?${searchParams.toString()}`
  );
  return response.data;
};

/**
 * Get a single event type by ID
 * Returns EventType data directly
 */
export const getEventType = async (id: number): Promise<EventType> => {
  const response = await apiClient.get<EventType>(`/event-types/${id}`);
  return response.data;
};

/**
 * Create a new event type
 * Returns ApiResponse<EventType> wrapper structure
 */
export const createEventType = async (
  eventTypeData: CreateEventTypeData
): Promise<EventType> => {
  const response: AxiosResponse<ApiResponse<EventType>> = await apiClient.post(
    '/event-types',
    {
      name: eventTypeData.name,
      is_active:
        eventTypeData.is_active !== undefined ? eventTypeData.is_active : true,
    }
  );

  return response.data.data;
};

/**
 * Update an existing event type
 * Returns ApiResponse<EventType> wrapper structure
 */
export const updateEventType = async (
  id: number,
  eventTypeData: UpdateEventTypeData
): Promise<EventType> => {
  const response: AxiosResponse<ApiResponse<EventType>> = await apiClient.put(
    `/event-types/${id}`,
    {
      name: eventTypeData.name,
      is_active: eventTypeData.is_active,
    }
  );

  return response.data.data;
};

/**
 * Delete an event type
 * Returns success message only
 */
export const deleteEventType = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/event-types/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    // Enhanced error handling for permission, not found, and constraint errors
    if (axiosError.response?.status === 404) {
      throw new Error('El tipo de evento no existe o ya fue eliminado.');
    }
    if (axiosError.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar este tipo de evento.');
    }
    if (axiosError.response?.status === 409) {
      throw new Error(
        'No se puede eliminar el tipo de evento porque tiene subtipos asociados.'
      );
    }

    // For other errors, provide a user-friendly message
    const errorMessage =
      axiosError.response?.data?.message ||
      'Error al eliminar el tipo de evento. Inténtalo de nuevo.';
    throw new Error(errorMessage);
  }
};

/**
 * Toggle event type active status
 * Returns ApiResponse<EventType> wrapper structure
 */
export const toggleEventTypeStatus = async (id: number): Promise<EventType> => {
  const response: AxiosResponse<ApiResponse<EventType>> = await apiClient.patch(
    `/event-types/${id}/toggle-status`
  );

  return response.data.data;
};

/**
 * Get active event types only (useful for dropdowns/selects)
 * Returns array of EventType
 */
export const getActiveEventTypes = async (): Promise<EventType[]> => {
  const response: AxiosResponse<ApiResponse<EventType[]>> = await apiClient.get(
    '/event-types/active'
  );

  // Handle both formats (array direct or wrapped in .data)
  const eventTypes = Array.isArray(response.data)
    ? response.data
    : response.data.data;

  return eventTypes;
};

/**
 * Search event types by name
 * Convenience method using getEventTypes with search parameter
 */
export const searchEventTypes = async (
  query: string,
  page: number = 1
): Promise<EventTypePagination> => {
  return getEventTypes({
    search: query,
    page,
    per_page: 15,
  });
};

/**
 * Validate event type data before submission
 * Client-side validation to reduce server round trips
 */
export const validateEventTypeData = (
  data: CreateEventTypeData | UpdateEventTypeData
): string[] => {
  const errors: string[] = [];

  if ('name' in data && data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre del tipo de evento es obligatorio');
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
const eventTypeService = {
  getEventTypes,
  getEventType,
  createEventType,
  updateEventType,
  deleteEventType,
  toggleEventTypeStatus,
  getActiveEventTypes,
  searchEventTypes,
  validateEventTypeData,
};

export default eventTypeService;
