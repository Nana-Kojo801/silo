import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { timeAgo, cn } from '@/lib/utils'
import {
  Plus, CircleHelp, MessageSquare, ExternalLink, ToggleLeft, ToggleRight, Trash2, Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

export function AskPage() {
  const { profile } = useCurrentUser()
  const [createOpen, setCreateOpen] = useState(false)

  const questions = useQuery(api.questions.listMine)

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">❓ Ask Me</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Create shareable links for anonymous Q&A
          </p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
            <Plus size={16} />
            New Question
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="card p-4 border-silo-500/20 bg-gradient-silo-soft">
        <div className="flex items-start gap-3">
          <CircleHelp size={18} className="text-silo-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink-primary mb-0.5">How it works</p>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Create a question prompt and share the link. Anyone can respond anonymously — no account needed. You see all responses, they never know who you are.
            </p>
          </div>
        </div>
      </div>

      {/* Questions list */}
      {questions === undefined ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-bg-elevated rounded w-3/4 mb-3" />
              <div className="h-3 bg-bg-elevated rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon="❓"
          title="No questions yet"
          description="Create your first anonymous question prompt and share the link."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus size={16} />
              Create Question
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q._id} question={q} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {profile && (
        <CreateQuestionModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  )
}

function QuestionCard({ question }: { question: any }) {
  const toggleActive = useMutation(api.questions.toggleActive)
  const removeQuestion = useMutation(api.questions.remove)

  const shareUrl = `${window.location.origin}/ask/${question.slug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied!')
  }

  async function handleToggle() {
    try {
      await toggleActive({ questionId: question._id })
      toast.success(question.isActive ? 'Question paused' : 'Question activated')
    } catch {
      toast.error('Failed to toggle')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this question and all its responses?')) return
    try {
      await removeQuestion({ questionId: question._id })
      toast.success('Question deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Question */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          question.isActive ? 'bg-silo-500/20 border border-silo-500/30' : 'bg-bg-elevated border border-border'
        )}>
          <CircleHelp size={16} className={question.isActive ? 'text-silo-400' : 'text-ink-muted'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink-primary text-sm leading-snug">{question.question}</p>
          {question.description && (
            <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{question.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-ink-muted">{timeAgo(question.createdAt)}</span>
            <span className={cn('badge text-xs', question.isActive ? 'badge-emerald' : 'bg-bg-elevated text-ink-muted border border-border')}>
              {question.isActive ? '● Active' : '○ Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats + actions */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <Link
          to={`/ask/${question._id}/responses`}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-silo-400 transition-colors"
        >
          <MessageSquare size={14} />
          {question.responseCount} {question.responseCount === 1 ? 'response' : 'responses'}
        </Link>

        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="btn-ghost text-xs px-2.5 py-1.5">
            <Copy size={13} />
            Copy Link
          </button>

          <Link
            to={`/ask/${question.slug}`}
            target="_blank"
            className="btn-ghost text-xs px-2.5 py-1.5"
          >
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleToggle}
            className={cn(
              'btn-ghost text-xs px-2.5 py-1.5',
              question.isActive ? 'text-ink-secondary' : 'text-silo-400'
            )}
          >
            {question.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          </button>

          <button onClick={handleDelete} className="btn-ghost text-xs px-2.5 py-1.5 text-rose-400/70 hover:text-rose-400">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateQuestionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const createQuestion = useMutation(api.questions.create)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || loading) return
    setLoading(true)
    try {
      const result = await createQuestion({
        question: question.trim(),
        description: description.trim() || undefined,
      })
      const shareUrl = `${window.location.origin}/ask/${result.slug}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Question created! Link copied to clipboard 🎉')
      setQuestion('')
      setDescription('')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Anonymous Question">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="section-label mb-2 block">Your Question *</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 280))}
            placeholder="Ask me anything... 👀"
            rows={3}
            autoFocus
            className="input-base resize-none"
          />
          <p className="text-xs text-ink-muted mt-1 text-right">{question.length}/280</p>
        </div>

        <div>
          <label className="section-label mb-2 block">Context <span className="font-normal normal-case text-ink-muted">(optional)</span></label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            placeholder="Add a bit more context..."
            className="input-base"
          />
        </div>

        <div className="bg-bg-card rounded-xl p-3 border border-border">
          <p className="text-xs text-ink-secondary leading-relaxed">
            📋 A shareable link will be created. Anyone can respond anonymously — no login needed.
            The link will be copied to your clipboard automatically.
          </p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create & Copy Link</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
