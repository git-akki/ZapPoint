<template>
  <DashboardLayout>
    <div class="dashboard-header">
      <h2>Update Charging Station</h2>
    </div>

    <form @submit.prevent="updateStation" class="station-form">
        <div class="form-group">
          <label>Station ID</label>
          <input v-model="stationId" type="text" placeholder="Enter station ID" required />
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

        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Updating…' : 'Update Station' }}
        </button>

        <p v-if="message" class="message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
  </DashboardLayout>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'

const stationId = ref('')
const form = ref({
  status: 'Inactive',
  powerOutput: ''
})

const message = ref('')
const error = ref('')
const submitting = ref(false)

const updateStation = async () => {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  message.value = ''

  try {
    await api.put(`/stations/${encodeURIComponent(stationId.value)}`, {
      status: form.value.status,
      powerOutput: form.value.powerOutput,
    })
    message.value = 'Station updated successfully.'
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || 'Update failed'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
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
.form-group input::placeholder { color: var(--zp-text-faint); }

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
.submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

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
