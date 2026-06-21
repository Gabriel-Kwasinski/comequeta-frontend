import { useMemo } from 'react'
import type { LatLng } from './geo'
import { haversineDistanceKm } from './geo'

/**
 * A neighbour shown on the proximity map.
 *
 * The shape is intentionally close to what a future `/users/nearby` endpoint
 * would return (id, name, coordinates, optional avatar) so the mock can be
 * swapped for a real `$api` query with minimal churn at the call sites.
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
 * Mock neighbours scattered a few hundred metres around a reference point.
 *
 * The app's purpose is connecting people to have lunch together on a university
 * campus, so neighbours are placed within walking distance (~tens to a few
 * hundred metres), not kilometres.
 */
function buildMockUsers(center: LatLng): NearbyUser[] {
  // Offsets in degrees; ~0.001° ≈ 100 m. Kept small so everyone is nearby.
  const offsets = [
    { dLat: 0.0006, dLng: 0.0007, name: 'Ana Souza' }, // ~95 m
    { dLat: -0.0011, dLng: 0.0009, name: 'Bruno Lima' }, // ~155 m
    { dLat: 0.0016, dLng: -0.0013, name: 'Carla Dias' }, // ~220 m
    { dLat: -0.0021, dLng: -0.0019, name: 'Diego Alves' }, // ~305 m
    { dLat: 0.0029, dLng: 0.0023, name: 'Elena Rocha' }, // ~400 m
    { dLat: -0.0035, dLng: 0.003, name: 'Felipe Nunes' }, // ~495 m
  ]

  return offsets.map((offset, index) => ({
    id: index + 1,
    name: offset.name,
    lat: center.lat + offset.dLat,
    lng: center.lng + offset.dLng,
  }))
}

/**
 * Returns nearby users within `radiusMeters` of `center`.
 *
 * TODO(backend): the API schema (src/api/schema.d.ts) currently only exposes
 * auth + /users/me — there is no geolocation/nearby endpoint yet. Once a real
 * `/users/nearby` (or similar) query lands, replace `buildMockUsers` with an
 * `$api.useQuery(...)` call and keep the `NearbyUser`/`UseNearbyUsersResult`
 * contract so consumers stay unchanged.
 */
export function useNearbyUsers(
  center: LatLng,
  radiusMeters: number,
): UseNearbyUsersResult {
  const users = useMemo(() => {
    // US04 (SCRUM-6) — privacy: only neighbours inside the proximity radius are
    // ever exposed to the client, so a user can only see (and be seen by)
    // people within their radius.
    return buildMockUsers(center)
      .map((user) => ({
        user,
        distanceMeters:
          haversineDistanceKm(center, { lat: user.lat, lng: user.lng }) * 1000,
      }))
      .filter(({ distanceMeters }) => distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .map(({ user }) => user)
  }, [center, radiusMeters])

  return { users, isLoading: false, error: null }
}
