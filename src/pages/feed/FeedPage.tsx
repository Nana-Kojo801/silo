import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Plus, Flame, Clock } from 'lucide-react'

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
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Feed</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>What's happening right now</p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary text-sm">
            <Plus size={15} /> Post
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="segment-control w-fit">
        <button
          onClick={() => setTab('latest')}
          className={`segment-btn flex items-center gap-1.5${tab === 'latest' ? ' segment-btn-active' : ''}`}
        >
          <Clock size={13} /> Latest
        </button>
        <button
          onClick={() => setTab('trending')}
          className={`segment-btn flex items-center gap-1.5${tab === 'trending' ? ' segment-btn-active' : ''}`}
        >
          <Flame size={13} /> Trending
        </button>
      </div>

      {/* Compose prompt */}
      {profile && tab === 'latest' && (
        <button
          onClick={() => setCreateOpen(true)}
          className="panel w-full p-3.5 flex items-center gap-3 text-left transition-colors"
          style={{ cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {profile.avatarEmoji || profile.username[0].toUpperCase()}
          </div>
          <span className="text-sm flex-1" style={{ color: 'var(--text-3)' }}>
            Share something...
          </span>
          <Plus size={14} style={{ color: 'var(--text-3)' }} />
        </button>
      )}

      {isLoading ? (
        <FeedSkeleton />
      ) : !posts || posts.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Nothing here yet"
          description="Be the first to post something."
          action={
            profile ? (
              <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
                <Plus size={15} /> Create post
              </button>
            ) : null
          }
        />
      ) : (
        <div className="feed-list">
          {posts.map(post => (
            <PostCard key={post._id} post={post} currentUserId={user?._id} />
          ))}
        </div>
      )}

      {profile && (
        <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} profile={profile} />
      )}
    </div>
  )
}
