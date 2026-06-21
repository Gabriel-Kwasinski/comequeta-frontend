/**
 * Geospatial helpers for the proximity map (SCRUM-5, SCRUM-6).
 */

export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Great-circle distance between two coordinates, in kilometres, using the
 * haversine formula.
 *
 * Used by US04 (SCRUM-6) to decide which neighbours fall inside the privacy
 * radius: users farther than the radius are never rendered, so a person is
 * only "seen" by — and only "sees" — others within their proximity bubble.
 */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)

  const h =
    sinLat * sinLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinLng * sinLng

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * True when `point` lies within `radiusKm` of `center` (inclusive).
 */
export function isWithinRadius(
  center: LatLng,
  point: LatLng,
  radiusKm: number,
): boolean {
  return haversineDistanceKm(center, point) <= radiusKm
}
