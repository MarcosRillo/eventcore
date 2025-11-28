/**
 * Tests for EventsFilterTabs Component
 *
 * Tests tab navigation, role-based visibility, counters, and loading states.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { EventsFilterTabs, DashboardTab } from '../EventsFilterTabs'
import { useAuth } from '@/context/AuthContext'

// Mock useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn()
}))

describe('EventsFilterTabs', () => {
  const mockOnTabChange = jest.fn()

  const defaultCounters: Record<DashboardTab, number> = {
    'requires-action': 5,
    'pending': 10,
    'published': 25,
    'historic': 100
  }

  const adminUser = {
    id: 1,
    name: 'Admin User',
    role: { role_code: 'entity_admin' }
  }

  const staffUser = {
    id: 2,
    name: 'Staff User',
    role: { role_code: 'entity_staff' }
  }

  const organizerUser = {
    id: 3,
    name: 'Organizer User',
    role: { role_code: 'organizer' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ user: adminUser })
  })

  describe('rendering for admin users', () => {
    test('should render all tabs for admin user', () => {
      render(
        <EventsFilterTabs
          activeTab="requires-action"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      expect(screen.getByText('Requiere mi Acción')).toBeInTheDocument()
      expect(screen.getByText('Pendientes')).toBeInTheDocument()
      expect(screen.getByText('Publicados')).toBeInTheDocument()
      expect(screen.getByText('Histórico')).toBeInTheDocument()
    })

    test('should render all tabs for staff user', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ user: staffUser })

      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      expect(screen.getByText('Requiere mi Acción')).toBeInTheDocument()
      expect(screen.getByText('Pendientes')).toBeInTheDocument()
      expect(screen.getByText('Publicados')).toBeInTheDocument()
      expect(screen.getByText('Histórico')).toBeInTheDocument()
    })
  })

  describe('rendering for non-admin users', () => {
    test('should hide admin-only tabs for organizer user', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ user: organizerUser })

      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      expect(screen.queryByText('Requiere mi Acción')).not.toBeInTheDocument()
      expect(screen.queryByText('Pendientes')).not.toBeInTheDocument()
      expect(screen.getByText('Publicados')).toBeInTheDocument()
      expect(screen.getByText('Histórico')).toBeInTheDocument()
    })

    test('should show only non-admin tabs when user has no role', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ user: { id: 1, name: 'User' } })

      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      expect(screen.queryByText('Requiere mi Acción')).not.toBeInTheDocument()
      expect(screen.queryByText('Pendientes')).not.toBeInTheDocument()
      expect(screen.getByText('Publicados')).toBeInTheDocument()
      expect(screen.getByText('Histórico')).toBeInTheDocument()
    })
  })

  describe('tab selection', () => {
    test('should highlight active tab', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const publishedButton = screen.getByRole('button', { name: /publicados/i })
      expect(publishedButton).toHaveAttribute('aria-current', 'page')
    })

    test('should not highlight inactive tabs', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const historicButton = screen.getByRole('button', { name: /histórico/i })
      expect(historicButton).not.toHaveAttribute('aria-current')
    })

    test('should call onTabChange when tab is clicked', () => {
      render(
        <EventsFilterTabs
          activeTab="requires-action"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const historicButton = screen.getByRole('button', { name: /histórico/i })
      fireEvent.click(historicButton)

      expect(mockOnTabChange).toHaveBeenCalledWith('historic')
    })

    test('should call onTabChange with correct tab key', () => {
      render(
        <EventsFilterTabs
          activeTab="historic"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pendientes/i })
      fireEvent.click(pendingButton)

      expect(mockOnTabChange).toHaveBeenCalledWith('pending')
    })
  })

  describe('counters', () => {
    test('should display counter for each tab', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    test('should display zero counter correctly', () => {
      const zeroCounters: Record<DashboardTab, number> = {
        'requires-action': 0,
        'pending': 0,
        'published': 0,
        'historic': 0
      }

      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={zeroCounters}
        />
      )

      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBe(4)
    })
  })

  describe('loading state', () => {
    test('should show loading spinner when isLoading is true', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
          isLoading={true}
        />
      )

      const spinners = document.querySelectorAll('.animate-spin')
      expect(spinners.length).toBeGreaterThan(0)
    })

    test('should not show counters when loading', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
          isLoading={true}
        />
      )

      // Counters should not be visible, spinners should be
      expect(screen.queryByText('25')).not.toBeInTheDocument()
    })

    test('should show counters when not loading', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
          isLoading={false}
        />
      )

      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  describe('mobile select', () => {
    test('should render mobile select element', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    test('should have correct value in mobile select', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('published')
    })

    test('should call onTabChange when mobile select changes', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'historic' } })

      expect(mockOnTabChange).toHaveBeenCalledWith('historic')
    })

    test('should show counter in mobile select options', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveTextContent('(5)')
      expect(options[1]).toHaveTextContent('(10)')
      expect(options[2]).toHaveTextContent('(25)')
      expect(options[3]).toHaveTextContent('(100)')
    })

    test('should have accessible label for mobile select', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      expect(screen.getByLabelText('Seleccionar pestaña')).toBeInTheDocument()
    })
  })

  describe('desktop navigation', () => {
    test('should have aria-label on navigation', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const nav = screen.getByRole('navigation', { name: 'Tabs' })
      expect(nav).toBeInTheDocument()
    })

    test('should have title attribute with description', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const publishedButton = screen.getByRole('button', { name: /publicados/i })
      expect(publishedButton).toHaveAttribute('title', 'Eventos aprobados y visibles al público')
    })
  })

  describe('tab styling', () => {
    test('should apply active styling to selected tab', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const publishedButton = screen.getByRole('button', { name: /publicados/i })
      expect(publishedButton.className).toContain('text-[#228B22]')
      expect(publishedButton.className).toContain('border-[#228B22]')
    })

    test('should apply inactive styling to non-selected tabs', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      const historicButton = screen.getByRole('button', { name: /histórico/i })
      expect(historicButton.className).toContain('text-gray-500')
    })
  })

  describe('edge cases', () => {
    test('should handle user with null role', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ user: { id: 1, role: null } })

      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      // Should only show non-admin tabs
      expect(screen.queryByText('Requiere mi Acción')).not.toBeInTheDocument()
      expect(screen.getByText('Publicados')).toBeInTheDocument()
    })

    test('should handle null user', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ user: null })

      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      // Should only show non-admin tabs
      expect(screen.queryByText('Requiere mi Acción')).not.toBeInTheDocument()
      expect(screen.getByText('Publicados')).toBeInTheDocument()
    })

    test('should default isLoading to false', () => {
      render(
        <EventsFilterTabs
          activeTab="published"
          onTabChange={mockOnTabChange}
          counters={defaultCounters}
        />
      )

      // Should show counters, not spinners
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
    })
  })
})
