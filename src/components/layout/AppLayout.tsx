import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { CreatePostModal } from '@/components/shared/CreatePostModal'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Plus } from 'lucide-react'

export function AppLayout() {
  const [createOpen, setCreateOpen] = useState(false)
  const { profile } = useCurrentUser()

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Sidebar — desktop */}
      <Sidebar onCreatePost={() => setCreateOpen(true)} />

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 xl:max-w-3xl">
          <Outlet />
        </div>
      </main>

      {/* Right panel — desktop only, wide screens */}
      <aside className="hidden xl:flex flex-col w-72 3xl:w-80 h-screen sticky top-0 pt-6 pb-4 px-4 shrink-0 border-l border-border/50">
        <RightPanel />
      </aside>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Mobile FAB */}
      {profile && (
        <button
          onClick={() => setCreateOpen(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl btn-primary shadow-glow"
        >
          <Plus size={22} />
        </button>
      )}

      {/* Create post modal */}
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
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-primary mb-3">About Silo</h3>
        <p className="text-sm text-ink-secondary leading-relaxed">
          A space for anonymous thoughts, confessions, and real conversations. Your identity stays hidden — always.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-ink-primary">Trending Tags</span>
          <span className="badge-violet text-xs">Live</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['#confession', '#campus', '#relationships', '#hottakes', '#secrets', '#friendships'].map(tag => (
            <span key={tag} className="tag text-xs">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
