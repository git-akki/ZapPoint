<template>
  <div class="track-view">
    <div class="hamburger" @click="toggleSidebar">
      ☰
    </div>

    <aside class="sidebar" :class="{ show: isSidebarVisible }">
      <img src="/zappoint-logo.png" alt="ZapPoint Logo" class="logo" />
      <nav>
        <RouterLink to="/dashboard" class="nav-item">
          <i class="icon-dashboard" /> Dashboard
        </RouterLink>
        <RouterLink to="/" class="nav-item">
          <i class="icon-home" /> Home
        </RouterLink>
        <RouterLink to="/map" class="nav-item">
          <i class="icon-map" /> Location
        </RouterLink>
        <RouterLink to="/emergency" class="nav-item">
          <i class="icon-emergency" /> Emergency
        </RouterLink>
        <RouterLink to="/create" class="nav-item">
          <i class="icon-create" /> Create Station
        </RouterLink>
        <RouterLink to="/update" class="nav-item">
          <i class="icon-update" /> Update Station
        </RouterLink>
        <RouterLink to="/delete" class="nav-item">
          <i class="icon-delete" /> Delete Station
        </RouterLink>
      </nav>
    </aside>

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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const requestId = ref(route.params.requestId)
const isSidebarVisible = ref(false)
const loading = ref(true)
const error = ref(null)
const trackingData = ref(null)
const assignedStation = ref(null)
let map = null
let userMarker = null
let vehicleMarker = null
let routeLine = null

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}

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
    const token = localStorage.getItem('authToken')
    const response = await fetch(`http://localhost:5000/api/emergency/${requestId.value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (response.ok) {
      trackingData.value = data.emergencyRequest
      assignedStation.value = data.assignedStation

      // Initialize map with markers
      if (map && trackingData.value.coordinates) {
        const { latitude, longitude } = trackingData.value.coordinates

        // Add user marker
        userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>Your Location</b><br>Emergency request location')

        // Add vehicle marker if station is assigned
        if (assignedStation.value && assignedStation.value.coordinates) {
          const stationLat = assignedStation.value.coordinates.latitude
          const stationLng = assignedStation.value.coordinates.longitude

          vehicleMarker = L.marker([stationLat, stationLng], { icon: vehicleIcon })
            .addTo(map)
            .bindPopup(`<b>${assignedStation.value.name}</b><br>Charging vehicle`)

          // Draw route
          routeLine = L.polyline([
            [latitude, longitude],
            [stationLat, stationLng]
          ], {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map)

          // Fit bounds
          const bounds = L.latLngBounds([
            [latitude, longitude],
            [stationLat, stationLng]
          ])
          map.fitBounds(bounds, { padding: [50, 50] })
        } else {
          map.setView([latitude, longitude], 13)
        }
      }
    } else {
      error.value = data.message || 'Failed to load tracking data'
    }
  } catch (err) {
    error.value = 'Failed to connect to server'
    console.error('Fetch error:', err)
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
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  padding: 2rem;
  background: white;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: #dc2626;
}

.retry-btn {
  margin-top: 1rem;
  background: #3b82f6;
  color: white;
}

.tracking-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.status-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.status-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.request-id {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1rem 0;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 2rem;
  position: relative;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.timeline-item.active {
  opacity: 1;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 30px;
  width: 2px;
  height: calc(100% - 10px);
  background: #e2e8f0;
}

.timeline-item.active:not(:last-child)::before {
  background: #3b82f6;
}

.timeline-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
  margin-top: 2px;
}

.timeline-item.active .timeline-dot {
  background: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.timeline-time {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.new-request-btn {
  width: 100%;
  background: #3b82f6;
  color: white;
  padding: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
}

.new-request-btn:hover {
  background: #2563eb;
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
