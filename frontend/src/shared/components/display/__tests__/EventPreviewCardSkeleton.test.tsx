/**
 * Tests for EventPreviewCardSkeleton
 */

import { render } from '@testing-library/react'

import {
  EventPreviewCardSkeleton,
  EventPreviewCardSkeletons,
} from '@/shared/components/display/EventPreviewCardSkeleton'

describe('EventPreviewCardSkeleton', () => {
  describe('rendering', () => {
    test('should render skeleton with pulse animations', () => {
      const { container } = render(<EventPreviewCardSkeleton />)

      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(0)
    })

    test('should render image placeholder area', () => {
      const { container } = render(<EventPreviewCardSkeleton />)

      const aspectVideo = container.querySelector('.aspect-video')
      expect(aspectVideo).toBeInTheDocument()
    })

    test('should render event type badge skeleton', () => {
      const { container } = render(<EventPreviewCardSkeleton />)

      const badgeSkeleton = container.querySelector('.rounded-full')
      expect(badgeSkeleton).toBeInTheDocument()
    })

    test('should render action button skeletons', () => {
      const { container } = render(<EventPreviewCardSkeleton />)

      const borderT = container.querySelector('.border-t')
      expect(borderT).toBeInTheDocument()
    })
  })

  describe('structure', () => {
    test('should use Card component as wrapper', () => {
      const { container } = render(<EventPreviewCardSkeleton />)

      expect(container.firstChild).toHaveClass('rounded-lg')
    })

    test('should have vertical flex layout', () => {
      const { container } = render(<EventPreviewCardSkeleton />)

      expect(container.firstChild).toHaveClass('flex')
      expect(container.firstChild).toHaveClass('flex-col')
    })
  })
})

describe('EventPreviewCardSkeletons', () => {
  test('should render default 6 skeletons', () => {
    const { container } = render(<EventPreviewCardSkeletons />)

    const skeletons = container.querySelectorAll('.rounded-lg.flex.flex-col')
    expect(skeletons.length).toBe(6)
  })

  test('should render specified number of skeletons', () => {
    const { container } = render(<EventPreviewCardSkeletons count={3} />)

    const skeletons = container.querySelectorAll('.rounded-lg.flex.flex-col')
    expect(skeletons.length).toBe(3)
  })

  test('should render 0 skeletons when count is 0', () => {
    const { container } = render(<EventPreviewCardSkeletons count={0} />)

    const skeletons = container.querySelectorAll('.rounded-lg.flex.flex-col')
    expect(skeletons.length).toBe(0)
  })

  test('should assign unique keys to skeletons', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<EventPreviewCardSkeletons count={5} />)

    const keyWarnings = consoleSpy.mock.calls.filter(
      call => call[0]?.includes?.('key')
    )
    expect(keyWarnings.length).toBe(0)

    consoleSpy.mockRestore()
  })
})
