import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'

export function AuthPage() {
  const { signIn } = useAuthActions()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    setGoogleLoading(true)
    try { await signIn('google') } catch {
      toast.error('Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await signIn('password', { email, password, flow: mode === 'signup' ? 'signUp' : 'signIn' })
      toast.success(mode === 'signup' ? 'Account created!' : 'Welcome back!')
    } catch (err: unknown) {
      toast.error(err instanceof Error && err.message.includes('Invalid') ? 'Invalid credentials' : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] shrink-0 p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(160deg, #111113 0%, #0D0B0D 100%)' }}>
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-900/15 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center violet-glow"
                 style={{ background: 'linear-gradient(145deg, #7C3AED, #5B21B6)' }}>
              <span className="font-display font-bold text-white leading-none">S</span>
            </div>
            <span className="font-display text-xl font-bold text-ink tracking-tight">silo</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h1 className="font-display text-[2.75rem] font-700 text-ink leading-[1.05] tracking-[-0.045em]">
              The internet's most honest{' '}
              <span className="text-violet-400">social space.</span>
            </h1>
          </div>

          <div className="space-y-3">
            {[
              { icon: '🤫', text: 'Confess anything. Stay anonymous forever.' },
              { icon: '🔥', text: 'Share hot takes without consequences.' },
              { icon: '❓', text: 'Get real answers with anonymous Q&A links.' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="text-base mt-px">{icon}</span>
                <p className="text-sm text-ink-muted leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-disabled">
          Your real identity is never exposed to other users.
        </p>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-base">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md flex items-center justify-center violet-glow"
                 style={{ background: 'linear-gradient(145deg, #7C3AED, #5B21B6)' }}>
              <span className="font-display font-bold text-white text-sm">S</span>
            </div>
            <span className="font-display text-xl font-bold text-ink">silo</span>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-700 text-ink tracking-tight mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-ink-muted">
              {mode === 'signin' ? 'Sign in to your anonymous identity.' : 'Join. Stay anonymous. Post freely.'}
            </p>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="btn-secondary w-full justify-center gap-3"
            >
              {googleLoading
                ? <span className="spinner spinner-sm" />
                : <GoogleIcon />
              }
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="divider flex-1" />
              <span className="text-xs text-ink-disabled">or</span>
              <div className="divider flex-1" />
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 p-0.5 bg-surface-subtle rounded-lg border border-line">
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-100',
                    mode === m ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-muted hover:text-ink-secondary'
                  )}
                >
                  {m === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" required autoComplete="email"
                  className="input pl-9"
                />
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required minLength={8}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="input pl-9 pr-10"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-muted transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button type="submit" disabled={loading || !email || !password} className="btn-primary w-full justify-center btn-lg">
                {loading ? <span className="spinner spinner-sm" /> : (
                  <>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-ink-disabled text-center pt-1">
              By continuing, your real identity stays private. Always.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
