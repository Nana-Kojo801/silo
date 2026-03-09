import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { Avatar } from '@/components/ui/Avatar'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { timeAgo, formatCount } from '@/lib/utils'
import { CalendarDays, PenLine, Zap } from 'lucide-react'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useCurrentUser()

  const profileData = useQuery(api.users.getByUsername, username ? { username } : 'skip')
  const posts = useQuery(api.posts.getByAuthor, profileData?.profile?.userId ? { userId: profileData.profile.userId } : 'skip')

  if (profileData === undefined || posts === undefined) return <ProfileSkeleton />
  if (!profileData) {
    return (
      <EmptyState
        icon="👤"
        title="User not found"
        description={`@${username} doesn't exist or hasn't set up their profile.`}
        action={<Link to="/explore" className="btn btn-secondary">Explore</Link>}
      />
    )
  }

  const { profile } = profileData
  const isOwnProfile = user?._id === profile.userId
  const feedPosts = posts.filter(p => p.type === 'post')
  const confessions = posts.filter(p => p.type === 'confession')

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile panel */}
      <div className="panel overflow-hidden">
        <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)', opacity: 0.3 }} />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-7 mb-4">
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="xl"
              className="border-4"
              style={{ borderColor: 'var(--surface-2)' } as React.CSSProperties}
            />
            {isOwnProfile && (
              <Link to="/settings" className="btn btn-secondary text-sm">
                <PenLine size={13} /> Edit
              </Link>
            )}
          </div>
          <h1 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>@{profile.username}</h1>
          {profile.bio && <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-2)' }}>{profile.bio}</p>}
          <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: 'var(--text-3)' }}>
            <CalendarDays size={11} /> Joined {timeAgo(profile.createdAt)}
          </div>
          <div className="flex gap-5">
            <StatItem label="Posts" value={feedPosts.length} />
            <StatItem label="Confessions" value={confessions.length} />
            <StatItem label="Karma" value={profile.karma} icon={<Zap size={11} style={{ color: 'var(--warning)' }} />} />
          </div>
        </div>
      </div>

      {feedPosts.length === 0 && confessions.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No posts yet"
          description={isOwnProfile ? 'Share your first thought!' : `@${profile.username} hasn't posted yet.`}
          action={isOwnProfile ? <Link to="/feed" className="btn btn-primary">Post something</Link> : undefined}
        />
      ) : (
        <div className="space-y-5">
          {feedPosts.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>Posts</h2>
              <div className="feed-list">
                {feedPosts.map(post => <PostCard key={post._id} post={post} currentUserId={user?._id} />)}
              </div>
            </section>
          )}
          {confessions.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>Confessions</h2>
              <div className="feed-list">
                {confessions.map(post => <PostCard key={post._id} post={post} currentUserId={user?._id} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{formatCount(value)}</span>
      </div>
      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
    </div>
  )
}
