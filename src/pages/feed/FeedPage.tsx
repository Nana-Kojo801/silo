import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Plus, Flame, Clock } from 'lucide-react'
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
          <h1 className="t-heading">Feed</h1>
          <p className="t-meta mt-0.5">What's happening right now</p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary btn-sm">
            <Plus size={14} />
            Post
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 p-1 bg-surface border border-line rounded-lg w-fit">
        <TabButton active={tab === 'latest'} onClick={() => setTab('latest')} icon={<Clock size={13} />}>
          Latest
        </TabButton>
        <TabButton active={tab === 'trending'} onClick={() => setTab('trending')} icon={<Flame size={13} />}>
          Trending
        </TabButton>
      </div>

      {/* Create post prompt */}
      {profile && tab === 'latest' && (
        <button
          onClick={() => setCreateOpen(true)}
          className="card-interactive w-full p-4 flex items-center gap-3 text-left group"
        >
          <div
            className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center font-bold text-xs text-white font-display"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
          >
            {profile.avatarEmoji || profile.username.slice(0, 2).toUpperCase()}
          </div>
          <span className="t-meta text-sm group-hover:text-ink-secondary transition-colors flex-1 text-left">
            Share something anonymously...
          </span>
          <Plus size={14} className="text-ink-disabled shrink-0" />
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
                <Plus size={15} />
                Create First Post
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} currentUserId={user?._id} />
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
        'flex items-center gap-1.5 px-3.5 py-1.5 rounded text-sm font-medium transition-all duration-120',
        active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-ink-muted hover:text-ink'
      )}
    >
      {icon}
      {children}
    </button>
  )
}
