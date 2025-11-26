import { renderHook, act, waitFor } from '@testing-library/react'
import { useAppearanceForm } from '../useAppearanceForm'
import * as appearanceService from '@/features/appearance/services/appearance.service'
import { AppearanceResponse, DEFAULT_THEME } from '@/types/appearance.types'

// Mock appearance service
jest.mock('@/features/appearance/services/appearance.service')

describe('useAppearanceForm', () => {
  const mockAppearanceData: AppearanceResponse = {
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    logo_url: 'https://example.com/logo.png',
    favicon_url: 'https://example.com/favicon.ico',
    entity_name: 'Test Organization',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(appearanceService.getAppearanceSettings as jest.Mock).mockResolvedValue(mockAppearanceData)
  })

  describe('Initialization', () => {
    it('should initialize with default theme while loading', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      expect(result.current.data).toEqual(DEFAULT_THEME)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isSaving).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasUnsavedChanges).toBe(false)
      expect(result.current.isValid).toBe(true)
      expect(result.current.isDirty).toBe(false)

      // Wait for async effects to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should load appearance settings on mount', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(appearanceService.getAppearanceSettings).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockAppearanceData)
      expect(result.current.originalData).toEqual(mockAppearanceData)
    })

    it('should handle loading errors and fallback to defaults', async () => {
      ;(appearanceService.getAppearanceSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Error al cargar la configuración de apariencia')
      expect(result.current.data).toEqual(DEFAULT_THEME)
      expect(result.current.originalData).toEqual(DEFAULT_THEME)
    })
  })

  describe('Field Updates', () => {
    it('should update primary_color field', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
      })

      expect(result.current.data.primary_color).toBe('#FF0000')
      expect(result.current.hasUnsavedChanges).toBe(true)
      expect(result.current.isDirty).toBe(true)
    })

    it('should update entity_name field', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('entity_name', 'New Organization')
      })

      expect(result.current.data.entity_name).toBe('New Organization')
      expect(result.current.hasUnsavedChanges).toBe(true)
    })

    it('should update logo_url field', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('logo_url', 'https://new-example.com/logo.png')
      })

      expect(result.current.data.logo_url).toBe('https://new-example.com/logo.png')
      expect(result.current.hasUnsavedChanges).toBe(true)
    })

    it('should clear error when field is updated', async () => {
      ;(appearanceService.getAppearanceSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Error')
      )

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar la configuración de apariencia')
      })

      act(() => {
        result.current.updateField('primary_color', '#000000')
      })

      expect(result.current.error).toBeNull()
    })

    it('should update multiple fields independently', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#111111')
        result.current.updateField('secondary_color', '#222222')
        result.current.updateField('accent_color', '#333333')
      })

      expect(result.current.data.primary_color).toBe('#111111')
      expect(result.current.data.secondary_color).toBe('#222222')
      expect(result.current.data.accent_color).toBe('#333333')
    })
  })

  describe('Form Submission', () => {
    it('should submit only changed fields', async () => {
      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockResolvedValue({
        ...mockAppearanceData,
        primary_color: '#FF0000',
      })

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(appearanceService.updateAppearanceSettings).toHaveBeenCalledWith({
        primary_color: '#FF0000',
      })
    })

    it('should not submit if no changes were made', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(appearanceService.updateAppearanceSettings).not.toHaveBeenCalled()
    })

    it('should update originalData after successful submit', async () => {
      const updatedData = {
        ...mockAppearanceData,
        primary_color: '#FF0000',
        entity_name: 'Updated Org',
      }

      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockResolvedValue(updatedData)

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
        result.current.updateField('entity_name', 'Updated Org')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.data).toEqual(updatedData)
      expect(result.current.originalData).toEqual(updatedData)
      expect(result.current.hasUnsavedChanges).toBe(false)
    })

    it('should set saving state during submission', async () => {
      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockAppearanceData), 100))
      )

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
      })

      // Start submission without awaiting
      act(() => {
        result.current.handleSubmit()
      })

      await waitFor(() => {
        expect(result.current.isSaving).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false)
      }, { timeout: 200 })
    })

    it('should handle submission errors', async () => {
      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Update failed')
      )

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
      })

      // Verify that handleSubmit throws error
      let errorThrown = false
      try {
        await act(async () => {
          await result.current.handleSubmit()
        })
      } catch (error) {
        errorThrown = true
        expect(error).toEqual(new Error('Error al actualizar la configuración de apariencia'))
      }

      expect(errorThrown).toBe(true)
      // Verify saving state is reset (from finally block)
      expect(result.current.isSaving).toBe(false)
    })

    it('should submit multiple changed fields', async () => {
      const updatedData = {
        ...mockAppearanceData,
        primary_color: '#AAAAAA',
        secondary_color: '#BBBBBB',
        logo_url: 'https://new.com/logo.png',
      }

      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockResolvedValue(updatedData)

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#AAAAAA')
        result.current.updateField('secondary_color', '#BBBBBB')
        result.current.updateField('logo_url', 'https://new.com/logo.png')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(appearanceService.updateAppearanceSettings).toHaveBeenCalledWith({
        primary_color: '#AAAAAA',
        secondary_color: '#BBBBBB',
        logo_url: 'https://new.com/logo.png',
      })
    })
  })

  describe('Form Reset', () => {
    it('should reset form to original loaded values', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
        result.current.updateField('entity_name', 'Changed')
      })

      expect(result.current.hasUnsavedChanges).toBe(true)

      act(() => {
        result.current.resetForm()
      })

      expect(result.current.data).toEqual(mockAppearanceData)
      expect(result.current.hasUnsavedChanges).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should reset form to system defaults', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
      })

      act(() => {
        result.current.resetToDefaults()
      })

      expect(result.current.data).toEqual(DEFAULT_THEME)
      expect(result.current.error).toBeNull()
    })

    it('should clear error when resetting to defaults', async () => {
      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Error')
      )

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#FF0000')
      })

      await act(async () => {
        try {
          await result.current.handleSubmit()
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.resetToDefaults()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('FormActions Compatibility', () => {
    it('should expose submit method', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.submit).toBe(result.current.handleSubmit)
      expect(typeof result.current.submit).toBe('function')
    })

    it('should expose reset method', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.reset).toBe(result.current.resetForm)
      expect(typeof result.current.reset).toBe('function')
    })

    it('should expose setError method', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setError('Custom error')
      })

      expect(result.current.error).toBe('Custom error')
    })

    it('should expose validate method that always returns true', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.validate()).toBe(true)
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('Unsaved Changes Detection', () => {
    it('should detect no changes initially', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasUnsavedChanges).toBe(false)
      expect(result.current.isDirty).toBe(false)
    })

    it('should detect changes after field update', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#000000')
      })

      expect(result.current.hasUnsavedChanges).toBe(true)
      expect(result.current.isDirty).toBe(true)
    })

    it('should clear unsaved changes after successful submit', async () => {
      ;(appearanceService.updateAppearanceSettings as jest.Mock).mockResolvedValue({
        ...mockAppearanceData,
        primary_color: '#000000',
      })

      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateField('primary_color', '#000000')
      })

      expect(result.current.hasUnsavedChanges).toBe(true)

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.hasUnsavedChanges).toBe(false)
    })

    it('should detect changes when reverting to original value', async () => {
      const { result } = renderHook(() => useAppearanceForm())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const originalColor = result.current.data.primary_color

      act(() => {
        result.current.updateField('primary_color', '#FFFFFF')
      })

      expect(result.current.hasUnsavedChanges).toBe(true)

      act(() => {
        result.current.updateField('primary_color', originalColor)
      })

      expect(result.current.hasUnsavedChanges).toBe(false)
    })
  })
})
