import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import { getAvatarGradient, getInitials } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const AVATAR_EMOJIS = ['👻', '🦊', '🐺', '🐉', '🦅', '🦋', '🌙', '⭐', '🔥', '💎', '🎭', '🌊', '🌸', '🍄', '🦄', '🎯']

export function OnboardingPage() {
  const navigate = useNavigate()
  const createProfile = useMutation(api.users.createProfile)

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const [debouncedUsername, setDebouncedUsername] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(username), 400)
    return () => clearTimeout(t)
  }, [username])

  const availability = useQuery(
    api.users.checkUsername,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : 'skip'
  )

  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username)
  const usernameAvailable = availability?.available ?? null
  const showCheck = debouncedUsername === username && usernameValid && usernameAvailable === true
  const showX = debouncedUsername === username && (usernameAvailable === false || (!usernameValid && username.length > 0))

  async function handleSubmit() {
    if (!username || !usernameValid || usernameAvailable === false || loading) return
    setLoading(true)
    try {
      await createProfile({
        username: username.toLowerCase(),
        bio: bio.trim() || undefined,
        avatarEmoji: selectedEmoji || undefined,
      })
      toast.success('Welcome to Silo!')
      navigate('/feed')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const { from, to } = getAvatarGradient(username || 'default')

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-rose-DEFAULT/8 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
          >
            <span className="text-white font-black text-sm font-display">S</span>
          </div>
          <span className="font-display font-bold text-xl text-ink tracking-tight">silo</span>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="t-label text-violet-400">Step {step} of 2</span>
          </div>
          <h1 className="t-heading text-xl mb-1">
            {step === 1 ? 'Create your anonymous identity' : 'Choose your avatar'}
          </h1>
          <p className="t-meta text-sm">
            {step === 1
              ? 'This is how others will see you. Your real identity stays hidden.'
              : 'Pick an avatar. You can change this later in settings.'}
          </p>

          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-0.5 rounded-full bg-violet-600" />
            <div className={cn('flex-1 h-0.5 rounded-full transition-colors', step === 2 ? 'bg-violet-600' : 'bg-line')} />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="t-label block mb-2">Username *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted font-medium text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                    placeholder="your_handle"
                    autoFocus
                    className="input pl-8 pr-10"
                  />
                  {showCheck && (
                    <Check size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-DEFAULT" />
                  )}
                  {showX && (
                    <X size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-DEFAULT" />
                  )}
                </div>
                <div className="mt-1.5 min-h-[1.125rem]">
                  {username && !usernameValid && (
                    <p className="text-xs text-rose-fg">3–20 characters, letters, numbers, underscores</p>
                  )}
                  {usernameValid && usernameAvailable === false && debouncedUsername === username && (
                    <p className="text-xs text-rose-fg">@{username} is already taken</p>
                  )}
                  {showCheck && (
                    <p className="text-xs text-emerald-fg">@{username} is available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="t-label block mb-2">
                  Bio <span className="font-normal normal-case text-ink-disabled">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  placeholder="A short vibe check..."
                  rows={3}
                  className="input resize-none"
                />
                <p className="t-meta text-right mt-1">{bio.length}/160</p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!usernameValid || usernameAvailable === false}
                className="btn-primary w-full justify-center"
              >
                Next: Choose Avatar
              </button>
            </>
          ) : (
            <>
              {/* Avatar preview */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-violet"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {selectedEmoji || getInitials(username)}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="t-label block mb-3">Pick an emoji (optional)</label>
                <div className="grid grid-cols-9 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji('')}
                    className={cn(
                      'w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all',
                      !selectedEmoji
                        ? 'bg-violet-600/15 ring-1 ring-violet-600/40 text-violet-400'
                        : 'bg-surface-raised hover:bg-surface-overlay text-ink-muted'
                    )}
                  >
                    {getInitials(username)}
                  </button>
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn(
                        'w-full aspect-square rounded-lg flex items-center justify-center text-lg transition-all',
                        selectedEmoji === emoji
                          ? 'bg-violet-600/15 ring-1 ring-violet-600/40 scale-110'
                          : 'bg-surface-raised hover:bg-surface-overlay hover:scale-105'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 justify-center"
                >
                  {loading ? <span className="spinner" /> : 'Enter Silo'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="t-meta text-center mt-5">
          Your real name or email is never visible to others.
        </p>
      </div>
    </div>
  )
}
