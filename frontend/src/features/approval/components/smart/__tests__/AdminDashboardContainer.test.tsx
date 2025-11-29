/**
 * Tests for AdminDashboardContainer (Smart Component)
 *
 * Tests integration of dashboard with data hooks and approval modals.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { AdminDashboardContainer } from '../AdminDashboardContainer'
import { useAdminStats } from '@/features/approval/hooks/useAdminStats'
import { useAdminEvents } from '@/features/approval/hooks/useAdminEvents'
import { useApprovalActions } from '@/features/approval/hooks/useApprovalActions'

jest.mock('@/features/approval/hooks/useAdminStats')
jest.mock('@/features/approval/hooks/useAdminEvents')
jest.mock('@/features/approval/hooks/useApprovalActions')

// Mock child components to simplify testing
jest.mock('@/features/approval/components/dumb/AdminDashboard', () => ({
  AdminDashboard: ({ onFilterChange, onApprove, onReject, onRequestChanges, onPublish }: {
    onFilterChange: (status: string | null) => void
    onApprove: (id: number) => void
    onReject: (id: number) => void
    onRequestChanges: (id: number) => void
    onPublish: (id: number) => void
  }) => (
    <div data-testid="admin-dashboard">
      <button onClick={() => onFilterChange('pending_approval')}>Filter Pending</button>
      <button onClick={() => onFilterChange(null)}>Show All</button>
      <button onClick={() => onApprove(1)}>Approve Event 1</button>
      <button onClick={() => onReject(1)}>Reject Event 1</button>
      <button onClick={() => onRequestChanges(1)}>Request Changes 1</button>
      <button onClick={() => onPublish(1)}>Publish Event 1</button>
    </div>
  )
}))

jest.mock('@/components/ui', () => ({
  ConfirmDialog: ({ isOpen, onCancel, onConfirm, title }: {
    isOpen: boolean
    onCancel: () => void
    onConfirm: () => void
    title: string
  }) => isOpen ? (
    <div data-testid="approve-modal">
      <span>{title}</span>
      <button onClick={onConfirm}>Confirm Approve</button>
      <button onClick={onCancel}>Cancel Approve</button>
    </div>
  ) : null,
  PromptDialog: ({ isOpen, onCancel, onConfirm, title, variant }: {
    isOpen: boolean
    onCancel: () => void
    onConfirm: (value: string) => void
    title: string
    variant?: string
  }) => isOpen ? (
    <div data-testid={variant === 'danger' ? 'reject-modal' : 'request-changes-modal'}>
      <span>{title}</span>
      <button onClick={() => onConfirm(variant === 'danger' ? 'Test reason' : 'Please fix this')}>
        {variant === 'danger' ? 'Confirm Reject' : 'Confirm Request Changes'}
      </button>
      <button onClick={onCancel}>
        {variant === 'danger' ? 'Cancel Reject' : 'Cancel Request Changes'}
      </button>
    </div>
  ) : null
}))

jest.mock('@/shared/components/modals', () => ({
  PublishConfirmModal: ({ isOpen, onClose, onConfirm }: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
  }) => isOpen ? (
    <div data-testid="publish-modal">
      <button onClick={onConfirm}>Confirm Publish</button>
      <button onClick={onClose}>Cancel Publish</button>
    </div>
  ) : null
}))

describe('AdminDashboardContainer', () => {
  const mockStats = {
    total_events: 100,
    pending_approval: 15,
    approved_internal: 45,
    published: 35,
    rejected: 5
  }

  const mockEvents = {
    data: [
      { id: 1, title: 'Event 1', status: 'pending_approval' },
      { id: 2, title: 'Event 2', status: 'approved_internal' }
    ],
    meta: { current_page: 1, total: 2 }
  }

  const mockRefetchStats = jest.fn()
  const mockRetry = jest.fn()
  const mockHandleStatusFilter = jest.fn()
  const mockOpenApproveModal = jest.fn()
  const mockCloseApproveModal = jest.fn()
  const mockOpenRejectModal = jest.fn()
  const mockCloseRejectModal = jest.fn()
  const mockOpenRequestChangesModal = jest.fn()
  const mockCloseRequestChangesModal = jest.fn()
  const mockOpenPublishModal = jest.fn()
  const mockClosePublishModal = jest.fn()
  const mockApproveEvent = jest.fn()
  const mockRejectEvent = jest.fn()
  const mockRequestChanges = jest.fn()
  const mockPublishEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useAdminStats as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: mockRefetchStats
    })

    ;(useAdminEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      statusFilter: null,
      handleStatusFilter: mockHandleStatusFilter,
      retry: mockRetry
    })

    ;(useApprovalActions as jest.Mock).mockReturnValue({
      loading: false,
      approveModalOpen: false,
      rejectModalOpen: false,
      requestChangesModalOpen: false,
      publishModalOpen: false,
      selectedEventId: null,
      openApproveModal: mockOpenApproveModal,
      closeApproveModal: mockCloseApproveModal,
      openRejectModal: mockOpenRejectModal,
      closeRejectModal: mockCloseRejectModal,
      openRequestChangesModal: mockOpenRequestChangesModal,
      closeRequestChangesModal: mockCloseRequestChangesModal,
      openPublishModal: mockOpenPublishModal,
      closePublishModal: mockClosePublishModal,
      approveEvent: mockApproveEvent,
      rejectEvent: mockRejectEvent,
      requestChanges: mockRequestChanges,
      publishEvent: mockPublishEvent
    })
  })

  describe('rendering', () => {
    test('should render AdminDashboard when stats are loaded', () => {
      render(<AdminDashboardContainer />)

      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
    })

    test('should not render AdminDashboard when stats are null', () => {
      ;(useAdminStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: mockRefetchStats
      })

      render(<AdminDashboardContainer />)

      expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument()
    })

    test('should not render any modals initially', () => {
      render(<AdminDashboardContainer />)

      expect(screen.queryByTestId('approve-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('reject-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('request-changes-modal')).not.toBeInTheDocument()
      expect(screen.queryByTestId('publish-modal')).not.toBeInTheDocument()
    })
  })

  describe('filter handling', () => {
    test('should call handleStatusFilter when filter is changed', () => {
      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Filter Pending'))

      expect(mockHandleStatusFilter).toHaveBeenCalledWith('pending_approval')
    })

    test('should call handleStatusFilter with null to show all', () => {
      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Show All'))

      expect(mockHandleStatusFilter).toHaveBeenCalledWith(null)
    })
  })

  describe('approval actions', () => {
    test('should open approve modal when approve action is triggered', () => {
      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Approve Event 1'))

      expect(mockOpenApproveModal).toHaveBeenCalledWith(1)
    })

    test('should open reject modal when reject action is triggered', () => {
      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Reject Event 1'))

      expect(mockOpenRejectModal).toHaveBeenCalledWith(1)
    })

    test('should open request changes modal when action is triggered', () => {
      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Request Changes 1'))

      expect(mockOpenRequestChangesModal).toHaveBeenCalledWith(1)
    })

    test('should open publish modal when publish action is triggered', () => {
      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Publish Event 1'))

      expect(mockOpenPublishModal).toHaveBeenCalledWith(1)
    })
  })

  describe('approve modal', () => {
    test('should render approve modal when open', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: true,
        rejectModalOpen: false,
        requestChangesModalOpen: false,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      expect(screen.getByTestId('approve-modal')).toBeInTheDocument()
    })

    test('should call approveEvent when confirm is clicked', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: true,
        rejectModalOpen: false,
        requestChangesModalOpen: false,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Confirm Approve'))

      expect(mockApproveEvent).toHaveBeenCalledWith(1)
    })

    test('should close approve modal when cancel is clicked', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: true,
        rejectModalOpen: false,
        requestChangesModalOpen: false,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Cancel Approve'))

      expect(mockCloseApproveModal).toHaveBeenCalled()
    })
  })

  describe('reject modal', () => {
    test('should render reject modal when open', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: false,
        rejectModalOpen: true,
        requestChangesModalOpen: false,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      expect(screen.getByTestId('reject-modal')).toBeInTheDocument()
    })

    test('should call rejectEvent with reason when confirm is clicked', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: false,
        rejectModalOpen: true,
        requestChangesModalOpen: false,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Confirm Reject'))

      expect(mockRejectEvent).toHaveBeenCalledWith(1, 'Test reason')
    })
  })

  describe('request changes modal', () => {
    test('should render request changes modal when open', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: false,
        rejectModalOpen: false,
        requestChangesModalOpen: true,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      expect(screen.getByTestId('request-changes-modal')).toBeInTheDocument()
    })

    test('should call requestChanges with comments when confirm is clicked', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: false,
        rejectModalOpen: false,
        requestChangesModalOpen: true,
        publishModalOpen: false,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Confirm Request Changes'))

      expect(mockRequestChanges).toHaveBeenCalledWith(1, 'Please fix this')
    })
  })

  describe('publish modal', () => {
    test('should render publish modal when open', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: false,
        rejectModalOpen: false,
        requestChangesModalOpen: false,
        publishModalOpen: true,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      expect(screen.getByTestId('publish-modal')).toBeInTheDocument()
    })

    test('should call publishEvent when confirm is clicked', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: false,
        rejectModalOpen: false,
        requestChangesModalOpen: false,
        publishModalOpen: true,
        selectedEventId: 1,
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Confirm Publish'))

      expect(mockPublishEvent).toHaveBeenCalledWith(1)
    })
  })

  describe('callback setup', () => {
    test('should pass refresh callback to useApprovalActions', () => {
      render(<AdminDashboardContainer />)

      // Verify useApprovalActions was called with a function
      expect(useApprovalActions).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('edge cases', () => {
    test('should not call approveEvent if selectedEventId is null', () => {
      ;(useApprovalActions as jest.Mock).mockReturnValue({
        loading: false,
        approveModalOpen: true,
        rejectModalOpen: false,
        requestChangesModalOpen: false,
        publishModalOpen: false,
        selectedEventId: null, // null event id
        openApproveModal: mockOpenApproveModal,
        closeApproveModal: mockCloseApproveModal,
        openRejectModal: mockOpenRejectModal,
        closeRejectModal: mockCloseRejectModal,
        openRequestChangesModal: mockOpenRequestChangesModal,
        closeRequestChangesModal: mockCloseRequestChangesModal,
        openPublishModal: mockOpenPublishModal,
        closePublishModal: mockClosePublishModal,
        approveEvent: mockApproveEvent,
        rejectEvent: mockRejectEvent,
        requestChanges: mockRequestChanges,
        publishEvent: mockPublishEvent
      })

      render(<AdminDashboardContainer />)

      fireEvent.click(screen.getByText('Confirm Approve'))

      // Should not call approveEvent because selectedEventId is null
      expect(mockApproveEvent).not.toHaveBeenCalled()
    })
  })
})
