/**
 * Pagination Component - Minimalist Design System
 * Clean pagination with subtle styling
 */

'use client'

import { Fragment } from 'react'
import type { SimplePaginationProps, AdvancedPaginationProps } from '@/types/pagination.types'

type PaginationProps = SimplePaginationProps | AdvancedPaginationProps

function isAdvancedPagination(props: PaginationProps): props is AdvancedPaginationProps {
  return 'lastPage' in props && 'total' in props && 'perPage' in props
}

const Pagination = (props: PaginationProps) => {
  const {
    currentPage,
    onPageChange,
    showInfo = true,
    className = '',
  } = props

  let totalPages: number
  let totalItems: number | undefined
  let perPage: number | undefined
  let onPerPageChange: ((perPage: number) => void) | undefined
  let showPerPageSelector: boolean

  if (isAdvancedPagination(props)) {
    totalPages = props.lastPage
    totalItems = props.total
    perPage = props.perPage
    onPerPageChange = props.onPerPageChange
    showPerPageSelector = true
  } else {
    totalPages = props.totalPages
    totalItems = props.totalItems
    perPage = undefined
    onPerPageChange = undefined
    showPerPageSelector = false
  }

  const itemsFrom = isAdvancedPagination(props)
    ? (currentPage - 1) * props.perPage + 1
    : props.itemsFrom || ((currentPage - 1) * 10 + 1)

  const itemsTo = isAdvancedPagination(props)
    ? Math.min(currentPage * props.perPage, props.total)
    : props.itemsTo || Math.min(currentPage * 10, totalItems || 0)

  const hasNextPage = isAdvancedPagination(props)
    ? currentPage < props.lastPage
    : props.hasNextPage ?? (currentPage < totalPages)

  const hasPrevPage = isAdvancedPagination(props)
    ? currentPage > 1
    : props.hasPrevPage ?? (currentPage > 1)

  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const getInfoText = (): string => {
    if (!showInfo || !totalItems) return ''
    if (totalItems === 0) return 'No hay elementos'
    return `Mostrando ${itemsFrom} a ${itemsTo} de ${totalItems}`
  }

  if (totalPages <= 1 && !showPerPageSelector) return null

  const baseButtonClasses = `
    inline-flex items-center justify-center
    px-3 py-2
    text-sm font-medium
    border border-neutral-200
    bg-white
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:z-10
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const activeButtonClasses = 'bg-primary-50 border-primary-200 text-primary-600 z-10'
  const inactiveButtonClasses = 'text-neutral-600 hover:bg-neutral-50'

  return (
    <div className={`px-4 py-3 flex items-center justify-between ${className}`}>
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={`${baseButtonClasses} rounded-md`}
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`${baseButtonClasses} rounded-md`}
        >
          Siguiente
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {showInfo && (
          <p className="text-sm text-neutral-500">{getInfoText()}</p>
        )}

        <div className="flex items-center gap-4">
          {showPerPageSelector && onPerPageChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="pagination-per-page" className="text-sm text-neutral-500">
                Mostrar:
              </label>
              <select
                id="pagination-per-page"
                value={perPage || 10}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="
                  border border-neutral-200 rounded-md
                  px-2 py-1.5
                  text-sm text-neutral-700
                  bg-white
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                "
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className={`${baseButtonClasses} rounded-l-md`}
                aria-label="Anterior"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {getVisiblePages().map((page, index) => (
                <Fragment key={index}>
                  {page === '...' ? (
                    <span className={`${baseButtonClasses} cursor-default`}>
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(Number(page))}
                      className={`
                        ${baseButtonClasses}
                        ${currentPage === page ? activeButtonClasses : inactiveButtonClasses}
                      `}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )}
                </Fragment>
              ))}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`${baseButtonClasses} rounded-r-md`}
                aria-label="Siguiente"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pagination
