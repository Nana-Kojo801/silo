import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { CONFESSION_CATEGORIES, cn } from '@/lib/utils'
import { Plus, Flame } from 'lucide-react'

export function ConfessionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [tab, setTab] = useState<'latest' | 'trending'>('latest')
  const [createOpen, setCreateOpen] = useState(false)
  const { user, profile } = useCurrentUser()

  const latest = useQuery(
    api.confessions.list,
    tab === 'latest' ? { category: selectedCategory ?? undefined } : 'skip'
  )
  const trending = useQuery(api.confessions.trending, tab === 'trending' ? undefined : 'skip')

  const posts = tab === 'latest' ? latest?.confessions : trending
  const isLoading = posts === undefined

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">🤫 Confessions</h1>
          <p className="text-sm text-ink-muted mt-0.5">Real stories, zero judgment</p>
        </div>
        {profile && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
            <Plus size={16} />
            Confess
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-card border border-border rounded-xl w-fit">
        <button
          onClick={() => setTab('latest')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
            tab === 'latest' ? 'bg-silo-500 text-white shadow-glow-xs' : 'text-ink-secondary hover:text-ink-primary'
          )}
        >
          Latest
        </button>
        <button
          onClick={() => setTab('trending')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
            tab === 'trending' ? 'bg-silo-500 text-white shadow-glow-xs' : 'text-ink-secondary hover:text-ink-primary'
          )}
        >
          <Flame size={14} />
          Trending
        </button>
      </div>

      {/* Category filter */}
      {tab === 'latest' && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'badge transition-all',
              !selectedCategory ? 'badge-violet' : 'bg-bg-elevated text-ink-secondary border border-border hover:border-border-strong cursor-pointer'
            )}
          >
            All
          </button>
          {CONFESSION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cn(
                'badge transition-all cursor-pointer',
                selectedCategory === cat.id ? cat.color : 'bg-bg-elevated text-ink-secondary border border-border hover:border-border-strong'
              )}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {isLoading ? (
        <FeedSkeleton />
      ) : !posts || posts.length === 0 ? (
        <EmptyState
          icon="🤫"
          title="No confessions yet"
          description={selectedCategory ? 'Nothing in this category. Be the first!' : 'Be the first to confess something.'}
          action={
            profile ? (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus size={16} />
                Share a Confession
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
          type="confession"
          profile={profile}
        />
      )}
    </div>
  )
}
