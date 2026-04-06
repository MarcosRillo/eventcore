/**
 * Common Utilities
 * Shared utility functions used across the application
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Utility for combining class names with conditional logic
 * @param {...any} inputs
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Date format presets
 */
export type DateFormatPreset = 'short' | 'long' | 'time' | 'full'

/**
 * Preset options for date formatting - hoisted as module constant for performance
 */
const DATE_FORMAT_PRESETS: Record<DateFormatPreset, Intl.DateTimeFormatOptions> = {
  short: {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
  long: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  time: {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  full: {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
}

/**
 * Format date to localized string using Intl.DateTimeFormat
 *
 * @param date - Date string or Date object
 * @param preset - Format preset ('short', 'long', 'time', 'full') or custom options
 * @returns Formatted date string in Spanish locale
 *
 * @example
 * ```ts
 * formatDate('2025-11-15', 'short')  // "15 nov 2025"
 * formatDate('2025-11-15', 'long')   // "15 de noviembre de 2025"
 * formatDate('2025-11-15T14:00', 'time')  // "15 nov 2025, 14:00"
 * formatDate('2025-11-15', { month: 'numeric' })  // Custom options
 * ```
 */
export function formatDate(
  date: string | Date,
  preset?: DateFormatPreset | Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Handle preset string
  if (typeof preset === 'string') {
    const options = DATE_FORMAT_PRESETS[preset];
    return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
  }

  // Handle custom options or default
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...preset }).format(dateObj);
}

/**
 * Capitalize first letter of a string
 * @param str
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate initials from a name
 * @param name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text to specified length
 * @param text
 * @param maxLength
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format file size to human readable format
 * @param bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate email format
 * @param email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep function for async operations
 * @param ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
