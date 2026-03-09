import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Flame, Compass, Bell, User, Settings,
  MessageSquareMore, CircleHelp, LogOut, Plus
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import toast from 'react-hot-toast'

interface SidebarProps {
  onCreatePost?: () => void
}

const NAV_ITEMS = [
  { icon: Flame, label: 'Feed', path: '/feed' },
  { icon: MessageSquareMore, label: 'Confessions', path: '/confessions' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: CircleHelp, label: 'Ask Me', path: '/ask' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
]

export function Sidebar({ onCreatePost }: SidebarProps) {
  const location = useLocation()
  const { profile } = useCurrentUser()
  const { signOut } = useAuthActions()
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Signed out')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 h-screen sticky top-0 pt-6 pb-4 px-3 shrink-0 border-r border-border/50">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-2.5 px-3 mb-8 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-silo flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-black text-sm">S</span>
        </div>
        <span className="text-xl font-black text-ink-primary group-hover:text-glow transition-all">
          silo
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = location.pathname.startsWith(path)
          const isNotif = path === '/notifications'
          return (
            <Link key={path} to={path} className={cn(active ? 'nav-item-active' : 'nav-item')}>
              <div className="relative shrink-0">
                <Icon size={18} />
                {isNotif && unreadCount > 0 && <span className="notif-dot" />}
              </div>
              <span>{label}</span>
              {isNotif && unreadCount > 0 && (
                <span className="ml-auto badge-rose text-xs px-1.5 py-0.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Create post button */}
      <div className="px-0 mb-4">
        <button
          onClick={onCreatePost}
          className="btn-primary w-full justify-center text-sm font-semibold"
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Divider */}
      <div className="divider mb-4" />

      {/* Profile + Settings */}
      <div className="space-y-1">
        {profile && (
          <Link
            to={`/profile/${profile.username}`}
            className={cn(
              location.pathname === `/profile/${profile.username}` ? 'nav-item-active' : 'nav-item'
            )}
          >
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm truncate block">@{profile.username}</span>
            </div>
            <User size={14} className="shrink-0 opacity-40" />
          </Link>
        )}

        <Link
          to="/settings"
          className={cn(location.pathname === '/settings' ? 'nav-item-active' : 'nav-item')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>

        <button onClick={handleSignOut} className="nav-item w-full text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10">
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
