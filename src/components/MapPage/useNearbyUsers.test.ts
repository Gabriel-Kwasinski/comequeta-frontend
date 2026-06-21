import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { haversineDistanceKm } from './geo'
import { useNearbyUsers } from './useNearbyUsers'

const CENTER = { lat: -23.5614, lng: -46.6559 }

function distanceMeters(user: { lat: number; lng: number }): number {
  return haversineDistanceKm(CENTER, { lat: user.lat, lng: user.lng }) * 1000
}

describe('useNearbyUsers', () => {
  it('only returns users within the radius in metres (US04 privacy)', () => {
    const radiusMeters = 250
    const { result } = renderHook(() => useNearbyUsers(CENTER, radiusMeters))

    expect(result.current.users.length).toBeGreaterThan(0)
    for (const user of result.current.users) {
      expect(distanceMeters(user)).toBeLessThanOrEqual(radiusMeters)
    }
  })

  it('returns more users as the radius grows', () => {
    const { result: small } = renderHook(() => useNearbyUsers(CENTER, 100))
    const { result: large } = renderHook(() => useNearbyUsers(CENTER, 500))

    expect(large.current.users.length).toBeGreaterThanOrEqual(
      small.current.users.length,
    )
  })

  it('sorts users from nearest to farthest', () => {
    const { result } = renderHook(() => useNearbyUsers(CENTER, 500))
    const distances = result.current.users.map(distanceMeters)
    const sorted = [...distances].sort((a, b) => a - b)
    expect(distances).toEqual(sorted)
  })
})
