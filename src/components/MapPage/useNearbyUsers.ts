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
  /** Neighbours within `radiusKm` of `center`, nearest first. */
  users: NearbyUser[]
  isLoading: boolean
  error: Error | null
}

/**
 * Mock neighbours scattered around a reference point. Generated relative to
 * the provided center so there is always something to render regardless of the
 * user's real geolocation. Offsets are in degrees (~0.01deg ≈ 1.1 km).
 */
function buildMockUsers(center: LatLng): NearbyUser[] {
  const offsets = [
    { dLat: 0.004, dLng: 0.006, name: 'Ana Souza' },
    { dLat: -0.008, dLng: 0.003, name: 'Bruno Lima' },
    { dLat: 0.012, dLng: -0.009, name: 'Carla Dias' },
    { dLat: -0.015, dLng: -0.014, name: 'Diego Alves' },
    { dLat: 0.03, dLng: 0.028, name: 'Elena Rocha' },
    { dLat: -0.045, dLng: 0.05, name: 'Felipe Nunes' },
  ]

  return offsets.map((offset, index) => ({
    id: index + 1,
    name: offset.name,
    lat: center.lat + offset.dLat,
    lng: center.lng + offset.dLng,
  }))
}

/**
 * Returns nearby users within `radiusKm` of `center`.
 *
 * TODO(backend): the API schema (src/api/schema.d.ts) currently only exposes
 * auth + /users/me — there is no geolocation/nearby endpoint yet. Once a real
 * `/users/nearby` (or similar) query lands, replace `buildMockUsers` with an
 * `$api.useQuery(...)` call and keep the `NearbyUser`/`UseNearbyUsersResult`
 * contract so consumers stay unchanged.
 */
export function useNearbyUsers(
  center: LatLng,
  radiusKm: number,
): UseNearbyUsersResult {
  const users = useMemo(() => {
    // US04 (SCRUM-6) — privacy: only neighbours inside the proximity radius are
    // ever exposed to the client, so a user can only see (and be seen by)
    // people within their radius.
    return buildMockUsers(center)
      .map((user) => ({
        user,
        distance: haversineDistanceKm(center, {
          lat: user.lat,
          lng: user.lng,
        }),
      }))
      .filter(({ distance }) => distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map(({ user }) => user)
  }, [center, radiusKm])

  return { users, isLoading: false, error: null }
}
