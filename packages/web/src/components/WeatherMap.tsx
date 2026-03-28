import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { WeatherData } from '@/types/weather'
import { useEffect } from 'react'

interface WeatherMapProps {
  data: WeatherData
  compareData?: WeatherData | null
  units: 'metric' | 'imperial'
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

function FitBounds({
  points
}: {
  points: [number, number][]
}) {
  const map = useMap()

  useEffect(() => {
    if (points.length < 2) return
    const bounds = L.latLngBounds(points.map(([lat, lon]) => [lat, lon]))
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, points])

  return null
}

function MarkerWithPopup({
  data,
  tempUnit
}: {
  data: WeatherData
  tempUnit: string
}) {
  const { lat, lon } = data.location.coordinates

  return (
    <Marker position={[lat, lon]} icon={markerIcon}>
      <Popup>
        <strong>{data.location.name}</strong>
        <br />
        {data.current.temperature}&deg;{tempUnit} &mdash;{' '}
        {data.current.condition.main}
      </Popup>
    </Marker>
  )
}

export function WeatherMap({ data, compareData, units }: WeatherMapProps) {
  const { lat, lon } = data.location.coordinates
  const tempUnit = units === 'metric' ? 'C' : 'F'
  const isComparing = !!compareData

  const points: [number, number][] = [[lat, lon]]
  if (compareData) {
    points.push([
      compareData.location.coordinates.lat,
      compareData.location.coordinates.lon
    ])
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-6 border border-bg-card">
      <MapContainer
        center={[lat, lon]}
        zoom={isComparing ? 3 : 10}
        style={{ height: isComparing ? '300px' : '250px', width: '100%' }}
        key={points.map((p) => p.join(',')).join('-')}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MarkerWithPopup data={data} tempUnit={tempUnit} />

        {compareData && (
          <>
            <MarkerWithPopup data={compareData} tempUnit={tempUnit} />
            <Polyline
              positions={[
                [lat, lon],
                [
                  compareData.location.coordinates.lat,
                  compareData.location.coordinates.lon
                ]
              ]}
              pathOptions={{
                color: '#6c63ff',
                weight: 3,
                opacity: 0.7,
                dashArray: '8, 8'
              }}
            />
            <FitBounds points={points} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
