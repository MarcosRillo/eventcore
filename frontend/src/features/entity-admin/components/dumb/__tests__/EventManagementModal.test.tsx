/**
 * Tests for EventManagementModal component
 *
 * Tests the main modal shell that combines all approval UI elements.
 */

import { render, screen } from '@testing-library/react';
import { EventManagementModal } from '../EventManagementModal';
import type { Event } from '@/types/event.types';

describe('EventManagementModal', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    start_date: '2025-03-15T10:00:00',
    end_date: '2025-03-15T18:00:00',
    type: 'sede_unica',
    status: 'pending_internal_approval',
    locations: [],
    is_featured: false,
    approval_history: [],
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  };

  const defaultProps = {
    isOpen: true,
    event: mockEvent,
    onClose: jest.fn(),
  };

  test('renders modal when open', () => {
    render(
      <EventManagementModal {...defaultProps}>
        <div>Modal content</div>
      </EventManagementModal>
    );

    expect(screen.getByText('Gestionar Evento')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <EventManagementModal {...defaultProps} isOpen={false}>
        <div>Modal content</div>
      </EventManagementModal>
    );

    expect(screen.queryByText('Gestionar Evento')).not.toBeInTheDocument();
  });

  test('renders event title in header', () => {
    render(
      <EventManagementModal {...defaultProps}>
        <div>Modal content</div>
      </EventManagementModal>
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <EventManagementModal {...defaultProps}>
        <div data-testid="modal-content">Custom content</div>
      </EventManagementModal>
    );

    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  test('renders status badge in header', () => {
    render(
      <EventManagementModal {...defaultProps}>
        <div>Modal content</div>
      </EventManagementModal>
    );

    expect(screen.getByText('Pendiente Aprobación Interna')).toBeInTheDocument();
  });

  test('handles null event gracefully', () => {
    render(
      <EventManagementModal {...defaultProps} event={null}>
        <div>Modal content</div>
      </EventManagementModal>
    );

    // Should not crash, modal should not render content
    expect(screen.queryByText('Gestionar Evento')).not.toBeInTheDocument();
  });
});
