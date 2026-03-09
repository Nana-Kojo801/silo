import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'

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
import { TeamsPage } from '@/pages/teams/TeamsPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading, hasProfile } = useCurrentUser()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-dvh"
        style={{ background: 'var(--surface-base)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base"
            style={{ background: 'var(--accent)' }}
          >
            S
          </div>
          <span className="spinner" />
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
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPageGuard />} />
          <Route path="/ask/:slug" element={<QuestionPage />} />

          {/* Onboarding */}
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
            <Route path="/teams" element={<TeamsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

function AuthPageGuard() {
  const { isAuthenticated, isAuthLoading, hasProfile } = useCurrentUser()
  if (isAuthLoading) return null
  if (isAuthenticated && hasProfile) return <Navigate to="/feed" replace />
  if (isAuthenticated && !hasProfile) return <Navigate to="/onboarding" replace />
  return <AuthPage />
}
