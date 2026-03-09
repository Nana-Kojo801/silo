import { useState, useRef, useCallback } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Plus, TrendingUp, Flame, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type FeedTab = 'latest' | 'trending'

export function FeedPage() {
  const [tab, setTab] = useState<FeedTab>('latest')
  const [createOpen, setCreateOpen] = useState(false)
  const { profile, user } = useCurrentUser()

  const feedData = useQuery(api.posts.listFeed, tab === 'latest' ? {} : 'skip')
  const trendingData = useQuery(api.posts.listTrending, tab === 'trending' ? undefined : 'skip')

  const posts = tab === 'latest' ? feedData?.posts : trendingData
  const isLoading = posts === undefined

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            {tab === 'latest' ? '✦ Feed' : '🔥 Trending'}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">What's going on right now</p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
            <Plus size={16} />
            Post
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-card border border-border rounded-xl w-fit">
        <TabButton active={tab === 'latest'} onClick={() => setTab('latest')} icon={<Clock size={14} />}>
          Latest
        </TabButton>
        <TabButton active={tab === 'trending'} onClick={() => setTab('trending')} icon={<Flame size={14} />}>
          Trending
        </TabButton>
      </div>

      {/* Create post prompt */}
      {profile && tab === 'latest' && (
        <button
          onClick={() => setCreateOpen(true)}
          className="card w-full p-4 flex items-center gap-3 hover:border-border-strong transition-all text-left group"
        >
          <div
            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-white"
            style={{ background: `linear-gradient(135deg, #7c4dff, #f94d6a)` }}
          >
            {profile.avatarEmoji || profile.username.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-ink-muted text-sm group-hover:text-ink-secondary transition-colors flex-1">
            Share something anonymously...
          </span>
          <Plus size={16} className="text-ink-muted shrink-0" />
        </button>
      )}

      {/* Feed */}
      {isLoading ? (
        <FeedSkeleton />
      ) : !posts || posts.length === 0 ? (
        <EmptyState
          icon="🌌"
          title="Nothing here yet"
          description="Be the first to post something. Your identity stays anonymous."
          action={
            profile ? (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus size={16} />
                Create First Post
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user?._id}
            />
          ))}
        </div>
      )}

      {profile && (
        <CreatePostModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          profile={profile}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
        active
          ? 'bg-silo-500 text-white shadow-glow-xs'
          : 'text-ink-secondary hover:text-ink-primary'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
