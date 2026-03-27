import { LoadingSpinner } from '@/shared/components/feedback'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="xl" text="Cargando..." />
    </div>
  )
}
