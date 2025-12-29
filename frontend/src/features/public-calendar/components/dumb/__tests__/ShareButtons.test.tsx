/**
 * Tests for ShareButtons Component
 *
 * Tests social media sharing functionality including URL generation,
 * window.open calls, clipboard copy, and accessibility attributes.
 */

import { render, screen, fireEvent, act } from '@testing-library/react'

import { ShareButtons } from '@/features/public-calendar/components/dumb/ShareButtons'

// Mock window.open
const mockOpen = jest.fn()
const originalOpen = window.open

// Mock navigator.clipboard
const mockWriteText = jest.fn().mockResolvedValue(undefined)

beforeAll(() => {
  window.open = mockOpen
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText
    }
  })
})

afterAll(() => {
  window.open = originalOpen
})

describe('ShareButtons', () => {
  const mockEvent = {
    title: 'Festival de Música',
    description: 'Gran festival con artistas nacionales'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockWriteText.mockClear()
  })

  describe('Rendering', () => {
    test('renders all four share buttons', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByRole('button', { name: /compartir en facebook/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /compartir en twitter/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /compartir en whatsapp/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copiar enlace/i })).toBeInTheDocument()
    })

    test('renders button labels correctly', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByText('Facebook')).toBeInTheDocument()
      expect(screen.getByText('Twitter')).toBeInTheDocument()
      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
      expect(screen.getByText('Copiar enlace')).toBeInTheDocument()
    })

    test('renders SVG icons for each platform', () => {
      const { container } = render(<ShareButtons event={mockEvent} />)

      const svgIcons = container.querySelectorAll('svg')
      expect(svgIcons).toHaveLength(4)
    })
  })

  describe('Facebook Share', () => {
    test('opens correct Facebook share URL', () => {
      render(<ShareButtons event={mockEvent} />)

      const facebookButton = screen.getByRole('button', { name: /compartir en facebook/i })
      fireEvent.click(facebookButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer/sharer.php'),
        '_blank',
        'width=600,height=400'
      )
    })

    test('Facebook URL includes encoded current page URL', () => {
      render(<ShareButtons event={mockEvent} />)

      fireEvent.click(screen.getByRole('button', { name: /compartir en facebook/i }))

      const calledUrl = mockOpen.mock.calls[0][0]
      // Verify URL parameter exists and is URL-encoded
      expect(calledUrl).toContain('u=')
      expect(calledUrl).toMatch(/u=http%3A%2F%2F/)
    })
  })

  describe('Twitter Share', () => {
    test('opens correct Twitter share URL', () => {
      render(<ShareButtons event={mockEvent} />)

      const twitterButton = screen.getByRole('button', { name: /compartir en twitter/i })
      fireEvent.click(twitterButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=600,height=400'
      )
    })

    test('Twitter URL includes event title and description', () => {
      render(<ShareButtons event={mockEvent} />)

      fireEvent.click(screen.getByRole('button', { name: /compartir en twitter/i }))

      const calledUrl = mockOpen.mock.calls[0][0]
      expect(calledUrl).toContain('text=')
      expect(calledUrl).toContain(encodeURIComponent('Festival de Música'))
    })

    test('Twitter URL includes event description when provided', () => {
      render(<ShareButtons event={mockEvent} />)

      fireEvent.click(screen.getByRole('button', { name: /compartir en twitter/i }))

      const calledUrl = mockOpen.mock.calls[0][0]
      expect(calledUrl).toContain(encodeURIComponent('Gran festival con artistas nacionales'))
    })
  })

  describe('WhatsApp Share', () => {
    test('opens correct WhatsApp share URL', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByRole('button', { name: /compartir en whatsapp/i })
      fireEvent.click(whatsappButton)

      expect(mockOpen).toHaveBeenCalledTimes(1)
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('api.whatsapp.com/send'),
        '_blank',
        'width=600,height=400'
      )
    })

    test('WhatsApp URL includes text parameter with event info and URL', () => {
      render(<ShareButtons event={mockEvent} />)

      fireEvent.click(screen.getByRole('button', { name: /compartir en whatsapp/i }))

      const calledUrl = mockOpen.mock.calls[0][0]
      expect(calledUrl).toContain('text=')
      // Verify URL-encoded event title is included
      expect(calledUrl).toContain(encodeURIComponent('Festival de Música'))
      // Verify a URL is appended (the current page URL)
      expect(calledUrl).toMatch(/http%3A%2F%2F/)
    })
  })

  describe('Copy Link', () => {
    test('copies current URL to clipboard when clicked', async () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByRole('button', { name: /copiar enlace/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(mockWriteText).toHaveBeenCalledTimes(1)
      expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('http'))
    })

    test('shows feedback text after copying', async () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByText('Copiar enlace')).toBeInTheDocument()

      const copyButton = screen.getByRole('button', { name: /copiar enlace/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(screen.getByText('¡Copiado!')).toBeInTheDocument()
    })

    test('reverts to original text after 2 seconds', async () => {
      jest.useFakeTimers()
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByRole('button', { name: /copiar enlace/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(screen.getByText('¡Copiado!')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(2000)
      })

      expect(screen.getByText('Copiar enlace')).toBeInTheDocument()
      jest.useRealTimers()
    })

    test('does not call window.open', async () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByRole('button', { name: /copiar enlace/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      // Copy link should not open a new window
      expect(mockOpen).not.toHaveBeenCalled()
    })
  })

  describe('Event Without Description', () => {
    test('handles event without description gracefully', () => {
      const eventWithoutDescription = { title: 'Simple Event' }
      render(<ShareButtons event={eventWithoutDescription} />)

      fireEvent.click(screen.getByRole('button', { name: /compartir en twitter/i }))

      expect(mockOpen).toHaveBeenCalledTimes(1)
      const calledUrl = mockOpen.mock.calls[0][0]
      expect(calledUrl).toContain(encodeURIComponent('Simple Event'))
    })

    test('Twitter text only includes title when no description', () => {
      const eventWithoutDescription = { title: 'Simple Event' }
      render(<ShareButtons event={eventWithoutDescription} />)

      fireEvent.click(screen.getByRole('button', { name: /compartir en twitter/i }))

      const calledUrl = mockOpen.mock.calls[0][0]
      // Should NOT contain the dash separator used when description exists
      expect(calledUrl).not.toContain(encodeURIComponent(' - '))
    })
  })

  describe('Accessibility', () => {
    test('all buttons have aria-labels', () => {
      render(<ShareButtons event={mockEvent} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)

      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    test('icon containers have aria-hidden attribute', () => {
      const { container } = render(<ShareButtons event={mockEvent} />)

      // Icons are wrapped in spans with aria-hidden by Button component
      const iconWrappers = container.querySelectorAll('span[aria-hidden="true"]')
      expect(iconWrappers.length).toBeGreaterThanOrEqual(4)
    })

    test('buttons have correct Spanish aria-labels', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByLabelText('Compartir en Facebook')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartir en Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartir en WhatsApp')).toBeInTheDocument()
      expect(screen.getByLabelText('Copiar enlace del evento')).toBeInTheDocument()
    })
  })

  describe('Window Open Parameters', () => {
    test('social share buttons open in new window with correct dimensions', () => {
      render(<ShareButtons event={mockEvent} />)

      // Click only the social share buttons (not copy link)
      fireEvent.click(screen.getByRole('button', { name: /compartir en facebook/i }))
      fireEvent.click(screen.getByRole('button', { name: /compartir en twitter/i }))
      fireEvent.click(screen.getByRole('button', { name: /compartir en whatsapp/i }))

      expect(mockOpen).toHaveBeenCalledTimes(3)

      mockOpen.mock.calls.forEach(call => {
        expect(call[1]).toBe('_blank')
        expect(call[2]).toBe('width=600,height=400')
      })
    })
  })

  describe('Styling', () => {
    test('buttons container has flex layout', () => {
      const { container } = render(<ShareButtons event={mockEvent} />)

      const buttonContainer = container.firstChild
      expect(buttonContainer).toHaveClass('flex')
      expect(buttonContainer).toHaveClass('flex-wrap')
      expect(buttonContainer).toHaveClass('gap-3')
    })

    test('WhatsApp button has distinct green styling', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByRole('button', { name: /compartir en whatsapp/i })
      expect(whatsappButton).toHaveClass('text-success-600')
      expect(whatsappButton).toHaveClass('border-success-200')
    })

    test('Copy link button has neutral styling', () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByRole('button', { name: /copiar enlace/i })
      expect(copyButton).toHaveClass('text-neutral-600')
      expect(copyButton).toHaveClass('border-neutral-200')
    })

    test('buttons use leftIcon prop for proper icon layout', () => {
      const { container } = render(<ShareButtons event={mockEvent} />)

      // Icons rendered via leftIcon prop are wrapped in spans with aria-hidden
      const iconWrappers = container.querySelectorAll('span[aria-hidden="true"]')
      expect(iconWrappers.length).toBeGreaterThanOrEqual(4)
    })
  })
})
