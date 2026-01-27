/**
 * CalendarToolbar Component (Dumb)
 *
 * Custom toolbar for react-big-calendar.
 * Provides navigation (Today, Previous, Next) and view switching (Month, Week, Day, Agenda).
 * Created following TDD methodology (tests written first).
 */

import type { ToolbarProps } from 'react-big-calendar'

/**
 * CalendarToolbar Props (matches ToolbarProps from react-big-calendar)
 */
export type CalendarToolbarProps = ToolbarProps<object, object>

/**
 * CalendarToolbar Component
 *
 * Custom toolbar for react-big-calendar with navigation and view switching.
 *
 * @param props - CalendarToolbar props
 * @param props.label
 * @param props.onNavigate
 * @param props.onView
 * @param props.view
 * @param props.views
 * @returns React component
 */
// Spanish labels for view names
const viewLabels: Record<string, string> = {
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
}

export function CalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
  views,
}: CalendarToolbarProps) {
  return (
    <div
      className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between"
      role="toolbar"
      aria-label="Calendar toolbar"
    >
      {/* Navigation buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Ir a hoy"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => onNavigate('PREV')}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Ir al anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => onNavigate('NEXT')}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Ir al siguiente"
        >
          ›
        </button>
      </div>

      {/* Current label (month/date) */}
      <div className="text-lg font-semibold text-gray-900">{label}</div>

      {/* View buttons */}
      <div className="flex gap-1">
        {Array.isArray(views) ? views.map((viewName) => (
          <button
            key={viewName}
            type="button"
            onClick={() => onView(viewName)}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              view === viewName
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            aria-label={`Ver ${viewLabels[viewName] || viewName}`}
            aria-pressed={view === viewName}
          >
            {viewLabels[viewName] || viewName}
          </button>
        )) : null}
      </div>
    </div>
  )
}
