import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { EventDetailModal, EventDetailModalProps } from '@/shared/components/modals/EventDetailModal'
import { Event } from '@/types/event.types'

// Mock Modal
interface MockModalProps {
  isOpen: boolean
  title: React.ReactNode
  children: React.ReactNode
  size?: string
  showCloseButton?: boolean
  onClose: () => void
}

jest.mock('@/shared/components/modals/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, title, children }: MockModalProps) =>
    isOpen ? (
      <div role="dialog">
        <div data-testid="modal-title">{title}</div>
        <div>{children}</div>
      </div>
    ) : null,
}))

// Mock ConfirmDialog
interface MockConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  variant?: string
  onConfirm: () => void
  onCancel: () => void
}

jest.mock('@/shared/components/modals/ConfirmDialog', () => ({
  __esModule: true,
  default: (props: MockConfirmDialogProps) =>
    props.isOpen ? (
      <div
        data-testid="confirm-dialog"
        data-variant={props.variant}
        data-title={props.title}
      >
        <button data-testid="confirm-btn" onClick={props.onConfirm}>Confirmar</button>
        <button data-testid="cancel-btn" onClick={props.onCancel}>Cancelar</button>
      </div>
    ) : null,
}))

// Mock eventPublicExportService
jest.mock('@/features/events/services/eventPublicService', () => ({
  eventPublicExportService: {
    getGoogleCalendarUrl: jest.fn().mockReturnValue('https://calendar.google.com/test'),
    getOutlookCalendarUrl: jest.fn().mockReturnValue('https://outlook.live.com/test'),
    downloadICalFile: jest.fn().mockResolvedValue(undefined),
  },
}))

// Helper to create a test event
const createTestEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test description',
  start_date: '2025-06-15T10:00:00',
  end_date: '2025-06-15T12:00:00',
  type: 'sede_unica',
  status: 'published',
  is_featured: false,
  locations: [],
  approval_history: [],
  created_at: '2025-01-01T00:00:00',
  updated_at: '2025-01-01T00:00:00',
  ...overrides,
})

const renderModal = (overrides: Partial<EventDetailModalProps> = {}) => {
  const defaultProps: EventDetailModalProps = {
    isOpen: true,
    event: createTestEvent(),
    onClose: jest.fn(),
    ...overrides,
  }

  return {
    props: defaultProps,
    ...render(<EventDetailModal {...defaultProps} />),
  }
}

describe('EventDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('returns null when event is null', () => {
      const { container } = render(
        <EventDetailModal isOpen={true} event={null} onClose={jest.fn()} />
      )

      expect(container.innerHTML).toBe('')
    })

    it('renders event title and description', () => {
      renderModal()

      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('renders date and location info', () => {
      renderModal({
        event: createTestEvent({
          location_text: 'Plaza Independencia',
        }),
      })

      expect(screen.getByText('Fecha y hora')).toBeInTheDocument()
      expect(screen.getByText('Ubicación')).toBeInTheDocument()
      expect(screen.getByText('Plaza Independencia')).toBeInTheDocument()
    })

    it('renders featured star when is_featured', () => {
      renderModal({
        event: createTestEvent({ is_featured: true }),
      })

      // Star icon is rendered with yellow classes
      const titleArea = screen.getByTestId('modal-title')
      const star = titleArea.querySelector('.text-yellow-500')
      expect(star).toBeInTheDocument()
    })

    it('uses neutral-* tokens (no gray-*)', () => {
      const { container } = renderModal()

      // Ensure no gray-* classes are present
      const allElements = container.querySelectorAll('*')
      allElements.forEach((el) => {
        const className = el.getAttribute('class') || ''
        expect(className).not.toMatch(/\bgray-/)
      })
    })
  })

  describe('Public Context', () => {
    it('renders export buttons (Google Calendar, Outlook, ICS)', () => {
      renderModal({ context: 'public', showExport: true })

      expect(screen.getByRole('button', { name: /Google Calendar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Outlook/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Descargar ICS/i })).toBeInTheDocument()
    })

    it('renders share buttons', () => {
      renderModal({ context: 'public', showSharing: true })

      expect(screen.getByRole('button', { name: 'Facebook' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Twitter' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'WhatsApp' })).toBeInTheDocument()
    })
  })

  describe('Admin Context', () => {
    it('renders status badge with primary-* tokens', () => {
      renderModal({
        context: 'admin',
        event: createTestEvent({
          status: { id: 1, status_code: 'published', status_name: 'Publicado', description: '', workflow_order: 1, created_at: '', updated_at: '' },
        }),
      })

      const badge = screen.getByText('Publicado')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-primary-100')
      expect(badge).toHaveClass('text-primary-800')
    })

    it('renders organizer info', () => {
      renderModal({
        context: 'admin',
        event: createTestEvent({
          organizer: { name: 'Test Org', organization: 'Org Name', id: 2 },
        }),
      })

      expect(screen.getByText('Org Name')).toBeInTheDocument()
      expect(screen.getByText('Externo')).toBeInTheDocument()
    })

    it('renders workflow buttons with correct variants', () => {
      renderModal({
        context: 'admin',
        onApproveInternal: jest.fn(),
        onRequestPublicApproval: jest.fn(),
        onPublishEvent: jest.fn(),
        onRequestChanges: jest.fn(),
        onReject: jest.fn(),
        onApprove: jest.fn(),
        onDelete: jest.fn(),
      })

      // Aprobar Internamente uses primary variant
      const approveInternalBtn = screen.getByRole('button', { name: 'Aprobar Internamente' })
      expect(approveInternalBtn).toHaveClass('bg-primary-500')

      // Solicitar Aprobación Pública uses warning variant
      const requestPublicBtn = screen.getByRole('button', { name: 'Solicitar Aprobación Pública' })
      expect(requestPublicBtn).toHaveClass('bg-warning-500')

      // Publicar uses success variant
      const publishBtn = screen.getByRole('button', { name: 'Publicar' })
      expect(publishBtn).toHaveClass('bg-success-500')

      // Solicitar Cambios uses warning variant
      const requestChangesBtn = screen.getByRole('button', { name: 'Solicitar Cambios' })
      expect(requestChangesBtn).toHaveClass('bg-warning-500')

      // Rechazar uses danger variant
      const rejectBtn = screen.getByRole('button', { name: 'Rechazar' })
      expect(rejectBtn).toHaveClass('bg-error-500')

      // Aprobar uses success variant
      const approveBtn = screen.getByRole('button', { name: 'Aprobar' })
      expect(approveBtn).toHaveClass('bg-success-500')

      // Eliminar uses danger variant
      const deleteBtn = screen.getByRole('button', { name: 'Eliminar' })
      expect(deleteBtn).toHaveClass('bg-error-500')
    })
  })

  describe('Actions', () => {
    it('calls onEdit with event', async () => {
      const user = userEvent.setup()
      const onEdit = jest.fn()
      const event = createTestEvent()

      renderModal({ context: 'admin', onEdit, event })

      await user.click(screen.getByRole('button', { name: 'Editar' }))

      expect(onEdit).toHaveBeenCalledWith(event)
    })

    it('shows confirm dialog before delete', async () => {
      const user = userEvent.setup()
      const onDelete = jest.fn()

      renderModal({ context: 'admin', onDelete })

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Eliminar' }))

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', 'danger')
    })

    it('shows confirm dialog before reject', async () => {
      const user = userEvent.setup()
      const onReject = jest.fn()

      renderModal({ context: 'admin', onReject })

      await user.click(screen.getByRole('button', { name: 'Rechazar' }))

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', 'warning')
    })
  })
})
