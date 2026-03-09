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
    <div className="flex min-h-dvh" style={{ background: 'var(--surface-base)' }}>
      <Sidebar onCreatePost={() => setCreateOpen(true)} />

      {/* Main */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-[680px] mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      <MobileNav />

      {/* Mobile FAB */}
      {profile && (
        <button
          onClick={() => setCreateOpen(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 btn btn-primary w-12 h-12 rounded-full p-0 justify-center shadow-lg"
        >
          <Plus size={18} />
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
