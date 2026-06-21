/**
 * Map data layer: report the current user's position and fetch nearby users.
 * Backed by `PUT /users/me/location` and `GET /users/nearby` (backend).
 */
import { getToken } from '../../auth/tokenStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function headers(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    // Skip ngrok's interstitial when the API is tunneled.
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface NearbyUserDto {
  id: number
  name: string
  lat: number
  lng: number
}

/** Report the current user's position (best-effort; failures are ignored). */
export async function updateMyLocation(
  lat: number,
  lng: number,
): Promise<void> {
  try {
    await fetch(`${API_URL}/users/me/location`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ lat, lng }),
    })
  } catch {
    /* offline / not logged in: ignore */
  }
}

/** Other users with a reported position within `radiusMeters` of (lat,lng). */
export async function getNearbyUsers(
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<NearbyUserDto[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_m: String(radiusMeters),
  })
  const res = await fetch(`${API_URL}/users/nearby?${params}`, {
    headers: headers(),
  })
  if (!res.ok) return []
  return (await res.json()) as NearbyUserDto[]
}
