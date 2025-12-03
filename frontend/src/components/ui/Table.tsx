/**
 * Table Component - Minimalist Design System
 * Clean, accessible table with loading states and pagination
 */

'use client'

import type { ReactNode } from 'react'
import { Pagination, Button, Skeleton, EmptyState, EmptyStateIcons } from '@/components/ui'
import { PermissionGate } from '@/components/auth/PermissionGate'
import type { Permission } from '@/types/auth.types'
import type { Event } from '@/types/event.types'
import type { User } from '@/types/auth.types'
import type { TablePaginationProps } from '@/types/pagination.types'

type TableDataType = Event | User

export interface TableColumn<T extends TableDataType = TableDataType> {
  key: string
  label: string
  className?: string
  render?: (item: T, index: number) => ReactNode
  sortable?: boolean
  visible?: boolean
}

export interface TableAction<T extends TableDataType = TableDataType> {
  key: string
  label: string
  icon?: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  condition?: (item: T, index: number) => boolean
  permission?: Permission
  onClick: (item: T, index: number) => void
}

export interface TableProps<T extends TableDataType = TableDataType> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: TablePaginationProps
  actions?: TableAction<T>[]
  onRowClick?: (item: T, index: number) => void
  emptyStateMessage?: string
  emptyStateDescription?: string
  emptyStateIcon?: ReactNode
  emptyStateAction?: ReactNode
  className?: string
  tableClassName?: string
  headerClassName?: string
  bodyClassName?: string
  rowClassName?: string | ((item: T, index: number) => string)
  selectable?: boolean
  selectedItems?: T[]
  onSelectionChange?: (items: T[]) => void
  getItemId?: (item: T) => string | number
}

const TableSkeleton = ({ columns }: { columns: number }) => (
  <div className="divide-y divide-neutral-100">
    {Array.from({ length: 5 }).map((_, rowIndex) => (
      <div key={rowIndex} className="px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={colIndex === 0 ? '25%' : '15%'}
            height={14}
          />
        ))}
      </div>
    ))}
  </div>
)

export const Table = <T extends TableDataType>({
  columns,
  data,
  loading = false,
  pagination,
  actions = [],
  onRowClick,
  emptyStateMessage = 'No hay datos disponibles',
  emptyStateDescription,
  emptyStateIcon,
  emptyStateAction,
  className = '',
  tableClassName = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = '',
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId,
}: TableProps<T>) => {
  const visibleColumns = columns.filter(col => col.visible !== false)

  const finalColumns = selectable
    ? [{ key: '__selection', label: '', className: 'w-10' }, ...visibleColumns]
    : visibleColumns

  if (actions.length > 0) {
    finalColumns.push({
      key: '__actions',
      label: 'Acciones',
      className: 'text-right w-28',
    })
  }

  const isSelected = (item: T): boolean => {
    if (!selectable || !getItemId) return false
    const itemId = getItemId(item)
    return selectedItems.some(selected => getItemId(selected) === itemId)
  }

  const toggleSelection = (item: T) => {
    if (!selectable || !getItemId || !onSelectionChange) return

    const itemId = getItemId(item)
    const currentlySelected = isSelected(item)

    if (currentlySelected) {
      onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== itemId))
    } else {
      onSelectionChange([...selectedItems, item])
    }
  }

  const toggleSelectAll = () => {
    if (!selectable || !getItemId || !onSelectionChange) return

    if (selectedItems.length === data.length) {
      onSelectionChange([])
    } else {
      onSelectionChange([...data])
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-neutral-200 overflow-hidden ${className}`}>
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200">
          <div className="flex gap-4">
            {finalColumns.map((col, i) => (
              <Skeleton key={col.key} variant="text" width={i === 0 ? '20%' : '12%'} height={12} />
            ))}
          </div>
        </div>
        <TableSkeleton columns={finalColumns.length} />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
        <EmptyState
          icon={emptyStateIcon || EmptyStateIcons.inbox}
          title={emptyStateMessage}
          description={emptyStateDescription}
          action={emptyStateAction}
          size="md"
        />
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-neutral-200 ${tableClassName}`}>
          <thead className={`bg-neutral-50 ${headerClassName}`}>
            <tr>
              {finalColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.key === '__selection' && selectable ? (
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedItems.length === data.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/20"
                      aria-label="Seleccionar todos los elementos"
                    />
                  ) : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-neutral-100 ${bodyClassName}`}>
            {data.map((item, index) => {
              const computedRowClassName = typeof rowClassName === 'function'
                ? rowClassName(item, index)
                : rowClassName

              return (
                <tr
                  key={getItemId ? getItemId(item) : index}
                  className={`
                    transition-colors duration-150
                    ${onRowClick ? 'cursor-pointer hover:bg-neutral-50' : 'hover:bg-neutral-50/50'}
                    ${isSelected(item) ? 'bg-primary-50/50' : ''}
                    ${computedRowClassName}
                  `}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {finalColumns.map((column) => (
                    <td
                      key={`${column.key}-${index}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                    >
                      {column.key === '__selection' && selectable ? (
                        <input
                          type="checkbox"
                          checked={isSelected(item)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleSelection(item)
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/20"
                          aria-label="Seleccionar fila"
                        />
                      ) : column.key === '__actions' ? (
                        <div className="flex items-center justify-end gap-1">
                          {actions
                            .filter(action => !action.condition || action.condition(item, index))
                            .map((action) => {
                              const ActionButton = (
                                <Button
                                  key={action.key}
                                  variant={action.variant || 'ghost'}
                                  size={action.size || 'sm'}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    action.onClick(item, index)
                                  }}
                                  className={action.className}
                                  title={action.label}
                                  leftIcon={action.icon}
                                >
                                  {action.size === 'sm' ? null : action.label}
                                </Button>
                              )

                              if (action.permission) {
                                return (
                                  <PermissionGate key={action.key} permission={action.permission}>
                                    {ActionButton}
                                  </PermissionGate>
                                )
                              }

                              return ActionButton
                            })}
                        </div>
                      ) : column.render ? (
                        column.render(item, index)
                      ) : (
                        <span className="text-neutral-900">
                          {String(item[column.key as keyof T] || '—')}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="border-t border-neutral-200">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  )
}

export default Table
