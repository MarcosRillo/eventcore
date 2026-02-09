/**
 * Tests for ApprovalActionPanel component
 *
 * Tests the approval action buttons and comment input.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { ApprovalActionPanel } from '@/features/entity-admin/components/dumb/ApprovalActionPanel';
import type { ApprovalAction } from '@/features/entity-admin/types';

describe('ApprovalActionPanel', () => {
  const defaultProps = {
    availableActions: ['approve_internal', 'request_changes', 'reject'] as ApprovalAction[],
    selectedAction: null as ApprovalAction | null,
    comment: '',
    commentError: null as string | null,
    isLoading: false,
    currentStatus: 'pending_internal_approval' as const,
    onActionSelect: jest.fn(),
    onCommentChange: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders current status badge', () => {
    render(<ApprovalActionPanel {...defaultProps} />);
    expect(screen.getByText('Pendiente Aprobación Interna')).toBeInTheDocument();
  });

  test('renders all available action buttons', () => {
    render(<ApprovalActionPanel {...defaultProps} />);

    expect(screen.getByText('Aprobar para Calendario Interno')).toBeInTheDocument();
    expect(screen.getByText('Solicitar Correcciones')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  test('calls onActionSelect when action button is clicked', () => {
    render(<ApprovalActionPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Aprobar para Calendario Interno'));

    expect(defaultProps.onActionSelect).toHaveBeenCalledWith('approve_internal');
  });

  test('shows textarea when action requiring comment is selected', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="request_changes"
      />
    );

    expect(screen.getByPlaceholderText(/Escribe el motivo/)).toBeInTheDocument();
  });

  test('does not show textarea for actions not requiring comment', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="approve_internal"
      />
    );

    expect(screen.queryByPlaceholderText(/Escribe el motivo/)).not.toBeInTheDocument();
  });

  test('calls onCommentChange when typing in textarea', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="request_changes"
      />
    );

    const textarea = screen.getByPlaceholderText(/Escribe el motivo/);
    fireEvent.change(textarea, { target: { value: 'Necesita más detalles' } });

    expect(defaultProps.onCommentChange).toHaveBeenCalledWith('Necesita más detalles');
  });

  test('displays comment error when provided', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="request_changes"
        commentError="El comentario debe tener al menos 10 caracteres"
      />
    );

    expect(screen.getByText('El comentario debe tener al menos 10 caracteres')).toBeInTheDocument();
  });

  test('shows confirm and cancel buttons when action is selected', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="approve_internal"
      />
    );

    // Confirm button now shows the action label instead of generic "Confirmar"
    const buttons = screen.getAllByRole('button');
    const cancelBtn = buttons.find(btn => btn.textContent?.includes('Cancelar'));
    const confirmBtn = buttons.find(btn => btn.textContent?.includes('Aprobar para Calendario Interno') && btn.getAttribute('aria-pressed') === null);
    expect(cancelBtn).toBeInTheDocument();
    expect(confirmBtn).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="approve_internal"
      />
    );

    // The confirm button is the one with the action label in the confirm/cancel section
    const cancelBtn = screen.getByText('Cancelar');
    const confirmSection = cancelBtn.closest('div');
    const confirmBtn = confirmSection?.querySelector('button:last-child');
    expect(confirmBtn).toBeTruthy();
    fireEvent.click(confirmBtn!);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="approve_internal"
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  test('disables buttons when loading', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="approve_internal"
        isLoading={true}
      />
    );

    // All action buttons should be disabled when loading
    const actionButtons = screen.getAllByRole('button').filter(btn => btn.getAttribute('aria-pressed') !== null);
    actionButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  test('renders no actions message when no actions available', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        availableActions={[]}
      />
    );

    expect(screen.getByText(/No hay acciones disponibles/)).toBeInTheDocument();
  });

  test('highlights selected action button with aria-pressed', () => {
    render(
      <ApprovalActionPanel
        {...defaultProps}
        selectedAction="approve_internal"
      />
    );

    const actionButton = screen.getAllByRole('button').find(
      btn => btn.getAttribute('aria-pressed') === 'true'
    );
    expect(actionButton).toBeTruthy();
    expect(actionButton).toHaveClass('ring-2');
  });
});
