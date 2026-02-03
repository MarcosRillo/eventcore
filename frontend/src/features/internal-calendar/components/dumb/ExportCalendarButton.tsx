/**
 * ExportCalendarButton - Dumb Component
 *
 * Button to export events to ICS format for calendar apps.
 */

'use client';

import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';
import { downloadICS } from '@/features/internal-calendar/utils/icsGenerator';

export interface ExportCalendarButtonProps {
  events: InternalCalendarEvent[];
  disabled?: boolean;
}

export function ExportCalendarButton({
  events,
  disabled = false,
}: ExportCalendarButtonProps) {
  const handleExport = () => {
    if (events.length === 0) return;
    downloadICS(events);
  };

  const isDisabled = disabled || events.length === 0;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
      aria-label="Exportar calendario"
      title={events.length === 0 ? 'No hay eventos para exportar' : `Exportar ${events.length} eventos`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span className="hidden sm:inline">Exportar</span>
      <span className="text-xs bg-blue-700 px-1.5 py-0.5 rounded">
        {events.length}
      </span>
    </button>
  );
}
