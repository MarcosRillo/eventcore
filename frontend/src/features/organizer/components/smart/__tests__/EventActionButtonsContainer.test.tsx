import '@testing-library/jest-dom'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
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
    deleteEvent: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue(mockUseEventActions)
  })

  const openMenu = async () => {
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: /acciones de test event/i })
    await user.click(trigger)
    return user
  }

  describe('Rendering', () => {
    it('should render overflow menu trigger', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(screen.getByRole('button', { name: /acciones de test event/i })).toBeInTheDocument()
    })

    it('should show menu items when overflow menu is opened', async () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      await openMenu()

      expect(screen.getByRole('menuitem', { name: /enviar a revisión/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /eliminar/i })).toBeInTheDocument()
    })

    it('should pass onSuccess callback to useEventActions', () => {
      const onSuccess = jest.fn()
      render(<EventActionButtonsContainer event={mockEvent} onSuccess={onSuccess} />)

      expect(useEventActionsModule.useEventActions).toHaveBeenCalledWith(onSuccess)
    })
  })

  describe('Submit action', () => {
    it('should open submit modal when submit menu item clicked', async () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const user = await openMenu()

      await user.click(screen.getByRole('menuitem', { name: /enviar a revisión/i }))

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
        confirmButton.click()
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
        confirmButton.click()
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
        cancelButton.click()
      })

      expect(mockUseEventActions.closeSubmitModal).toHaveBeenCalled()

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })
  })

  describe('Delete action', () => {
    it('should open delete modal when delete menu item clicked', async () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const user = await openMenu()

      await user.click(screen.getByRole('menuitem', { name: /eliminar/i }))

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
        confirmButton.click()
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
        confirmButton.click()
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
        cancelButton.click()
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

    it('should handle event without onSuccess callback', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(useEventActionsModule.useEventActions).toHaveBeenCalledWith(undefined)
    })
  })
})
