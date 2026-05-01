<template>
  <DashboardLayout>
    <div class="dashboard-header">
      <h2>Create New Charging Station</h2>
    </div>

    <form @submit.prevent="createStation" class="station-form">
        
        <div class="form-group">
          <label>Station Name</label>
          <input v-model="form.name" type="text" placeholder="Enter station name" required />
        </div>

        <div class="form-group">
          <label>Latitude</label>
          <input v-model.number="form.latitude" type="number" step="any" min="-90" max="90" placeholder="e.g., 28.6139" required />
        </div>

        <div class="form-group">
          <label>Longitude</label>
          <input v-model.number="form.longitude" type="number" step="any" min="-180" max="180" placeholder="e.g., 77.2090" required />
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="form.status" required>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div class="form-group">
          <label>Power Output (kW)</label>
          <input v-model.number="form.powerOutput" type="number" placeholder="e.g., 100" required />
        </div>

        <div class="form-group">
          <label>Connector Type</label>
          <input v-model="form.connectorType" type="text" placeholder="e.g., Type1" required />
        </div>

        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Creating…' : 'Create Station' }}
        </button>

        <p v-if="message" class="message">
          {{ message }}
          <span v-if="stationId" class="message-id">Station ID: {{ stationId }}</span>
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
  </DashboardLayout>
</template>


<script setup>
import { ref } from 'vue'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'


const form = ref({
  name: '',
  latitude: '',
  longitude: '',
  status: 'Active',
  powerOutput: '',
  connectorType: ''
})

const message = ref('')
const stationId = ref('')
const error = ref('')
const submitting = ref(false)

const createStation = async () => {
  if (submitting.value) return
  submitting.value = true
  message.value = ''
  stationId.value = ''
  error.value = ''

  try {
    const { data } = await api.post('/stations', {
      name: form.value.name,
      location: {
        latitude: form.value.latitude,
        longitude: form.value.longitude,
      },
      status: form.value.status,
      powerOutput: form.value.powerOutput,
      connectorType: form.value.connectorType,
    })

    message.value = `✅ Charging station "${data.name}" created successfully!
    Save this Id for future reference.`
    stationId.value = data._id

    form.value = {
      name: '',
      latitude: '',
      longitude: '',
      status: 'Active',
      powerOutput: '',
      connectorType: '',
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || 'An error occurred'
  } finally {
    submitting.value = false
  }
}
</script>


<style scoped>
/* Apple Settings-pane form pattern.
 * Single white pill button, hairline inputs on near-black, label above. */
.dashboard-header { margin-bottom: 1.5rem; }

.dashboard-header h2 {
  font-family: var(--zp-font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  margin: 0;
  color: var(--zp-text);
}

.station-form {
  background: var(--zp-bg-1);
  padding: 1.75rem;
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius-lg);
  max-width: 540px;
  box-shadow: var(--zp-lift);
  animation: zp-rise 400ms var(--zp-spring) both;
}

.form-group { margin-bottom: 1.25rem; }

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  font-size: 0.78rem;
  color: var(--zp-text-muted);
  letter-spacing: var(--zp-track-loose);
  text-transform: uppercase;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  background: var(--zp-bg-2);
  font-family: var(--zp-font);
  font-size: 0.92rem;
  color: var(--zp-text);
  transition: border-color var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease);
}

.form-group input::placeholder {
  color: var(--zp-text-faint);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--zp-accent);
  box-shadow: 0 0 0 3px var(--zp-accent-soft);
}

.submit-btn {
  margin-top: 0.5rem;
  background: white;
  color: black;
  padding: 0.8rem 1.25rem;
  border: 0;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.92rem;
  font-family: var(--zp-font);
  cursor: pointer;
  width: 100%;
  transition: background var(--zp-fast) var(--zp-ease), transform var(--zp-fast) var(--zp-spring), opacity var(--zp-fast) var(--zp-ease);
}

.submit-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.9); }
.submit-btn:active:not(:disabled) { transform: scale(0.99); }

.submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--zp-success-soft);
  color: var(--zp-success);
  border: 1px solid rgba(48, 209, 88, 0.25);
  border-radius: var(--zp-radius);
  font-weight: 500;
  font-size: 0.88rem;
}

.message-id {
  display: block;
  margin-top: 0.6rem;
  padding: 0.55rem 0.75rem;
  background: var(--zp-bg-3);
  color: var(--zp-text);
  border: 1px solid var(--zp-line);
  border-radius: 8px;
  font-family: var(--zp-font-mono);
  font-size: 0.78rem;
  word-break: break-all;
}

.error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--zp-error-soft);
  color: var(--zp-error);
  border: 1px solid rgba(255, 69, 58, 0.3);
  border-radius: var(--zp-radius);
  font-weight: 500;
  font-size: 0.88rem;
}

@media (max-width: 640px) {
  .station-form { padding: 1.5rem; }
}
</style>
