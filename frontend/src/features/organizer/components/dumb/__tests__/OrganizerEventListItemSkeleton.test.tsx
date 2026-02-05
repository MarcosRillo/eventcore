/**
 * Tests for OrganizerEventListItemSkeleton
 */

import { render } from '@testing-library/react'

import {
  OrganizerEventListItemSkeleton,
  OrganizerEventListItemSkeletons,
} from '@/features/organizer/components/dumb/OrganizerEventListItemSkeleton'

describe('OrganizerEventListItemSkeleton', () => {
  describe('rendering', () => {
    test('should render skeleton with pulse animation', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(0)
    })

    test('should render status badge skeleton', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      // Badge skeleton is rounded-full
      const badgeSkeleton = container.querySelector('.rounded-full')
      expect(badgeSkeleton).toBeInTheDocument()
    })

    test('should render title skeletons', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      // Title has two lines
      const roundedSkeletons = container.querySelectorAll('.rounded')
      expect(roundedSkeletons.length).toBeGreaterThan(2)
    })

    test('should render metadata skeletons', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      // Multiple width classes for metadata items
      const w28 = container.querySelector('.w-28')
      const w32 = container.querySelector('.w-32')
      const w24 = container.querySelector('.w-24')

      expect(w28).toBeInTheDocument()
      expect(w32).toBeInTheDocument()
      expect(w24).toBeInTheDocument()
    })

    test('should render action button skeletons', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      // Action buttons have specific widths
      const w14 = container.querySelector('.w-14')
      const w16 = container.querySelector('.w-16')

      expect(w14).toBeInTheDocument()
      expect(w16).toBeInTheDocument()
    })

    test('should apply custom className', () => {
      const { container } = render(<OrganizerEventListItemSkeleton className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('structure', () => {
    test('should use Card component as wrapper', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      // Card has rounded-lg class
      expect(container.firstChild).toHaveClass('rounded-lg')
    })

    test('should have border separator for actions', () => {
      const { container } = render(<OrganizerEventListItemSkeleton />)

      const borderElement = container.querySelector('.border-t')
      expect(borderElement).toBeInTheDocument()
    })
  })
})

describe('OrganizerEventListItemSkeletons', () => {
  test('should render default 3 skeletons', () => {
    const { container } = render(<OrganizerEventListItemSkeletons />)

    // Count Card wrappers (have both rounded-lg and flex gap-3)
    const skeletons = container.querySelectorAll('.rounded-lg.flex.gap-3')
    expect(skeletons.length).toBe(3)
  })

  test('should render specified number of skeletons', () => {
    const { container } = render(<OrganizerEventListItemSkeletons count={5} />)

    const skeletons = container.querySelectorAll('.rounded-lg.flex.gap-3')
    expect(skeletons.length).toBe(5)
  })

  test('should render 1 skeleton when count is 1', () => {
    const { container } = render(<OrganizerEventListItemSkeletons count={1} />)

    const skeletons = container.querySelectorAll('.rounded-lg.flex.gap-3')
    expect(skeletons.length).toBe(1)
  })

  test('should render 0 skeletons when count is 0', () => {
    const { container } = render(<OrganizerEventListItemSkeletons count={0} />)

    const skeletons = container.querySelectorAll('.rounded-lg.flex.gap-3')
    expect(skeletons.length).toBe(0)
  })

  test('should assign unique keys to skeletons', () => {
    // This test verifies no React key warnings - if keys are wrong, React would warn
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(<OrganizerEventListItemSkeletons count={5} />)

    // Check no key-related warnings
    const keyWarnings = consoleSpy.mock.calls.filter(
      call => call[0]?.includes?.('key')
    )
    expect(keyWarnings.length).toBe(0)

    consoleSpy.mockRestore()
  })
})
