import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { EmptyState } from '@/components/ui/EmptyState'
import { timeAgo, REACTION_EMOJIS, cn } from '@/lib/utils'
import { ArrowLeft, CircleHelp, Copy, ExternalLink, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Id } from '../../../convex/_generated/dataModel'

const REACTIONS = ['love', 'laugh', 'sad', 'surprised'] as const

export function ResponsesPage() {
  const { questionId } = useParams<{ questionId: string }>()
  const { user } = useCurrentUser()
  const navigate = useNavigate()

  const question = useQuery(
    api.questions.getById,
    questionId ? { questionId: questionId as Id<'anonymousQuestions'> } : 'skip'
  )
  const responses = useQuery(
    api.questions.listResponses,
    questionId && user ? { questionId: questionId as Id<'anonymousQuestions'> } : 'skip'
  )

  const reactToResponse = useMutation(api.questions.reactToResponse)

  if (question === undefined) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-5 h-5 border-2 border-silo-500/30 border-t-silo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!question) {
    return (
      <EmptyState
        icon="🫙"
        title="Question not found"
        action={<Link to="/ask" className="btn-secondary">My Questions</Link>}
      />
    )
  }

  if (question.ownerId !== user?._id) {
    return (
      <EmptyState
        icon="🔒"
        title="Not authorized"
        description="Only the question owner can view responses."
        action={<Link to="/ask" className="btn-secondary">Back</Link>}
      />
    )
  }

  const shareUrl = `${window.location.origin}/ask/${question.slug}`

  async function handleReact(responseId: Id<'anonymousResponses'>, reaction: string) {
    try {
      await reactToResponse({ responseId, reaction: reaction as any })
    } catch {
      toast.error('Failed to react')
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied!')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Back */}
      <button onClick={() => navigate('/ask')} className="btn-ghost -ml-2">
        <ArrowLeft size={16} />
        My Questions
      </button>

      {/* Question header */}
      <div className="card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-silo-500/20 border border-silo-500/30 flex items-center justify-center shrink-0">
            <CircleHelp size={16} className="text-silo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink-primary text-sm leading-snug">{question.question}</p>
            {question.description && (
              <p className="text-xs text-ink-secondary mt-0.5">{question.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <MessageSquare size={14} />
            {question.responseCount} {question.responseCount === 1 ? 'response' : 'responses'}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5">
              <Copy size={13} />
              Copy Link
            </button>
            <a href={shareUrl} target="_blank" rel="noopener" className="btn-secondary text-xs px-3 py-1.5">
              <ExternalLink size={13} />
              Preview
            </a>
          </div>
        </div>
      </div>

      {/* Responses */}
      {responses === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-bg-elevated rounded w-full mb-2" />
              <div className="h-4 bg-bg-elevated rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : responses.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No responses yet"
          description="Share your link to start collecting anonymous answers!"
          action={
            <button onClick={handleCopy} className="btn-primary">
              <Copy size={15} />
              Copy Share Link
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">{responses.length} anonymous responses</p>
          {responses.map((r) => (
            <div
              key={r._id}
              className={cn(
                'card p-5 space-y-3',
                !r.isRead && 'border-silo-500/20 bg-silo-500/5'
              )}
            >
              {/* Content */}
              <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
                {r.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted">{timeAgo(r.createdAt)}</span>

                {/* Reaction buttons */}
                <div className="flex items-center gap-1">
                  {REACTIONS.map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => handleReact(r._id, reaction)}
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all',
                        r.reaction === reaction
                          ? 'bg-silo-500/20 ring-1 ring-silo-500/40 scale-110'
                          : 'bg-bg-elevated hover:bg-bg-overlay hover:scale-110'
                      )}
                      title={reaction}
                    >
                      {REACTION_EMOJIS[reaction]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
