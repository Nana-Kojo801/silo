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
        <div className="text-4xl mb-4" style={{ opacity: 0.4 }}>{icon}</div>
      )}
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-2)' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs leading-relaxed mb-5" style={{ color: 'var(--text-3)' }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
