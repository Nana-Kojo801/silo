import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { timeAgo, formatCount, getCategoryInfo, truncate } from '@/lib/utils'
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

export function PostCard({ post, compact, showFullContent }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLike = useMutation(api.likes.togglePostLike)
  const deletePost = useMutation(api.posts.deletePost)

  const content = showFullContent ? post.content : truncate(post.content, 280)
  const category = post.type === 'confession' && post.category ? getCategoryInfo(post.category) : null
  const profile = post.authorProfile

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    const prev = liked
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
    try { await toggleLike({ postId: post._id }) }
    catch { setLiked(prev); setLikeCount(post.likeCount); toast.error('Failed to like') }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setMenuOpen(false)
    try { await deletePost({ postId: post._id }); toast.success('Post deleted') }
    catch { toast.error('Failed to delete') }
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)
      .then(() => toast.success('Link copied'))
    setMenuOpen(false)
  }

  return (
    <Link to={`/post/${post._id}`} className="block feed-item group">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        {profile ? (
          <Avatar
            username={profile.username}
            avatarSeed={profile.avatarSeed}
            avatarEmoji={profile.avatarEmoji}
            size={compact ? 'sm' : 'sm'}
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full shrink-0"
            style={{ background: 'var(--surface-4)' }}
          />
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
            {profile ? `@${profile.username}` : '@anonymous'}
          </span>
          {category && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}
            >
              {category.emoji} {category.label}
            </span>
          )}
          <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--text-3)' }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Menu */}
        <div className="relative shrink-0" onClick={e => e.preventDefault()}>
          <button
            className="btn btn-ghost w-7 h-7 p-0 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen) }}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              className="dropdown absolute right-0 top-8 z-20 min-w-32 animate-scale-in"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button onClick={handleShare} className="dropdown-item">
                <Share2 size={13} /> Copy link
              </button>
              <button onClick={handleDelete} className="dropdown-item" style={{ color: 'var(--danger)' }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p
        className="text-sm leading-relaxed mb-3"
        style={{ color: 'var(--text-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="text-[11px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-4)', color: 'var(--text-3)' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5" onClick={e => e.preventDefault()}>
        <button
          onClick={handleLike}
          className="rxn"
          style={liked ? { color: 'var(--secondary)', background: 'rgba(249,77,106,0.1)' } : {}}
        >
          <Heart size={14} style={liked ? { fill: 'currentColor' } : {}} />
          <span>{formatCount(likeCount)}</span>
        </button>
        <button className="rxn">
          <MessageCircle size={14} />
          <span>{formatCount(post.commentCount)}</span>
        </button>
        <button onClick={handleShare} className="rxn ml-auto">
          <Share2 size={13} />
        </button>
      </div>
    </Link>
  )
}
