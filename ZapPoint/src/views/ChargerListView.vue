<template>
  <DashboardLayout>
    <div class="charger-list-content">
      <!-- Header -->
      <div class="dashboard-header">
        <input 
          v-model="searchQuery"
          type="text" 
          class="search-bar" 
          placeholder="Search by name..." 
        />

        <!-- Filters -->
        <div class="filters">
          <div class="filter-icon"></div>
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          
          <select v-model="powerFilter" class="filter-select">
            <option value="">All Power</option>
            <option v-for="power in uniquePowerLevels" :value="power" :key="power">
              {{ power }}kW
            </option>
          </select>
          
          <select v-model="connectorFilter" class="filter-select">
            <option value="">All Connectors</option>
            <option v-for="connector in uniqueConnectors" :value="connector" :key="connector">
              {{ connector }}
            </option>
          </select>
        </div>

        <div class="profile">
          <span>{{ currentUserEmail }}</span>
          <small>User</small>
          <img src="/profile.png" alt="Profile" />
        </div>
      </div>

      <!-- Status Summary -->
      <div class="summary-boxes">
        <div class="summary-box">
          <i class="icon-charger" />
          <div>
            <h3>Charging Stations</h3>
            <p>{{ totalStations }}</p>
          </div>
        </div>
        <div class="summary-box">
          <i class="icon-active" />
          <div>
            <h3>Active</h3>
            <p>{{ activeStations }}</p>
          </div>
        </div>
        <div class="summary-box">
          <i class="icon-inactive" />
          <div>
            <h3>Inactive</h3>
            <p>{{ inactiveStations }}</p>
          </div>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="loading">Loading stations...</div>
      <div v-if="error" class="error">{{ error }}</div>

      <!-- Filtered Station List -->
      <div v-if="!loading && !error" class="station-list">
        <h3>All Charging Stations ({{ filteredStations.length }})</h3>
        <ul>
          <li v-for="station in filteredStations" :key="station._id || station.id">
            <div class="station-info">
              <p>{{ station.name }}</p>
              <small v-if="station.createdAt">{{ formatDate(station.createdAt) }}</small>
              <div class="station-details">
                <span>Power: {{ station.powerOutput }}kW</span>
                <span>Connector: {{ station.connectorType }}</span>
              </div>
              <!-- ID + copy chip. Update / Delete views require the
                   raw _id, so we expose it inline rather than burying it
                   in DevTools. -->
              <div class="station-id-row">
                <code class="station-id">{{ station._id || station.id }}</code>
                <button
                  type="button"
                  class="copy-btn"
                  :class="{ copied: copiedId === (station._id || station.id) }"
                  @click="copyId(station._id || station.id)"
                  :title="copiedId === (station._id || station.id) ? 'Copied!' : 'Copy ID'"
                >
                  {{ copiedId === (station._id || station.id) ? '✓ Copied' : '📋 Copy ID' }}
                </button>
              </div>
            </div>
            <span :class="station.status === 'Active' ? 'status-active' : 'status-inactive'">
              {{ station.status }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'

const stations = ref([])
const loading = ref(true)
const error = ref(null)

// Track which ID was just copied so we can flash a "Copied!" state for ~1.5s.
// One-at-a-time UX is fine because users typically copy a single ID before
// pasting it into the Update / Delete form.
const copiedId = ref('')
let copyResetTimer = null

const copyId = async (id) => {
  if (!id) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(id)
    } else {
      // Fallback for older Safari / non-HTTPS contexts where clipboard
      // permissions are denied. The textarea trick still works in those cases.
      const ta = document.createElement('textarea')
      ta.value = id
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copiedId.value = id
    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => { copiedId.value = '' }, 1500)
  } catch {
    // Permission denied or no clipboard API — surface via the error banner
    // so the user isn't left wondering why nothing happened.
    error.value = 'Could not copy. Long-press the ID to select it manually.'
  }
}

// Pull the logged-in user from the same localStorage slot that LoginView writes.
// Fail soft to "Account" if anything in the JSON is malformed (e.g. logged-out
// state, manual tampering).
const currentUserEmail = computed(() => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return 'Account'
    const parsed = JSON.parse(raw)
    return parsed?.email || 'Account'
  } catch {
    return 'Account'
  }
})

const searchQuery = ref('')
const statusFilter = ref('')
const powerFilter = ref('')
const connectorFilter = ref('')

const fetchStations = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data: responseData } = await api.get('/stations')

    if (Array.isArray(responseData)) {
      stations.value = responseData
    } else if (Array.isArray(responseData.stations)) {
      stations.value = responseData.stations
    } else if (responseData.data && Array.isArray(responseData.data)) {
      stations.value = responseData.data
    } else {
      throw new Error('Unexpected API response format')
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || 'Failed to load stations'
  } finally {
    loading.value = false
  }
}

// Computed properties for statistics
const totalStations = computed(() => stations.value.length)
const activeStations = computed(() => stations.value.filter(s => s.status === 'Active' || s.isActive).length)
const inactiveStations = computed(() => stations.value.filter(s => s.status === 'Inactive' || !s.isActive).length)

// Get unique values for filters
const uniquePowerLevels = computed(() => {
  const powers = stations.value.map(s => s.powerOutput)
  return [...new Set(powers)].sort((a, b) => a - b)
})

const uniqueConnectors = computed(() => {
  const connectors = stations.value.map(s => s.connectorType)
  return [...new Set(connectors)].sort()
})

// Filter stations based on search and filters
const filteredStations = computed(() => {
  return stations.value.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value ? station.status === statusFilter.value : true
    const matchesPower = powerFilter.value ? station.powerOutput == powerFilter.value : true
    const matchesConnector = connectorFilter.value ? station.connectorType === connectorFilter.value : true
    
    return matchesSearch && matchesStatus && matchesPower && matchesConnector
  })
})

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return 'Invalid Date'
  }
}

// Fetch data on component mount
onMounted(fetchStations)
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
  background: #fee;
  border-radius: 8px;
  margin: 1rem 0;
}

.dashboard-view {
  display: flex;
  font-family: 'Poppins', sans-serif;
}

.sidebar {
  width: 250px;
  background: #fff;
  padding: 1.5rem;
  border-right: 1px solid #eee;
  transition: transform 0.3s ease-in-out;
}

.logo {
  width: 140px;
  margin-bottom: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 0;
  color: #333;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-item:hover {
  color: #a855f7;
}

.nav-item.active {
  color: #a855f7;
  font-weight: 600;
}

.nav-item i {
  margin-right: 0.8rem;
  width: 20px;
}

.dashboard-content {
  flex: 1;
  padding: 2rem;
  background: #f9f9fb;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 15px;
}

.search-bar {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: 1px solid #ddd;
  width: 280px;
  background: #f0f0ff;
}

.filters {
  display: flex;
  gap: 10px;
  margin-left: 20px;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f0f0ff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-select:hover {
  background: #e5e5ff;
}

.profile {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.summary-boxes {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-box {
  background: #f3f3ff;
  padding: 1.2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-box h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.summary-box p {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.station-list {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.station-list h3 {
  margin-bottom: 1rem;
  color: #333;
}

.station-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.station-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.station-list li:last-child {
  border-bottom: none;
}

.station-info p {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.3rem;
}

.station-info small {
  color: #999;
  font-size: 0.8rem;
}

.station-details {
  display: flex;
  gap: 15px;
  margin-top: 5px;
  font-size: 0.8rem;
  color: #666;
}

.station-id-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.station-id {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  word-break: break-all;
  user-select: all; /* one-tap select on mobile if copy permission fails */
}

.copy-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.copy-btn:hover {
  background: #f3eaff;
  color: #a855f7;
  border-color: #d8b4fe;
}

.copy-btn.copied {
  background: #dcfce7;
  color: #16a34a;
  border-color: #86efac;
}

.status-active {
  color: #16a34a;
  font-weight: 600;
  background: #dcfce7;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-inactive {
  color: #dc2626;
  font-weight: 600;
  background: #fee2e2;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 100;
  padding: 0.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .dashboard-view {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #eee;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .nav-item {
    justify-content: center;
  }

  .dashboard-content {
    padding: 1rem;
  }

  .summary-boxes {
    flex-direction: column;
  }

  .filters {
    flex-wrap: wrap;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 250px;
    transform: translateX(-100%);
    z-index: 99;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .dashboard-content {
    margin-left: 0;
    padding-top: 4rem;
  }
}

@media (max-width: 600px) {
  .search-bar {
    width: 100%;
  }

  .filters {
    flex-direction: column;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .profile {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .station-details {
    flex-direction: column;
    gap: 4px;
  }

  .station-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .status-active, 
  .status-inactive {
    align-self: flex-start;
  }

  .dashboard-header {
    align-items: flex-start;
  }
}
</style>
