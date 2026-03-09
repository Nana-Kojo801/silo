import { useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useCurrentUser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const data = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : 'skip'
  )

  return {
    isAuthenticated,
    isAuthLoading: authLoading,
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading: authLoading || (isAuthenticated && data === undefined),
    hasProfile: !!data?.profile,
  }
}
