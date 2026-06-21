import { describe, expect, it } from 'vitest'
import { haversineDistanceKm, isWithinRadius } from './geo'

describe('haversineDistanceKm', () => {
  it('returns zero for the same point', () => {
    const p = { lat: -23.5614, lng: -46.6559 }
    expect(haversineDistanceKm(p, p)).toBeCloseTo(0, 5)
  })

  it('matches a known distance (São Paulo → Rio de Janeiro ≈ 360 km)', () => {
    const sp = { lat: -23.5505, lng: -46.6333 }
    const rio = { lat: -22.9068, lng: -43.1729 }
    const distance = haversineDistanceKm(sp, rio)
    expect(distance).toBeGreaterThan(355)
    expect(distance).toBeLessThan(365)
  })

  it('is symmetric', () => {
    const a = { lat: 10, lng: 20 }
    const b = { lat: -5, lng: 40 }
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 6)
  })
})

describe('isWithinRadius', () => {
  const center = { lat: 0, lng: 0 }

  it('includes points inside the radius', () => {
    // ~1.1 km north of the equator origin.
    expect(isWithinRadius(center, { lat: 0.01, lng: 0 }, 2)).toBe(true)
  })

  it('excludes points outside the radius', () => {
    expect(isWithinRadius(center, { lat: 0.1, lng: 0 }, 2)).toBe(false)
  })
})
