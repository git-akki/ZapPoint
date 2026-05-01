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
/* Compact form pattern shared across Create / Update / Delete views.
   Visual rules: clean white card, single-pixel borders, focus ring uses
   the brand violet, submit button defaults to dark primary so the page
   doesn't compete with the colored sidebar accent. */
.dashboard-header {
  margin-bottom: 1.5rem;
}

.dashboard-header h2 {
  font-family: var(--zp-font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}

.station-form {
  background: var(--zp-bg);
  padding: 2rem;
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius-lg);
  max-width: 540px;
  box-shadow: var(--zp-shadow-sm);
  animation: zp-rise 400ms var(--zp-ease-out) both;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--zp-text-soft);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius);
  background: var(--zp-bg);
  font-family: var(--zp-font-sans);
  font-size: 0.95rem;
  color: var(--zp-text);
  transition: border-color var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--zp-violet);
  box-shadow: 0 0 0 3px var(--zp-violet-100);
}

.submit-btn {
  margin-top: 0.5rem;
  background: var(--zp-text);
  color: var(--zp-text-on-dark);
  padding: 0.85rem 1.25rem;
  border: 0;
  border-radius: var(--zp-radius);
  font-weight: 600;
  font-size: 0.95rem;
  font-family: var(--zp-font-sans);
  cursor: pointer;
  width: 100%;
  transition: background var(--zp-fast) var(--zp-ease), transform var(--zp-fast) var(--zp-ease), opacity var(--zp-fast) var(--zp-ease);
}

.submit-btn:hover:not(:disabled) {
  background: #1f1f1f;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.99);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--zp-success-bg);
  color: var(--zp-success);
  border-radius: var(--zp-radius);
  font-weight: 500;
  font-size: 0.9rem;
}

.message-id {
  display: block;
  margin-top: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: var(--zp-bg);
  color: var(--zp-text);
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius-sm);
  font-family: var(--zp-font-mono);
  font-size: 0.8rem;
  word-break: break-all;
}

.error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--zp-error-bg);
  color: var(--zp-error);
  border-radius: var(--zp-radius);
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .station-form { padding: 1.5rem; }
}
</style>
