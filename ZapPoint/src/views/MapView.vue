<template>
  <DashboardLayout>
    <div id="map" class="map-container"></div>
  </DashboardLayout>
</template>


<script setup>
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'

// Escape user-supplied strings before they go into Leaflet popup HTML.
// Without this, a station named `<img onerror=alert(1)>` would execute when
// the marker is clicked, since Leaflet renders bindPopup content as raw HTML.
const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const customIcon = L.icon({
  iconUrl: '/zappoint-marker.png', 
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -45],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
})

onMounted(async () => {
  const map = L.map('map').setView([20.5937, 78.9629], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  try {
    const { data: responseData } = await api.get('/stations')
    const stations = Array.isArray(responseData)
      ? responseData
      : responseData?.stations || responseData?.data || []

    stations.forEach(station => {
      if (
        station.location &&
        typeof station.location.latitude === 'number' &&
        typeof station.location.longitude === 'number'
      ) {
        const marker = L.marker(
          [station.location.latitude, station.location.longitude],
          { icon: customIcon }
        ).addTo(map)

        // All interpolated values are HTML-escaped — see escapeHtml docstring above.
        const popupContent = `
          <div style="min-width: 200px">
            <b>${escapeHtml(station.name)}</b><br>
            Status: ${escapeHtml(station.status)}<br>
            Power: ${escapeHtml(station.powerOutput)} kW<br>
            Connector: ${escapeHtml(station.connectorType)}
          </div>
        `
        marker.bindPopup(popupContent)
      }
    })
  } catch (err) {
    // Surface to the user via the existing error pattern; previously was a silent log.
    // Keep console for debugging in dev.
    if (import.meta.env.DEV) console.error('Failed to load stations:', err)
  }
})
</script>

<style scoped>
/* Fill the layout's <main> slot with the map; negative margin offsets the
   parent's padding so the map paints edge-to-edge.
   Dark Leaflet tone: slight vignette + invert map tiles via filter so
   OpenStreetMap doesn't blast white into the dark UI. */
.map-container {
  height: calc(100vh - 0rem);
  width: auto;
  margin: -2rem -2.25rem;
  z-index: 1;
}

/* Apply Apple-like dark cartography. Hue-rotate keeps roads readable
   (pure invert turns roads green). The `:deep` selector reaches into
   Leaflet's runtime-injected tile layer. */
:deep(.leaflet-tile-pane) {
  filter: invert(1) hue-rotate(180deg) saturate(0.5) brightness(0.95) contrast(0.92);
}

/* Don't invert our own marker icons / popup chrome. */
:deep(.leaflet-marker-icon),
:deep(.leaflet-marker-shadow),
:deep(.leaflet-popup),
:deep(.leaflet-control) {
  filter: none;
}

:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) {
  background: rgba(20, 20, 20, 0.92);
  color: var(--zp-text);
  border: 1px solid var(--zp-line);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

:deep(.leaflet-control-attribution) {
  background: rgba(0, 0, 0, 0.6);
  color: var(--zp-text-muted);
  font-size: 10px;
}

:deep(.leaflet-control-attribution a) {
  color: var(--zp-accent);
}

:deep(.leaflet-control-zoom a) {
  background: var(--zp-bg-2);
  color: var(--zp-text);
  border-color: var(--zp-line);
}

:deep(.leaflet-control-zoom a:hover) {
  background: var(--zp-bg-3);
}

@media (max-width: 1024px) {
  .map-container {
    margin: -1.25rem;
    height: calc(100vh - 5rem);
  }
}
</style>
