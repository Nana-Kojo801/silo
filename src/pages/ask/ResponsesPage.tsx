import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { EmptyState } from '@/components/ui/EmptyState'
import { timeAgo, REACTION_EMOJIS } from '@/lib/utils'
import { ArrowLeft, CircleHelp, Copy, ExternalLink, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Id } from '../../../convex/_generated/dataModel'

const REACTIONS = ['love', 'laugh', 'sad', 'surprised'] as const

export function ResponsesPage() {
  const { questionId } = useParams<{ questionId: string }>()
  const { user } = useCurrentUser()
  const navigate = useNavigate()

  const question = useQuery(api.questions.getById, questionId ? { questionId: questionId as Id<'anonymousQuestions'> } : 'skip')
  const responses = useQuery(api.questions.listResponses, questionId && user ? { questionId: questionId as Id<'anonymousQuestions'> } : 'skip')
  const reactToResponse = useMutation(api.questions.reactToResponse)

  if (question === undefined) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <span className="spinner" />
      </div>
    )
  }

  if (!question) {
    return <EmptyState icon="📭" title="Question not found" action={<Link to="/ask" className="btn btn-secondary">My Questions</Link>} />
  }

  if (question.ownerId !== user?._id) {
    return <EmptyState icon="🔒" title="Not authorized" description="Only the question owner can view responses." action={<Link to="/ask" className="btn btn-secondary">Back</Link>} />
  }

  const shareUrl = `${window.location.origin}/ask/${question.slug}`

  async function handleReact(responseId: Id<'anonymousResponses'>, reaction: string) {
    try { await reactToResponse({ responseId, reaction: reaction as any }) }
    catch { toast.error('Failed to react') }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => navigate('/ask')} className="btn btn-ghost -ml-1 text-sm">
        <ArrowLeft size={15} /> My Questions
      </button>

      {/* Question header */}
      <div className="panel p-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
          >
            <CircleHelp size={14} style={{ color: 'var(--accent-muted)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>{question.question}</p>
            {question.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{question.description}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
            <MessageSquare size={12} />
            {question.responseCount} {question.responseCount === 1 ? 'response' : 'responses'}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied'))} className="btn btn-secondary text-xs px-2.5 py-1.5">
              <Copy size={12} /> Copy link
            </button>
            <a href={shareUrl} target="_blank" rel="noopener" className="btn btn-secondary text-xs px-2.5 py-1.5">
              <ExternalLink size={12} /> Preview
            </a>
          </div>
        </div>
      </div>

      {/* Responses */}
      {responses === undefined ? (
        <div className="feed-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="feed-item space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
            </div>
          ))}
        </div>
      ) : responses.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No responses yet"
          description="Share your link to start collecting anonymous answers!"
          action={
            <button onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied'))} className="btn btn-primary">
              <Copy size={14} /> Copy share link
            </button>
          }
        />
      ) : (
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{responses.length} anonymous responses</p>
          <div className="feed-list">
            {responses.map(r => (
              <div
                key={r._id}
                className="feed-item space-y-3"
                style={!r.isRead ? { borderLeft: '2px solid var(--accent)' } : {}}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-1)' }}>{r.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(r.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    {REACTIONS.map(reaction => (
                      <button
                        key={reaction}
                        onClick={() => handleReact(r._id, reaction)}
                        className="w-7 h-7 rounded flex items-center justify-center text-sm transition-all"
                        style={{
                          background: r.reaction === reaction ? 'var(--accent-subtle)' : 'var(--surface-3)',
                          border: `1px solid ${r.reaction === reaction ? 'var(--accent-border)' : 'transparent'}`,
                          transform: r.reaction === reaction ? 'scale(1.1)' : '',
                        }}
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
        </div>
      )}
    </div>
  )
}
