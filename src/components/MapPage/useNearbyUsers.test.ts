import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { haversineDistanceKm } from './geo'
import { useNearbyUsers } from './useNearbyUsers'

const CENTER = { lat: -23.5614, lng: -46.6559 }

describe('useNearbyUsers', () => {
  it('only returns users within the radius (US04 privacy)', () => {
    const radiusKm = 2
    const { result } = renderHook(() => useNearbyUsers(CENTER, radiusKm))

    expect(result.current.users.length).toBeGreaterThan(0)
    for (const user of result.current.users) {
      expect(
        haversineDistanceKm(CENTER, { lat: user.lat, lng: user.lng }),
      ).toBeLessThanOrEqual(radiusKm)
    }
  })

  it('returns more users as the radius grows', () => {
    const { result: small } = renderHook(() => useNearbyUsers(CENTER, 1))
    const { result: large } = renderHook(() => useNearbyUsers(CENTER, 10))

    expect(large.current.users.length).toBeGreaterThanOrEqual(
      small.current.users.length,
    )
  })

  it('sorts users from nearest to farthest', () => {
    const { result } = renderHook(() => useNearbyUsers(CENTER, 10))
    const distances = result.current.users.map((user) =>
      haversineDistanceKm(CENTER, { lat: user.lat, lng: user.lng }),
    )
    const sorted = [...distances].sort((a, b) => a - b)
    expect(distances).toEqual(sorted)
  })
})
