import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import toast from 'react-hot-toast'
import { LogOut, User, Shield, Palette, Check, X } from 'lucide-react'

const AVATAR_EMOJIS = ['', '👻', '🦊', '🐺', '🐉', '🦅', '🦋', '🌙', '⭐', '🔥', '💎', '🎭', '🌊', '🌸', '🍄', '🦄', '🎯']

type Section = 'profile' | 'appearance' | 'account'

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={15} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
  { id: 'account', label: 'Account', icon: <Shield size={15} /> },
]

export function SettingsPage() {
  const { profile } = useCurrentUser()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const updateProfile = useMutation(api.users.updateProfile)
  const { theme, setTheme, themes } = useTheme()

  const [username, setUsername] = useState(profile?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatarEmoji ?? '')
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState<Section>('profile')
  const [debouncedUsername, setDebouncedUsername] = useState(username)

  useEffect(() => {
    if (profile) { setUsername(profile.username); setBio(profile.bio ?? ''); setAvatarEmoji(profile.avatarEmoji ?? '') }
  }, [profile])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(username), 400)
    return () => clearTimeout(t)
  }, [username])

  const availability = useQuery(
    api.users.checkUsername,
    debouncedUsername.length >= 3 && debouncedUsername !== profile?.username ? { username: debouncedUsername } : 'skip'
  )

  const usernameChanged = username !== profile?.username
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
  const usernameAvailable = usernameChanged ? (availability?.available ?? null) : true

  async function handleSave() {
    if (!usernameValid || !usernameAvailable || loading) return
    setLoading(true)
    try {
      await updateProfile({ username: username.toLowerCase(), bio: bio.trim() || undefined, avatarEmoji: avatarEmoji || undefined })
      toast.success('Profile updated')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally { setLoading(false) }
  }

  async function handleSignOut() {
    try { await signOut(); navigate('/auth') }
    catch { toast.error('Failed to sign out') }
  }

  if (!profile) return null

  const darkThemes = themes.filter(t => t.dark)
  const lightThemes = themes.filter(t => !t.dark)

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Manage your profile and preferences</p>
      </div>

      <div className="flex gap-5 lg:items-start lg:flex-row flex-col">
        {/* Sidebar nav */}
        <div className="lg:w-44 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {SECTIONS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`nav-item w-full text-left${section === id ? ' nav-item-active' : ''}`}
              >
                {icon} {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {/* Profile section */}
          {section === 'profile' && (
            <div className="panel p-5 space-y-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Edit Profile</h2>

              {/* Avatar preview */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--surface-4)', color: 'var(--text-1)' }}
                >
                  {avatarEmoji || profile.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>@{profile.username}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>Choose an emoji below</p>
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="label block mb-2">Avatar Emoji</label>
                <div className="grid grid-cols-9 gap-1">
                  {AVATAR_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className="aspect-square rounded flex items-center justify-center text-base transition-colors"
                      style={{
                        background: avatarEmoji === emoji ? 'var(--accent-subtle)' : 'var(--surface-3)',
                        border: `1px solid ${avatarEmoji === emoji ? 'var(--accent-border)' : 'transparent'}`,
                      }}
                    >
                      {emoji === '' ? (
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-2)' }}>
                          {profile.username.slice(0, 2).toUpperCase()}
                        </span>
                      ) : emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="label block mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                    className="input w-full pl-7 pr-9"
                  />
                  {usernameChanged && usernameValid && usernameAvailable === true && (
                    <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--success)' }} />
                  )}
                  {usernameChanged && (!usernameValid || usernameAvailable === false) && (
                    <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--danger)' }} />
                  )}
                </div>
                {usernameChanged && usernameAvailable === false && (
                  <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>@{username} is already taken</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="label block mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 160))}
                  placeholder="A short introduction..."
                  rows={3}
                  className="input w-full resize-none"
                />
                <p className="text-xs text-right mt-1" style={{ color: 'var(--text-3)' }}>{bio.length}/160</p>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !usernameValid || usernameAvailable === false}
                className="btn btn-primary"
              >
                {loading ? <span className="spinner" /> : 'Save changes'}
              </button>
            </div>
          )}

          {/* Appearance section */}
          {section === 'appearance' && (
            <div className="panel p-5 space-y-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Theme</h2>

              <div>
                <p className="label block mb-3">Dark themes</p>
                <div className="grid grid-cols-2 gap-2">
                  {darkThemes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className="flex items-center gap-2.5 p-3 rounded border text-left transition-colors"
                      style={{
                        borderColor: theme === t.id ? 'var(--accent)' : 'var(--border-2)',
                        background: theme === t.id ? 'var(--accent-subtle)' : 'var(--surface-3)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                        style={{ background: t.bg, border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: theme === t.id ? 'var(--accent-muted)' : 'var(--text-1)' }}>{t.label}</p>
                      </div>
                      {theme === t.id && <Check size={13} style={{ color: 'var(--accent-muted)', shrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="label block mb-3">Light themes</p>
                <div className="grid grid-cols-2 gap-2">
                  {lightThemes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className="flex items-center gap-2.5 p-3 rounded border text-left transition-colors"
                      style={{
                        borderColor: theme === t.id ? 'var(--accent)' : 'var(--border-2)',
                        background: theme === t.id ? 'var(--accent-subtle)' : 'var(--surface-3)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                        style={{ background: t.bg, border: '1px solid rgba(0,0,0,0.1)' }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: theme === t.id ? 'var(--accent-muted)' : 'var(--text-1)' }}>{t.label}</p>
                      </div>
                      {theme === t.id && <Check size={13} style={{ color: 'var(--accent-muted)' }} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account section */}
          {section === 'account' && (
            <div className="space-y-4">
              <div className="panel p-5">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Account info</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>
                  Your real identity is never shown to other users. Silo keeps your anonymous identity separate from your login.
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Anonymous username', value: `@${profile.username}`, badge: 'Active' },
                    { label: 'Identity protection', value: 'Real name hidden from all users', badge: 'On' },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded"
                      style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)' }}
                    >
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{item.value}</p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel p-5">
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--danger)' }}>Sign out</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>
                  You'll need to sign back in to access your posts.
                </p>
                <button onClick={handleSignOut} className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
