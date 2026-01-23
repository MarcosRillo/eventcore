/**
 * Tests for useGenericModals Hook
 * Generic modal state management hook - reusable for any entity type
 */

import { act,renderHook } from '@testing-library/react';

import { useGenericModals } from '@/shared/hooks/useGenericModals';

interface TestItem {
  id: number;
  name: string;
}

const mockItem: TestItem = { id: 1, name: 'Test Item' };
const mockItem2: TestItem = { id: 2, name: 'Test Item 2' };

describe('useGenericModals Hook', () => {
  describe('initial state', () => {
    it('should initialize with all modals closed', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(result.current.isDetailsModalOpen).toBe(false);
      expect(result.current.currentItem).toBeNull();
    });

    it('should return all required functions', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      expect(typeof result.current.openCreateModal).toBe('function');
      expect(typeof result.current.openEditModal).toBe('function');
      expect(typeof result.current.openDeleteModal).toBe('function');
      expect(typeof result.current.openDetailsModal).toBe('function');
      expect(typeof result.current.closeAllModals).toBe('function');
      expect(typeof result.current.setCurrentItem).toBe('function');
    });
  });

  describe('openCreateModal', () => {
    it('should open create modal', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.isCreateModalOpen).toBe(true);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(result.current.isDetailsModalOpen).toBe(false);
    });

    it('should not set currentItem when opening create modal', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.currentItem).toBeNull();
    });
  });

  describe('openEditModal', () => {
    it('should open edit modal with item', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.openEditModal(mockItem);
      });

      expect(result.current.isEditModalOpen).toBe(true);
      expect(result.current.currentItem).toEqual(mockItem);
      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isDeleteModalOpen).toBe(false);
    });

    it('should update currentItem when called with different item', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.openEditModal(mockItem);
      });

      expect(result.current.currentItem).toEqual(mockItem);

      act(() => {
        result.current.openEditModal(mockItem2);
      });

      expect(result.current.currentItem).toEqual(mockItem2);
    });
  });

  describe('openDeleteModal', () => {
    it('should open delete modal with item', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.openDeleteModal(mockItem);
      });

      expect(result.current.isDeleteModalOpen).toBe(true);
      expect(result.current.currentItem).toEqual(mockItem);
      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isEditModalOpen).toBe(false);
    });
  });

  describe('openDetailsModal', () => {
    it('should open details modal with item', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.openDetailsModal(mockItem);
      });

      expect(result.current.isDetailsModalOpen).toBe(true);
      expect(result.current.currentItem).toEqual(mockItem);
      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isDeleteModalOpen).toBe(false);
    });
  });

  describe('closeAllModals', () => {
    it('should close all modals and clear currentItem', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      // Open multiple modals
      act(() => {
        result.current.openCreateModal();
        result.current.openEditModal(mockItem);
        result.current.openDeleteModal(mockItem);
        result.current.openDetailsModal(mockItem);
      });

      // Close all
      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(result.current.isDetailsModalOpen).toBe(false);
      expect(result.current.currentItem).toBeNull();
    });
  });

  describe('setCurrentItem', () => {
    it('should allow setting currentItem directly', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.setCurrentItem(mockItem);
      });

      expect(result.current.currentItem).toEqual(mockItem);
    });

    it('should allow clearing currentItem', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>());

      act(() => {
        result.current.setCurrentItem(mockItem);
      });

      act(() => {
        result.current.setCurrentItem(null);
      });

      expect(result.current.currentItem).toBeNull();
    });
  });

  describe('with approval modal (extended)', () => {
    it('should support optional approval modal', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>({ withApprovalModal: true }));

      expect(result.current.isApprovalModalOpen).toBe(false);
      expect(typeof result.current.openApprovalModal).toBe('function');
    });

    it('should open approval modal with item', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>({ withApprovalModal: true }));

      act(() => {
        result.current.openApprovalModal?.(mockItem);
      });

      expect(result.current.isApprovalModalOpen).toBe(true);
      expect(result.current.currentItem).toEqual(mockItem);
    });

    it('should close approval modal with closeAllModals', () => {
      const { result } = renderHook(() => useGenericModals<TestItem>({ withApprovalModal: true }));

      act(() => {
        result.current.openApprovalModal?.(mockItem);
      });

      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.isApprovalModalOpen).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should work with complex item types', () => {
      interface ComplexItem {
        id: number;
        metadata: {
          tags: string[];
          created: Date;
        };
      }

      const complexItem: ComplexItem = {
        id: 1,
        metadata: {
          tags: ['test', 'complex'],
          created: new Date(),
        },
      };

      const { result } = renderHook(() => useGenericModals<ComplexItem>());

      act(() => {
        result.current.openEditModal(complexItem);
      });

      expect(result.current.currentItem).toEqual(complexItem);
      expect(result.current.currentItem?.metadata.tags).toContain('test');
    });
  });
});
