import { useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PostCard } from '@/components/shared/PostCard'
import { Avatar } from '@/components/ui/Avatar'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { timeAgo, formatCount } from '@/lib/utils'
import { CalendarDays, PenLine, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useCurrentUser()

  const profileData = useQuery(
    api.users.getByUsername,
    username ? { username } : 'skip'
  )

  const posts = useQuery(
    api.posts.getByAuthor,
    profileData?.profile?.userId ? { userId: profileData.profile.userId } : 'skip'
  )

  if (profileData === undefined || posts === undefined) return <ProfileSkeleton />

  if (!profileData) {
    return (
      <EmptyState
        icon="👤"
        title="User not found"
        description={`@${username} doesn't exist or hasn't set up their profile.`}
        action={<Link to="/explore" className="btn-secondary">Explore Others</Link>}
      />
    )
  }

  const { profile } = profileData
  const isOwnProfile = user?._id === profile.userId

  const feedPosts = posts.filter((p) => p.type === 'post')
  const confessions = posts.filter((p) => p.type === 'confession')

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Profile card */}
      <div className="card overflow-hidden">
        {/* Banner gradient */}
        <div
          className="h-28 w-full"
          style={{
            background: `linear-gradient(135deg, #7c4dff 0%, #f94d6a 100%)`,
            opacity: 0.7,
          }}
        />

        <div className="px-6 pb-6">
          {/* Avatar + edit */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <Avatar
              username={profile.username}
              avatarSeed={profile.avatarSeed}
              avatarEmoji={profile.avatarEmoji}
              size="xl"
              className="border-4 border-bg-card shadow-glow-sm"
            />
            {isOwnProfile && (
              <Link to="/settings" className="btn-secondary text-sm">
                <PenLine size={14} />
                Edit Profile
              </Link>
            )}
          </div>

          {/* Username + bio */}
          <div className="space-y-1 mb-4">
            <h1 className="text-xl font-bold text-ink-primary">@{profile.username}</h1>
            {profile.bio && (
              <p className="text-sm text-ink-secondary leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <CalendarDays size={12} />
              Joined {timeAgo(profile.createdAt)}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <StatItem label="Posts" value={feedPosts.length} />
            <StatItem label="Confessions" value={confessions.length} />
            <StatItem label="Karma" value={profile.karma} icon={<Sparkles size={12} className="text-amber-400" />} />
          </div>
        </div>
      </div>

      {/* Posts */}
      {feedPosts.length === 0 && confessions.length === 0 ? (
        <EmptyState
          icon="🌌"
          title="No posts yet"
          description={isOwnProfile ? "Share your first thought!" : `@${profile.username} hasn't posted yet.`}
          action={isOwnProfile ? <Link to="/feed" className="btn-primary">Post Something</Link> : undefined}
        />
      ) : (
        <div className="space-y-5">
          {feedPosts.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-ink-secondary">Posts</h2>
              {feedPosts.map((post) => (
                <PostCard key={post._id} post={post} currentUserId={user?._id} />
              ))}
            </section>
          )}

          {confessions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-ink-secondary">Confessions</h2>
              {confessions.map((post) => (
                <PostCard key={post._id} post={post} currentUserId={user?._id} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-lg font-bold text-ink-primary">{formatCount(value)}</span>
      </div>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  )
}
