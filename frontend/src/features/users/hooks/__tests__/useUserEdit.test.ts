import { renderHook, act } from '@testing-library/react'
import { useUserEdit } from '../useUserEdit'
import type { User } from '../../types/user.types'

describe('useUserEdit', () => {
  const mockUser: User = {
    id: 1,
    name: 'Patricia López',
    email: 'patricia.lopez@enteturismo.gov.ar',
    status: 'active',
    role: {
      id: 4,
      role_code: 'entity_staff',
      role_name: 'Entity Staff',
      description: 'Staff member',
      permissions: [],
    },
    created_at: '2025-11-28T00:00:00Z',
    updated_at: '2025-11-28T00:00:00Z',
  }

  const defaultProps = {
    user: mockUser,
    onSave: jest.fn().mockResolvedValue(true),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with user name and email', () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      expect(result.current.name).toBe('Patricia López')
      expect(result.current.email).toBe('patricia.lopez@enteturismo.gov.ar')
      expect(result.current.errors).toEqual({})
    })

    it('should initialize with empty values when user is null', () => {
      const { result } = renderHook(() =>
        useUserEdit({ ...defaultProps, user: null })
      )

      expect(result.current.name).toBe('')
      expect(result.current.email).toBe('')
    })

    it('should update values when user changes', () => {
      const { result, rerender } = renderHook(
        (props) => useUserEdit(props),
        { initialProps: defaultProps }
      )

      expect(result.current.name).toBe('Patricia López')

      const newUser = { ...mockUser, id: 2, name: 'Miguel Sánchez', email: 'miguel@test.com' }
      rerender({ ...defaultProps, user: newUser })

      expect(result.current.name).toBe('Miguel Sánchez')
      expect(result.current.email).toBe('miguel@test.com')
    })
  })

  describe('setName and setEmail', () => {
    it('should update name when setName is called', () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setName('New Name')
      })

      expect(result.current.name).toBe('New Name')
    })

    it('should update email when setEmail is called', () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setEmail('new@email.com')
      })

      expect(result.current.email).toBe('new@email.com')
    })
  })

  describe('validation', () => {
    it('should set error when name is empty on submit', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setName('')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.name).toBe('El nombre es obligatorio')
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should set error when name is only whitespace on submit', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setName('   ')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.name).toBe('El nombre es obligatorio')
    })

    it('should set error when name exceeds 255 characters', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setName('a'.repeat(256))
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.name).toBe('El nombre no puede exceder 255 caracteres')
    })

    it('should set error when email is empty on submit', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setEmail('')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBe('El email es obligatorio')
    })

    it('should set error when email is invalid', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setEmail('invalidemail')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBe('El email debe ser válido')
    })

    it('should clear errors when user changes', () => {
      const { result, rerender } = renderHook(
        (props) => useUserEdit(props),
        { initialProps: defaultProps }
      )

      // Force an error
      act(() => {
        result.current.setName('')
      })

      // Now change the user
      const newUser = { ...mockUser, id: 2, name: 'Miguel', email: 'miguel@test.com' }
      rerender({ ...defaultProps, user: newUser })

      expect(result.current.errors).toEqual({})
    })
  })

  describe('handleSubmit', () => {
    it('should call onSave with trimmed values when valid', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.setName('  Patricia López Updated  ')
        result.current.setEmail('  updated@test.com  ')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(defaultProps.onSave).toHaveBeenCalledWith(1, {
        name: 'Patricia López Updated',
        email: 'updated@test.com',
      })
    })

    it('should call onClose after successful save', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should not call onClose when save fails', async () => {
      const onSaveFailing = jest.fn().mockResolvedValue(false)
      const { result } = renderHook(() =>
        useUserEdit({ ...defaultProps, onSave: onSaveFailing })
      )

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('should not call onSave when user is null', async () => {
      const { result } = renderHook(() =>
        useUserEdit({ ...defaultProps, user: null })
      )

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should prevent default form submission', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))
      const mockPreventDefault = jest.fn()

      await act(async () => {
        const mockEvent = { preventDefault: mockPreventDefault } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(mockPreventDefault).toHaveBeenCalled()
    })
  })

  describe('handleClose', () => {
    it('should call onClose', () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      act(() => {
        result.current.handleClose()
      })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should clear errors when closing', async () => {
      const { result } = renderHook(() => useUserEdit(defaultProps))

      // Force an error first
      act(() => {
        result.current.setName('')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.name).toBeDefined()

      act(() => {
        result.current.handleClose()
      })

      expect(result.current.errors).toEqual({})
    })
  })
})
