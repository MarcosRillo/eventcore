'use client'

/**
 * ImageUploadField Component - Minimalist Design System
 * Unified image field with toggle between URL input and file upload
 * Supports drag-and-drop, preview, and recommended dimensions display
 */

import { ChangeEvent, DragEvent, useEffect, useId, useRef, useState } from 'react'

export interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  file: File | null
  onFileChange: (file: File | null) => void
  recommendedSize: string
  aspectRatio?: string
  error?: string
  helperText?: string
  disabled?: boolean
  fullWidth?: boolean
  required?: boolean
  maxSizeMB?: number
}

type InputMode = 'file' | 'url'

const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.gif'

const ImageUploadField = ({
  label,
  value,
  onChange,
  file,
  onFileChange,
  recommendedSize,
  aspectRatio,
  error,
  helperText,
  disabled = false,
  fullWidth = false,
  required = false,
  maxSizeMB = 2,
}: ImageUploadFieldProps) => {
  const generatedId = useId()
  const inputId = `image-upload-${generatedId}`
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine initial mode based on existing value
  const [mode, setMode] = useState<InputMode>(() => {
    if (file) return 'file'
    if (value) return 'url'
    return 'file'
  })
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateFile = (fileToValidate: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(fileToValidate.type)) {
      return 'Formato no permitido. Usa JPG, PNG, WebP o GIF.'
    }
    if (fileToValidate.size > maxSizeBytes) {
      return `El archivo excede el tamaño máximo de ${maxSizeMB} MB.`
    }
    return null
  }

  const handleFileSelect = (selectedFile: File | null) => {
    setFileError(null)

    if (!selectedFile) {
      onFileChange(null)
      return
    }

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setFileError(validationError)
      return
    }

    onFileChange(selectedFile)
    // Clear URL when file is selected
    if (value) {
      onChange('')
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    handleFileSelect(files?.[0] || null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    // Clear file when URL is entered
    if (file) {
      onFileChange(null)
    }
  }

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode)
    setFileError(null)
  }

  const handleRemoveImage = () => {
    onFileChange(null)
    onChange('')
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDropzoneClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Get preview URL — useEffect ensures blob is revoked on cleanup (no memory leak)
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setBlobUrl(null); return; }
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const previewUrl = blobUrl ?? value ?? null;

  // Determine if there's an error to display
  const displayError = error || fileError

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label with recommended size */}
      <label
        htmlFor={inputId}
        className={`
          block text-sm font-medium mb-1.5 transition-colors
          ${displayError ? 'text-error-600' : 'text-neutral-700'}
        `}
      >
        {label}
        {required && <span className="text-error-500 ml-0.5">*</span>}
      </label>

      {/* Recommended dimensions hint */}
      <p className="text-xs text-neutral-500 mb-2">
        Recomendado: {recommendedSize}
        {aspectRatio && ` (${aspectRatio})`}
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        <button
          type="button"
          onClick={() => handleModeChange('file')}
          disabled={disabled}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150
            ${mode === 'file'
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Subir archivo
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('url')}
          disabled={disabled}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150
            ${mode === 'url'
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Ingresar URL
        </button>
      </div>

      {/* File upload mode */}
      {mode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            id={inputId}
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            disabled={disabled}
            className="sr-only"
          />

          {/* Dropzone - only show when no preview */}
          {!previewUrl && (
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Seleccionar imagen. Recomendado: ${recommendedSize}`}
              onClick={handleDropzoneClick}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                  e.preventDefault()
                  handleDropzoneClick()
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-all duration-150 ease-in-out
                ${isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : displayError
                    ? 'border-error-300 bg-error-50/50'
                    : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`w-10 h-10 ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium text-primary-600">Arrastra una imagen</span>
                    {' '}o haz clic aquí
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    JPG, PNG, WebP, GIF (máx. {maxSizeMB} MB)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL input mode */}
      {mode === 'url' && (
        <input
          type="url"
          id={inputId}
          value={value}
          onChange={handleUrlChange}
          disabled={disabled}
          placeholder="https://ejemplo.com/imagen.jpg"
          spellCheck={false}
          autoComplete="off"
          className={`
            w-full h-10 px-3 text-sm
            bg-white border rounded-md
            text-neutral-900 placeholder:text-neutral-400
            transition-all duration-150 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${displayError
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10 bg-error-50/50'
              : 'border-neutral-200'
            }
          `}
        />
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-3 relative">
          <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full h-40 object-contain"
              onError={(e) => {
                // Hide broken image
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {/* Change image button */}
            <button
              type="button"
              onClick={handleDropzoneClick}
              disabled={disabled}
              aria-label="Cambiar imagen"
              className={`
                p-1.5 rounded-full
                bg-white/90 hover:bg-white text-neutral-600 hover:text-primary-600
                shadow-sm border border-neutral-200
                transition-all duration-150
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title="Cambiar imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            {/* Delete image button */}
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              aria-label="Eliminar imagen"
              className={`
                p-1.5 rounded-full
                bg-white/90 hover:bg-white text-neutral-600 hover:text-error-600
                shadow-sm border border-neutral-200
                transition-all duration-150
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title="Eliminar imagen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {file && (
            <p className="mt-1 text-xs text-neutral-500">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <p
          className="mt-1.5 text-sm text-error-600 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {displayError}
        </p>
      )}

      {/* Helper text */}
      {helperText && !displayError && (
        <p className="mt-1.5 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default ImageUploadField
