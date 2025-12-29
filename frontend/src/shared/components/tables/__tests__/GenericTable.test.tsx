/**
 * GenericTable Tests
 * Comprehensive tests for the reusable table component
 */

import { render, screen, fireEvent, within } from '@testing-library/react';

import { GenericTable } from '@/shared/components/tables/GenericTable';
import type {
  TableColumnConfig,
  TableActionConfig,
  ConfirmDialogData,
} from '@/shared/components/tables/types';
import { PaginationMeta } from '@/types/api-response.types';

// Test item type
interface TestItem {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Mock data
const mockItems: TestItem[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', createdAt: '2025-01-01' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', createdAt: '2025-01-02' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'active', createdAt: '2025-01-03' },
];

const mockColumns: TableColumnConfig<TestItem>[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Estado' },
];

const mockActions: TableActionConfig<TestItem>[] = [
  {
    key: 'edit',
    label: 'Editar',
    icon: <span data-testid="edit-icon">E</span>,
    variant: 'secondary',
    onClick: jest.fn(),
  },
  {
    key: 'delete',
    label: 'Eliminar',
    icon: <span data-testid="delete-icon">D</span>,
    variant: 'danger',
    onClick: jest.fn(),
  },
];

const mockPagination: PaginationMeta = {
  current_page: 1,
  last_page: 3,
  per_page: 10,
  total: 25,
  from: 1,
  to: 10,
  path: '/api/items',
  links: [],
};

describe('GenericTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading skeleton when isLoading is true', () => {
      render(
        <GenericTable<TestItem>
          items={[]}
          columns={mockColumns}
          actions={[]}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('generic-table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('table-empty')).not.toBeInTheDocument();
    });

    it('renders correct number of skeleton rows based on skeletonRows prop', () => {
      render(
        <GenericTable<TestItem>
          items={[]}
          columns={mockColumns}
          actions={[]}
          isLoading={true}
          skeletonRows={8}
        />
      );

      const skeleton = screen.getByTestId('table-skeleton');
      const rows = skeleton.querySelectorAll('.divide-y > div');
      expect(rows).toHaveLength(8);
    });

    it('renders skeleton columns matching visible columns plus actions', () => {
      render(
        <GenericTable<TestItem>
          items={[]}
          columns={mockColumns}
          actions={mockActions}
          isLoading={true}
        />
      );

      const skeleton = screen.getByTestId('table-skeleton');
      const firstRow = skeleton.querySelector('.divide-y > div');
      const cols = firstRow?.querySelectorAll('.flex-1');
      // 3 columns + 1 actions column = 4
      expect(cols).toHaveLength(4);
    });
  });

  describe('Empty State', () => {
    it('renders empty state when items array is empty', () => {
      render(
        <GenericTable<TestItem>
          items={[]}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('table-empty')).toBeInTheDocument();
      expect(screen.queryByTestId('table-skeleton')).not.toBeInTheDocument();
      expect(screen.queryByTestId('generic-table')).not.toBeInTheDocument();
    });

    it('renders default empty message', () => {
      render(
        <GenericTable<TestItem>
          items={[]}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByText('No hay elementos disponibles')).toBeInTheDocument();
    });

    it('renders custom empty message when provided', () => {
      const customMessage = 'No se encontraron usuarios';
      render(
        <GenericTable<TestItem>
          items={[]}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          emptyMessage={customMessage}
        />
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('renders table with items when not loading and has data', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('generic-table')).toBeInTheDocument();
      expect(screen.queryByTestId('table-skeleton')).not.toBeInTheDocument();
      expect(screen.queryByTestId('table-empty')).not.toBeInTheDocument();
    });

    it('renders column headers correctly', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });

    it('renders Acciones header when actions are provided', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={mockActions}
          isLoading={false}
        />
      );

      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('does not render Acciones header when no actions', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    });

    it('renders all item rows', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-3')).toBeInTheDocument();
    });

    it('renders item data in cells', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      // Two items have 'active' status, so we use getAllByText
      expect(screen.getAllByText('active')).toHaveLength(2);
    });

    it('applies custom testId', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          testId="users-table"
        />
      );

      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('generic-table')).toHaveClass('custom-class');
    });
  });

  describe('Column Visibility', () => {
    it('hides columns with visible: false', () => {
      const columnsWithHidden: TableColumnConfig<TestItem>[] = [
        { key: 'name', label: 'Nombre', visible: true },
        { key: 'email', label: 'Email', visible: false },
        { key: 'status', label: 'Estado', visible: true },
      ];

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={columnsWithHidden}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });

    it('shows columns with visible: undefined (default true)', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      // All columns should be visible by default
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });
  });

  describe('Custom Render Functions', () => {
    it('uses custom render function when provided', () => {
      const columnsWithRender: TableColumnConfig<TestItem>[] = [
        {
          key: 'status',
          label: 'Estado',
          render: (item) => (
            <span data-testid={`status-badge-${item.id}`} className="badge">
              {item.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          ),
        },
      ];

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={columnsWithRender}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('status-badge-1')).toHaveTextContent('Activo');
      expect(screen.getByTestId('status-badge-2')).toHaveTextContent('Inactivo');
      expect(screen.getByTestId('status-badge-3')).toHaveTextContent('Activo');
    });

    it('renders dash for null/undefined values without custom render', () => {
      const itemsWithNull: TestItem[] = [
        { id: 1, name: 'Test', email: '', status: 'active', createdAt: '2025-01-01' },
      ];

      const columnsWithNull: TableColumnConfig<TestItem>[] = [
        { key: 'name', label: 'Nombre' },
        { key: 'unknownKey' as keyof TestItem, label: 'Unknown' },
      ];

      render(
        <GenericTable<TestItem>
          items={itemsWithNull}
          columns={columnsWithNull}
          actions={[]}
          isLoading={false}
        />
      );

      // The unknown key should render a dash
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders action buttons for each row', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={mockActions}
          isLoading={false}
        />
      );

      // Each row should have edit and delete buttons
      expect(screen.getAllByTestId('edit-icon')).toHaveLength(3);
      expect(screen.getAllByTestId('delete-icon')).toHaveLength(3);
    });

    it('calls onClick handler with correct item', () => {
      const editHandler = jest.fn();
      const deleteHandler = jest.fn();

      const actions: TableActionConfig<TestItem>[] = [
        {
          key: 'edit',
          label: 'Editar',
          icon: <span data-testid="edit-icon">E</span>,
          onClick: editHandler,
        },
        {
          key: 'delete',
          label: 'Eliminar',
          icon: <span data-testid="delete-icon">D</span>,
          onClick: deleteHandler,
        },
      ];

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={actions}
          isLoading={false}
        />
      );

      // Click edit on first row
      const editButtons = screen.getAllByTitle('Editar');
      fireEvent.click(editButtons[0]);

      expect(editHandler).toHaveBeenCalledTimes(1);
      expect(editHandler).toHaveBeenCalledWith(mockItems[0]);

      // Click delete on second row
      const deleteButtons = screen.getAllByTitle('Eliminar');
      fireEvent.click(deleteButtons[1]);

      expect(deleteHandler).toHaveBeenCalledTimes(1);
      expect(deleteHandler).toHaveBeenCalledWith(mockItems[1]);
    });

    it('respects action condition function', () => {
      const actionsWithCondition: TableActionConfig<TestItem>[] = [
        {
          key: 'activate',
          label: 'Activar',
          icon: <span data-testid="activate-icon">A</span>,
          condition: (item) => item.status === 'inactive',
          onClick: jest.fn(),
        },
        {
          key: 'deactivate',
          label: 'Desactivar',
          icon: <span data-testid="deactivate-icon">D</span>,
          condition: (item) => item.status === 'active',
          onClick: jest.fn(),
        },
      ];

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={actionsWithCondition}
          isLoading={false}
        />
      );

      // Only inactive items should show activate button (1 item: Jane)
      expect(screen.getAllByTestId('activate-icon')).toHaveLength(1);
      // Only active items should show deactivate button (2 items: John, Bob)
      expect(screen.getAllByTestId('deactivate-icon')).toHaveLength(2);
    });
  });

  describe('Pagination', () => {
    it('renders pagination when pagination prop is provided', () => {
      const onPageChange = jest.fn();

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          pagination={mockPagination}
          onPageChange={onPageChange}
        />
      );

      // Look for pagination info text
      expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
    });

    it('does not render pagination when pagination is null', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          pagination={null}
        />
      );

      expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    });

    it('does not render pagination when total is 0', () => {
      const emptyPagination: PaginationMeta = {
        ...mockPagination,
        total: 0,
      };

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          pagination={emptyPagination}
          onPageChange={jest.fn()}
        />
      );

      expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    });

    it('calls onPageChange when page button is clicked', () => {
      const onPageChange = jest.fn();

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          pagination={mockPagination}
          onPageChange={onPageChange}
        />
      );

      // Click next page button
      const nextButton = screen.getByLabelText('Siguiente');
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Confirm Dialog', () => {
    const mockConfirmDialog: ConfirmDialogData = {
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar este elemento?',
      onConfirm: jest.fn(),
    };

    it('renders confirm dialog when provided and open', () => {
      const onCloseConfirmDialog = jest.fn();

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          confirmDialog={mockConfirmDialog}
          onCloseConfirmDialog={onCloseConfirmDialog}
        />
      );

      expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();
      expect(screen.getByText('¿Estás seguro de eliminar este elemento?')).toBeInTheDocument();
    });

    it('does not render confirm dialog when closed', () => {
      const closedDialog: ConfirmDialogData = {
        ...mockConfirmDialog,
        isOpen: false,
      };

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
          confirmDialog={closedDialog}
          onCloseConfirmDialog={jest.fn()}
        />
      );

      expect(screen.queryByText('Confirmar eliminación')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure with semantic elements', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
    });

    it('action buttons have aria-label for accessibility', () => {
      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={mockColumns}
          actions={mockActions}
          isLoading={false}
        />
      );

      const editButtons = screen.getAllByLabelText('Editar');
      const deleteButtons = screen.getAllByLabelText('Eliminar');

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles items with string ids', () => {
      interface StringIdItem {
        id: string;
        name: string;
      }

      const stringItems: StringIdItem[] = [
        { id: 'abc-123', name: 'Item 1' },
        { id: 'def-456', name: 'Item 2' },
      ];

      const stringColumns: TableColumnConfig<StringIdItem>[] = [
        { key: 'name', label: 'Nombre' },
      ];

      render(
        <GenericTable<StringIdItem>
          items={stringItems}
          columns={stringColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getByTestId('table-row-abc-123')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-def-456')).toBeInTheDocument();
    });

    it('handles single item', () => {
      render(
        <GenericTable<TestItem>
          items={[mockItems[0]]}
          columns={mockColumns}
          actions={[]}
          isLoading={false}
        />
      );

      expect(screen.getAllByRole('row')).toHaveLength(2); // 1 header + 1 data row
    });

    it('handles large number of actions', () => {
      const manyActions: TableActionConfig<TestItem>[] = Array.from(
        { length: 5 },
        (_, i) => ({
          key: `action-${i}`,
          label: `Action ${i}`,
          icon: <span data-testid={`action-icon-${i}`}>{i}</span>,
          onClick: jest.fn(),
        })
      );

      render(
        <GenericTable<TestItem>
          items={[mockItems[0]]}
          columns={mockColumns}
          actions={manyActions}
          isLoading={false}
        />
      );

      // All 5 action buttons should be rendered
      for (let i = 0; i < 5; i++) {
        expect(screen.getByTestId(`action-icon-${i}`)).toBeInTheDocument();
      }
    });

    it('applies column className to both header and cells', () => {
      const columnsWithClass: TableColumnConfig<TestItem>[] = [
        { key: 'name', label: 'Nombre', className: 'custom-column-class' },
      ];

      render(
        <GenericTable<TestItem>
          items={mockItems}
          columns={columnsWithClass}
          actions={[]}
          isLoading={false}
        />
      );

      // Header should have the class
      const header = screen.getByRole('columnheader', { name: 'Nombre' });
      expect(header).toHaveClass('custom-column-class');

      // Cells should also have the class
      const row1 = screen.getByTestId('table-row-1');
      const cells = within(row1).getAllByRole('cell');
      expect(cells[0]).toHaveClass('custom-column-class');
    });
  });
});
