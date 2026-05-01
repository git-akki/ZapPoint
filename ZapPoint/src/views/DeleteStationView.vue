<template>
  <DashboardLayout>
    <div class="dashboard-header">
      <h2>Delete Charging Station</h2>
    </div>

    <form @submit.prevent="deleteStation" class="station-form">
        <div class="form-group">
          <label>Station ID</label>
          <input
            v-model="stationId"
            type="text"
            placeholder="Enter station ID"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Deleting…' : 'Delete Station' }}
        </button>

        <p v-if="message" class="message">
          {{ message }}
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
  </DashboardLayout>
</template>


<script setup>
import { ref } from 'vue'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'

const stationId = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)
// Sidebar state now lives inside DashboardLayout.

const deleteStation = async () => {
  if (submitting.value) return
  submitting.value = true
  message.value = ''
  error.value = ''

  try {
    await api.delete(`/stations/${encodeURIComponent(stationId.value)}`)
    message.value = `✅ Station with ID "${stationId.value}" deleted successfully.`
    stationId.value = ''
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || 'Failed to delete station'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Destructive form — red pill button, monospace ID input.
   Otherwise mirrors the Create/Update pattern for consistency. */
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

.form-group input {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  background: var(--zp-bg-2);
  font-family: var(--zp-font-mono);
  font-size: 0.86rem;
  color: var(--zp-text);
  transition: border-color var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease);
}
.form-group input::placeholder { color: var(--zp-text-faint); }
.form-group input:focus {
  outline: none;
  border-color: var(--zp-error);
  box-shadow: 0 0 0 3px var(--zp-error-soft);
}

.submit-btn {
  margin-top: 0.5rem;
  background: var(--zp-error);
  color: white;
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
.submit-btn:hover:not(:disabled) { background: #ff6259; }
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
