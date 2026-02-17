
<template> 
  <div class="dashboard-view">
    
    <button class="hamburger-btn" @click="toggleSidebar">
      <span :class="{ open: isSidebarOpen }">&#9776;</span>
    </button>

    
    <aside :class="['sidebar', { 'sidebar-open': isSidebarOpen }]">
      <img src="/zappoint-logo.png" alt="ZapPoint Logo" class="logo" />
      <nav>
        <RouterLink to="/dashboard" class="nav-item"><i class="icon-dashboard" /> Dashboard</RouterLink>
        <RouterLink to="/" class="nav-item"><i class="icon-home" /> Home</RouterLink>
        <RouterLink to="/map" class="nav-item"><i class="icon-home" /> Location</RouterLink>
        <RouterLink to="/create" class="nav-item active"><i class="icon-create" /> Create Station</RouterLink>
        <RouterLink to="/update" class="nav-item"><i class="icon-update" /> Update Station</RouterLink>
        <RouterLink to="/delete" class="nav-item"><i class="icon-delete" /> Delete Station</RouterLink>
      </nav>
    </aside>

    
    <main class="dashboard-content">
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
          <input v-model.number="form.latitude" type="number" step="any" placeholder="e.g., 543.6139" required />
        </div>

        <div class="form-group">
          <label>Longitude</label>
          <input v-model.number="form.longitude" type="number" step="any" placeholder="e.g., 654.2090" required />
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

        <button type="submit" class="submit-btn">Create Station</button>

        <p v-if="message" class="message">
          {{ message }}
          <span v-if="stationId" class="message-id">Station ID: {{ stationId }}</span>
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </main>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}


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

const createStation = async () => {
  message.value = ''
  stationId.value = ''
  error.value = ''

  const token = localStorage.getItem('authToken')

  if (!token) {
    error.value = 'Authentication token missing. Please login.'
    return
  }

  try {
    const response = await fetch('https://zappoint.onrender.com/api/stations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.value.name,
        location: {
          latitude: form.value.latitude,
          longitude: form.value.longitude
        },
        status: form.value.status,
        powerOutput: form.value.powerOutput,
        connectorType: form.value.connectorType
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to create station')
    }

    const data = await response.json()
    message.value = `✅ Charging station "${data.name}" created successfully!
    Save this Id for future reference.`
    stationId.value = data._id

    form.value = {
      name: '',
      latitude: '',
      longitude: '',
      status: 'Active',
      powerOutput: '',
      connectorType: ''
    }
  } catch (err) {
    error.value = err.message || 'An error occurred'
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
  width: 100%;
}

.message {
  margin-top: 1rem;
  color: green;
  font-weight: 500;
}

.message-id {
  display: block;
  margin-top: 0.5rem;
  color: #4f46e5;
  font-weight: bold;
  background: #eef2ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  word-break: break-word;
}

.error {
  margin-top: 1rem;
  color: red;
  font-weight: 500;
}


.hamburger-btn {
  display: none;
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: none;
  color: #a855f7;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}


@media (max-width: 1024px) {
  .hamburger-btn {
    display: block;
  }

  .dashboard-view {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 250px;
    background: white;
    z-index: 1000;
    transform: translateX(-100%);
    padding-top: 4rem;
    overflow-y: auto;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .dashboard-content {
    margin-top: 4rem;
    padding: 1rem;
  }

  .station-form {
    padding: 1.5rem;
  }

  .dashboard-header h2 {
    font-size: 1.4rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .station-form {
    padding: 1rem;
  }

  .form-group input,
  .form-group select {
    padding: 0.6rem;
  }

  .submit-btn {
    padding: 0.6rem 1rem;
  }
}


</style>
