import type { LatLng } from './geo'

/**
 * A neighbour shown on the proximity map.
 *
 * The shape mirrors what a future `/users/nearby` endpoint would return (id,
 * name, coordinates, optional avatar) so it can be wired to a real `$api` query
 * with minimal churn at the call sites.
 */
export interface NearbyUser {
  id: number
  name: string
  lat: number
  lng: number
  avatarUrl?: string
}

interface UseNearbyUsersResult {
  /** Neighbours within `radiusMeters` of `center`, nearest first. */
  users: NearbyUser[]
  isLoading: boolean
  error: Error | null
}

/**
 * Returns nearby users within `radiusMeters` of `center`.
 *
 * Currently returns NO users on purpose: the previous mock neighbours had fixed
 * ids (1..6) that collided with real account ids, so tapping one opened a chat
 * with a real account (e.g. yourself). Showing fake people that link to real
 * conversations is misleading, so the mock was removed.
 *
 * TODO(backend): real nearby users require an endpoint that stores user
 * locations (e.g. `GET /users/nearby?lat=&lng=&radius=`). Once it exists,
 * replace this body with an `$api`/fetch query and keep the
 * `NearbyUser`/`UseNearbyUsersResult` contract so consumers stay unchanged.
 * Until then, start conversations from the chat's "Nova conversa" picker
 * (backed by `GET /users`).
 */
export function useNearbyUsers(
  _center: LatLng,
  _radiusMeters: number,
): UseNearbyUsersResult {
  return { users: [], isLoading: false, error: null }
}
