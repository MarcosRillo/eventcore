/**
 * useGenericModals Hook
 * Generic modal state management - reusable for any entity type
 *
 * Usage:
 * const { currentItem, isEditModalOpen, openEditModal, closeAllModals } = useGenericModals<Event>();
 */

'use client';

import { useCallback,useState } from 'react';

interface UseGenericModalsOptions {
  /** Enable approval modal state (default: false) */
  withApprovalModal?: boolean;
}

interface UseGenericModalsReturn<T> {
  // State
  currentItem: T | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isDetailsModalOpen: boolean;
  isApprovalModalOpen?: boolean;

  // Actions
  openCreateModal: () => void;
  openEditModal: (item: T) => void;
  openDeleteModal: (item: T) => void;
  openDetailsModal: (item: T) => void;
  openApprovalModal?: (item: T) => void;
  closeAllModals: () => void;
  setCurrentItem: (item: T | null) => void;
}

/**
 *
 * @param options
 */
export function useGenericModals<T>(
  options: UseGenericModalsOptions = {}
): UseGenericModalsReturn<T> {
  const { withApprovalModal = false } = options;

  // Modal state
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Modal actions
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: T) => {
    setCurrentItem(item);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((item: T) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  }, []);

  const openDetailsModal = useCallback((item: T) => {
    setCurrentItem(item);
    setIsDetailsModalOpen(true);
  }, []);

  const openApprovalModal = useCallback((item: T) => {
    setCurrentItem(item);
    setIsApprovalModalOpen(true);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsApprovalModalOpen(false);
    setCurrentItem(null);
  }, []);

  // Base return object
  const result: UseGenericModalsReturn<T> = {
    // State
    currentItem,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isDetailsModalOpen,

    // Actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openDetailsModal,
    closeAllModals,
    setCurrentItem,
  };

  // Add approval modal if enabled
  if (withApprovalModal) {
    result.isApprovalModalOpen = isApprovalModalOpen;
    result.openApprovalModal = openApprovalModal;
  }

  return result;
}
