import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: number
  label: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
}

const variantStyles = {
  default: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  primary: { bg: 'bg-primary-50', text: 'text-primary-500' },
  success: { bg: 'bg-success-50', text: 'text-success-600' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
  error: { bg: 'bg-error-50', text: 'text-error-600' },
  info: { bg: 'bg-info-50', text: 'text-info-600' },
}

export const StatCard = ({ icon: Icon, value, label, variant = 'default' }: StatCardProps) => {
  const styles = variantStyles[variant]

  return (
    <article className="bg-white rounded-lg border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-md transition-all duration-150">
      <div className={`inline-flex p-2 rounded-lg ${styles.bg} mb-3`}>
        <Icon className={`w-5 h-5 ${styles.text}`} />
      </div>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm font-medium text-neutral-500 mt-1">{label}</p>
    </article>
  )
}
