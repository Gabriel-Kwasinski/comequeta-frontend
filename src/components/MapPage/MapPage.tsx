import { useEffect, useState } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import './MapPage.css'
import type { LatLng } from './geo'
import { useGeolocation } from './useGeolocation'
import { useNearbyUsers } from './useNearbyUsers'

// Leaflet's default marker icons reference asset paths that break under
// bundlers; point them at the imported asset URLs so markers render correctly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const RADIUS_OPTIONS_KM = [1, 2, 5, 10] as const
const DEFAULT_RADIUS_KM = 2

/** Keeps the map centered on the user's position as the geolocation fix updates. */
function RecenterMap({ center }: { center: LatLng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng])
  }, [map, center])
  return null
}

/**
 * US03 (SCRUM-5): interactive map centered on the user's geolocation showing
 * nearby neighbours as markers; clicking a marker opens a popup linking to that
 * neighbour's profile.
 *
 * US04 (SCRUM-6): only neighbours inside the selected proximity radius are
 * shown, and the radius is drawn on the map — a user sees, and is seen by, only
 * people within their proximity bubble (privacy by design).
 *
 * Uses Leaflet + OpenStreetMap tiles (open source, no API key required).
 */
function MapPage() {
  const { center, isLocating, hasFix } = useGeolocation()
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_KM)

  const { users } = useNearbyUsers(center, radiusKm)

  return (
    <div className="map-page">
      <header className="map-page__bar">
        <div className="map-page__status">
          {isLocating
            ? 'Localizando você…'
            : hasFix
              ? 'Mostrando vizinhos ao seu redor'
              : 'Usando localização aproximada'}
          <span className="map-page__count">
            {users.length} vizinho{users.length === 1 ? '' : 's'} no raio
          </span>
        </div>

        <label className="map-page__radius">
          Raio de proximidade
          <select
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
          >
            {RADIUS_OPTIONS_KM.map((option) => (
              <option key={option} value={option}>
                {option} km
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="map-page__canvas">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          scrollWheelZoom
          className="map-page__leaflet"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} />

          {/* Proximity radius (US04): the bubble in which the user sees and is seen. */}
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#2e7d32',
              weight: 2,
              fillColor: '#66bb6a',
              fillOpacity: 0.12,
            }}
          />

          {/* Current user's position. */}
          <Marker position={[center.lat, center.lng]}>
            <Popup>Você</Popup>
          </Marker>

          {users.map((user) => (
            <Marker key={user.id} position={[user.lat, user.lng]}>
              <Popup>
                <div className="map-page__info">
                  <strong>{user.name}</strong>
                  <Link to={`/profile/${user.id}`}>Ver perfil</Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapPage
