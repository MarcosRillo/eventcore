import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Event } from '@/types/event.types'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid="whatsapp-icon" />,
  Facebook: () => <div data-testid="facebook-icon" />,
  Twitter: () => <div data-testid="twitter-icon" />,
  Link2: () => <div data-testid="link-icon" />,
}))

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
    start_date: '2025-12-15',
    end_date: '2025-12-15',
    start_time: '20:00',
    end_time: '23:00',
    status: 'published',
    event_type: 'music',
    category_id: 1,
    organizer_id: 1,
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

    it('should render with correct button titles', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByTitle('Compartir en WhatsApp')).toBeInTheDocument()
      expect(screen.getByTitle('Compartir en Facebook')).toBeInTheDocument()
      expect(screen.getByTitle('Compartir en Twitter')).toBeInTheDocument()
      expect(screen.getByTitle('Copiar enlace')).toBeInTheDocument()
    })

    it('should render all icons', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument()
      expect(screen.getByTestId('facebook-icon')).toBeInTheDocument()
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument()
      expect(screen.getByTestId('link-icon')).toBeInTheDocument()
    })

    it('should have correct styling classes', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByTitle('Compartir en WhatsApp')
      expect(whatsappButton).toHaveClass('bg-green-600', 'text-white')

      const facebookButton = screen.getByTitle('Compartir en Facebook')
      expect(facebookButton).toHaveClass('bg-blue-600', 'text-white')

      const twitterButton = screen.getByTitle('Compartir en Twitter')
      expect(twitterButton).toHaveClass('bg-sky-500', 'text-white')
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
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(getExpectedUrl(123))
      })
    })

    it('should show "Copiado" text after copying', async () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copiado')).toBeInTheDocument()
      })
    })

    it('should change button styling when copied', async () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      await waitFor(() => {
        const copiedButton = screen.getByTitle('Enlace copiado')
        expect(copiedButton).toHaveClass('bg-green-100', 'text-green-800')
      })
    })

    it('should reset to "Copiar" after 2 seconds', async () => {
      jest.useFakeTimers()

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copiado')).toBeInTheDocument()
      })

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000)

      await waitFor(() => {
        expect(screen.getByText('Copiar')).toBeInTheDocument()
        expect(screen.queryByText('Copiado')).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })

    it('should handle clipboard error gracefully', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'))

      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      // Should not crash or show error
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled()
      })

      // Should still show "Copiar" (not "Copiado")
      expect(screen.getByText('Copiar')).toBeInTheDocument()
    })
  })

  describe('Event URL Generation', () => {
    it('should generate correct event URL', () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/evento/123')
      )
    })

    it('should use window.location.origin', () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining(window.location.origin)
      )
    })

    it('should handle different event IDs', () => {
      const differentEvent = { ...mockEvent, id: 456 }

      render(<ShareButtons event={differentEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith(getExpectedUrl(456))
    })
  })

  describe('Edge Cases', () => {
    it('should handle event with no description', () => {
      const eventNoDescription = { ...mockEvent, description: undefined }

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
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)
      fireEvent.click(copyButton)
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(3)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have title attributes on all buttons', () => {
      render(<ShareButtons event={mockEvent} />)

      expect(screen.getByTitle('Compartir en WhatsApp')).toBeInTheDocument()
      expect(screen.getByTitle('Compartir en Facebook')).toBeInTheDocument()
      expect(screen.getByTitle('Compartir en Twitter')).toBeInTheDocument()
      expect(screen.getByTitle('Copiar enlace')).toBeInTheDocument()
    })

    it('should update copy button title when copied', async () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByTitle('Enlace copiado')).toBeInTheDocument()
      })
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

      const copyButton = screen.getByTitle('Copiar enlace')
      expect(copyButton).toHaveClass('bg-gray-200', 'text-gray-700')
    })

    it('should have success styling when copied', async () => {
      render(<ShareButtons event={mockEvent} />)

      const copyButton = screen.getByText('Copiar')
      fireEvent.click(copyButton)

      await waitFor(() => {
        const copiedButton = screen.getByTitle('Enlace copiado')
        expect(copiedButton).toHaveClass('bg-green-100', 'text-green-800')
        expect(copiedButton).not.toHaveClass('bg-gray-200')
      })
    })

    it('should have hover styles', () => {
      render(<ShareButtons event={mockEvent} />)

      const whatsappButton = screen.getByTitle('Compartir en WhatsApp')
      expect(whatsappButton).toHaveClass('hover:bg-green-700')

      const facebookButton = screen.getByTitle('Compartir en Facebook')
      expect(facebookButton).toHaveClass('hover:bg-blue-700')

      const twitterButton = screen.getByTitle('Compartir en Twitter')
      expect(twitterButton).toHaveClass('hover:bg-sky-600')
    })
  })
})
