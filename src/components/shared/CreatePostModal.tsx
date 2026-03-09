import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { cn, CONFESSION_CATEGORIES } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Hash } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  type?: 'post' | 'confession'
  profile: { username: string; avatarSeed: string; avatarEmoji?: string }
}

export function CreatePostModal({ open, onClose, type: defaultType = 'post', profile }: Props) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'post' | 'confession'>(defaultType)
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const createPost = useMutation(api.posts.createPost)
  const max = 2000
  const remaining = max - content.length
  const over = remaining < 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading || over) return
    if (type === 'confession' && !category) return toast.error('Pick a category')
    setLoading(true)
    try {
      const parsedTags = tags.split(/[,\s]+/).map(t => t.replace(/^#/, '').trim().toLowerCase()).filter(t => t.length > 0).slice(0, 5)
      await createPost({ content: content.trim(), type, category: type === 'confession' ? category : undefined, tags: parsedTags })
      toast.success(type === 'confession' ? 'Confession posted' : 'Posted!')
      setContent(''); setCategory(''); setTags(''); onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form onSubmit={submit} className="p-5 space-y-4">

        {/* Type tabs */}
        <div className="flex gap-1 p-0.5 bg-surface-subtle rounded-lg border border-line">
          {(['post', 'confession'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-100',
                type === t ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-muted hover:text-ink-secondary'
              )}
            >
              {t === 'post' ? 'Post' : '🤫 Confession'}
            </button>
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2.5">
          <Avatar username={profile.username} avatarSeed={profile.avatarSeed} avatarEmoji={profile.avatarEmoji} size="sm" />
          <div>
            <p className="font-mono text-sm font-500 text-ink">@{profile.username}</p>
            <p className="text-xs text-ink-muted">posting anonymously</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={type === 'confession' ? "What's your confession? They'll never know…" : "What's on your mind?"}
            rows={5}
            autoFocus
            className={cn('input text-base', over && 'border-rose focus:shadow-none')}
          />
          <span className={cn(
            'absolute bottom-2.5 right-3 font-mono text-xs',
            remaining < 100 ? (over ? 'text-rose-fg' : 'text-amber-fg') : 'text-ink-disabled'
          )}>
            {remaining}
          </span>
        </div>

        {/* Category (confessions) */}
        {type === 'confession' && (
          <div>
            <p className="t-label mb-2">Category *</p>
            <div className="grid grid-cols-3 gap-1.5">
              {CONFESSION_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all',
                    category === cat.id
                      ? 'border-violet-600/60 bg-violet-600/10 text-ink'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink-secondary'
                  )}
                >
                  <span className="text-lg leading-none">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags (posts) */}
        {type === 'post' && (
          <div className="relative">
            <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none" />
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="tags, separated by commas"
              className="input pl-8 text-sm py-2"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-line">
          <button type="button" onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button
            type="submit"
            disabled={!content.trim() || loading || over}
            className="btn-primary btn-sm gap-2"
          >
            {loading ? <span className="spinner spinner-sm" /> : null}
            {type === 'confession' ? 'Confess' : 'Post'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
