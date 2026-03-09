import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Plus, TrendingUp, Hash } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AppLayout() {
  const [createOpen, setCreateOpen] = useState(false)
  const { profile } = useCurrentUser()

  return (
    <div className="flex min-h-dvh bg-surface-base">
      {/* Left sidebar */}
      <Sidebar onCreatePost={() => setCreateOpen(true)} />

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[42rem] mx-auto px-4 py-6 lg:px-6 pb-24 md:pb-6 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Right panel — wide screens */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 border-l border-line h-screen sticky top-0 overflow-y-auto no-scrollbar py-6 px-4 gap-5 bg-[#0d0d0f]">
        <RightPanel />
      </aside>

      {/* Mobile nav */}
      <MobileNav />

      {/* Mobile FAB */}
      {profile && (
        <button
          onClick={() => setCreateOpen(true)}
          className="md:hidden fixed right-4 bottom-[4.5rem] z-40 w-12 h-12 rounded-xl
                     bg-violet-600 text-white flex items-center justify-center
                     shadow-lg violet-glow transition-transform active:scale-95"
          aria-label="New post"
        >
          <Plus size={22} />
        </button>
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

function RightPanel() {
  const TRENDING_TAGS = ['confession', 'campus', 'relationships', 'hottakes', 'secrets', 'friendships', 'rant', 'academics']

  return (
    <>
      {/* About */}
      <div className="card px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
               style={{ background: 'linear-gradient(145deg, #7C3AED 0%, #5B21B6 100%)' }}>
            <span className="font-display font-bold text-white text-[10px]">S</span>
          </div>
          <span className="t-title text-sm">About Silo</span>
        </div>
        <p className="text-sm text-ink-muted leading-relaxed">
          A space for raw, honest thoughts. Your identity stays completely hidden — always.
        </p>
      </div>

      {/* Trending tags */}
      <div className="card px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-violet-400" />
          <span className="t-label">Trending</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TRENDING_TAGS.map(tag => (
            <Link key={tag} to={`/explore?q=${tag}`} className="tag">
              <Hash size={10} className="opacity-60" />
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Confession categories */}
      <div className="card px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🤫</span>
          <span className="t-label">Confessions</span>
        </div>
        <div className="space-y-0.5">
          {[
            { label: 'Campus',       emoji: '🏫', path: '/confessions?cat=campus' },
            { label: 'Relationships',emoji: '💔', path: '/confessions?cat=relationships' },
            { label: 'Hot Takes',    emoji: '🔥', path: '/confessions?cat=hot_takes' },
            { label: 'Secrets',      emoji: '🤫', path: '/confessions?cat=secrets' },
          ].map(({ label, emoji, path }) => (
            <Link
              key={label}
              to={path}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink-secondary hover:bg-surface-raised/50 transition-colors"
            >
              <span className="text-base w-5 text-center">{emoji}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
