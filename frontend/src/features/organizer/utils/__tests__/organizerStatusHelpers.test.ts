/**
 * Tests for Organizer Status Helpers
 */

import {
  getOrganizerStatusBadgeVariant,
  getOrganizerStatusColors,
  getOrganizerStatusLabel,
  isValidOrganizerStatus,
  STATUS_BADGE_VARIANTS,
} from '@/features/organizer/utils/organizerStatusHelpers'

describe('organizerStatusHelpers', () => {
  describe('getOrganizerStatusColors', () => {
    test('should return success colors for published status', () => {
      const colors = getOrganizerStatusColors('published')

      expect(colors.bg).toBe('bg-success-50')
      expect(colors.text).toBe('text-success-700')
      expect(colors.dot).toBe('bg-success-500')
    })

    test('should return warning colors for pending_internal_approval status', () => {
      const colors = getOrganizerStatusColors('pending_internal_approval')

      expect(colors.bg).toBe('bg-warning-50')
      expect(colors.text).toBe('text-warning-700')
      expect(colors.dot).toBe('bg-warning-500')
    })

    test('should return primary colors for approved_internal status', () => {
      const colors = getOrganizerStatusColors('approved_internal')

      expect(colors.bg).toBe('bg-primary-50')
      expect(colors.text).toBe('text-primary-700')
      expect(colors.dot).toBe('bg-primary-500')
    })

    test('should return error colors for rejected status', () => {
      const colors = getOrganizerStatusColors('rejected')

      expect(colors.bg).toBe('bg-error-50')
      expect(colors.text).toBe('text-error-700')
      expect(colors.dot).toBe('bg-error-500')
    })

    test('should return neutral colors for draft status', () => {
      const colors = getOrganizerStatusColors('draft')

      expect(colors.bg).toBe('bg-neutral-100')
      expect(colors.text).toBe('text-neutral-700')
      expect(colors.dot).toBe('bg-neutral-400')
    })

    test('should return neutral colors for cancelled status', () => {
      const colors = getOrganizerStatusColors('cancelled')

      expect(colors.bg).toBe('bg-neutral-100')
      expect(colors.text).toBe('text-neutral-500')
      expect(colors.dot).toBe('bg-neutral-400')
    })

    test('should return warning colors for requires_changes status', () => {
      const colors = getOrganizerStatusColors('requires_changes')

      expect(colors.bg).toBe('bg-warning-50')
      expect(colors.text).toBe('text-warning-700')
      expect(colors.dot).toBe('bg-warning-500')
    })

    test('should return warning colors for pending_public_approval status', () => {
      const colors = getOrganizerStatusColors('pending_public_approval')

      expect(colors.bg).toBe('bg-warning-50')
      expect(colors.text).toBe('text-warning-700')
      expect(colors.dot).toBe('bg-warning-500')
    })

    test('should return default colors for unknown status', () => {
      const colors = getOrganizerStatusColors('unknown_status')

      expect(colors.bg).toBe('bg-neutral-100')
      expect(colors.text).toBe('text-neutral-700')
      expect(colors.dot).toBe('bg-neutral-400')
    })
  })

  describe('getOrganizerStatusLabel', () => {
    const expectedLabels: Record<string, string> = {
      draft: 'Borrador',
      pending_internal_approval: 'Pendiente revision',
      approved_internal: 'Aprobado interno',
      pending_public_approval: 'Pendiente publicacion',
      published: 'Publicado',
      requires_changes: 'Requiere cambios',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
    }

    Object.entries(expectedLabels).forEach(([status, label]) => {
      test(`should return "${label}" for ${status} status`, () => {
        expect(getOrganizerStatusLabel(status)).toBe(label)
      })
    })

    test('should return status code as-is for unknown status', () => {
      expect(getOrganizerStatusLabel('unknown_status')).toBe('unknown_status')
    })
  })

  describe('getOrganizerStatusBadgeVariant', () => {
    test('should return success for published status', () => {
      expect(getOrganizerStatusBadgeVariant('published')).toBe('success')
    })

    test('should return warning for pending_internal_approval status', () => {
      expect(getOrganizerStatusBadgeVariant('pending_internal_approval')).toBe('warning')
    })

    test('should return info for approved_internal status', () => {
      expect(getOrganizerStatusBadgeVariant('approved_internal')).toBe('info')
    })

    test('should return danger for rejected status', () => {
      expect(getOrganizerStatusBadgeVariant('rejected')).toBe('danger')
    })

    test('should return default for draft status', () => {
      expect(getOrganizerStatusBadgeVariant('draft')).toBe('default')
    })

    test('should return default for unknown status', () => {
      expect(getOrganizerStatusBadgeVariant('unknown')).toBe('default')
    })
  })

  describe('isValidOrganizerStatus', () => {
    const validStatuses = [
      'draft',
      'pending_internal_approval',
      'approved_internal',
      'pending_public_approval',
      'published',
      'requires_changes',
      'rejected',
      'cancelled',
    ]

    validStatuses.forEach(status => {
      test(`should return true for valid status: ${status}`, () => {
        expect(isValidOrganizerStatus(status)).toBe(true)
      })
    })

    test('should return false for invalid status', () => {
      expect(isValidOrganizerStatus('invalid')).toBe(false)
    })

    test('should return false for empty string', () => {
      expect(isValidOrganizerStatus('')).toBe(false)
    })
  })

  describe('STATUS_BADGE_VARIANTS constant', () => {
    test('should be a frozen constant for performance', () => {
      expect(STATUS_BADGE_VARIANTS).toBeDefined()
      expect(typeof STATUS_BADGE_VARIANTS).toBe('object')
    })

    test('should have all 8 status codes', () => {
      const expectedKeys = [
        'draft',
        'pending_internal_approval',
        'approved_internal',
        'pending_public_approval',
        'published',
        'requires_changes',
        'rejected',
        'cancelled',
      ]

      expectedKeys.forEach(key => {
        expect(STATUS_BADGE_VARIANTS).toHaveProperty(key)
      })
    })
  })
})
