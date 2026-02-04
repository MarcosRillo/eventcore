/**
 * Tests for Card Component
 *
 * Tests rendering variants, semantic HTML, and interactive states.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import Card from '@/shared/components/display/Card'

describe('Card', () => {
  describe('rendering', () => {
    test('should render children', () => {
      render(<Card>Card content</Card>)

      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    test('should render as div by default', () => {
      const { container } = render(<Card>Content</Card>)

      expect(container.querySelector('div')).toBeInTheDocument()
    })

    test('should render as article when specified', () => {
      render(<Card as="article">Content</Card>)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    test('should render as section when specified', () => {
      const { container } = render(<Card as="section">Content</Card>)

      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    test('should apply default variant classes', () => {
      const { container } = render(<Card variant="default">Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('border-neutral-200')
    })

    test('should apply bordered variant classes', () => {
      const { container } = render(<Card variant="bordered">Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('border-neutral-300')
    })

    test('should apply elevated variant classes', () => {
      const { container } = render(<Card variant="elevated">Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('shadow-sm')
    })

    test('should apply flat variant classes', () => {
      const { container } = render(<Card variant="flat">Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('bg-neutral-50')
    })
  })

  describe('padding', () => {
    test('should apply no padding when padding is none', () => {
      const { container } = render(<Card padding="none">Content</Card>)

      const card = container.firstChild
      expect(card).not.toHaveClass('p-3')
      expect(card).not.toHaveClass('p-4')
      expect(card).not.toHaveClass('p-6')
      expect(card).not.toHaveClass('p-8')
    })

    test('should apply sm padding classes', () => {
      const { container } = render(<Card padding="sm">Content</Card>)

      expect(container.firstChild).toHaveClass('p-3')
    })

    test('should apply md padding classes by default', () => {
      const { container } = render(<Card>Content</Card>)

      expect(container.firstChild).toHaveClass('p-4')
    })

    test('should apply lg padding classes', () => {
      const { container } = render(<Card padding="lg">Content</Card>)

      expect(container.firstChild).toHaveClass('p-6')
    })

    test('should apply xl padding classes', () => {
      const { container } = render(<Card padding="xl">Content</Card>)

      expect(container.firstChild).toHaveClass('p-8')
    })
  })

  describe('hover state', () => {
    test('should apply hover classes when hover prop is true', () => {
      const { container } = render(<Card hover>Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('hover:shadow-md')
      expect(card).toHaveClass('hover:border-neutral-300')
    })

    test('should not apply hover classes by default', () => {
      const { container } = render(<Card>Content</Card>)

      const card = container.firstChild
      expect(card).not.toHaveClass('hover:shadow-md')
    })
  })

  describe('semantic button for onClick', () => {
    test('should render as button element when onClick is provided', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    test('should have type="button" by default when onClick is provided', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    test('should call onClick when button is clicked', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      fireEvent.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should apply cursor-pointer class when onClick is provided', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      expect(screen.getByRole('button')).toHaveClass('cursor-pointer')
    })

    test('should apply hover classes when onClick is provided', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:shadow-md')
    })

    test('should apply focus-visible ring classes when onClick is provided', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-2')
    })

    test('should have w-full and text-left classes for button', () => {
      const handleClick = jest.fn()
      render(<Card onClick={handleClick}>Clickable content</Card>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
      expect(button).toHaveClass('text-left')
    })

    test('should not render as button when onClick is not provided', () => {
      render(<Card>Non-clickable content</Card>)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('transition', () => {
    test('should use explicit transition properties instead of transition-all', () => {
      const { container } = render(<Card>Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('transition-[border-color,box-shadow]')
      expect(card).not.toHaveClass('transition-all')
    })
  })

  describe('custom className', () => {
    test('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>)

      expect(container.firstChild).toHaveClass('custom-class')
    })

    test('should merge custom className with default classes', () => {
      const { container } = render(<Card className="custom-class">Content</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('rounded-lg')
    })
  })
})
