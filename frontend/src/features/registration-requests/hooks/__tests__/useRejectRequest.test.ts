import { renderHook, act } from '@testing-library/react'
import { useRejectRequest } from '../useRejectRequest'

describe('useRejectRequest', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty reason', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      expect(result.current.reason).toBe('')
      expect(result.current.error).toBeNull()
      expect(result.current.isValid).toBe(false)
    })

    it('should expose minLength and maxLength constants', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      expect(result.current.minLength).toBe(10)
      expect(result.current.maxLength).toBe(500)
    })

    it('should reset state when modal closes', () => {
      const { result, rerender } = renderHook(
        (props) => useRejectRequest(props),
        { initialProps: defaultProps }
      )

      // Set some reason
      act(() => {
        result.current.handleReasonChange({
          target: { value: 'Some reason text here' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.reason).toBe('Some reason text here')

      // Close modal
      rerender({ ...defaultProps, isOpen: false })

      expect(result.current.reason).toBe('')
      expect(result.current.error).toBeNull()
    })
  })

  describe('handleReasonChange', () => {
    it('should update reason when called', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: 'Test reason' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.reason).toBe('Test reason')
    })

    it('should clear error when reason becomes valid after error was shown', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      // First try to confirm with empty reason to trigger error
      act(() => {
        result.current.handleConfirm()
      })

      expect(result.current.error).toBe('El motivo es obligatorio')

      // Now type valid reason
      act(() => {
        result.current.handleReasonChange({
          target: { value: 'Valid reason text here' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('validation', () => {
    it('should set error when reason is empty on confirm', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleConfirm()
      })

      expect(result.current.error).toBe('El motivo es obligatorio')
      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })

    it('should set error when reason is only whitespace', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: '   ' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      act(() => {
        result.current.handleConfirm()
      })

      expect(result.current.error).toBe('El motivo es obligatorio')
    })

    it('should set error when reason is less than 10 characters', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: 'Short' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      act(() => {
        result.current.handleConfirm()
      })

      expect(result.current.error).toBe('El motivo debe tener al menos 10 caracteres')
    })

    it('should set error when reason exceeds 500 characters', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: 'a'.repeat(501) },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      act(() => {
        result.current.handleConfirm()
      })

      expect(result.current.error).toBe('El motivo no puede superar 500 caracteres')
    })

    it('should be valid when reason has exactly 10 characters', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: '1234567890' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.isValid).toBe(true)
    })

    it('should be valid when reason has exactly 500 characters', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: 'a'.repeat(500) },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.isValid).toBe(true)
    })
  })

  describe('handleConfirm', () => {
    it('should call onConfirm with trimmed reason when valid', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: '  Valid reason text here  ' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      act(() => {
        result.current.handleConfirm()
      })

      expect(defaultProps.onConfirm).toHaveBeenCalledWith('Valid reason text here')
    })

    it('should not call onConfirm when validation fails', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: 'Short' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      act(() => {
        result.current.handleConfirm()
      })

      expect(defaultProps.onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('handleClose', () => {
    it('should call onClose', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleClose()
      })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('isValid computed property', () => {
    it('should be false when reason is empty', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      expect(result.current.isValid).toBe(false)
    })

    it('should be false when reason is less than minLength after trimming', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: '  short  ' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.isValid).toBe(false)
    })

    it('should be true when reason meets minimum length', () => {
      const { result } = renderHook(() => useRejectRequest(defaultProps))

      act(() => {
        result.current.handleReasonChange({
          target: { value: 'Valid reason text' },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      })

      expect(result.current.isValid).toBe(true)
    })
  })
})
