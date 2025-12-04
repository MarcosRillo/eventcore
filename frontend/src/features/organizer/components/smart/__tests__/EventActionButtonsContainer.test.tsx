import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EventActionButtonsContainer } from '../EventActionButtonsContainer'
import * as useEventActionsModule from '@/features/organizer/hooks/useEventActions'
import { OrganizerEvent } from '@/features/organizer/types/event.types'

jest.mock('@/features/organizer/hooks/useEventActions')

describe('EventActionButtonsContainer', () => {
  const mockEvent: OrganizerEvent = {
    id: 1,
    title: 'Test Event',
    status: 'draft',
    start_date: '2030-12-01T10:00:00',
  }

  const mockUseEventActions = {
    loading: false,
    submitModalOpen: false,
    deleteModalOpen: false,
    selectedEventId: null,
    validationErrors: null,
    openSubmitModal: jest.fn(),
    closeSubmitModal: jest.fn(),
    openDeleteModal: jest.fn(),
    closeDeleteModal: jest.fn(),
    submitForReview: jest.fn(),
    duplicateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue(mockUseEventActions)
  })

  describe('Rendering', () => {
    it('should render EventActionButtons with correct props', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(screen.getByRole('button', { name: /submit.*review/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /duplicar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('should pass loading state to EventActionButtons', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        loading: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const submitButton = screen.getByRole('button', { name: /submit.*review/i })
      expect(submitButton).toBeDisabled()
    })

    it('should pass onSuccess callback to useEventActions', () => {
      const onSuccess = jest.fn()
      render(<EventActionButtonsContainer event={mockEvent} onSuccess={onSuccess} />)

      expect(useEventActionsModule.useEventActions).toHaveBeenCalledWith(onSuccess)
    })
  })

  describe('Submit action', () => {
    it('should open submit modal when submit button clicked', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const submitButton = screen.getByRole('button', { name: /submit.*review/i })
      fireEvent.click(submitButton)

      expect(mockUseEventActions.openSubmitModal).toHaveBeenCalledWith(mockEvent.id)
    })

    it('should show submit modal when submitModalOpen is true', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        submitModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      // The modal title is "Enviar a revisión" - check for the confirm button
      expect(screen.getByRole('button', { name: /enviar$/i })).toBeInTheDocument()
    })

    it('should call submitForReview when confirm button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        submitModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /enviar$/i })

      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockUseEventActions.submitForReview).toHaveBeenCalledWith(mockEvent.id)
      })

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should not call submitForReview if selectedEventId is null', async () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        submitModalOpen: true,
        selectedEventId: null,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /enviar$/i })

      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockUseEventActions.submitForReview).not.toHaveBeenCalled()
      })
    })

    it('should close submit modal when cancel button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        submitModalOpen: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      await act(async () => {
        fireEvent.click(cancelButton)
      })

      expect(mockUseEventActions.closeSubmitModal).toHaveBeenCalled()

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })
  })

  describe('Duplicate action', () => {
    it('should render duplicate button as disabled (coming soon feature)', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const duplicateButton = screen.getByRole('button', { name: /duplicar/i })
      expect(duplicateButton).toBeDisabled()
      expect(duplicateButton).toHaveAttribute('aria-label', 'Duplicar evento (próximamente)')
    })

    it('should not call duplicateEvent when duplicate button is clicked', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const duplicateButton = screen.getByRole('button', { name: /duplicar/i })
      fireEvent.click(duplicateButton)

      expect(mockUseEventActions.duplicateEvent).not.toHaveBeenCalled()
    })
  })

  describe('Delete action', () => {
    it('should open delete modal when delete button clicked', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      expect(mockUseEventActions.openDeleteModal).toHaveBeenCalledWith(mockEvent.id)
    })

    it('should show delete modal when deleteModalOpen is true', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        deleteModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(screen.getByText(/eliminar evento/i)).toBeInTheDocument()
    })

    it('should call deleteEvent when confirm delete button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        deleteModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /^eliminar$/i })

      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockUseEventActions.deleteEvent).toHaveBeenCalledWith(mockEvent.id)
      })

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should not call deleteEvent if selectedEventId is null', async () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        deleteModalOpen: true,
        selectedEventId: null,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /^eliminar$/i })

      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockUseEventActions.deleteEvent).not.toHaveBeenCalled()
      })
    })

    it('should close delete modal when cancel button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        deleteModalOpen: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      await act(async () => {
        fireEvent.click(cancelButton)
      })

      expect(mockUseEventActions.closeDeleteModal).toHaveBeenCalled()

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })
  })

  describe('Loading states', () => {
    it('should disable all buttons when loading', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        loading: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const submitButton = screen.getByRole('button', { name: /submit.*review/i })
      const duplicateButton = screen.getByRole('button', { name: /duplicar/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      expect(submitButton).toBeDisabled()
      expect(duplicateButton).toBeDisabled()
      expect(deleteButton).toBeDisabled()
    })

    it('should show loading state in modals when loading', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        loading: true,
        submitModalOpen: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      // The confirm button should be disabled when loading
      const confirmButton = screen.getByRole('button', { name: /enviar/i })
      expect(confirmButton).toBeDisabled()
    })
  })

  describe('Edge cases', () => {
    it('should handle event with long title in delete modal', () => {
      const longTitleEvent = {
        ...mockEvent,
        title: 'A'.repeat(200),
      }

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        deleteModalOpen: true,
      })

      render(<EventActionButtonsContainer event={longTitleEvent} />)

      // Check if modal content is rendered (itemName is passed to modal)
      expect(screen.getByText(/eliminar evento/i)).toBeInTheDocument()
    })

    it('should handle multiple rapid clicks on same button', async () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const submitButton = screen.getByRole('button', { name: /submit.*review/i })

      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      expect(mockUseEventActions.openSubmitModal).toHaveBeenCalledTimes(3)
    })

    it('should handle event without onSuccess callback', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(useEventActionsModule.useEventActions).toHaveBeenCalledWith(undefined)
    })
  })
})
