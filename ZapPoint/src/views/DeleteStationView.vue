<template>
  <div class="dashboard-view">
    
    <button class="hamburger" @click="toggleSidebar">
      ☰
    </button>

    
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <img src="/zappoint-logo.png" alt="ZapPoint Logo" class="logo" />
      <nav>
        <RouterLink to="/dashboard" class="nav-item">
          <i class="icon-dashboard" /> Dashboard
        </RouterLink>
        <RouterLink to="/" class="nav-item">
          <i class="icon-home" /> Home
        </RouterLink>
        <RouterLink to="/map" class="nav-item">
          <i class="icon-home" /> Location
        </RouterLink>
        <RouterLink to="/create" class="nav-item">
          <i class="icon-create" /> Create Station
        </RouterLink>
        <RouterLink to="/update" class="nav-item">
          <i class="icon-update" /> Update Station
        </RouterLink>
        <RouterLink to="/delete" class="nav-item active">
          <i class="icon-delete" /> Delete Station
        </RouterLink>
      </nav>
    </aside>

    
    <main class="dashboard-content">
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

        <button type="submit" class="submit-btn">Delete Station</button>

        <p v-if="message" class="message">
          {{ message }}
        </p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </main>
  </div>
</template>


<script setup>
import { ref } from 'vue'

const stationId = ref('')
const message = ref('')
const error = ref('')
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}


const deleteStation = async () => {
  message.value = ''
  error.value = ''

  const token = localStorage.getItem('authToken')
  if (!token) {
    error.value = 'Authentication token missing. Please login.'
    return
  }

  try {
    const response = await fetch(`https://zappoint.onrender.com/api/stations/${stationId.value}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to delete station')
    }

    message.value = `✅ Station with ID "${stationId.value}" deleted successfully.`
    stationId.value = ''
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
