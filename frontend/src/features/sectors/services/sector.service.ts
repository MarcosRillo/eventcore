/**
 * Sector Service
 * API service functions for sector CRUD operations
 *
 * ARCHITECTURE RULES:
 * - All single item operations (CREATE, UPDATE, DELETE) use ApiResponse<T> wrapper
 * - Collection operations (INDEX) use Laravel Resource Collection structure directly
 * - Consistent error handling across all methods
 * - TypeScript safety with proper typing
 */

import { AxiosError, AxiosResponse } from 'axios';

import { Sector, SectorFormData, SectorPagination } from '@/features/sectors/types/sector.types';
import apiClient from '@/services/apiClient';
import { ApiError, ApiResponse } from '@/types/api-response.types';

export interface SectorQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  active?: boolean;
}

/**
 * Fetch paginated sectors
 * Returns Laravel Resource Collection with pagination metadata
 */
export const getSectors = async (
  params: SectorQueryParams = {}
): Promise<SectorPagination> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', String(params.page));
  if (params.per_page) searchParams.append('per_page', String(params.per_page));
  if (params.search) searchParams.append('search', params.search);
  if (params.active !== undefined)
    searchParams.append('active', String(params.active));

  const response = await apiClient.get<SectorPagination>(
    `/sectors?${searchParams.toString()}`
  );
  return response.data;
};

/**
 * Get active sectors only (useful for dropdowns/selects)
 * Returns array of Sector
 */
export const getActiveSectors = async (): Promise<Sector[]> => {
  const response: AxiosResponse<ApiResponse<Sector[]>> = await apiClient.get(
    '/sectors/active'
  );

  // Handle both formats (array direct or wrapped in .data)
  const sectors = Array.isArray(response.data) ? response.data : response.data.data;

  return sectors;
};

/**
 * Create a new sector
 * Returns ApiResponse<Sector> wrapper structure
 */
export const createSector = async (data: SectorFormData): Promise<Sector> => {
  const response: AxiosResponse<ApiResponse<Sector>> = await apiClient.post(
    '/sectors',
    {
      name: data.name,
      is_active: data.is_active !== undefined ? data.is_active : true,
    }
  );

  return response.data.data;
};

/**
 * Update an existing sector
 * Returns ApiResponse<Sector> wrapper structure
 */
export const updateSector = async (
  id: number,
  data: SectorFormData
): Promise<Sector> => {
  const response: AxiosResponse<ApiResponse<Sector>> = await apiClient.put(
    `/sectors/${id}`,
    {
      name: data.name,
      is_active: data.is_active,
    }
  );

  return response.data.data;
};

/**
 * Delete a sector
 * Returns void on success
 */
export const deleteSector = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/sectors/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.status === 404) {
      throw new Error('El sector no existe o ya fue eliminado.');
    }
    if (axiosError.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar este sector.');
    }
    if (axiosError.response?.status === 409) {
      throw new Error(
        'No se puede eliminar el sector porque tiene organizaciones asociadas.'
      );
    }

    const errorMessage =
      axiosError.response?.data?.message ||
      'Error al eliminar el sector. Inténtalo de nuevo.';
    throw new Error(errorMessage);
  }
};

/**
 * Toggle sector active status
 * Returns ApiResponse<Sector> wrapper structure
 */
export const toggleSectorStatus = async (id: number): Promise<Sector> => {
  const response: AxiosResponse<ApiResponse<Sector>> = await apiClient.patch(
    `/sectors/${id}/toggle-status`
  );

  return response.data.data;
};

/**
 * Export default object with all service functions
 */
const sectorService = {
  getSectors,
  getActiveSectors,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
};

export default sectorService;
