import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { AppLayout } from '@/components/layout/AppLayout'

// Pages
import { AuthPage } from '@/pages/auth/AuthPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { FeedPage } from '@/pages/feed/FeedPage'
import { PostPage } from '@/pages/post/PostPage'
import { ConfessionsPage } from '@/pages/confessions/ConfessionsPage'
import { ConfessionDetailPage } from '@/pages/confessions/ConfessionDetailPage'
import { ExplorePage } from '@/pages/explore/ExplorePage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { AskPage } from '@/pages/ask/AskPage'
import { QuestionPage } from '@/pages/ask/QuestionPage'
import { ResponsesPage } from '@/pages/ask/ResponsesPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading, hasProfile } = useCurrentUser()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-silo flex items-center justify-center shadow-glow">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <div className="w-5 h-5 border-2 border-silo-500/30 border-t-silo-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (!hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (hasProfile && location.pathname === '/onboarding') {
    return <Navigate to="/feed" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPageGuard />} />
        <Route path="/ask/:slug" element={<QuestionPage />} />

        {/* Onboarding (auth required, no profile yet) */}
        <Route
          path="/onboarding"
          element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          }
        />

        {/* App shell */}
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/confessions" element={<ConfessionsPage />} />
          <Route path="/confessions/:postId" element={<ConfessionDetailPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/ask/:questionId/responses" element={<ResponsesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthPageGuard() {
  const { isAuthenticated, isAuthLoading, hasProfile } = useCurrentUser()
  if (isAuthLoading) return null
  if (isAuthenticated && hasProfile) return <Navigate to="/feed" replace />
  if (isAuthenticated && !hasProfile) return <Navigate to="/onboarding" replace />
  return <AuthPage />
}
