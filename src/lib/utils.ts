import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNowStrict } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(timestamp: number): string {
  return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true })
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

// Generate a deterministic gradient based on a seed string
const AVATAR_GRADIENTS = [
  ['#7c4dff', '#f94d6a'],
  ['#6366f1', '#ec4899'],
  ['#8b5cf6', '#06b6d4'],
  ['#a855f7', '#f59e0b'],
  ['#6d28d9', '#10b981'],
  ['#4f46e5', '#f43f5e'],
  ['#7c3aed', '#fbbf24'],
  ['#5b21b6', '#34d399'],
  ['#9333ea', '#fb923c'],
  ['#7e22ce', '#22d3ee'],
  ['#6366f1', '#a3e635'],
  ['#8b5cf6', '#fb7185'],
]

export function getAvatarGradient(seed: string): { from: string; to: string } {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length
  const [from, to] = AVATAR_GRADIENTS[index]
  return { from, to }
}

export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

export const CONFESSION_CATEGORIES = [
  { id: 'campus', label: 'Campus', emoji: '🏫', color: 'badge-violet' },
  { id: 'relationships', label: 'Relationships', emoji: '💔', color: 'badge-rose' },
  { id: 'friendships', label: 'Friendships', emoji: '🤝', color: 'badge-emerald' },
  { id: 'academics', label: 'Academics', emoji: '📚', color: 'badge-amber' },
  { id: 'hot_takes', label: 'Hot Takes', emoji: '🔥', color: 'badge-rose' },
  { id: 'secrets', label: 'Secrets', emoji: '🤫', color: 'badge-violet' },
] as const

export type ConfessionCategory = typeof CONFESSION_CATEGORIES[number]['id']

export function getCategoryInfo(id: string) {
  return CONFESSION_CATEGORIES.find((c) => c.id === id) ?? {
    id,
    label: id,
    emoji: '💬',
    color: 'badge-violet' as const,
  }
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max).trimEnd() + '…'
}

export function generateSlug(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const REACTION_EMOJIS: Record<string, string> = {
  love: '❤️',
  laugh: '😂',
  sad: '😢',
  surprised: '😮',
}
