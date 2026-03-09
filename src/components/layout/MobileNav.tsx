import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Flame, Compass, Bell, User, MessageSquareMore } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const NAV_ITEMS = [
  { icon: Flame, label: 'Feed', path: '/feed' },
  { icon: MessageSquareMore, label: 'Confess', path: '/confessions' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Bell, label: 'Notifs', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
]

export function MobileNav() {
  const location = useLocation()
  const { profile } = useCurrentUser()
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isProfile = path === '/profile'
          const resolvedPath = isProfile && profile ? `/profile/${profile.username}` : path
          const active = isProfile
            ? location.pathname.startsWith('/profile')
            : location.pathname.startsWith(path)
          const isNotif = path === '/notifications'

          return (
            <Link
              key={path}
              to={resolvedPath}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-0 transition-all duration-150',
                active ? 'text-silo-400' : 'text-ink-muted'
              )}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                {isNotif && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active ? 'font-semibold' : '')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
