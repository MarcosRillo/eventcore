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
    publishModalOpen: false,
    deleteModalOpen: false,
    selectedEventId: null,
    openPublishModal: jest.fn(),
    closePublishModal: jest.fn(),
    openDeleteModal: jest.fn(),
    closeDeleteModal: jest.fn(),
    publishEvent: jest.fn(),
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

      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('should pass loading state to EventActionButtons', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        loading: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const publishButton = screen.getByRole('button', { name: /publish/i })
      expect(publishButton).toBeDisabled()
    })

    it('should pass onSuccess callback to useEventActions', () => {
      const onSuccess = jest.fn()
      render(<EventActionButtonsContainer event={mockEvent} onSuccess={onSuccess} />)

      expect(useEventActionsModule.useEventActions).toHaveBeenCalledWith(onSuccess)
    })
  })

  describe('Publish action', () => {
    it('should open publish modal when publish button clicked', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const publishButton = screen.getByRole('button', { name: /publish/i })
      fireEvent.click(publishButton)

      expect(mockUseEventActions.openPublishModal).toHaveBeenCalledWith(mockEvent.id)
    })

    it('should show publish modal when publishModalOpen is true', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        publishModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(screen.getByText(/publish item/i)).toBeInTheDocument()
      expect(screen.getByText(/are you sure you want to publish this item/i)).toBeInTheDocument()
    })

    it('should call publishEvent when confirm button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        publishModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /^publish$/i })

      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockUseEventActions.publishEvent).toHaveBeenCalledWith(mockEvent.id)
      })

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })

    it('should not call publishEvent if selectedEventId is null', async () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        publishModalOpen: true,
        selectedEventId: null,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /^publish$/i })

      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockUseEventActions.publishEvent).not.toHaveBeenCalled()
      })
    })

    it('should close publish modal when cancel button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        publishModalOpen: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      await act(async () => {
        fireEvent.click(cancelButton)
      })

      expect(mockUseEventActions.closePublishModal).toHaveBeenCalled()

      // Allow transition to complete
      act(() => {
        jest.runAllTimers()
      })

      jest.useRealTimers()
    })
  })

  describe('Duplicate action', () => {
    it('should call duplicateEvent when duplicate button clicked', async () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const duplicateButton = screen.getByRole('button', { name: /duplicate/i })
      fireEvent.click(duplicateButton)

      await waitFor(() => {
        expect(mockUseEventActions.duplicateEvent).toHaveBeenCalledWith(mockEvent.id)
      })
    })

    it('should show loading state while duplicating', async () => {
      let resolvePromise: () => void
      const duplicatePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve
      })

      mockUseEventActions.duplicateEvent.mockReturnValue(duplicatePromise)

      render(<EventActionButtonsContainer event={mockEvent} />)

      const duplicateButton = screen.getByRole('button', { name: /duplicate/i })
      fireEvent.click(duplicateButton)

      // Wait a bit to ensure promise is pending
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Resolve the promise
      resolvePromise!()
      await duplicatePromise
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

      expect(screen.getByText(/delete event/i)).toBeInTheDocument()
      expect(screen.getByText(/warning: this action cannot be undone/i)).toBeInTheDocument()
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(mockEvent.title))).toBeInTheDocument()
    })

    it('should call deleteEvent when confirm delete button clicked', async () => {
      jest.useFakeTimers()

      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        deleteModalOpen: true,
        selectedEventId: mockEvent.id,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /^delete$/i })

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

      const confirmButton = screen.getByRole('button', { name: /^delete$/i })

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

      const publishButton = screen.getByRole('button', { name: /publish/i })
      const duplicateButton = screen.getByRole('button', { name: /duplicate/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      expect(publishButton).toBeDisabled()
      expect(duplicateButton).toBeDisabled()
      expect(deleteButton).toBeDisabled()
    })

    it('should show loading spinner in modals when loading', () => {
      ;(useEventActionsModule.useEventActions as jest.Mock).mockReturnValue({
        ...mockUseEventActions,
        loading: true,
        publishModalOpen: true,
      })

      render(<EventActionButtonsContainer event={mockEvent} />)

      const confirmButton = screen.getByRole('button', { name: /publishing/i })
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

      // Check if at least part of the long title is rendered
      expect(screen.getByText(new RegExp('A{100,}'))).toBeInTheDocument()
    })

    it('should handle multiple rapid clicks on same button', async () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      const publishButton = screen.getByRole('button', { name: /publish/i })

      fireEvent.click(publishButton)
      fireEvent.click(publishButton)
      fireEvent.click(publishButton)

      expect(mockUseEventActions.openPublishModal).toHaveBeenCalledTimes(3)
    })

    it('should handle event without onSuccess callback', () => {
      render(<EventActionButtonsContainer event={mockEvent} />)

      expect(useEventActionsModule.useEventActions).toHaveBeenCalledWith(undefined)
    })
  })
})
