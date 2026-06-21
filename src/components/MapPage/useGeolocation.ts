import { useEffect, useState } from 'react'
import type { LatLng } from './geo'

/**
 * Fallback center used until (or if) the browser grants geolocation.
 * Av. Paulista, São Paulo — a sensible default for the app's audience.
 */
export const FALLBACK_CENTER: LatLng = { lat: -23.5614, lng: -46.6559 }

interface UseGeolocationResult {
  /** Best known position: the device location once granted, else the fallback. */
  center: LatLng
  /** True while the browser is resolving the initial position. */
  isLocating: boolean
  /** True when `center` is the device location rather than the fallback. */
  hasFix: boolean
}

/**
 * Resolves the user's current position via the browser Geolocation API
 * (US03 / SCRUM-5), degrading gracefully to {@link FALLBACK_CENTER} when the
 * API is unavailable, denied, or still pending.
 */
export function useGeolocation(): UseGeolocationResult {
  const [center, setCenter] = useState<LatLng>(FALLBACK_CENTER)
  const [hasFix, setHasFix] = useState(false)
  const hasGeolocation =
    typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [isLocating, setIsLocating] = useState(hasGeolocation)

  useEffect(() => {
    // Initial state already reflects geolocation availability, so there is
    // nothing to synchronize when the API is missing.
    if (!hasGeolocation) {
      return
    }

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setHasFix(true)
        setIsLocating(false)
      },
      () => {
        // Denied or unavailable: stay on the fallback center.
        if (cancelled) return
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )

    return () => {
      cancelled = true
    }
  }, [hasGeolocation])

  return { center, isLocating, hasFix }
}
