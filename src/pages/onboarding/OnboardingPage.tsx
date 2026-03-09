import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import { getAvatarGradient, getInitials } from '@/lib/utils'
import { Check, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const AVATAR_EMOJIS = ['👻', '🦊', '🐺', '🐉', '🦅', '🦋', '🌙', '⭐', '🔥', '💎', '🎭', '🌊', '🌸', '🍄', '🦄', '🎯']

const AVATAR_SEEDS = Array.from({ length: 12 }, (_, i) => `seed${i + 1}`)

export function OnboardingPage() {
  const navigate = useNavigate()
  const createProfile = useMutation(api.users.createProfile)

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')
  const [selectedSeed, setSelectedSeed] = useState('seed1')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  // Debounced username check
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
      toast.success('Welcome to Silo! 🎉')
      navigate('/feed')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const { from, to } = getAvatarGradient(selectedSeed)

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-silo-700/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-silo flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="text-xl font-black text-ink-primary">silo</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-silo-400" />
            <span className="text-sm text-ink-secondary font-medium">Step {step} of 2</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-primary">
            {step === 1 ? 'Create your anonymous identity' : 'Choose your avatar'}
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            {step === 1
              ? 'This is how others will see you. Your real identity stays hidden.'
              : 'Pick an avatar style. You can change this later.'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          <div className="flex-1 h-1 rounded-full bg-silo-500" />
          <div className={cn('flex-1 h-1 rounded-full transition-all', step === 2 ? 'bg-silo-500' : 'bg-border')} />
        </div>

        <div className="card p-6 space-y-5">
          {step === 1 ? (
            <>
              {/* Username */}
              <div>
                <label className="section-label mb-2 block">Username *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted font-medium text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                    placeholder="your_handle"
                    autoFocus
                    className="input-base pl-8 pr-10"
                  />
                  {showCheck && (
                    <Check size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                  {showX && (
                    <X size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
                  )}
                </div>
                <div className="mt-1.5 min-h-[1.25rem]">
                  {username && !usernameValid && (
                    <p className="text-xs text-rose-400">3–20 characters, letters, numbers, and underscores only</p>
                  )}
                  {usernameValid && usernameAvailable === false && debouncedUsername === username && (
                    <p className="text-xs text-rose-400">@{username} is already taken</p>
                  )}
                  {showCheck && (
                    <p className="text-xs text-emerald-400">@{username} is available!</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="section-label mb-2 block">Bio <span className="font-normal normal-case text-ink-muted">(optional)</span></label>
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
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow text-3xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {selectedEmoji || getInitials(username)}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="section-label mb-3 block">Pick an emoji (optional)</label>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji('')}
                    className={cn(
                      'w-full aspect-square rounded-xl flex items-center justify-center text-base transition-all',
                      !selectedEmoji ? 'bg-silo-500/20 ring-1 ring-silo-500' : 'bg-bg-elevated hover:bg-bg-overlay'
                    )}
                  >
                    <span className="text-ink-muted text-xs font-semibold">{getInitials(username)}</span>
                  </button>
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn(
                        'w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-all',
                        selectedEmoji === emoji ? 'bg-silo-500/20 ring-1 ring-silo-500' : 'bg-bg-elevated hover:bg-bg-overlay'
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
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Enter Silo 🚀'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-ink-muted text-center mt-4">
          Your real name or email will never be visible to others.
        </p>
      </div>
    </div>
  )
}
