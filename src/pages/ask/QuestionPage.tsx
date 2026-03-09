import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { Send, CircleHelp, Lock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Public page — no auth required
export function QuestionPage() {
  const { slug } = useParams<{ slug: string }>()
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const question = useQuery(
    api.questions.getBySlug,
    slug ? { slug } : 'skip'
  )

  const submitResponse = useMutation(api.questions.submitResponse)

  if (question === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-silo-500/30 border-t-silo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <EmptyState
          icon="🫙"
          title="Question not found"
          description="This link may be invalid or the question was removed."
          action={<Link to="/" className="btn-secondary">Go Home</Link>}
        />
      </div>
    )
  }

  if (!question.isActive) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <EmptyState
          icon="🔒"
          title="This question is closed"
          description="The owner has stopped accepting responses."
          action={<Link to="/" className="btn-secondary">Go Home</Link>}
        />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!response.trim() || loading) return
    setLoading(true)
    try {
      await submitResponse({ slug: slug!, content: response.trim() })
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-silo-700/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-700/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative animate-fade-up">
        {/* Silo brand */}
        <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
          <div className="w-7 h-7 rounded-lg bg-gradient-silo flex items-center justify-center">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="text-base font-black text-ink-primary">silo</span>
        </Link>

        {submitted ? (
          /* Success state */
          <div className="card p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink-primary mb-2">Response sent! 🎉</h2>
              <p className="text-sm text-ink-secondary">
                Your response was submitted completely anonymously. The question creator can't see who you are.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
              <Lock size={12} />
              100% anonymous · powered by silo
            </div>
            <button
              onClick={() => { setSubmitted(false); setResponse('') }}
              className="btn-secondary w-full justify-center"
            >
              Send Another Response
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Question card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                {question.ownerProfile ? (
                  <Avatar
                    username={question.ownerProfile.username}
                    avatarSeed={question.ownerProfile.avatarSeed}
                    avatarEmoji={question.ownerProfile.avatarEmoji}
                    size="md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border" />
                )}
                <div>
                  <p className="text-sm font-semibold text-ink-primary">
                    @{question.ownerProfile?.username ?? 'anonymous'}
                  </p>
                  <p className="text-xs text-ink-muted">asks</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-silo-500/20 border border-silo-500/30 flex items-center justify-center shrink-0">
                  <CircleHelp size={16} className="text-silo-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-ink-primary leading-snug">
                    {question.question}
                  </p>
                  {question.description && (
                    <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">
                      {question.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Response form */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={14} className="text-emerald-400" />
                <span className="text-sm font-medium text-ink-secondary">
                  Your response is 100% anonymous
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value.slice(0, 1000))}
                  placeholder="Type your anonymous response..."
                  rows={5}
                  autoFocus
                  className="input-base resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted">{response.length}/1000</span>
                  <button
                    type="submit"
                    disabled={!response.trim() || loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={15} />
                        Send Anonymously
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Powered by */}
            <div className="text-center">
              <Link to="/" className="text-xs text-ink-muted hover:text-ink-secondary transition-colors">
                Create your own anonymous Q&A on <span className="font-semibold text-silo-400">silo</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
