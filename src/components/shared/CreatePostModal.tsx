import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { cn, CONFESSION_CATEGORIES } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Hash, ChevronDown } from 'lucide-react'

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
    if (type === 'confession' && !category) {
      toast.error('Pick a category for your confession')
      return
    }

    setLoading(true)
    try {
      const parsedTags = tags
        .split(/[,\s]+/)
        .map((t) => t.replace(/^#/, '').trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 5)

      await createPost({
        content: content.trim(),
        type,
        category: type === 'confession' ? category : undefined,
        tags: parsedTags,
      })

      toast.success(type === 'confession' ? 'Confession posted 🤫' : 'Post shared!')
      setContent('')
      setCategory('')
      setTags('')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-bg-card rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setType('post')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
              type === 'post'
                ? 'bg-silo-500 text-white shadow-glow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            )}
          >
            Post
          </button>
          <button
            type="button"
            onClick={() => setType('confession')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
              type === 'confession'
                ? 'bg-silo-500 text-white shadow-glow-xs'
                : 'text-ink-secondary hover:text-ink-primary'
            )}
          >
            Confession 🤫
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar
            username={profile.username}
            avatarSeed={profile.avatarSeed}
            avatarEmoji={profile.avatarEmoji}
            size="md"
          />
          <div>
            <span className="font-semibold text-sm text-ink-primary">@{profile.username}</span>
            <p className="text-xs text-ink-muted">posting anonymously</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'confession'
                ? "What's your confession? No one will know it's you..."
                : "What's on your mind?"
            }
            rows={5}
            autoFocus
            className={cn(
              'input-base resize-none',
              isOverLimit && 'border-rose-500 focus:border-rose-500'
            )}
          />
          <div className={cn(
            'absolute bottom-3 right-3 text-xs font-mono',
            remaining < 50 ? 'text-rose-400' : 'text-ink-muted'
          )}>
            {remaining}
          </div>
        </div>

        {/* Category (confessions only) */}
        {type === 'confession' && (
          <div>
            <label className="section-label mb-2 block">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CONFESSION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all duration-150',
                    category === cat.id
                      ? 'border-silo-500 bg-silo-500/10 text-silo-300'
                      : 'border-border bg-bg-card text-ink-secondary hover:border-border-strong hover:text-ink-primary'
                  )}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags (posts only) */}
        {type === 'post' && (
          <div className="relative">
            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tags, separated by commas (optional)"
              className="input-base pl-8 text-sm py-2.5"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim() || loading || isOverLimit}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : (
              type === 'confession' ? 'Confess 🤫' : 'Post'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
