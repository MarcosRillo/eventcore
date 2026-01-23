/**
 * Location Service
 * API service functions for location CRUD operations
 *
 * ARCHITECTURE RULES:
 * - All single item operations (CREATE, READ, UPDATE, DELETE) use ApiResponse<T> wrapper
 * - Collection operations (INDEX) use Laravel Resource Collection structure directly
 * - Consistent error handling across all methods
 * - TypeScript safety with proper typing
 */

import { AxiosResponse } from 'axios';

import apiClient from '@/services/apiClient';
import {
  Location,
  LocationFilters,
  LocationPagination,
  LocationPayload,
} from '@/types/location.types';

/**
 * Fetch paginated locations
 * Returns Laravel Resource Collection with pagination metadata
 * @param params
 */
export const getLocations = async (params: LocationFilters = {}): Promise<LocationPagination> => {
  try {
    // Build query params, filtering out undefined values to avoid 422 errors
    const queryParams: Record<string, string | number | boolean> = {
      page: params.page || 1,
      per_page: params.per_page || 15,
    };

    // Only include search if it has a value
    if (params.search) {
      queryParams.search = params.search;
    }

    // Only include active filter if explicitly set (not undefined)
    if (params.is_active !== undefined) {
      queryParams.active = params.is_active;
    }

    // Laravel Resource collections with pagination return the paginated data directly
    const response: AxiosResponse<LocationPagination> = await apiClient.get('/locations', {
      params: queryParams,
    });

    // Laravel Resource pagination structure is directly in response.data
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all active locations for the current user's entity
 * Returns array of active locations without pagination
 */
export const getActiveLocations = async (): Promise<Location[]> => {
  try {
    const response: AxiosResponse<{ data: Location[] }> = await apiClient.get('/locations/active');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a single location by ID
 * @param id
 */
export const getLocation = async (id: number): Promise<Location> => {
  try {
    const response: AxiosResponse<{ data: Location }> = await apiClient.get(`/locations/${id}`);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new location
 * Uses LocationPayload which includes required fields + defaults
 * @param locationData
 */
export const createLocation = async (locationData: LocationPayload): Promise<Location> => {
  try {
    const response: AxiosResponse<{ data: Location }> = await apiClient.post('/locations', locationData);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing location
 * Uses LocationPayload for consistent field structure
 * @param id
 * @param locationData
 */
export const updateLocation = async (id: number, locationData: LocationPayload): Promise<Location> => {
  try {
    const response: AxiosResponse<{ data: Location }> = await apiClient.put(`/locations/${id}`, locationData);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a location
 * @param id
 */
export const deleteLocation = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/locations/${id}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Search locations by name (for autocomplete)
 * Returns simplified options for select components
 * @param query
 */
export const searchLocations = async (query: string): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await getLocations({ search: query, per_page: 20 });
    return response.data.map(loc => ({ id: loc.id, name: loc.name }));
  } catch (error) {
    throw error;
  }
};

/**
 * Exported location service object
 */
export const locationService = {
  getLocations,
  getActiveLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  searchLocations,
};

export default locationService;
