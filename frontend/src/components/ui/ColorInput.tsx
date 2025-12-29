import Input from '@/components/ui/Input';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  predefinedColors?: string[];
  disabled?: boolean;
  error?: string;
  className?: string;
  required?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#6b7280', '#374151', '#111827'
  ],
  disabled = false,
  error,
  className = '',
  required = false,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Color input and text input */}
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-12 h-10 border rounded cursor-pointer ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          disabled={disabled}
          error={error}
          fullWidth
        />
      </div>
      
      {/* Predefined Colors */}
      {predefinedColors.length > 0 && (
        <div className="grid grid-cols-10 gap-1">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded border-2 ${
                value === color ? 'border-gray-800' : 'border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ backgroundColor: color }}
              disabled={disabled}
              title={color}
            />
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ColorPicker;
