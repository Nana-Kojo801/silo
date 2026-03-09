import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Link } from 'react-router-dom'
import { Search, Users, FileText, CircleHelp } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchTab = 'posts' | 'confessions' | 'people' | 'questions'

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTab>('posts')
  const { user } = useCurrentUser()

  const postResults = useQuery(
    api.posts.searchPosts,
    query.length >= 2 ? { query, type: 'post' } : 'skip'
  )
  const confessionResults = useQuery(
    api.posts.searchPosts,
    query.length >= 2 && tab === 'confessions' ? { query, type: 'confession' } : 'skip'
  )
  const userResults = useQuery(
    api.users.searchUsers,
    query.length >= 2 && tab === 'people' ? { query } : 'skip'
  )
  const questionResults = useQuery(
    api.questions.listRecent,
    !query && tab === 'questions' ? undefined : 'skip'
  )

  const tabs: { id: SearchTab; label: string; icon: React.ReactNode }[] = [
    { id: 'posts', label: 'Posts', icon: <FileText size={14} /> },
    { id: 'confessions', label: 'Confessions', icon: <span className="text-xs">🤫</span> },
    { id: 'people', label: 'People', icon: <Users size={14} /> },
    { id: 'questions', label: 'Q&A', icon: <CircleHelp size={14} /> },
  ]

  const results = tab === 'posts' ? postResults : tab === 'confessions' ? confessionResults : null
  const isLoading = query.length >= 2 && results === undefined

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="page-header">🔭 Explore</h1>
        <p className="text-sm text-ink-muted mt-0.5">Search posts, confessions, and people</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything..."
          className="input-base pl-11"
          autoFocus
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-card border border-border rounded-xl">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
              tab === id ? 'bg-silo-500 text-white shadow-glow-xs' : 'text-ink-secondary hover:text-ink-primary'
            )}
          >
            {icon}
            <span className="hidden xs:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {query.length < 2 && tab !== 'questions' ? (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">Type at least 2 characters to search</p>

          {/* Popular tags */}
          <div>
            <h3 className="section-label mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['confession', 'campus', 'relationships', 'friendships', 'hottakes', 'secrets', 'academics', 'rant', 'question', 'random'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="tag"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <FeedSkeleton />
      ) : tab === 'people' ? (
        <PeopleResults results={userResults ?? []} />
      ) : tab === 'questions' ? (
        <QuestionResults results={questionResults ?? []} />
      ) : (
        <PostResults results={results ?? []} currentUserId={user?._id} />
      )}
    </div>
  )
}

function PostResults({ results, currentUserId }: { results: any[]; currentUserId?: any }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No results found"
        description="Try a different search term"
        className="py-12"
      />
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted">{results.length} results</p>
      {results.map((post) => (
        <PostCard key={post._id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  )
}

function PeopleResults({ results }: { results: any[] }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon="👤"
        title="No users found"
        description="Try a different username"
        className="py-12"
      />
    )
  }
  return (
    <div className="space-y-2">
      {results.map((profile: any) => (
        <Link key={profile._id} to={`/profile/${profile.username}`}>
          <div className="card-hover p-4 flex items-center gap-4">
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-primary">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-ink-secondary truncate">{profile.bio}</p>
              )}
            </div>
            <div className="text-xs text-ink-muted shrink-0">
              {profile.postCount} posts
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function QuestionResults({ results }: { results: any[] }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon="❓"
        title="No questions yet"
        description="Be the first to create an anonymous question"
        className="py-12"
      />
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted">Recent anonymous questions</p>
      {results.map((q: any) => (
        <Link key={q._id} to={`/ask/${q.slug}`}>
          <div className="card-hover p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-silo-500/20 border border-silo-500/20 flex items-center justify-center shrink-0">
                <CircleHelp size={16} className="text-silo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-primary text-sm leading-snug mb-1">{q.question}</p>
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <span>by @{q.ownerProfile?.username ?? 'anonymous'}</span>
                  <span>·</span>
                  <span>{q.responseCount} responses</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
