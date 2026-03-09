import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface AvatarProps {
  username: string
  avatarSeed: string
  avatarEmoji?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: CSSProperties
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-16 h-16 text-lg',
}

const AVATAR_GRADIENTS = [
  ['#4F46E5', '#7C3AED'],
  ['#0369A1', '#0891B2'],
  ['#7C3AED', '#A855F7'],
  ['#0F766E', '#0D9488'],
  ['#1D4ED8', '#4338CA'],
  ['#9333EA', '#C026D3'],
  ['#B45309', '#D97706'],
  ['#047857', '#059669'],
  ['#BE123C', '#E11D48'],
  ['#374151', '#6B7280'],
  ['#1E40AF', '#2563EB'],
  ['#6D28D9', '#8B5CF6'],
]

function getGradient(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const [from, to] = AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
  return { from, to }
}

export function Avatar({ username, avatarSeed, avatarEmoji, size = 'md', className, style }: AvatarProps) {
  const { from, to } = getGradient(avatarSeed)
  const initials = getInitials(username)

  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold shrink-0 select-none', SIZE_MAP[size], className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, ...style }}
    >
      {avatarEmoji ? (
        <span className="leading-none">{avatarEmoji}</span>
      ) : (
        <span className="text-white leading-none">{initials}</span>
      )}
    </div>
  )
}
