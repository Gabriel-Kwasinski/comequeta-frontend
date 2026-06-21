import { useQuery } from '@tanstack/react-query'
import type { LatLng } from './geo'
import { getNearbyUsers } from './mapApi'

/** A neighbour shown on the proximity map (a real registered account). */
export interface NearbyUser {
  id: number
  name: string
  lat: number
  lng: number
  avatarUrl?: string
}

interface UseNearbyUsersResult {
  /** Real users within `radiusMeters` of `center`. */
  users: NearbyUser[]
  isLoading: boolean
  error: Error | null
}

/** How often to refresh nearby users so newly-arrived people show up. */
const REFRESH_MS = 8000

/**
 * Returns real users near `center` within `radiusMeters`, from
 * `GET /users/nearby`. Each user reports their own position when they open the
 * map (see MapPage), so two accounts in the same place see each other. Refetches
 * periodically so a peer who opens the app afterwards appears without a reload.
 */
export function useNearbyUsers(
  center: LatLng,
  radiusMeters: number,
): UseNearbyUsersResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['nearby-users', center.lat, center.lng, radiusMeters],
    queryFn: () => getNearbyUsers(center.lat, center.lng, radiusMeters),
    refetchInterval: REFRESH_MS,
  })

  return {
    users: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  }
}
