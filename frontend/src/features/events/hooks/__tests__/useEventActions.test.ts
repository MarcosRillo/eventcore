import { renderHook } from '@testing-library/react'
import { useEventActions } from '../useEventActions'
import { Event, EventStatus } from '@/types/event.types'

const mockEvent: Event = {
  id: 1,
  title: 'Test Event',
  description: 'Test',
  type: 'sede_unica',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-15T18:00:00Z',
  status: 'draft' as EventStatus,
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

describe('useEventActions', () => {
  const mockOnViewDetail = jest.fn()
  const mockOnEditEvent = jest.fn()
  const mockOnDeleteEvent = jest.fn()
  const mockOnApproveInternal = jest.fn()
  const mockOnRequestPublicApproval = jest.fn()
  const mockOnPublishEvent = jest.fn()
  const mockOnRequestChanges = jest.fn()
  const mockOnApproveEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Actions', () => {
    it('should always include view detail action', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      expect(result.current.actions).toHaveLength(1)
      expect(result.current.actions[0].key).toBe('view')
      expect(result.current.actions[0].label).toBe('Ver Detalle')
      expect(result.current.actions[0].variant).toBe('secondary')
    })

    it('should call onViewDetail when view action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      result.current.actions[0].onClick()

      expect(mockOnViewDetail).toHaveBeenCalledWith(mockEvent.id)
      expect(mockOnViewDetail).toHaveBeenCalledTimes(1)
    })
  })

  describe('Approval Workflow Actions', () => {
    it('should include approve internal action when canApproveInternal returns true', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveInternal: mockOnApproveInternal,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const approveAction = result.current.actions.find((a) => a.key === 'approve-internal')
      expect(approveAction).toBeDefined()
      expect(approveAction?.label).toBe('Aprobar Interno')
      expect(approveAction?.variant).toBe('primary')
    })

    it('should call onApproveInternal when approve internal action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveInternal: mockOnApproveInternal,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const approveAction = result.current.actions.find((a) => a.key === 'approve-internal')
      approveAction?.onClick()

      expect(mockOnApproveInternal).toHaveBeenCalledWith(mockEvent)
    })

    it('should not include approve internal action when callback is missing', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const approveAction = result.current.actions.find((a) => a.key === 'approve-internal')
      expect(approveAction).toBeUndefined()
    })

    it('should include request public approval action when canRequestPublicApproval returns true', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onRequestPublicApproval: mockOnRequestPublicApproval,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => true,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const requestAction = result.current.actions.find((a) => a.key === 'request-public')
      expect(requestAction).toBeDefined()
      expect(requestAction?.label).toBe('Solicitar Publicación')
      expect(requestAction?.variant).toBe('primary')
    })

    it('should call onRequestPublicApproval when action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onRequestPublicApproval: mockOnRequestPublicApproval,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => true,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const requestAction = result.current.actions.find((a) => a.key === 'request-public')
      requestAction?.onClick()

      expect(mockOnRequestPublicApproval).toHaveBeenCalledWith(mockEvent)
    })

    it('should include publish action when canPublish returns true', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onPublishEvent: mockOnPublishEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => true,
          canRequestChanges: () => false,
        })
      )

      const publishAction = result.current.actions.find((a) => a.key === 'publish')
      expect(publishAction).toBeDefined()
      expect(publishAction?.label).toBe('Publicar')
      expect(publishAction?.variant).toBe('primary')
    })

    it('should call onPublishEvent when publish action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onPublishEvent: mockOnPublishEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => true,
          canRequestChanges: () => false,
        })
      )

      const publishAction = result.current.actions.find((a) => a.key === 'publish')
      publishAction?.onClick()

      expect(mockOnPublishEvent).toHaveBeenCalledWith(mockEvent)
    })

    it('should include request changes action when canRequestChanges returns true', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onRequestChanges: mockOnRequestChanges,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => true,
        })
      )

      const changesAction = result.current.actions.find((a) => a.key === 'request-changes')
      expect(changesAction).toBeDefined()
      expect(changesAction?.label).toBe('Solicitar Cambios')
      expect(changesAction?.variant).toBe('danger')
    })

    it('should call onRequestChanges when action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onRequestChanges: mockOnRequestChanges,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => true,
        })
      )

      const changesAction = result.current.actions.find((a) => a.key === 'request-changes')
      changesAction?.onClick()

      expect(mockOnRequestChanges).toHaveBeenCalledWith(mockEvent)
    })

    it('should include all approval workflow actions when all conditions are true', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveInternal: mockOnApproveInternal,
          onRequestPublicApproval: mockOnRequestPublicApproval,
          onPublishEvent: mockOnPublishEvent,
          onRequestChanges: mockOnRequestChanges,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => true,
          canPublish: () => true,
          canRequestChanges: () => true,
        })
      )

      expect(result.current.actions).toHaveLength(5) // view + 4 workflow actions
      expect(result.current.actions.find((a) => a.key === 'approve-internal')).toBeDefined()
      expect(result.current.actions.find((a) => a.key === 'request-public')).toBeDefined()
      expect(result.current.actions.find((a) => a.key === 'publish')).toBeDefined()
      expect(result.current.actions.find((a) => a.key === 'request-changes')).toBeDefined()
    })
  })

  describe('Legacy Approval', () => {
    it('should include legacy approve action when onApproveEvent is provided without onApproveInternal', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveEvent: mockOnApproveEvent,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const legacyAction = result.current.actions.find((a) => a.key === 'approve-legacy')
      expect(legacyAction).toBeDefined()
      expect(legacyAction?.label).toBe('Aprobar')
      expect(legacyAction?.variant).toBe('primary')
    })

    it('should call onApproveEvent when legacy approve action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveEvent: mockOnApproveEvent,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const legacyAction = result.current.actions.find((a) => a.key === 'approve-legacy')
      legacyAction?.onClick()

      expect(mockOnApproveEvent).toHaveBeenCalledWith(mockEvent)
    })

    it('should not include legacy approve action when onApproveInternal is provided', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveInternal: mockOnApproveInternal,
          onApproveEvent: mockOnApproveEvent,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const legacyAction = result.current.actions.find((a) => a.key === 'approve-legacy')
      expect(legacyAction).toBeUndefined()
    })
  })

  describe('Edit and Delete Actions', () => {
    it('should include edit action when onEditEvent is provided', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onEditEvent: mockOnEditEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const editAction = result.current.actions.find((a) => a.key === 'edit')
      expect(editAction).toBeDefined()
      expect(editAction?.label).toBe('Editar')
      expect(editAction?.variant).toBe('secondary')
    })

    it('should call onEditEvent when edit action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onEditEvent: mockOnEditEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const editAction = result.current.actions.find((a) => a.key === 'edit')
      editAction?.onClick()

      expect(mockOnEditEvent).toHaveBeenCalledWith(mockEvent)
    })

    it('should include delete action when onDeleteEvent is provided', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onDeleteEvent: mockOnDeleteEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const deleteAction = result.current.actions.find((a) => a.key === 'delete')
      expect(deleteAction).toBeDefined()
      expect(deleteAction?.label).toBe('Eliminar')
      expect(deleteAction?.variant).toBe('danger')
    })

    it('should call onDeleteEvent with event ID when delete action is clicked', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onDeleteEvent: mockOnDeleteEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const deleteAction = result.current.actions.find((a) => a.key === 'delete')
      deleteAction?.onClick()

      expect(mockOnDeleteEvent).toHaveBeenCalledWith(mockEvent.id)
    })

    it('should include both edit and delete actions when both callbacks are provided', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onEditEvent: mockOnEditEvent,
          onDeleteEvent: mockOnDeleteEvent,
          canApproveInternal: () => false,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      expect(result.current.actions).toHaveLength(3) // view + edit + delete
      expect(result.current.actions.find((a) => a.key === 'edit')).toBeDefined()
      expect(result.current.actions.find((a) => a.key === 'delete')).toBeDefined()
    })
  })

  describe('Complete Action Set', () => {
    it('should include all possible actions when all callbacks and conditions are provided', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onEditEvent: mockOnEditEvent,
          onDeleteEvent: mockOnDeleteEvent,
          onApproveInternal: mockOnApproveInternal,
          onRequestPublicApproval: mockOnRequestPublicApproval,
          onPublishEvent: mockOnPublishEvent,
          onRequestChanges: mockOnRequestChanges,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => true,
          canPublish: () => true,
          canRequestChanges: () => true,
        })
      )

      expect(result.current.actions).toHaveLength(7) // all actions
      expect(result.current.actions.map((a) => a.key)).toEqual([
        'view',
        'approve-internal',
        'request-public',
        'publish',
        'request-changes',
        'edit',
        'delete',
      ])
    })

    it('should maintain action order', () => {
      const { result } = renderHook(() =>
        useEventActions({
          event: mockEvent,
          onViewDetail: mockOnViewDetail,
          onApproveInternal: mockOnApproveInternal,
          onEditEvent: mockOnEditEvent,
          onDeleteEvent: mockOnDeleteEvent,
          canApproveInternal: () => true,
          canRequestPublicApproval: () => false,
          canPublish: () => false,
          canRequestChanges: () => false,
        })
      )

      const actionKeys = result.current.actions.map((a) => a.key)
      expect(actionKeys).toEqual(['view', 'approve-internal', 'edit', 'delete'])
    })
  })

  describe('Memoization', () => {
    it('should memoize actions based on dependencies', () => {
      const props = {
        event: mockEvent,
        onViewDetail: mockOnViewDetail,
        canApproveInternal: () => false,
        canRequestPublicApproval: () => false,
        canPublish: () => false,
        canRequestChanges: () => false,
      }

      const { result, rerender } = renderHook(() => useEventActions(props))

      const firstActions = result.current.actions

      rerender()

      expect(result.current.actions).toBe(firstActions)
    })

    it('should update actions when event changes', () => {
      let event = mockEvent

      const { result, rerender } = renderHook(
        ({ ev }) =>
          useEventActions({
            event: ev,
            onViewDetail: mockOnViewDetail,
            canApproveInternal: () => false,
            canRequestPublicApproval: () => false,
            canPublish: () => false,
            canRequestChanges: () => false,
          }),
        { initialProps: { ev: event } }
      )

      const firstActions = result.current.actions

      // Update event
      event = { ...mockEvent, id: 2 }
      rerender({ ev: event })

      expect(result.current.actions).not.toBe(firstActions)
      expect(result.current.actions[0].key).toBe('view')
    })

    it('should update actions when permission functions change', () => {
      let canApprove = false

      const { result, rerender } = renderHook(
        ({ canApproveInternal }) =>
          useEventActions({
            event: mockEvent,
            onViewDetail: mockOnViewDetail,
            onApproveInternal: mockOnApproveInternal,
            canApproveInternal,
            canRequestPublicApproval: () => false,
            canPublish: () => false,
            canRequestChanges: () => false,
          }),
        { initialProps: { canApproveInternal: () => canApprove } }
      )

      expect(result.current.actions.find((a) => a.key === 'approve-internal')).toBeUndefined()

      // Update permission
      canApprove = true
      rerender({ canApproveInternal: () => canApprove })

      expect(result.current.actions.find((a) => a.key === 'approve-internal')).toBeDefined()
    })
  })
})
