/**
 * API Response Types
 * Standardized response interfaces for all API services
 */

import { Event } from '@/types/event.types';
import { User } from '@/types/auth.types';

/**
 * Core pagination interfaces - essential for API responses
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  path: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

// DEPRECATED: Use PaginatedResponse<T> directly
export type EventsResponse = PaginatedResponse<Event>;
export type UsersResponse = PaginatedResponse<User>;

// API error interface
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
  field_errors?: Record<string, string[]>;
}

// Backward compatibility alias
export type ApiErrorResponse = ApiError;

// Generic API response wrapper
export interface ApiResponse<T> {
  message: string;
  data: T;
}