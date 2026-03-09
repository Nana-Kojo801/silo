import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { cn, timeAgo, formatCount, getCategoryInfo, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Id } from '../../../convex/_generated/dataModel'

const CATEGORY_COLORS: Record<string, string> = {
  campus:        '#7C3AED',
  relationships: '#F43F5E',
  friendships:   '#10B981',
  academics:     '#F59E0B',
  hot_takes:     '#EF4444',
  secrets:       '#8B5CF6',
}

interface PostCardProps {
  post: {
    _id: Id<'posts'>
    content: string
    type: 'post' | 'confession'
    category?: string
    tags?: string[]
    likeCount: number
    commentCount: number
    createdAt: number
    authorProfile?: { username: string; avatarSeed: string; avatarEmoji?: string } | null
    liked?: boolean
  }
  currentUserId?: Id<'users'>
  compact?: boolean
  showFullContent?: boolean
}

export function PostCard({ post, compact, showFullContent }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLike = useMutation(api.likes.togglePostLike)
  const deletePost = useMutation(api.posts.deletePost)

  const content = showFullContent ? post.content : truncate(post.content, 300)
  const category = post.type === 'confession' && post.category ? getCategoryInfo(post.category) : null
  const stripeColor = category ? CATEGORY_COLORS[category.id] : null
  const profile = post.authorProfile

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    const prev = liked
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
    try { await toggleLike({ postId: post._id }) } catch {
      setLiked(prev)
      setLikeCount(post.likeCount)
      toast.error('Failed to like')
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation(); setMenuOpen(false)
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)
      .then(() => toast.success('Link copied'))
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation(); setMenuOpen(false)
    try { await deletePost({ postId: post._id }); toast.success('Deleted') } catch { toast.error('Failed') }
  }

  return (
    <Link to={`/post/${post._id}`} className="block group">
      <article
        className={cn(
          'card-interactive relative overflow-hidden',
          compact ? 'p-4' : 'p-5'
        )}
      >
        {/* Confession accent stripe */}
        {stripeColor && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[7px]"
            style={{ background: stripeColor }}
          />
        )}

        <div className={cn(stripeColor && 'pl-3')}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {profile ? (
                <Avatar
                  username={profile.username}
                  avatarSeed={profile.avatarSeed}
                  avatarEmoji={profile.avatarEmoji}
                  size={compact ? 'xs' : 'sm'}
                />
              ) : (
                <div className={cn('rounded-lg bg-surface-raised border border-line shrink-0', compact ? 'w-6 h-6' : 'w-8 h-8')} />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-500 text-ink leading-none">
                    @{profile?.username ?? 'anon'}
                  </span>
                  {category && (
                    <span className="badge badge-subtle text-[10px] gap-1">
                      <span>{category.emoji}</span>
                      {category.label}
                    </span>
                  )}
                </div>
                <span className="t-meta text-xs mt-0.5 block">{timeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Menu */}
            <div className="relative shrink-0" onClick={e => e.preventDefault()}>
              <button
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-md text-ink-disabled',
                  'hover:bg-surface-raised hover:text-ink-secondary transition-all',
                  'opacity-0 group-hover:opacity-100'
                )}
                onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              >
                <MoreHorizontal size={15} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-8 z-20 py-1 min-w-[9rem] rounded-lg border border-line bg-surface-raised shadow-lg animate-scale-in"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button onClick={handleShare}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-secondary hover:bg-surface-overlay hover:text-ink transition-colors">
                    <Share2 size={13} /> Copy link
                  </button>
                  <button onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-fg hover:bg-rose/8 transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <p className={cn(
            'text-ink leading-[1.65] whitespace-pre-wrap break-words mb-3',
            compact ? 'text-sm line-clamp-3' : 'text-base'
          )}>
            {content}
          </p>

          {/* Tags */}
          {!compact && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="tag text-xs"># {tag}</span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="divider mb-3" />

          {/* Action bar */}
          <div className="flex items-center gap-0.5" onClick={e => e.preventDefault()}>
            <button
              onClick={handleLike}
              className={cn('reaction-btn gap-1.5', liked && 'reaction-btn-active-rose')}
            >
              <Heart size={14} className={cn('transition-transform duration-100', liked && 'fill-current scale-110')} />
              <span className="font-mono text-xs">{formatCount(likeCount)}</span>
            </button>

            <Link
              to={`/post/${post._id}`}
              className="reaction-btn gap-1.5"
              onClick={e => e.stopPropagation()}
            >
              <MessageCircle size={14} />
              <span className="font-mono text-xs">{formatCount(post.commentCount)}</span>
            </Link>

            <button
              onClick={handleShare}
              className="reaction-btn ml-auto"
              title="Copy link"
            >
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
