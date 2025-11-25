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
  LocationPagination,
  LocationFilters,
} from '@/types/location.types';

/**
 * Fetch paginated locations
 * Returns Laravel Resource Collection with pagination metadata
 */
export const getLocations = async (params: LocationFilters = {}): Promise<LocationPagination> => {
  try {
    // Laravel Resource collections with pagination return the paginated data directly
    const response: AxiosResponse<LocationPagination> = await apiClient.get('/locations', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 15,
        search: params.search || '',
        is_active: params.is_active,
      },
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
 */
export const createLocation = async (locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> => {
  try {
    const response: AxiosResponse<{ data: Location }> = await apiClient.post('/locations', locationData);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing location
 */
export const updateLocation = async (id: number, locationData: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>): Promise<Location> => {
  try {
    const response: AxiosResponse<{ data: Location }> = await apiClient.put(`/locations/${id}`, locationData);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a location
 */
export const deleteLocation = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/locations/${id}`);
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
};

export default locationService;
