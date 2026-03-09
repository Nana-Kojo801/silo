import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { timeAgo } from '@/lib/utils'
import { Plus, CircleHelp, MessageSquare, ExternalLink, ToggleLeft, ToggleRight, Trash2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export function AskPage() {
  const { profile } = useCurrentUser()
  const [createOpen, setCreateOpen] = useState(false)
  const questions = useQuery(api.questions.listMine)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Ask Me</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Anonymous Q&A links</p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary text-sm">
            <Plus size={15} /> New question
          </button>
        )}
      </div>

      {/* Info */}
      <div className="panel p-4 flex items-start gap-3" style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-subtle)' }}>
        <CircleHelp size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-muted)' }} />
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Create a question and share the link. Anyone can respond anonymously — no account needed.
        </p>
      </div>

      {questions === undefined ? (
        <div className="feed-list">
          {[1, 2].map(i => (
            <div key={i} className="feed-item">
              <div className="skeleton h-4 w-3/4 mb-2 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon="❓"
          title="No questions yet"
          description="Create your first anonymous Q&A prompt."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
              <Plus size={15} /> Create question
            </button>
          }
        />
      ) : (
        <div className="feed-list">
          {questions.map(q => <QuestionCard key={q._id} question={q} />)}
        </div>
      )}

      {profile && <CreateQuestionModal open={createOpen} onClose={() => setCreateOpen(false)} />}
    </div>
  )
}

function QuestionCard({ question }: { question: any }) {
  const toggleActive = useMutation(api.questions.toggleActive)
  const removeQuestion = useMutation(api.questions.remove)
  const shareUrl = `${window.location.origin}/ask/${question.slug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied')
  }

  async function handleToggle() {
    try { await toggleActive({ questionId: question._id }) }
    catch { toast.error('Failed to toggle') }
  }

  async function handleDelete() {
    if (!confirm('Delete this question and all its responses?')) return
    try { await removeQuestion({ questionId: question._id }); toast.success('Question deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="feed-item space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center shrink-0"
          style={{
            background: question.isActive ? 'var(--accent-subtle)' : 'var(--surface-3)',
            border: `1px solid ${question.isActive ? 'var(--accent-border)' : 'var(--border-1)'}`,
          }}
        >
          <CircleHelp size={14} style={{ color: question.isActive ? 'var(--accent-muted)' : 'var(--text-3)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-1)' }}>{question.question}</p>
          {question.description && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{question.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(question.createdAt)}</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                background: question.isActive ? 'var(--success-bg)' : 'var(--surface-3)',
                color: question.isActive ? 'var(--success)' : 'var(--text-3)',
              }}
            >
              {question.isActive ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid var(--border-1)' }}>
        <Link to={`/ask/${question._id}/responses`} className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-muted)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <MessageSquare size={13} />
          {question.responseCount} {question.responseCount === 1 ? 'response' : 'responses'}
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="btn btn-ghost text-xs px-2 py-1">
            <Copy size={12} /> Copy
          </button>
          <a href={shareUrl} target="_blank" rel="noopener" className="btn btn-ghost text-xs px-2 py-1">
            <ExternalLink size={12} />
          </a>
          <button onClick={handleToggle} className="btn btn-ghost text-xs px-2 py-1">
            {question.isActive ? <ToggleRight size={14} style={{ color: 'var(--accent-muted)' }} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={handleDelete} className="btn btn-ghost text-xs px-2 py-1" style={{ color: 'var(--danger)' }}>
            <Trash2 size={12} />
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
      const result = await createQuestion({ question: question.trim(), description: description.trim() || undefined })
      await navigator.clipboard.writeText(`${window.location.origin}/ask/${result.slug}`)
      toast.success('Question created! Link copied.')
      setQuestion(''); setDescription(''); onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create question')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create anonymous question">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="label block mb-1.5">Question *</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value.slice(0, 280))}
            placeholder="Ask me anything..."
            rows={3}
            autoFocus
            className="input w-full resize-none"
          />
          <p className="text-xs text-right mt-1" style={{ color: 'var(--text-3)' }}>{question.length}/280</p>
        </div>
        <div>
          <label className="label block mb-1.5">Context <span className="font-normal" style={{ color: 'var(--text-3)' }}>(optional)</span></label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 200))}
            placeholder="Add context..."
            className="input w-full"
          />
        </div>
        <div className="rounded p-3 text-xs leading-relaxed" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
          A shareable link will be created. Anyone can respond anonymously — the link will be copied automatically.
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={!question.trim() || loading} className="btn btn-primary flex-1 justify-center">
            {loading ? <span className="spinner" /> : 'Create & copy link'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
