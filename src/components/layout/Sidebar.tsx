import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Rss, BookOpen, Compass, Bell, User, Settings,
  CircleHelp, LogOut, Plus, Users, ChevronDown, Check,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthActions } from '@convex-dev/auth/react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { TEAMS, getMyTeams, getCurrentTeam, setCurrentTeam } from '@/lib/teams'
import toast from 'react-hot-toast'

interface SidebarProps {
  onCreatePost?: () => void
}

const NAV_ITEMS = [
  { icon: Rss,           label: 'Feed',          path: '/feed' },
  { icon: BookOpen,      label: 'Confessions',   path: '/confessions' },
  { icon: Compass,       label: 'Explore',       path: '/explore' },
  { icon: CircleHelp,    label: 'Ask',           path: '/ask' },
  { icon: Bell,          label: 'Notifications', path: '/notifications' },
  { icon: Users,         label: 'Teams',         path: '/teams' },
]

export function Sidebar({ onCreatePost }: SidebarProps) {
  const location = useLocation()
  const { profile } = useCurrentUser()
  const { signOut } = useAuthActions()
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0
  const [teamOpen, setTeamOpen] = useState(false)
  const [currentTeamId, setCurrentTeamIdState] = useState(getCurrentTeam)
  const myTeams = getMyTeams()
  const currentTeam = TEAMS.find(t => t.id === currentTeamId)

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      toast.error('Failed to sign out')
    }
  }

  function handleSelectTeam(id: string | null) {
    setCurrentTeam(id)
    setCurrentTeamIdState(id)
    setTeamOpen(false)
  }

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] xl:w-[240px] h-screen sticky top-0 shrink-0 border-r"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--border-1)' }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link to="/feed" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'var(--accent)' }}
          >
            S
          </div>
          <span className="font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Silo
          </span>
        </Link>
      </div>

      {/* Team switcher */}
      {myTeams.length > 0 && (
        <div className="px-2 mb-2">
          <button
            onClick={() => setTeamOpen(o => !o)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors"
            style={{
              color: 'var(--text-2)',
              background: teamOpen ? 'var(--surface-3)' : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
            onMouseLeave={e => (e.currentTarget.style.background = teamOpen ? 'var(--surface-3)' : 'transparent')}
          >
            {currentTeam ? (
              <>
                <span
                  className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white shrink-0"
                  style={{ background: currentTeam.color }}
                >
                  {currentTeam.shortName[0]}
                </span>
                <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>
                  {currentTeam.name}
                </span>
              </>
            ) : (
              <>
                <Users size={14} className="shrink-0" />
                <span className="flex-1 text-xs font-medium truncate">Personal</span>
              </>
            )}
            <ChevronDown size={12} style={{ opacity: 0.5 }} />
          </button>

          {teamOpen && (
            <div
              className="mt-1 rounded border overflow-hidden"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)' }}
            >
              <button
                onClick={() => handleSelectTeam(null)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors"
                style={{ color: currentTeamId === null ? 'var(--accent-muted)' : 'var(--text-2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Users size={12} className="shrink-0" />
                <span className="flex-1">Personal</span>
                {currentTeamId === null && <Check size={12} />}
              </button>
              {myTeams.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTeam(t.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors"
                  style={{ color: currentTeamId === t.id ? 'var(--accent-muted)' : 'var(--text-2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    className="w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center text-white shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.shortName[0]}
                  </span>
                  <span className="flex-1 truncate">{t.name}</span>
                  {currentTeamId === t.id && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const active = location.pathname.startsWith(path)
          const isNotif = path === '/notifications'
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item${active ? ' nav-item-active' : ''}`}
            >
              <div className="relative shrink-0">
                <Icon size={16} strokeWidth={active ? 2.25 : 1.75} />
                {isNotif && unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{ background: 'var(--danger)' }}
                  />
                )}
              </div>
              <span>{label}</span>
              {isNotif && unreadCount > 0 && (
                <span
                  className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--danger)', color: '#fff' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Compose */}
      <div className="px-2 py-2">
        <button
          onClick={onCreatePost}
          className="btn btn-primary w-full justify-center text-sm"
        >
          <Plus size={15} />
          New Post
        </button>
      </div>

      {/* Bottom */}
      <div
        className="px-2 pt-2 pb-4 border-t"
        style={{ borderColor: 'var(--border-1)' }}
      >
        {profile && (
          <Link
            to={`/profile/${profile.username}`}
            className={`nav-item${location.pathname.startsWith('/profile') ? ' nav-item-active' : ''}`}
          >
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="sm"
            />
            <span className="flex-1 text-sm truncate">@{profile.username}</span>
          </Link>
        )}
        <Link
          to="/settings"
          className={`nav-item${location.pathname === '/settings' ? ' nav-item-active' : ''}`}
        >
          <Settings size={16} strokeWidth={1.75} />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="nav-item w-full"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
