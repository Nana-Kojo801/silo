import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { CONFESSION_CATEGORIES } from '@/lib/utils'
import { Plus, Flame, Clock } from 'lucide-react'

export function ConfessionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [tab, setTab] = useState<'latest' | 'trending'>('latest')
  const [createOpen, setCreateOpen] = useState(false)
  const { user, profile } = useCurrentUser()

  const latest = useQuery(api.confessions.list, tab === 'latest' ? { category: selectedCategory ?? undefined } : 'skip')
  const trending = useQuery(api.confessions.trending, tab === 'trending' ? undefined : 'skip')

  const posts = tab === 'latest' ? latest?.confessions : trending
  const isLoading = posts === undefined

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Confessions</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Real stories, zero judgment</p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary text-sm">
            <Plus size={15} /> Confess
          </button>
        )}
      </div>

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

      {tab === 'latest' && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs px-2.5 py-1 rounded-full border transition-colors"
            style={{
              borderColor: !selectedCategory ? 'var(--accent)' : 'var(--border-2)',
              background: !selectedCategory ? 'var(--accent-subtle)' : 'transparent',
              color: !selectedCategory ? 'var(--accent-muted)' : 'var(--text-3)',
            }}
          >
            All
          </button>
          {CONFESSION_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className="text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={{
                borderColor: selectedCategory === cat.id ? 'var(--accent)' : 'var(--border-2)',
                background: selectedCategory === cat.id ? 'var(--accent-subtle)' : 'transparent',
                color: selectedCategory === cat.id ? 'var(--accent-muted)' : 'var(--text-3)',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <FeedSkeleton />
      ) : !posts || posts.length === 0 ? (
        <EmptyState
          icon="🤫"
          title="No confessions yet"
          description={selectedCategory ? 'Nothing in this category.' : 'Be the first to confess.'}
          action={
            profile ? (
              <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
                <Plus size={15} /> Share a confession
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
        <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} type="confession" profile={profile} />
      )}
    </div>
  )
}
