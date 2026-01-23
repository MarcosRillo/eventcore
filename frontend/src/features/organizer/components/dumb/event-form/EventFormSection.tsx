import { ReactNode } from 'react'

interface EventFormSectionProps {
  number: number
  title: string
  children: ReactNode
}

/**
 * Wrapper component for form sections with consistent styling
 */
export const EventFormSection = ({ number, title, children }: EventFormSectionProps) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
        {number}. {title}
      </h2>
      {children}
    </div>
  )
}
