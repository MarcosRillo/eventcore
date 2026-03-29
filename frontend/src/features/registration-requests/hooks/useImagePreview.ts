import { useEffect, useState } from 'react'

/**
 * Generates and revokes object URLs for file previews.
 * Returns null when no file is provided.
 */
export function useImagePreview(file: File | null | undefined): string | null {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return preview
}
