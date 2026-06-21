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
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import './MapPage.css'
import type { LatLng } from './geo'
import { updateMyLocation } from './mapApi'
import { useGeolocation } from './useGeolocation'
import { useNearbyUsers } from './useNearbyUsers'

// Eye-catching custom markers built with divIcon (inline SVG/HTML) so they
// never depend on — or break as — an external image asset. A red pin with a
// little user glyph marks neighbours; a blue dot marks the current user.
const userIcon = L.divIcon({
  className: 'map-marker',
  html:
    '<svg width="30" height="42" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 22 12 22s12-13.5 12-22C24 5.37 18.63 0 12 0z" fill="#e53935"/>' +
    '<circle cx="12" cy="12" r="7" fill="#fff"/>' +
    '<path d="M12 8.1a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6zm0 5.4c2.6 0 4.3 1.3 4.3 2.35v.35H7.7v-.35c0-1.05 1.7-2.35 4.3-2.35z" fill="#e53935"/>' +
    '</svg>',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
})

const selfIcon = L.divIcon({
  className: 'map-marker',
  html: '<div class="map-marker__self"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

// University-lunch context: neighbours are within walking distance, so the
// radius is measured in metres (hundreds, not kilometres).
const RADIUS_OPTIONS_M = [100, 250, 500] as const
const DEFAULT_RADIUS_M = 250

/** Keeps the map centered on the user's position as the geolocation updates. */
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
 * US04 (SCRUM-6): only neighbours inside the selected proximity radius (in
 * metres) are shown, and the radius is drawn on the map.
 *
 * Uses Leaflet with the CartoDB "Positron" basemap (open data, no API key) —
 * a clean, low-clutter style without terrain/relief labels.
 */
function MapPage() {
  const { center, isLocating, hasFix } = useGeolocation()
  const [radiusMeters, setRadiusMeters] = useState<number>(DEFAULT_RADIUS_M)

  const { users } = useNearbyUsers(center, radiusMeters)

  // Report our position so other users' maps can find us (US03/US04). Two
  // accounts in the same place (same device/geolocation) thus see each other.
  useEffect(() => {
    void updateMyLocation(center.lat, center.lng)
  }, [center.lat, center.lng])

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
            value={radiusMeters}
            onChange={(event) => setRadiusMeters(Number(event.target.value))}
          >
            {RADIUS_OPTIONS_M.map((option) => (
              <option key={option} value={option}>
                {option} m
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="map-page__canvas">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={16}
          scrollWheelZoom
          className="map-page__leaflet"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <RecenterMap center={center} />

          {/* Proximity radius (US04): the bubble in which the user sees and is seen. */}
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusMeters}
            pathOptions={{
              color: '#2e7d32',
              weight: 2,
              fillColor: '#66bb6a',
              fillOpacity: 0.12,
            }}
          />

          {/* Current user's position. */}
          <Marker position={[center.lat, center.lng]} icon={selfIcon}>
            <Popup>Você</Popup>
          </Marker>

          {users.map((user) => (
            <Marker
              key={user.id}
              position={[user.lat, user.lng]}
              icon={userIcon}
            >
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
