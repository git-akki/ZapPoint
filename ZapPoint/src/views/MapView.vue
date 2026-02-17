<template>
  <div class="map-view">
    
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
        <RouterLink to="/map" class="nav-item active">
          <i class="icon-home" /> Location
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

    
    <div id="map" class="map-container"></div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const isSidebarVisible = ref(false)

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}


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
    const token = localStorage.getItem('authToken')
    const res = await fetch('https://zappoint.onrender.com/api/stations', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const responseData = await res.json()
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

        const popupContent = `
          <div style="min-width: 200px">
            <b>${station.name}</b><br>
            Status: ${station.status}<br>
            Power: ${station.powerOutput} kW<br>
            Connector: ${station.connectorType}
          </div>
        `
        marker.bindPopup(popupContent)
      }
    })
  } catch (err) {
    console.error('Failed to load stations:', err)
  }
})
</script>

<style scoped>
.map-view {
  display: flex;
  height: 100vh;
  overflow: hidden;
}


.sidebar {
  width: 240px;
  background-color: #1e293b;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
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


.map-container {
  flex: 1;
  z-index: 1;
}


.hamburger {
  display: none;
  position: absolute;
  top: 2rem;
  left: 1rem;
  z-index: 20;
  font-size: 1.5rem;
  color: white;
  background: #1e293b;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .map-view {
    flex-direction: column;
  }

  
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 10;
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .map-container {
    height: 100vh;
    width: 100%;
  }

  .hamburger {
    display: block;
    top: 19.4%;
    left: 0.5%;
  }
}
</style>
