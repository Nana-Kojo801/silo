import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Flame, Compass, Bell, User, MessageSquareMore } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const NAV = [
  { icon: Flame,             label: 'Feed',     path: '/feed' },
  { icon: MessageSquareMore, label: 'Confess',  path: '/confessions' },
  { icon: Compass,           label: 'Explore',  path: '/explore' },
  { icon: Bell,              label: 'Alerts',   path: '/notifications' },
  { icon: User,              label: 'Profile',  path: '/profile' },
]

export function MobileNav() {
  const location = useLocation()
  const { profile } = useCurrentUser()
  const unread = useQuery(api.notifications.unreadCount) ?? 0

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line"
         style={{ background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-around h-[3.75rem] max-w-lg mx-auto px-1 safe-area-bottom">
        {NAV.map(({ icon: Icon, label, path }) => {
          const isProfile = path === '/profile'
          const to = isProfile && profile ? `/profile/${profile.username}` : path
          const active = isProfile
            ? location.pathname.startsWith('/profile')
            : location.pathname.startsWith(path)
          const isNotif = path === '/notifications'

          return (
            <Link
              key={path}
              to={to}
              className="relative flex flex-col items-center justify-center gap-1 w-14 h-full"
            >
              <div className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150',
                active ? 'bg-violet-600/12 text-ink' : 'text-ink-muted'
              )}>
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.75}
                  className={cn('transition-transform duration-150', active && 'scale-105')}
                />
                {isNotif && unread > 0 && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose rounded-full border border-[#09090B]" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-none transition-colors',
                active ? 'text-ink' : 'text-ink-disabled'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
