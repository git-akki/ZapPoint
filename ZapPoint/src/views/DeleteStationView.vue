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

.submit-btn {
  background: #a855f7;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
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
  display: none;
  font-size: 2rem;
  background: none;
  border: none;
  color: #a855f7;
  padding: 1rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
}


.sidebar {
  transition: transform 0.3s ease-in-out;
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .dashboard-content {
    margin-top: 3rem;
  }
}

</style>
