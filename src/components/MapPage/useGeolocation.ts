import { Geolocation } from "@capacitor/geolocation";
import { useEffect, useState } from "react";
import type { LatLng } from "./geo";

/**
 * Fallback center used until (or if) geolocation is granted.
 * Av. Paulista, São Paulo — a sensible default for the app's audience.
 */
export const FALLBACK_CENTER: LatLng = { lat: -23.5614, lng: -46.6559 };

interface UseGeolocationResult {
	/** Best known position: the device location once granted, else the fallback. */
	center: LatLng;
	/** True while the initial position is being resolved. */
	isLocating: boolean;
	/** True when `center` is the device location rather than the fallback. */
	hasFix: boolean;
}

/**
 * Resolves the user's current position via the Capacitor Geolocation plugin
 * (US03 / SCRUM-5), degrading gracefully to {@link FALLBACK_CENTER} when
 * permission is denied, location services are off, or the lookup is still
 * pending. Capacitor falls back to the browser Geolocation API on web, so
 * this works unchanged across web, iOS, and Android.
 */
export function useGeolocation(): UseGeolocationResult {
	const [center, setCenter] = useState<LatLng>(FALLBACK_CENTER);
	const [hasFix, setHasFix] = useState(false);
	const [isLocating, setIsLocating] = useState(true);

	useEffect(() => {
		let cancelled = false;

		Geolocation.getCurrentPosition({
			enableHighAccuracy: true,
			timeout: 10_000,
		})
			.then((position) => {
				if (cancelled) return;
				setCenter({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
				setHasFix(true);
			})
			.catch(() => {
				// Denied, unavailable, or location services disabled: stay on the
				// fallback center.
			})
			.finally(() => {
				if (!cancelled) setIsLocating(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return { center, isLocating, hasFix };
}
