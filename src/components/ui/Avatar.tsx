import { getAvatarGradient, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  username: string
  avatarSeed: string
  avatarEmoji?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({ username, avatarSeed, avatarEmoji, size = 'md', className }: AvatarProps) {
  const { from, to } = getAvatarGradient(avatarSeed)
  const initials = getInitials(username)
  const sizeClass = SIZE_MAP[size]

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0 select-none',
        sizeClass,
        className
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {avatarEmoji ? (
        <span className="leading-none">{avatarEmoji}</span>
      ) : (
        <span className="text-white leading-none">{initials}</span>
      )}
    </div>
  )
}
