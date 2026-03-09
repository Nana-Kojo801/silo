import { useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '@/components/ui/Avatar'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { timeAgo, cn } from '@/lib/utils'
import { Heart, MessageCircle, CornerDownRight, CircleHelp, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  like_post: <Heart size={14} className="text-rose-400" />,
  like_comment: <Heart size={14} className="text-rose-400" />,
  comment: <MessageCircle size={14} className="text-silo-400" />,
  reply: <CornerDownRight size={14} className="text-silo-300" />,
  question_response: <CircleHelp size={14} className="text-amber-400" />,
  follow: <span>👋</span>,
}

const NOTIF_TEXT: Record<string, (actor: string) => string> = {
  like_post: (a) => `${a} liked your post`,
  like_comment: (a) => `${a} liked your comment`,
  comment: (a) => `${a} commented on your post`,
  reply: (a) => `${a} replied to your comment`,
  question_response: (_) => `Someone answered your question`,
  follow: (a) => `${a} is following you`,
}

export function NotificationsPage() {
  const notifications = useQuery(api.notifications.list)
  const markAllRead = useMutation(api.notifications.markAllRead)

  const unread = notifications?.filter((n) => !n.isRead) ?? []

  async function handleMarkAllRead() {
    if (unread.length === 0) return
    try {
      await markAllRead()
      toast.success('All caught up!')
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">🔔 Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-ink-muted mt-0.5">{unread.length} unread</p>
          )}
        </div>
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-sm text-ink-secondary">
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications */}
      {notifications === undefined ? (
        <FeedSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔕"
          title="No notifications yet"
          description="When people interact with your posts, you'll see it here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const actorName = n.actorProfile
              ? `@${n.actorProfile.username}`
              : 'Someone'
            const text = NOTIF_TEXT[n.type]?.(actorName) ?? 'You have a new notification'
            const icon = NOTIF_ICONS[n.type]
            const href = n.postId ? `/post/${n.postId}` :
                         n.questionId ? `/ask/${n.questionId}/responses` : '#'

            return (
              <Link key={n._id} to={href}>
                <div className={cn(
                  'card-hover p-4 flex items-start gap-4 transition-all',
                  !n.isRead && 'border-silo-500/20 bg-silo-500/5'
                )}>
                  {/* Avatar or icon */}
                  <div className="relative shrink-0">
                    {n.actorProfile ? (
                      <Avatar
                        username={n.actorProfile.username}
                        avatarSeed={n.actorProfile.avatarSeed}
                        avatarEmoji={n.actorProfile.avatarEmoji}
                        size="md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-bg-surface border border-border flex items-center justify-center">
                      {icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-primary">{text}</p>
                    {n.post && (
                      <p className="text-xs text-ink-muted mt-0.5 truncate">
                        "{n.post.content.slice(0, 60)}{n.post.content.length > 60 ? '…' : ''}"
                      </p>
                    )}
                    <span className="text-xs text-ink-muted mt-1 block">{timeAgo(n.createdAt)}</span>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-silo-500 shrink-0 mt-1.5" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
