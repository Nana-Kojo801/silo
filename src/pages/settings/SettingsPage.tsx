import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cn, getAvatarGradient } from '@/lib/utils'
import { LogOut, User, Shield, PenLine, Check, X } from 'lucide-react'

const AVATAR_EMOJIS = ['', '👻', '🦊', '🐺', '🐉', '🦅', '🦋', '🌙', '⭐', '🔥', '💎', '🎭', '🌊', '🌸', '🍄', '🦄', '🎯']

export function SettingsPage() {
  const { profile } = useCurrentUser()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const updateProfile = useMutation(api.users.updateProfile)

  const [username, setUsername] = useState(profile?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatarEmoji ?? '')
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState<'profile' | 'account' | 'privacy'>('profile')

  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setBio(profile.bio ?? '')
      setAvatarEmoji(profile.avatarEmoji ?? '')
    }
  }, [profile])

  // Username availability check
  const [debouncedUsername, setDebouncedUsername] = useState(username)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(username), 400)
    return () => clearTimeout(t)
  }, [username])

  const availability = useQuery(
    api.users.checkUsername,
    debouncedUsername.length >= 3 && debouncedUsername !== profile?.username
      ? { username: debouncedUsername }
      : 'skip'
  )

  const usernameChanged = username !== profile?.username
  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
  const usernameAvailable = usernameChanged ? (availability?.available ?? null) : true

  async function handleSave() {
    if (!usernameValid || !usernameAvailable || loading) return
    setLoading(true)
    try {
      await updateProfile({
        username: username.toLowerCase(),
        bio: bio.trim() || undefined,
        avatarEmoji: avatarEmoji || undefined,
      })
      toast.success('Profile updated!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/auth')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  if (!profile) return null

  const { from, to } = getAvatarGradient(profile.avatarSeed)

  const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'account', label: 'Account', icon: <Shield size={16} /> },
  ] as const

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="page-header">⚙️ Settings</h1>
        <p className="text-sm text-ink-muted mt-0.5">Manage your anonymous identity</p>
      </div>

      <div className="flex gap-6 lg:items-start lg:flex-row flex-col">
        {/* Sidebar */}
        <div className="lg:w-48 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {SECTIONS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={cn(
                  'w-full text-left',
                  section === id ? 'nav-item-active' : 'nav-item'
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === 'profile' && (
            <div className="card p-6 space-y-6">
              <h2 className="font-semibold text-ink-primary flex items-center gap-2">
                <PenLine size={16} />
                Edit Profile
              </h2>

              {/* Avatar preview */}
              <div className="flex items-center gap-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-glow-sm"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {avatarEmoji || profile.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-primary">@{profile.username}</p>
                  <p className="text-xs text-ink-muted">Your avatar updates with your emoji choice</p>
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="section-label mb-3 block">Avatar Emoji</label>
                <div className="grid grid-cols-9 gap-1.5">
                  {AVATAR_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center text-lg transition-all',
                        avatarEmoji === emoji
                          ? 'bg-silo-500/20 ring-1 ring-silo-500'
                          : 'bg-bg-elevated hover:bg-bg-overlay'
                      )}
                    >
                      {emoji === '' ? (
                        <span className="text-xs font-semibold text-ink-muted">
                          {profile.username.slice(0, 2).toUpperCase()}
                        </span>
                      ) : emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="section-label mb-2 block">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted font-medium text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                    className="input-base pl-8 pr-10"
                  />
                  {usernameChanged && usernameValid && usernameAvailable === true && (
                    <Check size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                  {usernameChanged && (!usernameValid || usernameAvailable === false) && (
                    <X size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
                  )}
                </div>
                {usernameChanged && usernameAvailable === false && (
                  <p className="text-xs text-rose-400 mt-1">@{username} is already taken</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="section-label mb-2 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  placeholder="A short vibe check..."
                  rows={3}
                  className="input-base resize-none"
                />
                <p className="text-xs text-ink-muted mt-1 text-right">{bio.length}/160</p>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !usernameValid || usernameAvailable === false}
                className="btn-primary"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Save Changes'}
              </button>
            </div>
          )}

          {section === 'account' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="font-semibold text-ink-primary mb-4">Account</h2>
                <p className="text-sm text-ink-secondary mb-6">
                  Your real identity (Google account or email) is never shown to other users.
                  Silo keeps your anonymous identity separate from your login.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl border border-border">
                    <div>
                      <p className="text-sm font-medium text-ink-primary">Anonymous Username</p>
                      <p className="text-xs text-ink-muted">@{profile.username}</p>
                    </div>
                    <span className="badge-emerald">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl border border-border">
                    <div>
                      <p className="text-sm font-medium text-ink-primary">Identity Protection</p>
                      <p className="text-xs text-ink-muted">Real name hidden from all users</p>
                    </div>
                    <span className="badge-emerald">On</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-rose-400 mb-2">Sign Out</h3>
                <p className="text-sm text-ink-secondary mb-4">
                  You'll need to sign back in to access your posts and notifications.
                </p>
                <button onClick={handleSignOut} className="btn-danger">
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
