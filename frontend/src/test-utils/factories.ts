/**
 * Test Mock Factories
 * Reusable mock factory functions for common types used in tests
 */

import { Event, EventStatusCode, EventTypeCode, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types'
import { Location } from '@/types/location.types'
import { PaginationMeta, PaginationLinks } from '@/types/api-response.types'

/**
 * Creates a valid Event mock with required fields
 */
export const createMockEvent = (overrides: Partial<Event> & { id: number; title: string }): Event => ({
  description: 'Test event description',
  start_date: '2025-01-15T10:00:00.000Z',
  end_date: '2025-01-15T18:00:00.000Z',
  type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
  status: EVENT_STATUS.DRAFT as EventStatusCode,
  locations: [],
  is_featured: false,
  approval_history: [],
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Creates a valid Location mock with required fields
 * Simplified for Tucumán Tourism
 */
export const createMockLocation = (overrides: Partial<Location> & { id: number; name: string }): Location => ({
  address: 'Av. Soldati 330',
  city: 'San Miguel de Tucumán',
  state: 'Tucumán',
  country: 'Argentina',
  is_active: true,
  entity_id: 1,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Creates valid PaginationMeta
 */
export const createMockPaginationMeta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
  path: 'http://api.example.com/test',
  links: [],
  ...overrides,
})

/**
 * Creates valid PaginationLinks
 */
export const createMockPaginationLinks = (overrides: Partial<PaginationLinks> = {}): PaginationLinks => ({
  first: 'http://api.example.com/test?page=1',
  last: 'http://api.example.com/test?page=1',
  prev: null,
  next: null,
  ...overrides,
})

/**
 * Creates a complete paginated response structure
 */
export const createMockPaginatedResponse = <T>(
  data: T[],
  metaOverrides: Partial<PaginationMeta> = {},
  linksOverrides: Partial<PaginationLinks> = {}
) => ({
  data,
  meta: createMockPaginationMeta({
    total: data.length,
    from: data.length > 0 ? 1 : null,
    to: data.length > 0 ? data.length : null,
    ...metaOverrides,
  }),
  links: createMockPaginationLinks(linksOverrides),
})
