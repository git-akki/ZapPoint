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
/* ChargerList — Apple Mail / Logic Pro library aesthetic on dark.
 * - Title + sub
 * - Inline toolbar (search + filters)
 * - Three stat tiles, equal-weight
 * - List with hairline rules, hover bg, monospace ID chip with copy CTA
 */
.charger-list-content {
  max-width: 1100px;
}

.page-header {
  margin-bottom: 1.75rem;
}

.page-title {
  font-family: var(--zp-font-display);
  font-size: 1.65rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  margin: 0 0 0.3rem;
  color: var(--zp-text);
}

.page-sub {
  margin: 0;
  color: var(--zp-text-muted);
  font-size: 0.9rem;
  letter-spacing: var(--zp-track-normal);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1.5rem;
}

.search-bar {
  flex: 1 1 280px;
  padding: 0.6rem 0.95rem;
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  background: var(--zp-bg-2);
  color: var(--zp-text);
  font-family: var(--zp-font);
  font-size: 0.88rem;
  transition: border-color var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease);
}
.search-bar::placeholder { color: var(--zp-text-faint); }
.search-bar:focus {
  outline: none;
  border-color: var(--zp-accent);
  box-shadow: 0 0 0 3px var(--zp-accent-soft);
}

.filters {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  background: var(--zp-bg-2);
  color: var(--zp-text-soft);
  font-family: var(--zp-font);
  font-size: 0.82rem;
  cursor: pointer;
  transition: border-color var(--zp-fast) var(--zp-ease), color var(--zp-fast) var(--zp-ease);
}
.filter-select:hover {
  border-color: var(--zp-line-strong);
  color: var(--zp-text);
}

.summary-boxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px; /* hairline tile divider trick */
  margin-bottom: 1.5rem;
  background: var(--zp-line-soft);
  border: 1px solid var(--zp-line-soft);
  border-radius: var(--zp-radius);
  overflow: hidden;
}

.summary-box {
  background: var(--zp-bg-1);
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.summary-box i { display: none; }

.summary-box h3 {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--zp-track-caps);
  color: var(--zp-text-muted);
  margin: 0;
}

.summary-box p {
  font-size: 1.65rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  font-variant-numeric: tabular-nums;
  color: var(--zp-text);
  margin: 0;
}

/* List */
.station-list {
  background: var(--zp-bg-1);
  border: 1px solid var(--zp-line-soft);
  border-radius: var(--zp-radius);
  overflow: hidden;
}

.station-list h3 {
  margin: 0;
  padding: 0.85rem 1.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--zp-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--zp-track-caps);
  border-bottom: 1px solid var(--zp-line-soft);
  background: var(--zp-bg-2);
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
  border-bottom: 1px solid var(--zp-line-soft);
  transition: background var(--zp-fast) var(--zp-ease);
  animation: zp-rise 400ms var(--zp-spring) both;
}
.station-list li:last-child { border-bottom: 0; }
.station-list li:hover { background: var(--zp-bg-2); }

.station-info { flex: 1; min-width: 0; }

.station-info p {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--zp-text);
  margin: 0 0 0.2rem;
  letter-spacing: var(--zp-track-normal);
}

.station-info small {
  color: var(--zp-text-faint);
  font-size: 0.78rem;
  letter-spacing: var(--zp-track-normal);
}

.station-details {
  display: flex;
  gap: 1.1rem;
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--zp-text-soft);
}

.station-id-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.65rem;
  flex-wrap: wrap;
}

.station-id {
  font-family: var(--zp-font-mono);
  font-size: 0.7rem;
  background: var(--zp-bg-3);
  color: var(--zp-text-soft);
  padding: 0.22rem 0.55rem;
  border-radius: 6px;
  word-break: break-all;
  user-select: all;
  border: 1px solid var(--zp-line-soft);
}

.copy-btn {
  border: 1px solid var(--zp-line);
  background: var(--zp-bg-2);
  color: var(--zp-text-soft);
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background var(--zp-fast) var(--zp-ease),
    color var(--zp-fast) var(--zp-ease),
    border-color var(--zp-fast) var(--zp-ease);
}
.copy-btn:hover {
  background: var(--zp-accent-soft);
  color: var(--zp-accent);
  border-color: rgba(10, 132, 255, 0.4);
}
.copy-btn.copied {
  background: var(--zp-success-soft);
  color: var(--zp-success);
  border-color: rgba(48, 209, 88, 0.4);
}

.status-active,
.status-inactive {
  font-weight: 600;
  font-size: 0.7rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  flex-shrink: 0;
  margin-left: 1rem;
  letter-spacing: var(--zp-track-loose);
  text-transform: uppercase;
}
.status-active {
  color: var(--zp-success);
  background: var(--zp-success-soft);
}
.status-inactive {
  color: var(--zp-error);
  background: var(--zp-error-soft);
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
  font-size: 0.92rem;
}
.error {
  color: var(--zp-error);
  background: var(--zp-error-soft);
  border: 1px solid rgba(255, 69, 58, 0.3);
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .station-list li { flex-direction: column; gap: 0.5rem; }
  .status-active,
  .status-inactive { align-self: flex-start; margin-left: 0; }
}
</style>
