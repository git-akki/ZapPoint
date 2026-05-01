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
.dashboard-view {
  display: flex;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  flex-direction: row;
}

.sidebar {
  width: 250px;
  background: #fff;
  padding: 1.5rem;
  border-right: 1px solid #eee;
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
}

.nav-item.active {
  color: #a855f7;
}

.dashboard-content {
  flex: 1;
  padding: 2rem;
  background: #f9f9fb;
}
.dashboard-header h2 {
  margin-bottom: 1rem;
}
.station-form {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.form-group input,
.form-group select {
  width: 96%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f0f0ff;
}
.load-btn {
  margin-top: 0.5rem;
  padding: 0.4rem 1rem;
  border: none;
  background: #6c63ff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
.submit-btn {
  background: #a855f7;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.station-preview {
  margin-bottom: 1rem;
  background: #f9f9ff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.message {
  margin-top: 1rem;
  color: green;
  font-weight: 500;
}
.error {
  margin-top: 1rem;
  color: red;
  font-weight: 500;
}

.hamburger {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 2rem;
  color: #a855f7;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
  display: none;
}

.sidebar {
  width: 250px;
  background: #fff;
  padding: 1.5rem;
  border-right: 1px solid #eee;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .sidebar {
    position: fixed;
    height: 100%;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    z-index: 1000;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .dashboard-content {
    padding: 1.5rem;
    margin-left: 0;
  }
}

</style>
