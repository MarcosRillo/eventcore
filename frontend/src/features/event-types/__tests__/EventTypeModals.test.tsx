/**
 * EventType Modal Components Tests
 *
 * Tests for Create and Edit EventType modals.
 * Covers form rendering, validation, submission, and callbacks.
 *
 * Created: December 2, 2025
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import CreateEventTypeModal from '@/features/event-types/components/CreateEventTypeModal'
import EditEventTypeModal from '@/features/event-types/components/EditEventTypeModal'
import * as eventTypeService from '@/features/event-types/services/eventType.service'
import type { EventType } from '@/types/eventType.types'

// Mock service
jest.mock('../services/eventType.service')

describe('CreateEventTypeModal', () => {
  const mockedService = eventTypeService as jest.Mocked<typeof eventTypeService>

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onEventTypeCreated: jest.fn(),
  }

  const mockCreatedEventType: EventType = {
    id: 1,
    name: 'Conferencia',
    is_active: true,
    subtypes_count: 0,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedService.createEventType.mockResolvedValue(mockCreatedEventType)
    mockedService.validateEventTypeData.mockReturnValue([])
  })

  describe('rendering', () => {
    it('should render modal when open', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      expect(screen.getByText('Crear Nuevo Tipo de Evento')).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tipo de evento activo/i)).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<CreateEventTypeModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Crear Nuevo Tipo de Evento')).not.toBeInTheDocument()
    })

    it('should show submit button with correct text', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /crear tipo/i })).toBeInTheDocument()
    })

    it('should have checkbox checked by default', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/tipo de evento activo/i)
      expect(checkbox).toBeChecked()
    })

    it('should have empty name input by default', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      expect(nameInput).toHaveValue('')
    })
  })

  describe('form interaction', () => {
    it('should update name input value', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Test Event Type' } })

      expect(nameInput).toHaveValue('Test Event Type')
    })

    it('should toggle checkbox', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/tipo de evento activo/i)
      expect(checkbox).toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Nueva Conferencia' } })

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventType).toHaveBeenCalledWith({
          name: 'Nueva Conferencia',
          is_active: true,
        })
      })
    })

    it('should call onSuccess after successful creation', async () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Test Type' } })

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onEventTypeCreated after successful creation', async () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Test Type' } })

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onEventTypeCreated).toHaveBeenCalled()
      })
    })

    it('should submit with is_active false', async () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Inactive Type' } })

      const checkbox = screen.getByLabelText(/tipo de evento activo/i)
      fireEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventType).toHaveBeenCalledWith({
          name: 'Inactive Type',
          is_active: false,
        })
      })
    })

    it('should trim whitespace from name', async () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: '  Trimmed Name  ' } })

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.createEventType).toHaveBeenCalledWith({
          name: 'Trimmed Name',
          is_active: true,
        })
      })
    })
  })

  describe('validation', () => {
    it('should not submit with empty name', async () => {
      mockedService.validateEventTypeData.mockReturnValue([
        'El nombre del tipo de evento es obligatorio',
      ])

      render(<CreateEventTypeModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      // Wait a bit then verify service was not called
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockedService.createEventType).not.toHaveBeenCalled()
    })

    it('should not submit with validation errors and not call onSuccess', async () => {
      mockedService.validateEventTypeData.mockReturnValue([
        'El nombre del tipo de evento es obligatorio',
      ])

      render(<CreateEventTypeModal {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      // Wait a bit then verify callbacks were not called
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockedService.createEventType).not.toHaveBeenCalled()
      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
      expect(defaultProps.onEventTypeCreated).not.toHaveBeenCalled()
    })
  })

  describe('close behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<CreateEventTypeModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('optional callbacks', () => {
    it('should work when onEventTypeCreated callback is not provided', async () => {
      // Render without onEventTypeCreated callback
      const propsWithoutCallback = {
        isOpen: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
      }

      render(<CreateEventTypeModal {...propsWithoutCallback} />)

      // Fill in name
      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Tipo Sin Callback' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /crear tipo/i })
      fireEvent.click(submitButton)

      // Should submit successfully without error
      await waitFor(() => {
        expect(mockedService.createEventType).toHaveBeenCalledWith({
          name: 'Tipo Sin Callback',
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

describe('EditEventTypeModal', () => {
  const mockedService = eventTypeService as jest.Mocked<typeof eventTypeService>

  const mockEventType: EventType = {
    id: 1,
    name: 'Conferencia Existente',
    is_active: true,
    subtypes_count: 3,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    eventType: mockEventType,
    onEventTypeUpdated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedService.updateEventType.mockResolvedValue(mockEventType)
    mockedService.validateEventTypeData.mockReturnValue([])
  })

  describe('rendering', () => {
    it('should render modal when open with eventType', () => {
      render(<EditEventTypeModal {...defaultProps} />)

      expect(screen.getByText('Editar Tipo de Evento')).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    })

    it('should not render when eventType is null', () => {
      render(<EditEventTypeModal {...defaultProps} eventType={null} />)

      expect(screen.queryByText('Editar Tipo de Evento')).not.toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(<EditEventTypeModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Editar Tipo de Evento')).not.toBeInTheDocument()
    })

    it('should show submit button with correct text', () => {
      render(<EditEventTypeModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument()
    })

    it('should populate form with eventType data', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nombre/i)
        expect(nameInput).toHaveValue('Conferencia Existente')
      })

      const checkbox = screen.getByLabelText(/tipo de evento activo/i)
      expect(checkbox).toBeChecked()
    })

    it('should populate form with inactive eventType', async () => {
      const inactiveType = { ...mockEventType, is_active: false }
      render(<EditEventTypeModal {...defaultProps} eventType={inactiveType} />)

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/tipo de evento activo/i)
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  describe('form interaction', () => {
    it('should update name input value', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } })

      expect(nameInput).toHaveValue('Updated Name')
    })

    it('should toggle checkbox', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/tipo de evento activo/i)
        expect(checkbox).toBeChecked()
      })

      const checkbox = screen.getByLabelText(/tipo de evento activo/i)
      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('form submission', () => {
    it('should submit form with updated data', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Updated Conferencia' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventType).toHaveBeenCalledWith(1, {
          name: 'Updated Conferencia',
          is_active: true,
        })
      })
    })

    it('should call onSuccess after successful update', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onEventTypeUpdated after successful update', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onEventTypeUpdated).toHaveBeenCalled()
      })
    })

    it('should update is_active status', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const checkbox = screen.getByLabelText(/tipo de evento activo/i)
      fireEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventType).toHaveBeenCalledWith(1, {
          name: 'Conferencia Existente',
          is_active: false,
        })
      })
    })

    it('should trim whitespace from name', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: '  Trimmed Update  ' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedService.updateEventType).toHaveBeenCalledWith(1, {
          name: 'Trimmed Update',
          is_active: true,
        })
      })
    })
  })

  describe('validation', () => {
    it('should not submit with invalid name', async () => {
      mockedService.validateEventTypeData.mockReturnValue([
        'El nombre debe tener al menos 2 caracteres',
      ])

      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'A' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      // Wait a bit then verify service was not called
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockedService.updateEventType).not.toHaveBeenCalled()
    })

    it('should not call callbacks with validation errors', async () => {
      mockedService.validateEventTypeData.mockReturnValue([
        'El nombre debe tener al menos 2 caracteres',
      ])

      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: '' } })

      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
      expect(defaultProps.onEventTypeUpdated).not.toHaveBeenCalled()
    })
  })

  describe('close behavior', () => {
    it('should call onClose when cancel button is clicked', async () => {
      render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('eventType changes', () => {
    it('should update form when eventType changes', async () => {
      const { rerender } = render(<EditEventTypeModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      const newEventType: EventType = {
        ...mockEventType,
        id: 2,
        name: 'Nuevo Tipo',
        is_active: false,
      }

      rerender(<EditEventTypeModal {...defaultProps} eventType={newEventType} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Nuevo Tipo')
      })
    })
  })

  describe('optional callbacks', () => {
    it('should work when onEventTypeUpdated callback is not provided', async () => {
      // Render without onEventTypeUpdated callback
      const propsWithoutCallback = {
        isOpen: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        eventType: mockEventType,
      }

      render(<EditEventTypeModal {...propsWithoutCallback} />)

      // Wait for form to populate
      await waitFor(() => {
        expect(screen.getByLabelText(/nombre/i)).toHaveValue('Conferencia Existente')
      })

      // Change name
      const nameInput = screen.getByLabelText(/nombre/i)
      fireEvent.change(nameInput, { target: { value: 'Nombre Actualizado' } })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /guardar cambios/i })
      fireEvent.click(submitButton)

      // Should submit successfully without error
      await waitFor(() => {
        expect(mockedService.updateEventType).toHaveBeenCalledWith(1, {
          name: 'Nombre Actualizado',
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
