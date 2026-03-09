import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Send, CircleHelp, Lock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function QuestionPage() {
  const { slug } = useParams<{ slug: string }>()
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const question = useQuery(api.questions.getBySlug, slug ? { slug } : 'skip')
  const submitResponse = useMutation(api.questions.submitResponse)

  if (question === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--surface-base)' }}>
        <span className="spinner" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: 'var(--surface-base)' }}>
        <EmptyState icon="📭" title="Question not found" description="This link may be invalid or the question was removed."
          action={<Link to="/" className="btn btn-secondary">Go home</Link>} />
      </div>
    )
  }

  if (!question.isActive) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: 'var(--surface-base)' }}>
        <EmptyState icon="🔒" title="This question is closed" description="The owner has stopped accepting responses."
          action={<Link to="/" className="btn btn-secondary">Go home</Link>} />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!response.trim() || loading) return
    setLoading(true)
    try { await submitResponse({ slug: slug!, content: response.trim() }); setSubmitted(true) }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to submit') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--surface-base)' }}>
      <div className="w-full max-w-lg animate-fade-in">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
          <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--accent)' }}>S</div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>Silo</span>
        </Link>

        {submitted ? (
          <div className="panel p-8 text-center space-y-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}
            >
              <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Response sent!</h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Submitted completely anonymously. The question creator can't see who you are.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
              <Lock size={11} /> 100% anonymous · powered by Silo
            </div>
            <button onClick={() => { setSubmitted(false); setResponse('') }} className="btn btn-secondary w-full justify-center">
              Send another response
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="panel p-5">
              <div className="flex items-center gap-3 mb-4">
                {question.ownerProfile ? (
                  <Avatar username={question.ownerProfile.username} avatarSeed={question.ownerProfile.avatarSeed} avatarEmoji={question.ownerProfile.avatarEmoji} size="sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full" style={{ background: 'var(--surface-4)' }} />
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>@{question.ownerProfile?.username ?? 'anonymous'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>asks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
                >
                  <CircleHelp size={14} style={{ color: 'var(--accent-muted)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>{question.question}</p>
                  {question.description && <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-2)' }}>{question.description}</p>}
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={13} style={{ color: 'var(--success)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>Your response is 100% anonymous</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value.slice(0, 1000))}
                  placeholder="Type your anonymous response..."
                  rows={5}
                  autoFocus
                  className="input w-full resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{response.length}/1000</span>
                  <button type="submit" disabled={!response.trim() || loading} className="btn btn-primary">
                    {loading ? <span className="spinner" /> : <><Send size={14} /> Send anonymously</>}
                  </button>
                </div>
              </form>
            </div>

            <div className="text-center">
              <Link to="/" className="text-xs transition-colors" style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                Create your own Q&A on <span style={{ color: 'var(--accent-muted)', fontWeight: 500 }}>Silo</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
