import Navigation from '../NavigationBar/Navigation.jsx'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps'

function MapPage() {
  const position = { lat: 53.54, lng: 10 }

  return (
    <APIProvider>
      <div style={{ height: '50vh' }}>
        <Navigation></Navigation>
        <Map zoom={9} center={position}></Map>
      </div>
    </APIProvider>
  )
}

export default MapPage
