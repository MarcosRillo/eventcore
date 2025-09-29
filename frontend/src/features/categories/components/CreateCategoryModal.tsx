/**
 * CreateCategoryModal Component - Migrated to FormModal pattern
 * Uses unified FormModal component for consistent form handling
 */

import { createCategory, validateCategoryData } from '../services/category.service';
import { CreateCategoryData } from '@/types/category.types';
import { FormModal, FormSubmitHandler, FormValidator, Input, Textarea, ColorInput, Checkbox } from '@/components/ui';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCategoryCreated?: () => void;
}

// Initial form data
const initialData: CreateCategoryData = {
  name: '',
  description: '',
  color: '#3B82F6',
  is_active: true,
};

// Form validator using existing validation service
const categoryValidator: FormValidator<CreateCategoryData> = (data) => {
  return validateCategoryData(data);
};

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCategoryCreated,
}) => {
  // Submit handler
  const handleSubmit: FormSubmitHandler<CreateCategoryData> = async (formData) => {
    await createCategory({
      ...formData,
      description: formData.description?.trim() || undefined,
    });

    // Notify parent component
    if (onCategoryCreated) {
      onCategoryCreated();
    }
  };

  // Success handler
  const handleSuccess = () => {
    onSuccess();
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title="Crear Nueva Categoría"
      submitButtonText="Crear Categoría"
      initialData={initialData}
      validator={categoryValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={true}
      closeOnSuccess={true}
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

export default CreateCategoryModal;