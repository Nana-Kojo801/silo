import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { timeAgo, formatCount, getCategoryInfo, cn } from '@/lib/utils'
import {
  Heart, MessageCircle, Share2, ArrowLeft, Send, ChevronDown, Trash2, CornerDownRight
} from 'lucide-react'
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
        icon="🫙"
        title="Post not found"
        description="This post may have been deleted."
        action={<Link to="/feed" className="btn-secondary">Back to Feed</Link>}
      />
    )
  }

  const isOwner = user?._id === post.authorId
  const category = post.type === 'confession' && post.category ? getCategoryInfo(post.category) : null

  async function handleLike() {
    const prev = liked
    setLiked(!liked)
    setLikeCount((c: number) => (liked ? c - 1 : c + 1))
    try {
      await toggleLike({ postId: post!._id })
    } catch {
      setLiked(prev)
      setLikeCount(post!.likeCount)
      toast.error('Failed to like')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    try {
      await deletePost({ postId: post!._id })
      toast.success('Post deleted')
      navigate(-1)
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      await addComment({
        postId: post!._id,
        content: commentText.trim(),
        parentId: replyingTo?.id,
      })
      setCommentText('')
      setReplyingTo(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!'))
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
        <ArrowLeft size={15} />
        Back
      </button>

      {/* Post body */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {post.authorProfile ? (
              <Avatar
                username={post.authorProfile.username}
                avatarSeed={post.authorProfile.avatarSeed}
                avatarEmoji={post.authorProfile.avatarEmoji}
                size="lg"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-surface-raised border border-line" />
            )}
            <div>
              <Link
                to={`/profile/${post.authorProfile?.username}`}
                className="t-mono text-sm font-semibold text-ink hover:text-violet-400 transition-colors"
              >
                @{post.authorProfile?.username ?? 'anonymous'}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="t-meta">{timeAgo(post.createdAt)}</span>
                {category && (
                  <span className={cn('badge', category.color)}>
                    {category.emoji} {category.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <button onClick={handleDelete} className="btn-danger btn-sm">
              <Trash2 size={13} />
              Delete
            </button>
          )}
        </div>

        <p className="t-body leading-7 mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="divider mb-4" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={cn(
              'reaction-btn',
              liked && 'text-rose-fg bg-rose-DEFAULT/10 border-rose-DEFAULT/20'
            )}
          >
            <Heart size={14} className={cn(liked && 'fill-current')} />
            <span>{formatCount(likeCount)}</span>
          </button>

          <div className="reaction-btn cursor-default">
            <MessageCircle size={14} />
            <span>{formatCount(post.commentCount)}</span>
          </div>

          <button onClick={handleShare} className="reaction-btn ml-auto">
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Comment input */}
      {profile && (
        <div className="card p-4">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2.5 t-meta text-xs">
              <span className="flex items-center gap-1.5">
                <CornerDownRight size={12} />
                Replying to @{replyingTo.username}
              </span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-ink-secondary transition-colors">
                Cancel
              </button>
            </div>
          )}
          <form onSubmit={handleComment} className="flex items-end gap-3">
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="sm"
              className="shrink-0 mb-0.5"
            />
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
              rows={1}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = t.scrollHeight + 'px'
              }}
              className="input resize-none min-h-[2.5rem] py-2 text-sm flex-1"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="btn-primary px-3 py-2 mb-0.5 shrink-0"
            >
              {submitting ? <span className="spinner spinner-sm" /> : <Send size={14} />}
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-2">
        <h3 className="t-label mb-3">
          {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </h3>
        {comments.length === 0 ? (
          <EmptyState icon="💬" title="No comments yet" description="Start the conversation" className="py-8" />
        ) : (
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={post._id}
                currentUserId={user?._id}
                onReply={(id, username) => {
                  setReplyingTo({ id, username })
                  document.querySelector('textarea')?.focus()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  onReply,
  depth = 0,
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

  const replies = useQuery(
    api.comments.listReplies,
    showReplies ? { parentId: comment._id } : 'skip'
  )
  const toggleCommentLike = useMutation(api.likes.toggleCommentLike)

  async function handleLike() {
    const prev = liked
    setLiked(!liked)
    setLikeCount((c: number) => (liked ? c - 1 : c + 1))
    try {
      await toggleCommentLike({ commentId: comment._id })
    } catch {
      setLiked(prev)
      setLikeCount(comment.likeCount)
    }
  }

  return (
    <div className={cn('card p-4', depth > 0 && 'ml-8')}>
      <div className="flex gap-3">
        {comment.authorProfile ? (
          <Avatar
            username={comment.authorProfile.username}
            avatarSeed={comment.authorProfile.avatarSeed}
            avatarEmoji={comment.authorProfile.avatarEmoji}
            size="sm"
            className="shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-surface-raised shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="t-mono text-xs font-semibold text-ink">
              @{comment.authorProfile?.username ?? 'anonymous'}
            </span>
            <span className="t-meta text-xs">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-ink leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-0.5 mt-2">
            <button
              onClick={handleLike}
              className={cn(
                'reaction-btn text-xs',
                liked && 'text-rose-fg bg-rose-DEFAULT/10 border-rose-DEFAULT/20'
              )}
            >
              <Heart size={12} className={cn(liked && 'fill-current')} />
              {likeCount > 0 && likeCount}
            </button>

            {depth === 0 && (
              <button
                onClick={() => onReply(comment._id, comment.authorProfile?.username ?? 'anonymous')}
                className="reaction-btn text-xs"
              >
                <CornerDownRight size={12} />
                Reply
              </button>
            )}

            {comment.replyCount > 0 && depth === 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="reaction-btn text-xs ml-1"
              >
                <ChevronDown size={12} className={cn('transition-transform', showReplies && 'rotate-180')} />
                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {showReplies && depth === 0 && (
            <div className="mt-3 space-y-2">
              {replies === undefined ? (
                <p className="t-meta text-xs">Loading...</p>
              ) : (
                replies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    postId={postId}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    depth={1}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
