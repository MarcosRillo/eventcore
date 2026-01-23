/**
 * Generic Modal Management Hooks
 * Provides modal state management for single and multiple modals
 */

import { useCallback,useState } from 'react';

import { ModalId, ModalState } from '@/types/modal.types';

// Single modal hook
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// Multi-modal management hook
export const useMultiModal = () => {
  const [modals, setModals] = useState<ModalState>({});

  const openModal = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: true }));
  }, []);

  const closeModal = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: false }));
  }, []);

  const toggleModal = useCallback((id: ModalId) => {
    setModals(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  const isOpen = useCallback((id: ModalId) => Boolean(modals[id]), [modals]);

  const getOpenModals = useCallback(() => {
    return Object.entries(modals).filter(([, isOpen]) => isOpen).map(([id]) => id as ModalId);
  }, [modals]);

  return {
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isOpen,
    getOpenModals
  };
};

// Modal with data hook - for modals that need to pass data
export const useModalWithData = <T = unknown>(initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const openModal = useCallback((modalData?: T) => {
    setData(modalData || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const updateData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    updateData
  };
};