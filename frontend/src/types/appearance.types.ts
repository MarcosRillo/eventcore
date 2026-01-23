/**
 * Appearance Types
 * Theme and appearance configuration
 */

import type { FormHook } from '@/types/generic-infrastructure.types';

/**
 * Core theme settings - essential interface that cannot be reduced
 */
export interface ThemeSettings {
  logo_url?: string | null;
  banner_url?: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
}

// Type aliases for backward compatibility
export type AppearanceFormData = ThemeSettings;
export type AppearanceResponse = ThemeSettings;

// Use generic form hook with additional methods
export type UseAppearanceFormReturn = FormHook<ThemeSettings> & {
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  resetToDefaults?: () => void;
  handleSubmit?: () => Promise<void>;
  resetForm?: () => void;
};

// Default theme values - essential constant
export const DEFAULT_THEME: ThemeSettings = {
  logo_url: null,
  banner_url: null,
  color_primary: '#2563eb',
  color_secondary: '#64748b',
  color_background: '#ffffff',
  color_text: '#1e293b',
};