import { cn, getAvatarGradient, getInitials } from '@/lib/utils'

interface AvatarProps {
  username: string
  avatarSeed: string
  avatarEmoji?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px] rounded',
  sm: 'w-8 h-8 text-xs rounded-md',
  md: 'w-10 h-10 text-sm rounded-lg',
  lg: 'w-12 h-12 text-base rounded-xl',
  xl: 'w-16 h-16 text-xl rounded-2xl',
}

export function Avatar({ username, avatarSeed, avatarEmoji, size = 'md', className }: AvatarProps) {
  const { from, to } = getAvatarGradient(avatarSeed)
  const initials = getInitials(username)
  return (
    <div
      className={cn(
        'flex items-center justify-center font-display font-bold shrink-0 select-none',
        SIZES[size],
        className
      )}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      {avatarEmoji
        ? <span className="leading-none">{avatarEmoji}</span>
        : <span className="text-white leading-none">{initials}</span>
      }
    </div>
  )
}
