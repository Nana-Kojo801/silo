import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Rss, BookOpen, Search, Bell, User } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const NAV = [
  { icon: Rss,      label: 'Feed',    path: '/feed' },
  { icon: BookOpen, label: 'Confess', path: '/confessions' },
  { icon: Search,   label: 'Explore', path: '/explore' },
  { icon: Bell,     label: 'Alerts',  path: '/notifications' },
  { icon: User,     label: 'Profile', path: '/profile' },
]

export function MobileNav() {
  const location = useLocation()
  const { profile } = useCurrentUser()
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border-2)',
      }}
    >
      <div className="flex items-center h-14 px-1">
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
              className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
              style={{ color: active ? 'var(--accent-muted)' : 'var(--text-3)' }}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                {isNotif && unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                    style={{ background: 'var(--danger)' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
