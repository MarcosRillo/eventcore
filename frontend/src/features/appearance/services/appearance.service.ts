/**
 * Appearance Service
 * Handles all API operations for theme/appearance management
 * Contains NO business logic - only HTTP operations
 */

import apiClient from '@/services/apiClient';
import { AppearanceResponse, AppearanceFormData } from '@/types/appearance.types';

const APPEARANCE_ENDPOINTS = {
  base: '/admin/appearance',
} as const;

/**
 * Fetches current appearance settings from the server
 */
export const getAppearanceSettings = async (): Promise<AppearanceResponse> => {
  const response = await apiClient.get<AppearanceResponse>(APPEARANCE_ENDPOINTS.base);
  return response.data;
};

/**
 * Updates appearance settings on the server
 */
export const updateAppearanceSettings = async (
  data: Partial<AppearanceFormData>
): Promise<AppearanceResponse> => {
  const response = await apiClient.put<AppearanceResponse>(
    APPEARANCE_ENDPOINTS.base,
    data
  );
  return response.data;
};
