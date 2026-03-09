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

type SearchTab = 'posts' | 'confessions' | 'people' | 'questions'

const POPULAR_TAGS = ['confession', 'campus', 'relationships', 'friendships', 'secrets', 'academics', 'rant', 'random']

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTab>('posts')
  const { user } = useCurrentUser()

  const postResults = useQuery(api.posts.searchPosts, query.length >= 2 ? { query, type: 'post' } : 'skip')
  const confessionResults = useQuery(api.posts.searchPosts, query.length >= 2 && tab === 'confessions' ? { query, type: 'confession' } : 'skip')
  const userResults = useQuery(api.users.searchUsers, query.length >= 2 && tab === 'people' ? { query } : 'skip')
  const questionResults = useQuery(api.questions.listRecent, !query && tab === 'questions' ? undefined : 'skip')

  const tabs: { id: SearchTab; label: string; icon: React.ReactNode }[] = [
    { id: 'posts', label: 'Posts', icon: <FileText size={13} /> },
    { id: 'confessions', label: 'Confessions', icon: <span className="text-xs">🤫</span> },
    { id: 'people', label: 'People', icon: <Users size={13} /> },
    { id: 'questions', label: 'Q&A', icon: <CircleHelp size={13} /> },
  ]

  const results = tab === 'posts' ? postResults : tab === 'confessions' ? confessionResults : null
  const isLoading = query.length >= 2 && results === undefined

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Explore</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Search posts, people, and Q&A</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search anything..."
          className="input w-full pl-9"
          autoFocus
        />
      </div>

      {/* Tabs */}
      <div className="segment-control">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`segment-btn flex items-center gap-1.5${tab === id ? ' segment-btn-active' : ''}`}
          >
            {icon}
            <span className="hidden xs:inline">{label}</span>
          </button>
        ))}
      </div>

      {query.length < 2 && tab !== 'questions' ? (
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>Type at least 2 characters to search</p>
          <h3 className="label block mb-2">Popular tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                style={{ borderColor: 'var(--border-2)', color: 'var(--text-3)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-muted)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
              >
                #{tag}
              </button>
            ))}
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
    return <EmptyState icon="🔍" title="No results" description="Try a different search term" className="py-12" />
  }
  return (
    <div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{results.length} results</p>
      <div className="feed-list">
        {results.map(post => <PostCard key={post._id} post={post} currentUserId={currentUserId} />)}
      </div>
    </div>
  )
}

function PeopleResults({ results }: { results: any[] }) {
  if (results.length === 0) {
    return <EmptyState icon="👤" title="No users found" description="Try a different username" className="py-12" />
  }
  return (
    <div className="feed-list">
      {results.map((profile: any) => (
        <Link key={profile._id} to={`/profile/${profile.username}`} className="feed-item flex items-center gap-3">
          <Avatar username={profile.username} avatarSeed={profile.avatarSeed} avatarEmoji={profile.avatarEmoji} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>@{profile.username}</p>
            {profile.bio && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>{profile.bio}</p>}
          </div>
          <div className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>{profile.postCount} posts</div>
        </Link>
      ))}
    </div>
  )
}

function QuestionResults({ results }: { results: any[] }) {
  if (results.length === 0) {
    return <EmptyState icon="❓" title="No questions yet" description="Be the first to create an anonymous Q&A" className="py-12" />
  }
  return (
    <div className="feed-list">
      {results.map((q: any) => (
        <Link key={q._id} to={`/ask/${q.slug}`} className="feed-item flex items-start gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
          >
            <CircleHelp size={14} style={{ color: 'var(--accent-muted)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-1)' }}>{q.question}</p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
              <span>by @{q.ownerProfile?.username ?? 'anonymous'}</span>
              <span>·</span>
              <span>{q.responseCount} responses</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
