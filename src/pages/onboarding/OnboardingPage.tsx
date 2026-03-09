import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
      await createProfile({ username: username.toLowerCase(), bio: bio.trim() || undefined, avatarEmoji: selectedEmoji || undefined })
      toast.success('Welcome to Silo!')
      navigate('/feed')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--surface-base)' }}
    >
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo + title */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--accent)' }}
          >
            S
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-1)' }}>Silo</span>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {[1, 2].map(s => (
              <div
                key={s}
                className="flex-1 h-0.5 rounded-full transition-colors"
                style={{ background: step >= s ? 'var(--accent)' : 'var(--border-2)' }}
              />
            ))}
          </div>
          <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            {step === 1 ? 'Create your identity' : 'Choose your avatar'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {step === 1 ? 'Your real identity stays hidden.' : 'How you appear to others.'}
          </p>
        </div>

        <div className="panel p-5 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="label block mb-1.5">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
                    placeholder="your_handle"
                    autoFocus
                    className="input w-full pl-7 pr-9"
                  />
                  {showCheck && <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--success)' }} />}
                  {showX && <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--danger)' }} />}
                </div>
                <div className="mt-1 min-h-[1.1rem]">
                  {username && !usernameValid && (
                    <p className="text-xs" style={{ color: 'var(--danger)' }}>3–20 chars, letters, numbers, underscores</p>
                  )}
                  {usernameValid && usernameAvailable === false && debouncedUsername === username && (
                    <p className="text-xs" style={{ color: 'var(--danger)' }}>@{username} is taken</p>
                  )}
                  {showCheck && (
                    <p className="text-xs" style={{ color: 'var(--success)' }}>@{username} is available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label block mb-1.5">
                  Bio <span className="font-normal" style={{ color: 'var(--text-3)' }}>(optional)</span>
                </label>
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
                onClick={() => setStep(2)}
                disabled={!usernameValid || usernameAvailable === false}
                className="btn btn-primary w-full justify-center"
              >
                Next
              </button>
            </>
          ) : (
            <>
              {/* Avatar preview */}
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--surface-4)', color: 'var(--text-1)' }}
                >
                  {selectedEmoji || getInitials(username)}
                </div>
              </div>

              <div>
                <label className="label block mb-2">Pick an emoji</label>
                <div className="grid grid-cols-8 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji('')}
                    className="aspect-square rounded flex items-center justify-center text-xs font-semibold transition-colors"
                    style={{
                      background: !selectedEmoji ? 'var(--accent-subtle)' : 'var(--surface-3)',
                      border: `1px solid ${!selectedEmoji ? 'var(--accent-border)' : 'transparent'}`,
                      color: 'var(--text-2)',
                    }}
                  >
                    {getInitials(username)}
                  </button>
                  {AVATAR_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className="aspect-square rounded flex items-center justify-center text-lg transition-colors"
                      style={{
                        background: selectedEmoji === emoji ? 'var(--accent-subtle)' : 'var(--surface-3)',
                        border: `1px solid ${selectedEmoji === emoji ? 'var(--accent-border)' : 'transparent'}`,
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn btn-secondary flex-1 justify-center">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-primary flex-1 justify-center">
                  {loading ? <span className="spinner" /> : 'Enter Silo'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-4)' }}>
          Your real name or email is never shown to others.
        </p>
      </div>
    </div>
  )
}
