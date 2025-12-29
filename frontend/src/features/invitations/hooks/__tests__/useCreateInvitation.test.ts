import { renderHook, act } from '@testing-library/react'

import { useCreateInvitation } from '@/features/invitations/hooks/useCreateInvitation'

describe('useCreateInvitation', () => {
  const defaultProps = {
    onSubmit: jest.fn().mockResolvedValue(true),
    onClose: jest.fn(),
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty values', () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      expect(result.current.email).toBe('')
      expect(result.current.roleId).toBe('')
      expect(result.current.errors).toEqual({})
    })
  })

  describe('setEmail and setRoleId', () => {
    it('should update email when setEmail is called', () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('test@example.com')
      })

      expect(result.current.email).toBe('test@example.com')
    })

    it('should update roleId when setRoleId is called', () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setRoleId(1)
      })

      expect(result.current.roleId).toBe(1)
    })
  })

  describe('validation', () => {
    it('should set error when email is empty on submit', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBe('El email es requerido')
      expect(defaultProps.onSubmit).not.toHaveBeenCalled()
    })

    it('should set error when email is only whitespace', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('   ')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBe('El email es requerido')
    })

    it('should set error when email format is invalid', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('notanemail')
        result.current.setRoleId(1)
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBe('Ingrese un email válido')
    })

    it('should set error when role is not selected', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('test@example.com')
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.role_id).toBe('Debe seleccionar un rol')
    })

    it('should accept valid email formats', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('valid@example.com')
        result.current.setRoleId(1)
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBeUndefined()
      expect(defaultProps.onSubmit).toHaveBeenCalled()
    })
  })

  describe('clearEmailError and clearRoleError', () => {
    it('should clear email error when clearEmailError is called', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      // First trigger error
      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.email).toBeDefined()

      // Clear the error
      act(() => {
        result.current.clearEmailError()
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('should clear role error when clearRoleError is called', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      // Set email but not role
      act(() => {
        result.current.setEmail('test@example.com')
      })

      // Trigger error
      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.errors.role_id).toBeDefined()

      // Clear the error
      act(() => {
        result.current.clearRoleError()
      })

      expect(result.current.errors.role_id).toBeUndefined()
    })
  })

  describe('handleSubmit', () => {
    it('should call onSubmit with trimmed email and roleId', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('  test@example.com  ')
        result.current.setRoleId(1)
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        role_id: 1,
      })
    })

    it('should reset form and call onClose after successful submit', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('test@example.com')
        result.current.setRoleId(1)
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.email).toBe('')
      expect(result.current.roleId).toBe('')
      expect(result.current.errors).toEqual({})
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should not reset form or call onClose when submit fails', async () => {
      const onSubmitFailing = jest.fn().mockResolvedValue(false)
      const { result } = renderHook(() =>
        useCreateInvitation({ ...defaultProps, onSubmit: onSubmitFailing })
      )

      act(() => {
        result.current.setEmail('test@example.com')
        result.current.setRoleId(1)
      })

      await act(async () => {
        const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(result.current.email).toBe('test@example.com')
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('should prevent default form submission', async () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))
      const mockPreventDefault = jest.fn()

      act(() => {
        result.current.setEmail('test@example.com')
        result.current.setRoleId(1)
      })

      await act(async () => {
        const mockEvent = { preventDefault: mockPreventDefault } as unknown as React.FormEvent
        await result.current.handleSubmit(mockEvent)
      })

      expect(mockPreventDefault).toHaveBeenCalled()
    })
  })

  describe('handleClose', () => {
    it('should reset form and call onClose when not loading', () => {
      const { result } = renderHook(() => useCreateInvitation(defaultProps))

      act(() => {
        result.current.setEmail('test@example.com')
        result.current.setRoleId(1)
      })

      act(() => {
        result.current.handleClose()
      })

      expect(result.current.email).toBe('')
      expect(result.current.roleId).toBe('')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should not close when loading', () => {
      const { result } = renderHook(() =>
        useCreateInvitation({ ...defaultProps, isLoading: true })
      )

      act(() => {
        result.current.setEmail('test@example.com')
      })

      act(() => {
        result.current.handleClose()
      })

      // Should not reset because loading
      expect(result.current.email).toBe('test@example.com')
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })
})
