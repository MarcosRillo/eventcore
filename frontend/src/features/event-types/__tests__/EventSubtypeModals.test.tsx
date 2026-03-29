/**
 * EventSubtype Modal Components Tests
 *
 * Tests for Create and Edit EventSubtype modals.
 * Covers form rendering, validation, submission, and callbacks.
 *
 * Created: December 2, 2025
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import CreateEventSubtypeModal from '@/features/event-types/components/dumb/CreateEventSubtypeModal'
import EditEventSubtypeModal from '@/features/event-types/components/smart/EditEventSubtypeModal'
import * as eventSubtypeService from '@/features/event-types/services/eventSubtype.service'
import type { EventSubtype } from '@/types/eventType.types'

// Mock service
jest.mock('../services/eventSubtype.service')

describe('CreateEventSubtypeModal', () => {
  const mockedService = eventSubtypeService as jest.Mocked<typeof eventSubtypeService>

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    eventTypeId: 1,
    eventTypeName: 'Conferencia',
    onSubtypeCreated: jest.fn(),
  }

  const mockCreatedSubtype: EventSubtype = {
    id: 1,
    event_type_id: 1,
    entity_id: 1,
    name: 'Congreso Nacional',
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedService.createEventSubtype.mockResolvedValue(mockCreatedSubtype)
    mockedService.validateEventSubtypeData.mockReturnValue([])
  })

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      expect(screen.getByText(/crear subtipo para "conferencia"/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre del subtipo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subtipo activo/i)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<CreateEventSubtypeModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText(/crear subtipo para/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /crear subtipo/i })).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/nombre del subtipo/i)).not.toBeInTheDocument()
      expect(defaultProps.isOpen).toBe(true) // Default prop is true, we override with false
    })

    it('should show submit button with correct text', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toBeEnabled()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2)
    })

    it('should have checkbox checked by default', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/subtipo activo/i)
      expect(checkbox).toBeChecked()
      expect(checkbox).toBeEnabled()
      expect(checkbox).toHaveAttribute('type', 'checkbox')
      expect(screen.getByText(/subtipo activo/i)).toBeInTheDocument()
    })

    it('should have empty name input by default', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      expect(nameInput).toHaveValue('')
      expect(nameInput).toBeEnabled()
      expect(nameInput).toHaveAttribute('type', 'text')
      expect(screen.getByText(/nombre del subtipo/i)).toBeInTheDocument()
    })

    it('should display parent type name in title', () => {
      render(<CreateEventSubtypeModal {...defaultProps} eventTypeName="Taller" />)

      expect(screen.getByText(/crear subtipo para "taller"/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre del subtipo/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear subtipo/i })).toBeInTheDocument()
      expect(defaultProps.eventTypeName).toBe('Conferencia')
    })
  })

  describe('form interaction', () => {
    it('should update name input value', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      expect(nameInput).toHaveValue('')
      fireEvent.change(nameInput, { target: { value: 'Congreso Internacional' } })

      expect(nameInput).toHaveValue('Congreso Internacional')
      expect(nameInput).toBeEnabled()
      expect(screen.getByRole('button', { name: /crear subtipo/i })).toBeInTheDocument()
    })

    it('should toggle checkbox', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/subtipo activo/i)
      expect(checkbox).toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Congreso Nacional' } })

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventSubtype).toHaveBeenCalledWith(1, {
          name: 'Congreso Nacional',
          is_active: true,
        })
      })
    })

    it('should call onSuccess after successful creation', async () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Test Subtype' } })

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onSubtypeCreated after successful creation', async () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Test Subtype' } })

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSubtypeCreated).toHaveBeenCalled()
      })
    })

    it('should submit with is_active false', async () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Inactive Subtype' } })

      const checkbox = screen.getByLabelText(/subtipo activo/i)
      fireEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventSubtype).toHaveBeenCalledWith(1, {
          name: 'Inactive Subtype',
          is_active: false,
        })
      })
    })

    it('should submit for different parent event type', async () => {
      render(<CreateEventSubtypeModal {...defaultProps} eventTypeId={5} eventTypeName="Feria" />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Feria Regional' } })

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventSubtype).toHaveBeenCalledWith(5, {
          name: 'Feria Regional',
          is_active: true,
        })
      })
    })

    it('should trim whitespace from name', async () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: '  Trimmed Name  ' } })

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventSubtype).toHaveBeenCalledWith(1, {
          name: 'Trimmed Name',
          is_active: true,
        })
      })
    })
  })

  describe('validation', () => {
    it('should not submit with empty name', async () => {
      mockedService.validateEventSubtypeData.mockReturnValue([
        'El nombre del subtipo es obligatorio',
      ])

      render(<CreateEventSubtypeModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockedService.createEventSubtype).not.toHaveBeenCalled()
    })

    it('should not call callbacks with validation errors', async () => {
      mockedService.validateEventSubtypeData.mockReturnValue([
        'El nombre del subtipo es obligatorio',
      ])

      render(<CreateEventSubtypeModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
      expect(defaultProps.onSubtypeCreated).not.toHaveBeenCalled()
    })
  })

  describe('close behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<CreateEventSubtypeModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      expect(cancelButton).toBeInTheDocument()
      expect(cancelButton).toBeEnabled()
      fireEvent.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('optional callbacks', () => {
    it('should work when onSubtypeCreated callback is not provided', async () => {
      // Render without onSubtypeCreated callback
      const propsWithoutCallback = {
        isOpen: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        eventTypeId: 1,
        eventTypeName: 'Conferencia',
      }

      render(<CreateEventSubtypeModal {...propsWithoutCallback} />)

      // Fill in name
      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Subtipo Sin Callback' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /crear subtipo/i })
      fireEvent.click(submitButton)

      // Should submit successfully without error
      await waitFor(() => {
        expect(mockedService.createEventSubtype).toHaveBeenCalledWith(1, {
          name: 'Subtipo Sin Callback',
          is_active: true,
        })
      })

      // onSuccess should be called
      await waitFor(() => {
        expect(propsWithoutCallback.onSuccess).toHaveBeenCalled()
      })
    })
  })
})

describe('EditEventSubtypeModal', () => {
  const mockedService = eventSubtypeService as jest.Mocked<typeof eventSubtypeService>

  const mockEventSubtype: EventSubtype = {
    id: 1,
    event_type_id: 1,
    entity_id: 1,
    name: 'Congreso Existente',
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    eventSubtype: mockEventSubtype,
    onSubtypeUpdated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedService.updateEventSubtype.mockResolvedValue(mockEventSubtype)
    mockedService.validateEventSubtypeData.mockReturnValue([])
  })

  describe('rendering', () => {
    it('should render modal when open with eventSubtype', () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      expect(screen.getByText('Editar Subtipo de Evento')).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre del subtipo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subtipo activo/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument()
    })

    it('should not render when eventSubtype is null', () => {
      render(<EditEventSubtypeModal {...defaultProps} eventSubtype={null} />)

      expect(screen.queryByText('Editar Subtipo de Evento')).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/nombre del subtipo/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument()
      expect(defaultProps.eventSubtype).not.toBeNull()
    })

    it('should not render when closed', () => {
      render(<EditEventSubtypeModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Editar Subtipo de Evento')).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/nombre del subtipo/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument()
      expect(defaultProps.isOpen).toBe(true)
    })

    it('should show submit button with correct text', () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toBeEnabled()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2)
    })

    it('should populate form with eventSubtype data', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nombre del subtipo/i)
        expect(nameInput).toHaveValue('Congreso Existente')
      })

      const checkbox = screen.getByLabelText(/subtipo activo/i)
      expect(checkbox).toBeChecked()
    })

    it('should populate form with inactive eventSubtype', async () => {
      const inactiveSubtype = { ...mockEventSubtype, is_active: false }
      render(<EditEventSubtypeModal {...defaultProps} eventSubtype={inactiveSubtype} />)

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/subtipo activo/i)
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  describe('form interaction', () => {
    it('should update name input value', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } })

      expect(nameInput).toHaveValue('Updated Name')
    })

    it('should toggle checkbox', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/subtipo activo/i)
        expect(checkbox).toBeChecked()
      })

      const checkbox = screen.getByLabelText(/subtipo activo/i)
      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('form submission', () => {
    it('should submit form with updated data', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Congreso Actualizado' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventSubtype).toHaveBeenCalledWith(1, 1, {
          name: 'Congreso Actualizado',
          is_active: true,
        })
      })
    })

    it('should pass eventTypeId from eventSubtype when calling updateEventSubtype', async () => {
      const subtypeWithDifferentTypeId: EventSubtype = {
        ...mockEventSubtype,
        id: 5,
        event_type_id: 3,
        name: 'Seminario',
      }

      render(<EditEventSubtypeModal {...defaultProps} eventSubtype={subtypeWithDifferentTypeId} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Seminario')
      })

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Taller' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventSubtype).toHaveBeenCalledWith(
          3,  // eventTypeId from eventSubtype.event_type_id
          5,  // subtypeId
          {
            name: 'Taller',
            is_active: true,
          }
        )
      })
    })

    it('should call onSuccess after successful update', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onSubtypeUpdated after successful update', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSubtypeUpdated).toHaveBeenCalled()
      })
    })

    it('should update is_active status', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const checkbox = screen.getByLabelText(/subtipo activo/i)
      fireEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventSubtype).toHaveBeenCalledWith(1, 1, {
          name: 'Congreso Existente',
          is_active: false,
        })
      })
    })

    it('should trim whitespace from name', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: '  Trimmed Update  ' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventSubtype).toHaveBeenCalledWith(1, 1, {
          name: 'Trimmed Update',
          is_active: true,
        })
      })
    })
  })

  describe('validation', () => {
    it('should not submit with invalid name', async () => {
      mockedService.validateEventSubtypeData.mockReturnValue([
        'El nombre debe tener al menos 2 caracteres',
      ])

      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'A' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockedService.updateEventSubtype).not.toHaveBeenCalled()
    })

    it('should not call callbacks with validation errors', async () => {
      mockedService.validateEventSubtypeData.mockReturnValue([
        'El nombre debe tener al menos 2 caracteres',
      ])

      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: '' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
      expect(defaultProps.onSubtypeUpdated).not.toHaveBeenCalled()
    })
  })

  describe('close behavior', () => {
    it('should call onClose when cancel button is clicked', async () => {
      render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('eventSubtype changes', () => {
    it('should update form when eventSubtype changes', async () => {
      const { rerender } = render(<EditEventSubtypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      const newSubtype: EventSubtype = {
        ...mockEventSubtype,
        id: 2,
        name: 'Nuevo Subtipo',
        is_active: false,
      }

      rerender(<EditEventSubtypeModal {...defaultProps} eventSubtype={newSubtype} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Nuevo Subtipo')
      })
    })
  })

  describe('optional callbacks', () => {
    it('should work when onSubtypeUpdated callback is not provided', async () => {
      // Render without onSubtypeUpdated callback
      const propsWithoutCallback = {
        isOpen: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        eventSubtype: mockEventSubtype,
      }

      render(<EditEventSubtypeModal {...propsWithoutCallback} />)

      // Wait for form to populate
      await waitFor(() => {
        expect(screen.getByLabelText(/nombre del subtipo/i)).toHaveValue('Congreso Existente')
      })

      // Change name
      const nameInput = screen.getByLabelText(/nombre del subtipo/i)
      fireEvent.change(nameInput, { target: { value: 'Subtipo Actualizado' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      // Should submit successfully without error
      await waitFor(() => {
        expect(mockedService.updateEventSubtype).toHaveBeenCalledWith(1, 1, {
          name: 'Subtipo Actualizado',
          is_active: true,
        })
      })

      // onSuccess should be called
      await waitFor(() => {
        expect(propsWithoutCallback.onSuccess).toHaveBeenCalled()
      })
    })
  })
})
