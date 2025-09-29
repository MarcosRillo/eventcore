/**
 * Location Types - Ultra-Aggressive Consolidation
 *
 * Reduced from 4 interfaces/types to essential entity + generic patterns
 */

import { PaginatedResponse } from './api-response.types';
import { UniversalFilters } from './filter.types';

/**
 * Base Location interface - core entity that cannot be reduced
 */
export interface Location {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;

  // Geographic coordinates
  latitude?: number;
  longitude?: number;

  // Capacity and features
  max_capacity?: number;
  features: string[];

  // Contact information
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;

  // Meta information
  is_active: boolean;
  notes?: string;
  entity_id: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Use generic patterns for everything else
export type LocationFormData = Omit<Location, 'id' | 'created_at' | 'updated_at' | 'entity_id'>;
export type LocationFilters = UniversalFilters;
export type LocationPagination = PaginatedResponse<Location>;