import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { CONFESSION_CATEGORIES } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Hash } from 'lucide-react'

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  type?: 'post' | 'confession'
  profile: {
    username: string
    avatarSeed: string
    avatarEmoji?: string
  }
}

export function CreatePostModal({ open, onClose, type: defaultType = 'post', profile }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'post' | 'confession'>(defaultType)
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const createPost = useMutation(api.posts.createPost)

  const maxLength = 2000
  const remaining = maxLength - content.length
  const isOverLimit = remaining < 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading || isOverLimit) return
    if (type === 'confession' && !category) { toast.error('Pick a category'); return }

    setLoading(true)
    try {
      const parsedTags = tags
        .split(/[,\s]+/)
        .map(t => t.replace(/^#/, '').trim().toLowerCase())
        .filter(t => t.length > 0)
        .slice(0, 5)

      await createPost({ content: content.trim(), type, category: type === 'confession' ? category : undefined, tags: parsedTags })
      toast.success(type === 'confession' ? 'Confession posted' : 'Post shared')
      setContent(''); setCategory(''); setTags('')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Type toggle */}
        <div className="segment-control">
          <button type="button" onClick={() => setType('post')} className={`segment-btn${type === 'post' ? ' segment-btn-active' : ''}`}>
            Post
          </button>
          <button type="button" onClick={() => setType('confession')} className={`segment-btn${type === 'confession' ? ' segment-btn-active' : ''}`}>
            Confession
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2.5">
          <Avatar username={profile.username} avatarSeed={profile.avatarSeed} avatarEmoji={profile.avatarEmoji} size="sm" />
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>@{profile.username}</span>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              {type === 'confession' ? 'posted anonymously' : 'posting as yourself'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={type === 'confession' ? "What's your confession? No one will know..." : "What's on your mind?"}
            rows={5}
            autoFocus
            className="input w-full resize-none"
            style={isOverLimit ? { borderColor: 'var(--danger)' } : {}}
          />
          <div
            className="absolute bottom-3 right-3 text-xs mono-text"
            style={{ color: remaining < 50 ? 'var(--danger)' : 'var(--text-3)' }}
          >
            {remaining}
          </div>
        </div>

        {/* Category */}
        {type === 'confession' && (
          <div>
            <label className="label block mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CONFESSION_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded text-xs font-medium transition-all border"
                  style={{
                    borderColor: category === cat.id ? 'var(--accent)' : 'var(--border-2)',
                    background: category === cat.id ? 'var(--accent-subtle)' : 'var(--surface-3)',
                    color: category === cat.id ? 'var(--accent-muted)' : 'var(--text-2)',
                  }}
                >
                  <span className="text-base">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {type === 'post' && (
          <div className="relative">
            <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="tags, separated by commas"
              className="input w-full pl-8 text-sm"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={onClose} className="btn btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={!content.trim() || loading || isOverLimit} className="btn btn-primary">
            {loading ? <span className="spinner" /> : (type === 'confession' ? 'Confess' : 'Post')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
