import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../../convex/_generated/api'
import {
  Flame, Compass, Bell, Settings, MessageSquareMore,
  CircleHelp, LogOut, Plus, PenLine
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import toast from 'react-hot-toast'

interface SidebarProps { onCreatePost: () => void }

const NAV = [
  { icon: Flame,             label: 'Feed',          path: '/feed' },
  { icon: MessageSquareMore, label: 'Confessions',   path: '/confessions' },
  { icon: Compass,           label: 'Explore',       path: '/explore' },
  { icon: CircleHelp,        label: 'Ask Me',        path: '/ask' },
  { icon: Bell,              label: 'Notifications', path: '/notifications' },
]

export function Sidebar({ onCreatePost }: SidebarProps) {
  const location = useLocation()
  const { profile } = useCurrentUser()
  const { signOut } = useAuthActions()
  const unread = useQuery(api.notifications.unreadCount) ?? 0

  async function handleSignOut() {
    try { await signOut() } catch { toast.error('Sign out failed') }
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 w-56 lg:w-60 shrink-0 border-r border-line bg-[#0d0d0f]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-line shrink-0">
        <SiloMark />
        <span className="font-display text-xl font-bold text-ink tracking-tight">silo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = isActive(path)
          const isNotif = path === '/notifications'
          return (
            <Link key={path} to={path} className={cn('nav-link', active && 'nav-link-active')}>
              <Icon size={16} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
              <span className="flex-1 font-medium">{label}</span>
              {isNotif && unread > 0 && (
                <span className="flex items-center justify-center min-w-[1.125rem] h-[1.125rem] rounded-full text-[10px] font-bold bg-rose text-white px-1 shrink-0">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          )
        })}

        <div className="divider !my-3 mx-1" />

        <Link to="/settings" className={cn('nav-link', isActive('/settings') && 'nav-link-active')}>
          <Settings size={16} strokeWidth={2} className="shrink-0" />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>

      {/* Compose CTA */}
      <div className="px-2 pb-3">
        <button onClick={onCreatePost} className="btn-primary w-full justify-center gap-2 py-2.5 text-sm">
          <Plus size={15} />
          New Post
        </button>
      </div>

      {/* Profile strip */}
      {profile && (
        <div className="border-t border-line px-2 py-2 shrink-0">
          <Link
            to={`/profile/${profile.username}`}
            className={cn('nav-link', isActive(`/profile/${profile.username}`) && 'nav-link-active')}
          >
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="xs"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">@{profile.username}</p>
            </div>
            <PenLine size={12} className="shrink-0 opacity-40" />
          </Link>
          <button
            onClick={handleSignOut}
            className="nav-link w-full text-left mt-0.5 hover:!text-rose-DEFAULT hover:!bg-rose-DEFAULT/5"
          >
            <LogOut size={15} className="shrink-0" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      )}
    </aside>
  )
}

function SiloMark() {
  return (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 violet-glow"
      style={{ background: 'linear-gradient(145deg, #7C3AED 0%, #5B21B6 100%)' }}
    >
      <span className="font-display font-bold text-white text-sm leading-none">S</span>
    </div>
  )
}
