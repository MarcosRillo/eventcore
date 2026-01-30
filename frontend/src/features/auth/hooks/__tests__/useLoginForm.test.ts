import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/context/AuthContext'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'
import { useToast } from '@/shared/context'

// Mock dependencies
jest.mock('@/context/AuthContext')
jest.mock('next/navigation')
jest.mock('@/shared/context', () => ({
  useToast: jest.fn(),
}))

const mockLogin = jest.fn()
const mockClearError = jest.fn()
const mockPush = jest.fn()
const mockAddToast = jest.fn()

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock setup
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      clearError: mockClearError,
    })

    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    ;(useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty email and password', () => {
      const { result } = renderHook(() => useLoginForm())

      expect(result.current.data.email).toBe('')
      expect(result.current.data.password).toBe('')
      expect(result.current.isValid).toBe(false)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should not be valid with empty credentials', () => {
      const { result } = renderHook(() => useLoginForm())

      expect(result.current.isValid).toBe(false)
      expect(result.current.validate()).toBe(false)
    })
  })

  describe('Field Updates', () => {
    it('should update email field correctly', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
      })

      expect(result.current.data.email).toBe('test@example.com')
      expect(result.current.isDirty).toBe(true)
    })

    it('should update password field correctly', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('password', 'password123')
      })

      expect(result.current.data.password).toBe('password123')
      expect(result.current.isDirty).toBe(true)
    })

    it('should mark form as dirty when any field has value', () => {
      const { result } = renderHook(() => useLoginForm())

      expect(result.current.isDirty).toBe(false)

      act(() => {
        result.current.updateField('email', 'test@example.com')
      })

      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('should be valid when both email and password are provided', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'password123')
      })

      expect(result.current.isValid).toBe(true)
      expect(result.current.validate()).toBe(true)
    })

    it('should be invalid with only email', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
      })

      expect(result.current.isValid).toBe(false)
    })

    it('should be invalid with only password', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('password', 'password123')
      })

      expect(result.current.isValid).toBe(false)
    })

    it('should trim whitespace when validating', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', '   ')
        result.current.updateField('password', '   ')
      })

      expect(result.current.isValid).toBe(false)
    })
  })

  describe('Form Submission', () => {
    it('should call login with trimmed credentials on valid submit', async () => {
      mockLogin.mockResolvedValueOnce(true)

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', '  test@example.com  ')
        result.current.updateField('password', '  password123  ')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should not call login when form is invalid', async () => {
      const { result } = renderHook(() => useLoginForm())

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should handle preventDefault when event is provided', async () => {
      mockLogin.mockResolvedValueOnce(true)
      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'password123')
      })

      await act(async () => {
        await result.current.handleSubmit(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockLogin).toHaveBeenCalled()
    })

    it('should set loading state during login', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      )

      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      const { result } = renderHook(() => useLoginForm())

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('User Redirection', () => {
    it('should redirect organizer_admin to /organizer/dashboard after login', async () => {
      const mockUser = {
        id: 1,
        email: 'organizer@example.com',
        role: {
          id: 2,
          role_code: 'organizer_admin',
        },
      }

      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        user: mockUser,
        clearError: mockClearError,
      })

      renderHook(() => useLoginForm())

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/organizer/dashboard')
      })
    })

    it('should redirect entity roles to /internal-calendar after login', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        role: {
          id: 1,
          role_code: 'entity_admin',
        },
      }

      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        user: mockUser,
        clearError: mockClearError,
      })

      renderHook(() => useLoginForm())

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/internal-calendar')
      })
    })

    it('should not redirect when user is not authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      renderHook(() => useLoginForm())

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not redirect when authenticated but user data is missing', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        user: null,
        clearError: mockClearError,
      })

      renderHook(() => useLoginForm())

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should display error from auth context', () => {
      const errorMessage = 'Invalid credentials'

      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      const { result } = renderHook(() => useLoginForm())

      expect(result.current.error).toBe(errorMessage)
    })

    it('should clear error when user types in email field', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'new@example.com')
      })

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled()
      })
    })

    it('should clear error when user types in password field', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('password', 'newpassword')
      })

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled()
      })
    })

    it('should clear error manually via setError method', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setError(null)
      })

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('Form Reset', () => {
    it('should reset email and password to empty strings', () => {
      const { result } = renderHook(() => useLoginForm())

      // Set some values
      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'password123')
      })

      expect(result.current.data.email).toBe('test@example.com')
      expect(result.current.data.password).toBe('password123')

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.data.email).toBe('')
      expect(result.current.data.password).toBe('')
      expect(result.current.isValid).toBe(false)
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle login failure gracefully', async () => {
      mockLogin.mockResolvedValueOnce(false)

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'wrongpassword')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockLogin).toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should show error toast when login fails', async () => {
      mockLogin.mockResolvedValueOnce(false)

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'wrongpassword')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Credenciales incorrectas. Verifica tu email y contraseña.',
        type: 'error',
        duration: 5000,
      })
    })

    it('should show success toast when login succeeds', async () => {
      mockLogin.mockResolvedValueOnce(true)

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'password123')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Sesión iniciada correctamente',
        type: 'success',
        duration: 3000,
      })
    })

    it('should handle login exception gracefully', async () => {
      // Mock login to throw error (simulating network error)
      const mockLoginWithError = jest.fn().mockRejectedValueOnce(new Error('Network error'))

      ;(useAuth as jest.Mock).mockReturnValue({
        login: mockLoginWithError,
        isLoading: false,
        error: 'Network error',
        isAuthenticated: false,
        user: null,
        clearError: mockClearError,
      })

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.updateField('password', 'password123')
      })

      // Wrap in try-catch to prevent unhandled rejection
      try {
        await act(async () => {
          await result.current.handleSubmit()
        })
      } catch {
        // Expected to throw
      }

      expect(mockLoginWithError).toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
      expect(result.current.error).toBe('Network error')
    })

    it('should handle multiple rapid field updates', () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.updateField('email', 'a')
        result.current.updateField('email', 'ab')
        result.current.updateField('email', 'abc@example.com')
      })

      expect(result.current.data.email).toBe('abc@example.com')
    })
  })
})
