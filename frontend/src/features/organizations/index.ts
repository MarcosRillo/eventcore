/**
 * Organizations Feature - Main Barrel Export
 *
 * Organization management for admin.
 */

// Hooks
export { useOrganizations } from '@/features/organizations/hooks/useOrganizations'

// Services
export { default as organizationService } from '@/features/organizations/services/organization.service'

// Types
export * from '@/features/organizations/types/organization.types'
