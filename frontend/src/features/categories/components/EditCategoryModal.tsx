/**
 * EditCategoryModal Component - Migrated to FormModal pattern
 * Uses unified FormModal component for consistent form handling
 */

import { updateCategory, validateCategoryData } from '../services/category.service';
import { Category, UpdateCategoryData } from '@/types/category.types';
import { FormModal, FormSubmitHandler, FormValidator, Input, Textarea, ColorInput, Checkbox } from '@/components/ui';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
  onCategoryUpdated?: () => void;
}

// Form validator using existing validation service
const categoryValidator: FormValidator<UpdateCategoryData> = (data) => {
  return validateCategoryData(data);
};

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  category,
  onCategoryUpdated,
}) => {
  // Submit handler
  const handleSubmit: FormSubmitHandler<UpdateCategoryData> = async (formData) => {
    if (!category) {
      throw new Error('No se encontró la categoría a editar');
    }

    await updateCategory(category.id, {
      ...formData,
      description: formData.description?.trim() || undefined,
    });

    // Notify parent component
    if (onCategoryUpdated) {
      onCategoryUpdated();
    }
  };

  // Success handler
  const handleSuccess = () => {
    onSuccess();
  };

  // Create initial data from category
  const getInitialData = (): UpdateCategoryData => {
    if (!category) {
      return {
        name: '',
        description: '',
        color: '#3B82F6',
        is_active: true,
      };
    }

    return {
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      is_active: category.is_active,
    };
  };

  // Predefined colors for color picker
  const predefinedColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6B7280', // Gray
  ];

  if (!category) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title={`Editar Categoría: ${category.name}`}
      submitButtonText="Actualizar Categoría"
      initialData={getInitialData()}
      validator={categoryValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={false}
      closeOnSuccess={true}
      key={category.id} // Reset form when category changes
    >
      {({ formData, errors, isLoading, handleInputChange, handleFieldChange }) => (
        <>
          {/* Name Field */}
          <div>
            <Input
              label="Nombre *"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej. Reuniones"
              disabled={isLoading}
              error={errors.name}
              fullWidth
            />
          </div>

          {/* Description Field */}
          <div>
            <Textarea
              label="Descripción"
              id="description"
              name="description"
              value={formData.description ?? ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe el propósito de esta categoría..."
              disabled={isLoading}
              error={errors.description}
              fullWidth
            />
          </div>

          {/* Color Field */}
          <div>
            <ColorInput
              label="Color"
              value={formData.color || '#3B82F6'}
              onChange={(color) => handleFieldChange('color', color)}
              predefinedColors={predefinedColors}
              disabled={isLoading}
              error={errors.color}
            />
          </div>

          {/* Active Status */}
          <div>
            <Checkbox
              id="is_active"
              name="is_active"
              label="Categoría activa"
              checked={formData.is_active ?? true}
              onChange={(checked) => handleFieldChange('is_active', checked)}
              disabled={isLoading}
            />
          </div>
        </>
      )}
    </FormModal>
  );
};

export default EditCategoryModal;
