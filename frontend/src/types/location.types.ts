/**
 * Location Types - Simplified for Tucumán Tourism
 *
 * Aligned with backend validation (LocationController.php)
 * Required: name, address, city
 * Optional: state, country, description
 * Defaults: state="Tucumán", country="Argentina", is_active=true
 */

import { PaginatedResponse } from '@/types/api-response.types';
import { UniversalFilters } from '@/types/filter.types';

/**
 * Base Location interface - aligned with backend schema
 */
export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  description?: string;
  is_active: boolean;
  entity_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Form data for creating/editing locations
 * Only includes user-editable fields
 */
export interface LocationFormData {
  name: string;
  address: string;
  city: string;
  description?: string;
}

/**
 * Payload sent to backend when creating/updating
 */
export interface LocationPayload extends LocationFormData {
  state: string;
  country: string;
  is_active: boolean;
}

export type LocationFilters = UniversalFilters;
export type LocationPagination = PaginatedResponse<Location>;