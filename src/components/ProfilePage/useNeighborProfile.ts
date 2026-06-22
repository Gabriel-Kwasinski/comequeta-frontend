/**
 * Neighbour profile data layer (SCRUM-7 / US05).
 *
 * Resolves a neighbour picked from the map to a REAL registered account
 * (via `GET /users`), so the name and bio shown on the profile — and the name
 * carried into the chat — match the real user. The avatar is still a
 * placeholder until the backend stores profile images.
 */
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../ChatPage/chatApi'

export interface NeighborProfile {
  id: number
  name: string
  bio: string
  avatarUrl: string
  distance: string
}

export interface UseNeighborProfileResult {
  profile?: NeighborProfile
  isLoading: boolean
  isError: boolean
}

export function useNeighborProfile(id: number): UseNeighborProfileResult {
  const isValidId = !Number.isNaN(id)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isValidId,
  })

  if (!isValidId) {
    return { profile: undefined, isLoading: false, isError: true }
  }

  const match = data?.find((u) => u.id === id)
  const profile: NeighborProfile | undefined = match
    ? {
        id,
        name: match.name,
        bio: match.bio?.trim()
          ? match.bio
          : 'Este vizinho ainda não preencheu uma descrição.',
        avatarUrl: `https://i.pravatar.cc/160?u=${id}`,
        distance: 'Por perto',
      }
    : undefined

  return {
    profile,
    isLoading,
    // A fetch failure, or the data loaded but there is no such user.
    isError: isError || (!isLoading && data !== undefined && !match),
  }
}
