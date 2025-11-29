/**
 * useRegistrationRequest Hook Tests
 * Tests for public registration form submission
 */
import { renderHook, act } from '@testing-library/react'
import { useRegistrationRequest } from '../useRegistrationRequest'
import { createRegistrationRequest } from '../../services/registration-request.service'
import { initialFormData } from '../../types/registration-request.types'

jest.mock('../../services/registration-request.service', () => ({
  createRegistrationRequest: jest.fn(),
}))

const mockCreateRegistrationRequest = createRegistrationRequest as jest.MockedFunction<
  typeof createRegistrationRequest
>

describe('useRegistrationRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty form data', () => {
      const { result } = renderHook(() => useRegistrationRequest())

      expect(result.current.formData).toEqual(initialFormData)
      expect(result.current.formErrors).toEqual({})
      expect(result.current.submitting).toBe(false)
      expect(result.current.success).toBe(false)
    })

    it('should have all required action functions', () => {
      const { result } = renderHook(() => useRegistrationRequest())

      expect(typeof result.current.updateField).toBe('function')
      expect(typeof result.current.submitForm).toBe('function')
      expect(typeof result.current.resetForm).toBe('function')
      expect(typeof result.current.clearErrors).toBe('function')
    })
  })

  describe('updateField', () => {
    it('should update text field', () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('first_name', 'Juan')
      })

      expect(result.current.formData.first_name).toBe('Juan')
    })

    it('should update file field', () => {
      const { result } = renderHook(() => useRegistrationRequest())
      const mockFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })

      act(() => {
        result.current.updateField('profile_photo', mockFile)
      })

      expect(result.current.formData.profile_photo).toBe(mockFile)
    })

    it('should clear field error when updating', () => {
      const { result } = renderHook(() => useRegistrationRequest())

      // First, trigger validation to get an error
      act(() => {
        result.current.submitForm()
      })

      expect(result.current.formErrors.first_name).toBeDefined()

      // Now update the field
      act(() => {
        result.current.updateField('first_name', 'Juan')
      })

      expect(result.current.formErrors.first_name).toBeUndefined()
    })
  })

  describe('form validation', () => {
    it('should validate required fields', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.dni).toBe('El DNI es requerido')
      expect(result.current.formErrors.first_name).toBe('El nombre es requerido')
      expect(result.current.formErrors.last_name).toBe('El apellido es requerido')
      expect(result.current.formErrors.email).toBe('El email es requerido')
      expect(result.current.formErrors.whatsapp).toBe('El WhatsApp es requerido')
      expect(result.current.formErrors.organization_name).toBe('El nombre de la organización es requerido')
      expect(result.current.formErrors.organization_cuit).toBe('El CUIT es requerido')
      expect(result.current.formErrors.organization_sector).toBe('El sector es requerido')
      expect(result.current.formErrors.motivation).toBe('La motivación es requerida')
    })

    it('should validate email format', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('email', 'invalid-email')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.email).toBe('El email no es válido')
    })

    it('should validate valid email', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('email', 'valid@example.com')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.email).toBeUndefined()
    })

    it('should validate CUIT format', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('organization_cuit', '20123456789')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.organization_cuit).toBe('El formato del CUIT debe ser XX-XXXXXXXX-X')
    })

    it('should accept valid CUIT format', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('organization_cuit', '20-12345678-9')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.organization_cuit).toBeUndefined()
    })

    it('should validate motivation length (min 50)', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('motivation', 'Short motivation')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.motivation).toBe('La motivación debe tener al menos 50 caracteres')
    })

    it('should validate motivation length (max 1000)', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('motivation', 'a'.repeat(1001))
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.motivation).toBe('La motivación no puede exceder 1000 caracteres')
    })

    it('should validate file size (max 2MB)', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      // Create a file larger than 2MB
      const largeFile = new File(['a'.repeat(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      act(() => {
        result.current.updateField('profile_photo', largeFile)
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.profile_photo).toBe('La foto no puede exceder 2MB')
    })

    it('should validate file type (image only)', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })

      act(() => {
        result.current.updateField('profile_photo', pdfFile)
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.profile_photo).toBe('El archivo debe ser una imagen')
    })

    it('should validate website URL format', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('website', 'not-a-valid-url')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.website).toBe('La URL del sitio web no es válida')
    })

    it('should accept valid website URL', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      act(() => {
        result.current.updateField('website', 'https://example.com')
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.website).toBeUndefined()
    })
  })

  describe('submitForm', () => {
    const validFormData = {
      dni: '12345678',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      whatsapp: '+5491234567890',
      organization_name: 'Turismo SRL',
      organization_cuit: '20-12345678-9',
      organization_sector: 'hotel',
      motivation: 'Quiero publicar eventos turísticos en la plataforma para promocionar mi negocio.',
    }

    it('should not submit if validation fails', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      await act(async () => {
        await result.current.submitForm()
      })

      expect(mockCreateRegistrationRequest).not.toHaveBeenCalled()
      expect(result.current.success).toBe(false)
    })

    it('should submit successfully with valid data', async () => {
      mockCreateRegistrationRequest.mockResolvedValueOnce({
        id: 1,
        email: 'juan@example.com',
        status: 'pending',
      })

      const { result } = renderHook(() => useRegistrationRequest())

      // Fill in all required fields
      Object.entries(validFormData).forEach(([key, value]) => {
        act(() => {
          result.current.updateField(key as keyof typeof validFormData, value)
        })
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(mockCreateRegistrationRequest).toHaveBeenCalledTimes(1)
      expect(result.current.success).toBe(true)
      expect(result.current.submitting).toBe(false)
    })

    it('should set submitting state during submission', async () => {
      let resolvePromise: (value: unknown) => void
      mockCreateRegistrationRequest.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve
        })
      )

      const { result } = renderHook(() => useRegistrationRequest())

      // Fill in all required fields
      Object.entries(validFormData).forEach(([key, value]) => {
        act(() => {
          result.current.updateField(key as keyof typeof validFormData, value)
        })
      })

      act(() => {
        result.current.submitForm()
      })

      expect(result.current.submitting).toBe(true)

      await act(async () => {
        resolvePromise!({ id: 1, email: 'juan@example.com', status: 'pending' })
      })

      expect(result.current.submitting).toBe(false)
    })

    it('should handle API validation errors', async () => {
      mockCreateRegistrationRequest.mockRejectedValueOnce({
        response: {
          data: {
            errors: {
              email: ['Este email ya está registrado'],
              organization_cuit: ['Este CUIT ya está registrado'],
            },
          },
        },
      })

      const { result } = renderHook(() => useRegistrationRequest())

      // Fill in all required fields
      Object.entries(validFormData).forEach(([key, value]) => {
        act(() => {
          result.current.updateField(key as keyof typeof validFormData, value)
        })
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.email).toBe('Este email ya está registrado')
      expect(result.current.formErrors.organization_cuit).toBe('Este CUIT ya está registrado')
      expect(result.current.success).toBe(false)
    })

    it('should handle API general error message', async () => {
      mockCreateRegistrationRequest.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error del servidor',
          },
        },
      })

      const { result } = renderHook(() => useRegistrationRequest())

      // Fill in all required fields
      Object.entries(validFormData).forEach(([key, value]) => {
        act(() => {
          result.current.updateField(key as keyof typeof validFormData, value)
        })
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.general).toBe('Error del servidor')
      expect(result.current.success).toBe(false)
    })

    it('should handle network errors', async () => {
      mockCreateRegistrationRequest.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useRegistrationRequest())

      // Fill in all required fields
      Object.entries(validFormData).forEach(([key, value]) => {
        act(() => {
          result.current.updateField(key as keyof typeof validFormData, value)
        })
      })

      await act(async () => {
        await result.current.submitForm()
      })

      expect(result.current.formErrors.general).toBe('Error al enviar la solicitud. Por favor, intenta nuevamente.')
      expect(result.current.success).toBe(false)
    })
  })

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useRegistrationRequest())

      // Modify some fields
      act(() => {
        result.current.updateField('first_name', 'Juan')
        result.current.updateField('email', 'juan@example.com')
      })

      expect(result.current.formData.first_name).toBe('Juan')

      // Reset the form
      act(() => {
        result.current.resetForm()
      })

      expect(result.current.formData).toEqual(initialFormData)
      expect(result.current.formErrors).toEqual({})
      expect(result.current.success).toBe(false)
    })
  })

  describe('clearErrors', () => {
    it('should clear all form errors', async () => {
      const { result } = renderHook(() => useRegistrationRequest())

      // Submit empty form to generate errors
      await act(async () => {
        await result.current.submitForm()
      })

      expect(Object.keys(result.current.formErrors).length).toBeGreaterThan(0)

      // Clear errors
      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.formErrors).toEqual({})
    })
  })
})
