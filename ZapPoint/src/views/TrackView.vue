<template>
  <DashboardLayout>
    <div class="main-content">
      <!-- Status Panel -->
      <div class="status-panel">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading tracking information...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <Button @click="fetchTrackingData" class="retry-btn">Retry</Button>
        </div>

        <div v-else-if="trackingData" class="tracking-info">
          <div class="status-header">
            <div class="status-icon">
              <span v-if="trackingData.status === 'assigned'">🚗</span>
              <span v-else-if="trackingData.status === 'in-progress'">⚡</span>
              <span v-else-if="trackingData.status === 'completed'">✅</span>
              <span v-else>⏳</span>
            </div>
            <div>
              <h2>{{ getStatusText(trackingData.status) }}</h2>
              <p class="request-id">Request #{{ requestId.slice(-6) }}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <span class="info-label">Station</span>
              <span class="info-value">{{ assignedStation?.name || 'N/A' }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Distance</span>
              <span class="info-value">{{ assignedStation?.distance || 'N/A' }} km</span>
            </div>
            <div class="info-card">
              <span class="info-label">ETA</span>
              <span class="info-value">{{ assignedStation?.eta || 'N/A' }} min</span>
            </div>
            <div class="info-card">
              <span class="info-label">Contact</span>
              <span class="info-value">{{ trackingData.contactNumber }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Connector</span>
              <span class="info-value">{{ trackingData.connectorType }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Power</span>
              <span class="info-value">{{ trackingData.powerRequired }} kW</span>
            </div>
          </div>

          <div class="timeline">
            <div class="timeline-item" :class="{ active: true }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <p class="timeline-title">Request Submitted</p>
                <p class="timeline-time">{{ formatDate(trackingData.requestedAt) }}</p>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: trackingData.status !== 'pending' }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <p class="timeline-title">Vehicle Assigned</p>
                <p class="timeline-time">{{ trackingData.status !== 'pending' ? 'Assigned' : 'Pending' }}</p>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: trackingData.status === 'in-progress' || trackingData.status === 'completed' }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <p class="timeline-title">En Route</p>
                <p class="timeline-time">{{ trackingData.status === 'in-progress' || trackingData.status === 'completed' ? 'In Progress' : 'Waiting' }}</p>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: trackingData.status === 'completed' }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <p class="timeline-title">Service Completed</p>
                <p class="timeline-time">{{ trackingData.completedAt ? formatDate(trackingData.completedAt) : 'Pending' }}</p>
              </div>
            </div>
          </div>

          <Button @click="goToEmergency" class="new-request-btn">
            Request Another Service
          </Button>
        </div>
      </div>

      <!-- Map Container -->
      <div id="map" class="map-container"></div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const requestId = ref(route.params.requestId)
const loading = ref(true)
const error = ref(null)
const trackingData = ref(null)
const assignedStation = ref(null)
let map = null
let userMarker = null
let vehicleMarker = null
let routeLine = null

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41]
})

const vehicleIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41]
})

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Request Pending',
    assigned: 'Vehicle Assigned',
    'in-progress': 'Service In Progress',
    completed: 'Service Completed',
    cancelled: 'Request Cancelled'
  }
  return statusMap[status] || 'Unknown Status'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'Invalid Date'
  }
}

const fetchTrackingData = async () => {
  loading.value = true
  error.value = null

  try {
    if (!requestId.value) {
      throw new Error('Missing request ID in URL')
    }
    const { data } = await api.get(`/emergency/${encodeURIComponent(requestId.value)}`)
    trackingData.value = data.emergencyRequest
    assignedStation.value = data.assignedStation

    // Initialize map with markers
    if (map && trackingData.value?.coordinates) {
      const { latitude, longitude } = trackingData.value.coordinates

      userMarker = L.marker([latitude, longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b><br>Emergency request location')

      if (assignedStation.value && assignedStation.value.coordinates) {
        const stationLat = assignedStation.value.coordinates.latitude
        const stationLng = assignedStation.value.coordinates.longitude

        // Station name is escaped — same XSS surface as MapView popups.
        const safeName = String(assignedStation.value.name ?? '')
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        vehicleMarker = L.marker([stationLat, stationLng], { icon: vehicleIcon })
          .addTo(map)
          .bindPopup(`<b>${safeName}</b><br>Charging vehicle`)

        routeLine = L.polyline([
          [latitude, longitude],
          [stationLat, stationLng],
        ], {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(map)

        const bounds = L.latLngBounds([
          [latitude, longitude],
          [stationLat, stationLng],
        ])
        map.fitBounds(bounds, { padding: [50, 50] })
      } else {
        map.setView([latitude, longitude], 13)
      }
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || 'Failed to load tracking data'
    if (import.meta.env.DEV) console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

const goToEmergency = () => {
  router.push('/emergency')
}

onMounted(() => {
  map = L.map('map').setView([20.5937, 78.9629], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  if (requestId.value) {
    fetchTrackingData()
  } else {
    error.value = 'No request ID provided'
    loading.value = false
  }
})
</script>

<style scoped>
.track-view {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--zp-bg);
  color: var(--zp-text);
  font-family: var(--zp-font);
}

/* Apple-dark cartography on Leaflet */
:deep(.leaflet-tile-pane) {
  filter: invert(1) hue-rotate(180deg) saturate(0.5) brightness(0.95) contrast(0.92);
}
:deep(.leaflet-marker-icon),
:deep(.leaflet-marker-shadow),
:deep(.leaflet-popup),
:deep(.leaflet-control) { filter: none; }
:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) {
  background: rgba(20, 20, 20, 0.92);
  color: var(--zp-text);
  border: 1px solid var(--zp-line);
}
:deep(.leaflet-control-zoom a) {
  background: var(--zp-bg-2);
  color: var(--zp-text);
  border-color: var(--zp-line);
}

.sidebar {
  width: 240px;
  background-color: #1e293b;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
  flex-shrink: 0;
}

.logo {
  padding-left: 1rem;
  width: 130px;
  margin-bottom: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: white;
  text-decoration: none;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background-color: #334155;
}

.nav-item i {
  margin-right: 0.5rem;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.status-panel {
  width: 420px;
  padding: 1.75rem;
  background: var(--zp-bg-1);
  border-right: 1px solid var(--zp-line-soft);
  overflow-y: auto;
  flex-shrink: 0;
  color: var(--zp-text);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--zp-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--zp-line);
  border-top: 3px solid var(--zp-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state { color: var(--zp-error); }

.retry-btn {
  margin-top: 1rem;
  background: white !important;
  color: black !important;
  border-radius: 999px !important;
}

.tracking-info {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--zp-line);
}

.status-icon {
  width: 52px;
  height: 52px;
  background: var(--zp-accent-soft);
  color: var(--zp-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  box-shadow: var(--zp-lift);
}

.status-header h2 {
  font-family: var(--zp-font-display);
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  color: var(--zp-text);
  margin: 0;
}

.request-id {
  font-size: 0.78rem;
  color: var(--zp-text-muted);
  font-family: var(--zp-font-mono);
  margin: 0.25rem 0 0 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--zp-line-soft);
  border: 1px solid var(--zp-line-soft);
  border-radius: var(--zp-radius);
  overflow: hidden;
}

.info-card {
  background: var(--zp-bg-2);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.7rem;
  color: var(--zp-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--zp-track-caps);
}

.info-value {
  font-size: 0.95rem;
  color: var(--zp-text);
  font-weight: 500;
  letter-spacing: var(--zp-track-normal);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.5rem 0;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  position: relative;
  opacity: 0.4;
  transition: opacity var(--zp-base) var(--zp-ease);
}

.timeline-item.active { opacity: 1; }

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 22px;
  width: 2px;
  height: calc(100% - 12px);
  background: var(--zp-line);
}

.timeline-item.active:not(:last-child)::before {
  background: var(--zp-accent);
}

.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--zp-bg-3);
  border: 1px solid var(--zp-line);
  flex-shrink: 0;
  margin-top: 2px;
}

.timeline-item.active .timeline-dot {
  background: var(--zp-accent);
  border-color: var(--zp-accent);
  box-shadow: 0 0 0 3px var(--zp-accent-soft);
}

.timeline-content { flex: 1; }

.timeline-title {
  font-weight: 500;
  font-size: 0.92rem;
  color: var(--zp-text);
  margin: 0 0 0.2rem 0;
  letter-spacing: var(--zp-track-normal);
}

.timeline-time {
  font-size: 0.78rem;
  color: var(--zp-text-muted);
  margin: 0;
}

.new-request-btn {
  width: 100%;
  background: white !important;
  color: black !important;
  padding: 0.8rem !important;
  font-weight: 600;
  border-radius: 999px !important;
  font-size: 0.92rem !important;
}

.new-request-btn:hover {
  background: rgba(255, 255, 255, 0.9) !important;
}

.map-container {
  flex: 1;
}

.hamburger {
  display: none;
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1000;
  font-size: 1.5rem;
  color: white;
  background: #1e293b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 999;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    flex-direction: column;
    padding-top: 4rem;
  }

  .status-panel {
    width: 100%;
    max-height: 50vh;
  }

  .map-container {
    height: 50vh;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
