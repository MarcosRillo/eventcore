import { act,renderHook } from '@testing-library/react'

import { useDebounce } from '@/shared/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))

    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Value should still be initial
    expect(result.current).toBe('initial')

    // Change the value
    rerender({ value: 'changed', delay: 500 })

    // Value should still be initial (not enough time passed)
    expect(result.current).toBe('initial')

    // Advance time by 500ms
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now it should be updated
    expect(result.current).toBe('changed')
  })

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Rapid changes
    rerender({ value: 'change1', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(200)
    })

    rerender({ value: 'change2', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(200)
    })

    rerender({ value: 'change3', delay: 500 })

    // Value should still be initial
    expect(result.current).toBe('initial')

    // Advance to complete the debounce from last change
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Should have the last value
    expect(result.current).toBe('change3')
  })

  it('should work with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'changed', delay: 1000 })

    // Advance 500ms - not enough
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')

    // Advance another 500ms - should be enough now
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('changed')
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'changed', delay: 0 })

    act(() => {
      jest.advanceTimersByTime(0)
    })

    expect(result.current).toBe('changed')
  })

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 500 } }
    )

    rerender({ value: 42, delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe(42)
  })

  it('should work with objects', () => {
    const initialObj = { name: 'test' }
    const newObj = { name: 'updated' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 500 } }
    )

    rerender({ value: newObj, delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toEqual(newObj)
  })

  it('should work with arrays', () => {
    const initialArr = [1, 2, 3]
    const newArr = [4, 5, 6]

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialArr, delay: 500 } }
    )

    rerender({ value: newArr, delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toEqual(newArr)
  })

  it('should work with boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 500 } }
    )

    rerender({ value: true, delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    )

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('should handle null values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null as string | null, delay: 500 } }
    )

    rerender({ value: 'not null', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('not null')
  })

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: undefined as string | undefined, delay: 500 } }
    )

    rerender({ value: 'defined', delay: 500 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('defined')
  })
})
