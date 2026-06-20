import { APIProvider, Map } from '@vis.gl/react-google-maps'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

function MapPage() {
  const position = { lat: 53.54, lng: 10 }

  return (
    <div>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <div style={{ height: '80vh' }}>
          <Map defaultZoom={9} defaultCenter={position} />
        </div>
      </APIProvider>
    </div>
  )
}

export default MapPage
