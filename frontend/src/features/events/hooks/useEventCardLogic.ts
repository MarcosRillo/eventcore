/**
 * Event Card Logic Hook
 * Handles business logic for event card display and interactions
 */

import { useMemo } from 'react';

import { Event } from '@/types/event.types';

export const useEventCardLogic = (event: Event) => {
  // Date formatting logic
  const formattedDate = useMemo(() => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return {
        date: start.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        time: `${start.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })} - ${end.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
      };
    } else {
      return {
        date: `${start.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })} - ${end.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })}`,
        time: `${start.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
      };
    }
  }, [event.start_date, event.end_date]);

  // Status color logic
  const statusColor = useMemo(() => {
    const statusCode = typeof event.status === 'string' ? event.status : event.status?.status_code;

    switch (statusCode) {
      case 'pending_internal_approval':
      case 'pending_public_approval':
      case 'requires_changes':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'approved_internal':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, [event.status]);

  // Event status helper
  const getEventStatus = () => {
    return typeof event.status === 'string' ? event.status : event.status?.status_code;
  };

  // Business rules for actions
  const canApproveInternal = () => {
    return getEventStatus() === 'pending_internal_approval';
  };

  const canRequestPublicApproval = () => {
    return getEventStatus() === 'approved_internal';
  };

  const canPublish = () => {
    return getEventStatus() === 'pending_public_approval';
  };

  const canRequestChanges = () => {
    const status = getEventStatus();
    return status === 'pending_internal_approval' || status === 'pending_public_approval';
  };

  return {
    formattedDate,
    statusColor,
    getEventStatus,
    canApproveInternal,
    canRequestPublicApproval,
    canPublish,
    canRequestChanges
  };
};