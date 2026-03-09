import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null

  const sizeClass = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Sheet */}
      <div className={cn(
        'relative w-full z-10 animate-scale-in',
        'bg-surface-raised border border-line rounded-xl',
        'shadow-xl max-h-[90dvh] flex flex-col',
        sizeClass,
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
            <h2 className="font-display text-base font-600 text-ink tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="btn-ghost btn-sm w-7 h-7 p-0 rounded-md text-ink-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-10 btn-ghost btn-sm w-7 h-7 p-0 rounded-md text-ink-muted hover:text-ink"
          >
            <X size={14} />
          </button>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
