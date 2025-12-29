/**
 * useAppearanceForm Hook
 * Contains ALL business logic for appearance form management
 * Components that use this hook should ONLY handle presentation
 */

import { useState, useEffect, useCallback } from 'react';

import { getAppearanceSettings, updateAppearanceSettings } from '@/features/appearance/services/appearance.service';
import { 
  UseAppearanceFormReturn, 
  AppearanceFormData, 
  DEFAULT_THEME
} from '@/types/appearance.types';

export const useAppearanceForm = (): UseAppearanceFormReturn => {
  // Form state
  const [data, setData] = useState<AppearanceFormData>(DEFAULT_THEME);
  const [originalData, setOriginalData] = useState<AppearanceFormData>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(originalData);

  /**
   * Load current appearance settings from server
   */
  const loadAppearanceSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const settingsData = await getAppearanceSettings();

      setData(settingsData);
      setOriginalData(settingsData);
    } catch {
      setError('Error al cargar la configuración de apariencia');
      
      // Use default values if loading fails
      setData(DEFAULT_THEME);
      setOriginalData(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a specific field in the form
   */
  const updateField = useCallback(<K extends keyof AppearanceFormData>(
    field: K,
    value: AppearanceFormData[K]
  ) => {
    setData(prevData => ({
      ...prevData,
      [field]: value
    }));

    // Clear any existing errors when user makes changes
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Submit form data to server
   */
  const handleSubmit = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Only send changed fields
      const changedFields: Partial<AppearanceFormData> = {};
      (Object.keys(data) as Array<keyof AppearanceFormData>).forEach(key => {
        if (data[key] !== originalData[key]) {
          const value = data[key];
          if (value !== undefined) {
            (changedFields as Record<string, string | null>)[key] = value;
          }
        }
      });

      // If no changes, don't make API call
      if (Object.keys(changedFields).length === 0) {
        return;
      }

      const updatedData = await updateAppearanceSettings(changedFields);

      // Update both current and original data
      setData(updatedData);
      setOriginalData(updatedData);
      
      // Success feedback could be handled by the component if needed
    } catch {
      setError('Error al actualizar la configuración de apariencia');
      throw new Error('Error al actualizar la configuración de apariencia');
    } finally {
      setIsSaving(false);
    }
  }, [data, originalData]);

  /**
   * Reset form to original loaded values
   */
  const resetForm = useCallback(() => {
    setData(originalData);
    setError(null);
  }, [originalData]);

  /**
   * Reset form to system defaults
   */
  const resetToDefaults = useCallback(() => {
    setData(DEFAULT_THEME);
    setError(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAppearanceSettings();
  }, [loadAppearanceSettings]);

  return {
    // State
    data,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    isValid: true, // Appearance form is always valid as all fields have defaults
    isDirty: hasUnsavedChanges,
    originalData,

    // Actions
    updateField,
    handleSubmit,
    resetForm,
    resetToDefaults,
    submit: handleSubmit, // Add submit method for FormActions compliance
    reset: resetForm, // Add reset method for FormActions compliance
    setError, // Add setError method for FormActions compliance
    validate: () => true, // Appearance form always validates successfully
  };
};
