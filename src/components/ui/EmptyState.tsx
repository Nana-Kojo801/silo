import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && (
        <div className="mb-4 text-4xl opacity-50 select-none">{icon}</div>
      )}
      <h3 className="font-display text-base font-600 text-ink-secondary mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-ink-muted max-w-xs leading-relaxed mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
