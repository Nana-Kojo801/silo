import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit2, Share2 } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { cn, timeAgo, formatCount, getCategoryInfo, truncate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Id } from '../../../convex/_generated/dataModel'

interface Profile {
  _id: Id<'profiles'>
  username: string
  avatarSeed: string
  avatarEmoji?: string
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
    authorProfile?: Profile | null
    liked?: boolean
  }
  currentUserId?: Id<'users'>
  compact?: boolean
  showFullContent?: boolean
}

export function PostCard({ post, currentUserId, compact, showFullContent }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLike = useMutation(api.likes.togglePostLike)
  const deletePost = useMutation(api.posts.deletePost)

  const isOwner = currentUserId && post.authorProfile &&
    // We don't have userId on profile directly, but we can check via context
    false // placeholder — will be derived from parent

  const content = showFullContent ? post.content : truncate(post.content, 280)
  const category = post.type === 'confession' && post.category ? getCategoryInfo(post.category) : null

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const prev = liked
    setLiked(!liked)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
    try {
      await toggleLike({ postId: post._id })
    } catch {
      setLiked(prev)
      setLikeCount(post.likeCount)
      toast.error('Failed to like')
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen(false)
    try {
      await deletePost({ postId: post._id })
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/post/${post._id}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
    setMenuOpen(false)
  }

  const profile = post.authorProfile

  return (
    <Link to={`/post/${post._id}`} className="block">
      <div className={cn('card-hover p-5 group', compact && 'p-4')}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {profile ? (
              <Avatar
                username={profile.username}
                avatarSeed={profile.avatarSeed}
                avatarEmoji={profile.avatarEmoji}
                size={compact ? 'sm' : 'md'}
              />
            ) : (
              <div className={cn(
                'rounded-full bg-bg-elevated border border-border shrink-0',
                compact ? 'w-8 h-8' : 'w-10 h-10'
              )} />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-ink-primary">
                  {profile ? `@${profile.username}` : '@anonymous'}
                </span>
                {category && (
                  <span className={cn('badge text-xs', category.color)}>
                    {category.emoji} {category.label}
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-muted">{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative" onClick={(e) => e.preventDefault()}>
            <button
              className="btn-ghost w-8 h-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen) }}
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 bg-bg-surface border border-border rounded-xl shadow-modal py-1 min-w-36 animate-scale-in"
                   onMouseLeave={() => setMenuOpen(false)}>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-elevated transition-colors"
                >
                  <Share2 size={14} /> Copy link
                </button>
                {isOwner && (
                  <>
                    <Link
                      to={`/post/${post._id}/edit`}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-elevated transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={cn('post-content mb-4', compact ? 'text-sm' : 'text-[0.9375rem]')}>
          {content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
              liked
                ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-ink-muted hover:text-ink-secondary hover:bg-bg-elevated'
            )}
          >
            <Heart
              size={15}
              className={cn('transition-transform', liked && 'fill-current scale-110')}
            />
            <span>{formatCount(likeCount)}</span>
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted hover:text-ink-secondary hover:bg-bg-elevated transition-colors"
          >
            <MessageCircle size={15} />
            <span>{formatCount(post.commentCount)}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted hover:text-ink-secondary hover:bg-bg-elevated transition-colors ml-auto"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </Link>
  )
}
