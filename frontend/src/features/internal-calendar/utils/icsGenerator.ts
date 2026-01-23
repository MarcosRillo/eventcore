/**
 * ICS (iCalendar) Generator
 *
 * Generates iCalendar (.ics) files for calendar export.
 * Compatible with Google Calendar, Apple Calendar, Outlook, etc.
 */

import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

/**
 * Format date to iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters in ICS text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a single VEVENT block
 */
function generateVEvent(event: InternalCalendarEvent): string {
  const uid = `event-${event.id}@plataforma-calendario`;
  const dtstart = formatICSDate(event.start_date);
  const dtend = formatICSDate(event.end_date);
  const summary = escapeICSText(event.title);
  const description = event.description ? escapeICSText(event.description) : '';
  const location = event.locations?.length
    ? escapeICSText(event.locations.map((l) => l.name).join(', '))
    : '';

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${description}`);
  }

  if (location) {
    lines.push(`LOCATION:${location}`);
  }

  if (event.organization) {
    lines.push(`ORGANIZER:${escapeICSText(event.organization.name)}`);
  }

  lines.push('END:VEVENT');

  return lines.join('\r\n');
}

/**
 * Generate ICS content from events
 */
export function generateICS(events: InternalCalendarEvent[]): string {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Plataforma Calendario//Eventos Turisticos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Calendario de Eventos',
  ].join('\r\n');

  const footer = 'END:VCALENDAR';

  const vevents = events.map(generateVEvent).join('\r\n');

  return `${header}\r\n${vevents}\r\n${footer}`;
}

/**
 * Download ICS file
 */
export function downloadICS(events: InternalCalendarEvent[], filename = 'calendario-eventos.ics'): void {
  const icsContent = generateICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate ICS for a single event
 */
export function downloadSingleEventICS(event: InternalCalendarEvent): void {
  const filename = `evento-${event.title.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.ics`;
  downloadICS([event], filename);
}
