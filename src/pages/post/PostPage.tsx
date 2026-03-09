import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { timeAgo, formatCount, getCategoryInfo } from '@/lib/utils'
import { Heart, MessageCircle, Share2, ArrowLeft, Send, ChevronDown, Trash2, CornerDownRight } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Id } from '../../../convex/_generated/dataModel'

export function PostPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user, profile } = useCurrentUser()

  const post = useQuery(api.posts.getPost, postId ? { postId: postId as Id<'posts'> } : 'skip')
  const comments = useQuery(api.comments.listByPost, postId ? { postId: postId as Id<'posts'> } : 'skip')

  const toggleLike = useMutation(api.likes.togglePostLike)
  const deletePost = useMutation(api.posts.deletePost)
  const addComment = useMutation(api.comments.add)

  const [liked, setLiked] = useState(post?.liked ?? false)
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ id: Id<'comments'>; username: string } | null>(null)

  if (!postId) return null
  if (post === undefined || comments === undefined) return <FeedSkeleton />
  if (post === null) {
    return (
      <EmptyState
        icon="📭"
        title="Post not found"
        description="This post may have been deleted."
        action={<Link to="/feed" className="btn btn-secondary">Back to Feed</Link>}
      />
    )
  }

  const isOwner = user?._id === post.authorId
  const category = post.type === 'confession' && post.category ? getCategoryInfo(post.category) : null

  async function handleLike() {
    const prev = liked
    setLiked(!liked)
    setLikeCount((c: number) => liked ? c - 1 : c + 1)
    try { await toggleLike({ postId: post!._id }) }
    catch { setLiked(prev); setLikeCount(post!.likeCount); toast.error('Failed to like') }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    try { await deletePost({ postId: post!._id }); toast.success('Post deleted'); navigate(-1) }
    catch { toast.error('Failed to delete') }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      await addComment({ postId: post!._id, content: commentText.trim(), parentId: replyingTo?.id })
      setCommentText(''); setReplyingTo(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn btn-ghost -ml-1 text-sm">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Post */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {post.authorProfile ? (
              <Avatar username={post.authorProfile.username} avatarSeed={post.authorProfile.avatarSeed} avatarEmoji={post.authorProfile.avatarEmoji} size="md" />
            ) : (
              <div className="w-9 h-9 rounded-full" style={{ background: 'var(--surface-4)' }} />
            )}
            <div>
              <Link
                to={`/profile/${post.authorProfile?.username}`}
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--text-1)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-muted)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-1)')}
              >
                @{post.authorProfile?.username ?? 'anonymous'}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(post.createdAt)}</span>
                {category && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}
                  >
                    {category.emoji} {category.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <button onClick={handleDelete} className="btn btn-ghost text-xs" style={{ color: 'var(--danger)' }}>
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-1)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-4)', color: 'var(--text-3)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="h-px mb-4" style={{ background: 'var(--border-1)' }} />

        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className="rxn"
            style={liked ? { color: 'var(--secondary)', background: 'rgba(249,77,106,0.1)' } : {}}
          >
            <Heart size={14} style={liked ? { fill: 'currentColor' } : {}} />
            <span>{formatCount(likeCount)}</span>
          </button>
          <div className="rxn" style={{ cursor: 'default' }}>
            <MessageCircle size={14} />
            <span>{formatCount(post.commentCount)}</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied'))}
            className="rxn ml-auto"
          >
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>

      {/* Comment input */}
      {profile && (
        <div className="panel p-4">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 text-xs" style={{ color: 'var(--text-3)' }}>
              <span className="flex items-center gap-1.5"><CornerDownRight size={11} /> Replying to @{replyingTo.username}</span>
              <button onClick={() => setReplyingTo(null)}>Cancel</button>
            </div>
          )}
          <form onSubmit={handleComment} className="flex items-end gap-2.5">
            <Avatar username={profile.username} avatarSeed={profile.avatarSeed} avatarEmoji={profile.avatarEmoji} size="sm" className="shrink-0 mb-0.5" />
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
              rows={1}
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }}
              className="input flex-1 resize-none min-h-[2.5rem] py-2 text-sm"
            />
            <button type="submit" disabled={!commentText.trim() || submitting} className="btn btn-primary px-3 py-2 shrink-0">
              {submitting ? <span className="spinner" /> : <Send size={14} />}
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-3)' }}>
          {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </h3>
        {comments.length === 0 ? (
          <EmptyState icon="💬" title="No comments yet" description="Start the conversation" className="py-8" />
        ) : (
          <div className="feed-list">
            {comments.map(comment => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={post._id}
                currentUserId={user?._id}
                onReply={(id, username) => { setReplyingTo({ id, username }); document.querySelector('textarea')?.focus() }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CommentItem({
  comment, postId, currentUserId, onReply, depth = 0,
}: {
  comment: {
    _id: Id<'comments'>
    content: string
    likeCount: number
    replyCount: number
    createdAt: number
    liked: boolean
    authorProfile?: { username: string; avatarSeed: string; avatarEmoji?: string } | null
  }
  postId: Id<'posts'>
  currentUserId?: Id<'users'>
  onReply: (id: Id<'comments'>, username: string) => void
  depth?: number
}) {
  const [liked, setLiked] = useState(comment.liked)
  const [likeCount, setLikeCount] = useState(comment.likeCount)
  const [showReplies, setShowReplies] = useState(false)

  const replies = useQuery(api.comments.listReplies, showReplies ? { parentId: comment._id } : 'skip')
  const toggleCommentLike = useMutation(api.likes.toggleCommentLike)

  async function handleLike() {
    const prev = liked
    setLiked(!liked)
    setLikeCount((c: number) => liked ? c - 1 : c + 1)
    try { await toggleCommentLike({ commentId: comment._id }) }
    catch { setLiked(prev); setLikeCount(comment.likeCount) }
  }

  return (
    <div className={`feed-item${depth > 0 ? ' pl-10' : ''}`}>
      <div className="flex gap-2.5">
        {comment.authorProfile ? (
          <Avatar username={comment.authorProfile.username} avatarSeed={comment.authorProfile.avatarSeed} avatarEmoji={comment.authorProfile.avatarEmoji} size="sm" className="shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full shrink-0" style={{ background: 'var(--surface-4)' }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>@{comment.authorProfile?.username ?? 'anonymous'}</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-2)' }}>{comment.content}</p>
          <div className="flex items-center gap-1">
            <button onClick={handleLike} className="rxn" style={liked ? { color: 'var(--secondary)', background: 'rgba(249,77,106,0.1)' } : {}}>
              <Heart size={12} style={liked ? { fill: 'currentColor' } : {}} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            {depth === 0 && (
              <button onClick={() => onReply(comment._id, comment.authorProfile?.username ?? 'anonymous')} className="rxn">
                <CornerDownRight size={12} /> Reply
              </button>
            )}
            {comment.replyCount > 0 && depth === 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="rxn ml-1">
                <ChevronDown size={12} style={{ transform: showReplies ? 'rotate(180deg)' : '', transition: 'transform 150ms' }} />
                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
          {showReplies && depth === 0 && (
            <div className="mt-2">
              {replies === undefined ? (
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Loading...</span>
              ) : (
                replies.map(reply => (
                  <CommentItem key={reply._id} comment={reply} postId={postId} currentUserId={currentUserId} onReply={onReply} depth={1} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
