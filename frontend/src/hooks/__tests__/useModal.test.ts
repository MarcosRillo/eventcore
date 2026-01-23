import { act,renderHook } from '@testing-library/react'

import { useModal, useModalWithData,useMultiModal } from '@/hooks/useModal'
import { ModalId } from '@/types/modal.types'

describe('useModal', () => {
  it('should initialize with default closed state', () => {
    const { result } = renderHook(() => useModal())
    
    expect(result.current.isOpen).toBe(false)
  })

  it('should initialize with custom initial state', () => {
    const { result } = renderHook(() => useModal(true))
    
    expect(result.current.isOpen).toBe(true)
  })

  it('should open modal', () => {
    const { result } = renderHook(() => useModal())
    
    act(() => {
      result.current.openModal()
    })
    
    expect(result.current.isOpen).toBe(true)
  })

  it('should close modal', () => {
    const { result } = renderHook(() => useModal(true))
    
    act(() => {
      result.current.closeModal()
    })
    
    expect(result.current.isOpen).toBe(false)
  })

  it('should toggle modal state', () => {
    const { result } = renderHook(() => useModal())
    
    act(() => {
      result.current.toggleModal()
    })
    expect(result.current.isOpen).toBe(true)
    
    act(() => {
      result.current.toggleModal()
    })
    expect(result.current.isOpen).toBe(false)
  })
})

describe('useMultiModal', () => {
  it('should initialize with no modals open', () => {
    const { result } = renderHook(() => useMultiModal())
    
    expect(result.current.isOpen(ModalId.CREATE_EVENT)).toBe(false)
    expect(result.current.getOpenModals()).toEqual([])
  })

  it('should open specific modal', () => {
    const { result } = renderHook(() => useMultiModal())
    
    act(() => {
      result.current.openModal(ModalId.CREATE_EVENT)
    })
    
    expect(result.current.isOpen(ModalId.CREATE_EVENT)).toBe(true)
    expect(result.current.isOpen(ModalId.EDIT_EVENT)).toBe(false)
  })

  it('should close specific modal', () => {
    const { result } = renderHook(() => useMultiModal())
    
    act(() => {
      result.current.openModal(ModalId.CREATE_EVENT)
      result.current.openModal(ModalId.EDIT_EVENT)
    })
    
    act(() => {
      result.current.closeModal(ModalId.CREATE_EVENT)
    })
    
    expect(result.current.isOpen(ModalId.CREATE_EVENT)).toBe(false)
    expect(result.current.isOpen(ModalId.EDIT_EVENT)).toBe(true)
  })

  it('should toggle specific modal', () => {
    const { result } = renderHook(() => useMultiModal())
    
    act(() => {
      result.current.toggleModal(ModalId.DELETE_EVENT)
    })
    expect(result.current.isOpen(ModalId.DELETE_EVENT)).toBe(true)
    
    act(() => {
      result.current.toggleModal(ModalId.DELETE_EVENT)
    })
    expect(result.current.isOpen(ModalId.DELETE_EVENT)).toBe(false)
  })

  it('should close all modals', () => {
    const { result } = renderHook(() => useMultiModal())
    
    act(() => {
      result.current.openModal(ModalId.CREATE_EVENT)
      result.current.openModal(ModalId.EDIT_EVENT)
      result.current.openModal(ModalId.DELETE_EVENT)
    })
    
    expect(result.current.getOpenModals()).toHaveLength(3)
    
    act(() => {
      result.current.closeAllModals()
    })
    
    expect(result.current.getOpenModals()).toEqual([])
  })

  it('should get list of open modals', () => {
    const { result } = renderHook(() => useMultiModal())
    
    act(() => {
      result.current.openModal(ModalId.APPROVE_EVENT)
      result.current.openModal(ModalId.REJECT_EVENT)
    })
    
    const openModals = result.current.getOpenModals()
    expect(openModals).toContain(ModalId.APPROVE_EVENT)
    expect(openModals).toContain(ModalId.REJECT_EVENT)
    expect(openModals).not.toContain(ModalId.CREATE_EVENT)
  })
})

describe('useModalWithData', () => {
  interface TestData {
    id: number
    name: string
  }

  it('should initialize with closed state and no data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>())
    
    expect(result.current.isOpen).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('should open modal without data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>())
    
    act(() => {
      result.current.openModal()
    })
    
    expect(result.current.isOpen).toBe(true)
    expect(result.current.data).toBeNull()
  })

  it('should open modal with data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>())
    const testData: TestData = { id: 1, name: 'Test' }
    
    act(() => {
      result.current.openModal(testData)
    })
    
    expect(result.current.isOpen).toBe(true)
    expect(result.current.data).toEqual(testData)
  })

  it('should close modal and clear data', () => {
    const { result } = renderHook(() => useModalWithData<TestData>())
    const testData: TestData = { id: 1, name: 'Test' }
    
    act(() => {
      result.current.openModal(testData)
    })
    
    act(() => {
      result.current.closeModal()
    })
    
    expect(result.current.isOpen).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('should update data while modal is open', () => {
    const { result } = renderHook(() => useModalWithData<TestData>())
    const initialData: TestData = { id: 1, name: 'Initial' }
    const updatedData: TestData = { id: 2, name: 'Updated' }
    
    act(() => {
      result.current.openModal(initialData)
    })
    
    act(() => {
      result.current.updateData(updatedData)
    })
    
    expect(result.current.isOpen).toBe(true)
    expect(result.current.data).toEqual(updatedData)
  })

  it('should handle complex data types', () => {
    interface ComplexData {
      user: { id: number; email: string }
      settings: { notifications: boolean }
    }
    
    const { result } = renderHook(() => useModalWithData<ComplexData>())
    const complexData: ComplexData = {
      user: { id: 1, email: 'test@example.com' },
      settings: { notifications: true }
    }
    
    act(() => {
      result.current.openModal(complexData)
    })
    
    expect(result.current.data).toEqual(complexData)
  })
})
