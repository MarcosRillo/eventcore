import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Event } from '@/types/event.types'

import ShareButtons from '../ShareButtons'

// Helper to get expected URL (works with Jest's default localhost)
const getExpectedUrl = (eventId: number) => `${window.location.origin}/calendar/evento/${eventId}`

// Mock window.open
const mockWindowOpen = jest.fn()
global.window.open = mockWindowOpen

// Mock navigator.clipboard
const mockWriteText = jest.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

describe('ShareButtons', () => {
  const mockEvent: Event = {
    id: 123,
    title: 'Concierto de Jazz',
    description: 'Un increíble concierto de jazz con artistas internacionales. Disfruta de una noche mágica con la mejor música en vivo.',
    type: 'sede_unica',
    start_date: '2025-12-15T20:00:00',
    end_date: '2025-12-15T23:00:00',
    status: 'published',
    category_id: 1,
    category: { id: 1, name: 'Music', slug: 'music', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    locations: [],
    location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
    is_featured: false,
    approval_history: [],
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)
  })

  describe('Rendering', () => {
    it('should render all share buttons', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
      expect(screen.getByText('Facebook')).toBeInTheDocument()
      expect(screen.getByText('Twitter')).toBeInTheDocument()
      expect(screen.getByText('Copiar')).toBeInTheDocument()
    })

    it('should render with correct aria-labels', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByLabelText('Compartir en WhatsApp')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartir en Facebook')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartir en Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('Copiar enlace')).toBeInTheDocument()
    })

    it('should render SVG icons with aria-hidden', () => {
      render(<ShareButtons event={mockEvent} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const svg = button.querySelector('svg')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should have correct styling classes', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByLabelText('Compartir en WhatsApp')
      expect(whatsappButton).toHaveClass('bg-success-600', 'text-white')

      const facebookButton = screen.getByLabelText('Compartir en Facebook')
      expect(facebookButton).toHaveClass('bg-primary-600', 'text-white')

      const twitterButton = screen.getByLabelText('Compartir en Twitter')
      expect(twitterButton).toHaveClass('bg-neutral-800', 'text-white')
    })

    it('should have role group container with aria-label', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByRole('group', { name: 'Compartir evento' })).toBeInTheDocument()
    })
  })

  describe('WhatsApp Share', () => {
    it('should open WhatsApp share when button clicked', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByText('WhatsApp')
      fireEvent.click(whatsappButton)

      expect(mockWindowOpen).toHaveBeenCalledTimes(1)
      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain('wa.me')
      expect(calledUrl).toContain(encodeURIComponent('Concierto de Jazz'))
      expect(calledUrl).toContain(encodeURIComponent(getExpectedUrl(123)))
    })

    it('should format WhatsApp message correctly', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByText('WhatsApp')
      fireEvent.click(whatsappButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain('text=')
      expect(calledUrl).toContain('%0A%0A') // newlines
    })
  })

  describe('Facebook Share', () => {
    it('should open Facebook share when button clicked', () => {
      render(<ShareButtons event={mockEvent} />)

      const facebookButton = screen.getByText('Facebook')
      fireEvent.click(facebookButton)

      expect(mockWindowOpen).toHaveBeenCalledTimes(1)
      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain('facebook.com/sharer')
      expect(calledUrl).toContain(encodeURIComponent(getExpectedUrl(123)))
    })

    it('should open in new tab', () => {
      render(<ShareButtons event={mockEvent} />)

      const facebookButton = screen.getByText('Facebook')
      fireEvent.click(facebookButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(expect.any(String), '_blank')
    })
  })

  describe('Twitter Share', () => {
    it('should open Twitter share when button clicked', () => {
      render(<ShareButtons event={mockEvent} />)

      const twitterButton = screen.getByText('Twitter')
      fireEvent.click(twitterButton)

      expect(mockWindowOpen).toHaveBeenCalledTimes(1)
      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain('twitter.com/intent/tweet')
      expect(calledUrl).toContain('text=')
      expect(calledUrl).toContain('url=')
    })

    it('should truncate description to 100 characters', () => {
      render(<ShareButtons event={mockEvent} />)

      const twitterButton = screen.getByText('Twitter')
      fireEvent.click(twitterButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0]
      // Description is 120+ chars, should be truncated to 100
      expect(calledUrl).toContain(encodeURIComponent('Un increíble concierto de jazz con artistas internacionales. Disfruta de una noche mágica con la mej...'))
    })

    it('should include event URL', () => {
      render(<ShareButtons event={mockEvent} />)

      const twitterButton = screen.getByText('Twitter')
      fireEvent.click(twitterButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain(encodeURIComponent(getExpectedUrl(123)))
    })
  })

  describe('Copy Link', () => {
    it('should copy link to clipboard when button clicked', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(getExpectedUrl(123))
      })

      // Clean up timer
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should show "Copiado" text after copying', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Copiado')).toBeInTheDocument()
      })

      // Clean up timer
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should change button styling when copied', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        const copiedButton = screen.getByLabelText('Enlace copiado')
        expect(copiedButton).toHaveClass('bg-success-50', 'text-success-700')
      })

      // Clean up timer
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should reset to "Copiar" after 2 seconds', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Copiado')).toBeInTheDocument()
      })

      // Fast-forward 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText('Copiar')).toBeInTheDocument()
        expect(screen.queryByText('Copiado')).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })

    it('should handle clipboard error gracefully', async () => {
      jest.useFakeTimers()
      mockWriteText.mockRejectedValue(new Error('Clipboard error'))

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      // Should not crash or show error
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled()
      })

      // Should still show "Copiar" (not "Copiado")
      expect(screen.getByText('Copiar')).toBeInTheDocument()

      jest.useRealTimers()
    })
  })

  describe('Event URL Generation', () => {
    it('should generate correct event URL', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining('/calendar/evento/123')
        )
      })

      // Clean up timer
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should use window.location.origin', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining(window.location.origin)
        )
      })

      // Clean up timer
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should handle different event IDs', async () => {
      jest.useFakeTimers()

      const differentEvent = { ...mockEvent, id: 456 }

      render(<ShareButtons event={differentEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(getExpectedUrl(456))
      })

      // Clean up timer
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })
  })

  describe('Edge Cases', () => {
    it('should handle event with no description', () => {
      // Type assertion needed for edge case testing
      const eventNoDescription = { ...mockEvent, description: undefined } as unknown as Event

      render(<ShareButtons event={eventNoDescription} />)

      const twitterButton = screen.getByText('Twitter')
      fireEvent.click(twitterButton)

      // Should not crash
      expect(mockWindowOpen).toHaveBeenCalled()
    })

    it('should handle event with short description', () => {
      const eventShortDescription = { ...mockEvent, description: 'Short' }

      render(<ShareButtons event={eventShortDescription} />)

      const twitterButton = screen.getByText('Twitter')
      fireEvent.click(twitterButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain(encodeURIComponent('Short'))
    })

    it('should handle event with special characters in title', () => {
      const specialEvent = { ...mockEvent, title: 'Event & "Special" <chars>' }

      render(<ShareButtons event={specialEvent} />)

      const whatsappButton = screen.getByText('WhatsApp')
      fireEvent.click(whatsappButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0]
      expect(calledUrl).toContain(encodeURIComponent('Event & "Special" <chars>'))
    })

    it('should handle multiple rapid clicks on copy button', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
        fireEvent.click(copyButton)
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(3)
      })

      // Clean up timers
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label attributes on all buttons', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByLabelText('Compartir en WhatsApp')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartir en Facebook')).toBeInTheDocument()
      expect(screen.getByLabelText('Compartir en Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('Copiar enlace')).toBeInTheDocument()
    })

    it('should update copy button aria-label when copied', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('Enlace copiado')).toBeInTheDocument()
      })

      // Clean up timers
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should have proper button elements', () => {
      render(<ShareButtons event={mockEvent} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    it('should have visible text labels', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByText('WhatsApp')).toBeVisible()
      expect(screen.getByText('Facebook')).toBeVisible()
      expect(screen.getByText('Twitter')).toBeVisible()
      expect(screen.getByText('Copiar')).toBeVisible()
    })
  })

  describe('Visual States', () => {
    it('should have default styling for copy button', () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByLabelText('Copiar enlace')
      expect(copyButton).toHaveClass('bg-neutral-100', 'text-neutral-700')
    })

    it('should have success styling when copied', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')

      await act(async () => {
        fireEvent.click(copyButton)
      })

      await waitFor(() => {
        const copiedButton = screen.getByLabelText('Enlace copiado')
        expect(copiedButton).toHaveClass('bg-success-50', 'text-success-700')
        expect(copiedButton).not.toHaveClass('bg-neutral-100')
      })

      // Clean up timers
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should have hover styles', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByLabelText('Compartir en WhatsApp')
      expect(whatsappButton).toHaveClass('hover:bg-success-700')

      const facebookButton = screen.getByLabelText('Compartir en Facebook')
      expect(facebookButton).toHaveClass('hover:bg-primary-700')

      const twitterButton = screen.getByLabelText('Compartir en Twitter')
      expect(twitterButton).toHaveClass('hover:bg-neutral-900')
    })
  })
})
