<template>
  <DashboardLayout>
    <div class="charger-list-content">
      <!-- Page header — user identity is now in the sidebar's user chip,
           so this row only carries the page title + filters. -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Stations</h1>
          <p class="page-sub">Browse, filter, and copy IDs for any registered charger.</p>
        </div>
      </div>

      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-bar"
          placeholder="🔍 Search by name…"
        />

        <div class="filters">
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
/* Dashboard list — Vercel-inspired:
 * - Page header with title + subtitle
 * - Toolbar row with search + filters
 * - Stat cards in a clean grid
 * - List rows with subtle dividers and per-row copy chip */
.charger-list-content {
  max-width: 1100px;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-family: var(--zp-font-display);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
  color: var(--zp-text);
}

.page-sub {
  margin: 0;
  color: var(--zp-text-soft);
  font-size: 0.9rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: var(--zp-bg);
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius);
}

.search-bar {
  flex: 1 1 280px;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius-sm);
  background: var(--zp-bg-soft);
  color: var(--zp-text);
  font-family: var(--zp-font-sans);
  font-size: 0.9rem;
  transition: border-color var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease);
}

.search-bar:focus {
  outline: none;
  border-color: var(--zp-violet);
  box-shadow: 0 0 0 3px var(--zp-violet-100);
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius-sm);
  background: var(--zp-bg-soft);
  color: var(--zp-text-soft);
  font-family: var(--zp-font-sans);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color var(--zp-fast) var(--zp-ease);
}

.filter-select:hover {
  border-color: var(--zp-text-muted);
  color: var(--zp-text);
}

.summary-boxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.summary-box {
  background: var(--zp-bg);
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: border-color var(--zp-fast) var(--zp-ease);
}

.summary-box:hover {
  border-color: var(--zp-violet-300);
}

.summary-box i {
  display: none; /* legacy icon classes — sidebar handles iconography now */
}

.summary-box h3 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--zp-text-muted);
  margin: 0;
}

.summary-box p {
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--zp-text);
  margin: 0;
}

.station-list {
  background: var(--zp-bg);
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius);
  overflow: hidden;
}

.station-list h3 {
  margin: 0;
  padding: 1rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--zp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--zp-border-soft);
  background: var(--zp-bg-soft);
}

.station-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.station-list li {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--zp-border-soft);
  transition: background var(--zp-fast) var(--zp-ease);
  animation: zp-rise 400ms var(--zp-ease-out) both;
}

.station-list li:last-child {
  border-bottom: none;
}

.station-list li:hover {
  background: var(--zp-bg-soft);
}

.station-info {
  flex: 1;
  min-width: 0;
}

.station-info p {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--zp-text);
  margin: 0 0 0.2rem;
}

.station-info small {
  color: var(--zp-text-muted);
  font-size: 0.78rem;
}

.station-details {
  display: flex;
  gap: 1rem;
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--zp-text-soft);
}

.station-id-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
}

.station-id {
  font-family: var(--zp-font-mono);
  font-size: 0.7rem;
  background: var(--zp-bg-mute);
  color: var(--zp-text-soft);
  padding: 0.2rem 0.5rem;
  border-radius: var(--zp-radius-sm);
  word-break: break-all;
  user-select: all;
}

.copy-btn {
  border: 1px solid var(--zp-border);
  background: var(--zp-bg);
  color: var(--zp-text-soft);
  padding: 0.2rem 0.55rem;
  border-radius: var(--zp-radius-sm);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--zp-fast) var(--zp-ease), color var(--zp-fast) var(--zp-ease), border-color var(--zp-fast) var(--zp-ease);
}

.copy-btn:hover {
  background: var(--zp-violet-50);
  color: var(--zp-violet-700);
  border-color: var(--zp-violet-300);
}

.copy-btn.copied {
  background: var(--zp-success-bg);
  color: var(--zp-success);
  border-color: #86efac;
}

.status-active,
.status-inactive {
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  flex-shrink: 0;
  margin-left: 1rem;
}

.status-active {
  color: var(--zp-success);
  background: var(--zp-success-bg);
}

.status-inactive {
  color: var(--zp-error);
  background: var(--zp-error-bg);
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  border-radius: var(--zp-radius);
  margin: 0 0 1rem;
}

.loading {
  color: var(--zp-text-muted);
  font-size: 0.95rem;
}

.error {
  color: var(--zp-error);
  background: var(--zp-error-bg);
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .station-list li {
    flex-direction: column;
    gap: 0.5rem;
  }
  .status-active,
  .status-inactive {
    align-self: flex-start;
    margin-left: 0;
  }
}
</style>
