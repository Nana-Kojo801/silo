import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { timeAgo } from '@/lib/utils'
import { Heart, MessageCircle, CornerDownRight, CircleHelp, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  like_post: <Heart size={12} style={{ color: 'var(--secondary)' }} />,
  like_comment: <Heart size={12} style={{ color: 'var(--secondary)' }} />,
  comment: <MessageCircle size={12} style={{ color: 'var(--accent-muted)' }} />,
  reply: <CornerDownRight size={12} style={{ color: 'var(--accent-muted)' }} />,
  question_response: <CircleHelp size={12} style={{ color: 'var(--warning)' }} />,
  follow: <span className="text-xs">👋</span>,
}

const NOTIF_TEXT: Record<string, (actor: string) => string> = {
  like_post: a => `${a} liked your post`,
  like_comment: a => `${a} liked your comment`,
  comment: a => `${a} commented on your post`,
  reply: a => `${a} replied to your comment`,
  question_response: _ => 'Someone answered your question',
  follow: a => `${a} is following you`,
}

export function NotificationsPage() {
  const notifications = useQuery(api.notifications.list)
  const markAllRead = useMutation(api.notifications.markAllRead)

  const unread = notifications?.filter(n => !n.isRead) ?? []

  async function handleMarkAllRead() {
    if (unread.length === 0) return
    try { await markAllRead() }
    catch { toast.error('Failed to mark as read') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Notifications</h1>
          {unread.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{unread.length} unread</p>
          )}
        </div>
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost text-sm">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications === undefined ? (
        <FeedSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔕" title="No notifications" description="When people interact with your posts, you'll see it here." />
      ) : (
        <div className="feed-list">
          {notifications.map(n => {
            const actorName = n.actorProfile ? `@${n.actorProfile.username}` : 'Someone'
            const text = NOTIF_TEXT[n.type]?.(actorName) ?? 'You have a new notification'
            const icon = NOTIF_ICONS[n.type]
            const href = n.postId ? `/post/${n.postId}` : n.questionId ? `/ask/${n.questionId}/responses` : '#'

            return (
              <Link key={n._id} to={href} className="feed-item flex items-start gap-3">
                <div className="relative shrink-0">
                  {n.actorProfile ? (
                    <Avatar username={n.actorProfile.username} avatarSeed={n.actorProfile.avatarSeed} avatarEmoji={n.actorProfile.avatarEmoji} size="sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-base" style={{ background: 'var(--surface-4)' }}>👤</div>
                  )}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}
                  >
                    {icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-1)' }}>{text}</p>
                  {n.post && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                      "{n.post.content.slice(0, 60)}{n.post.content.length > 60 ? '…' : ''}"
                    </p>
                  )}
                  <span className="text-xs mt-1 block" style={{ color: 'var(--text-3)' }}>{timeAgo(n.createdAt)}</span>
                </div>
                {!n.isRead && (
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ background: 'var(--accent)' }} />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
