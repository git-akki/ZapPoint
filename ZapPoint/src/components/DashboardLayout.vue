<script setup>
// Shared sidebar + chrome for every authenticated page. Replaces 7 hand-copied
// sidebars across MapView / ChargerListView / Create / Update / Delete /
// Emergency / Track. Each consumer just slots its main content. The active
// link is computed from the current route name so pages don't need to pass
// it explicitly.
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const isSidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⚡', match: ['ChargerList'] },
  { to: '/', label: 'Home', icon: '🏠', match: ['Home'] },
  { to: '/map', label: 'Location', icon: '📍', match: ['Map'] },
  { to: '/emergency', label: 'Emergency', icon: '🚨', match: ['Emergency'] },
  { to: '/create', label: 'Create Station', icon: '➕', match: ['CreateStation'] },
  { to: '/update', label: 'Update Station', icon: '✏️', match: ['UpdateStation'] },
  { to: '/delete', label: 'Delete Station', icon: '🗑️', match: ['DeleteStation'] },
]

const isActive = (item) => item.match.includes(String(route.name))

const handleSignOut = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-shell">
    <button class="hamburger-btn" @click="toggleSidebar" aria-label="Toggle menu">
      <span :class="{ open: isSidebarOpen }">&#9776;</span>
    </button>

    <aside :class="['sidebar', { 'sidebar-open': isSidebarOpen }]">
      <img src="/zappoint-logo.png" alt="ZapPoint Logo" class="logo" />
      <nav>
        <RouterLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
          @click="isSidebarOpen = false"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>

        <button class="nav-item signout" @click="handleSignOut">
          <span class="nav-icon">↪</span>
          <span class="nav-label">Sign out</span>
        </button>
      </nav>
    </aside>

    <main class="dashboard-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: #f9f9fb;
}

.sidebar {
  width: 250px;
  background: #fff;
  padding: 1.5rem;
  border-right: 1px solid #eee;
  transition: transform 0.3s ease-in-out;
  flex-shrink: 0;
}

.logo {
  width: 140px;
  margin-bottom: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.7rem 0.5rem;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.25rem;
  transition: background 0.15s ease, color 0.15s ease;
  background: none;
  border: none;
  width: 100%;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
}

.nav-item:hover {
  background: #f3eaff;
  color: #a855f7;
}

.nav-item.active {
  background: #f3eaff;
  color: #a855f7;
  font-weight: 600;
}

.nav-icon {
  width: 1.5rem;
  display: inline-block;
  text-align: center;
  margin-right: 0.5rem;
}

.signout {
  margin-top: 1.5rem;
  color: #b91c1c;
}

.signout:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.dashboard-content {
  flex: 1;
  padding: 2rem;
  min-width: 0;
}

.hamburger-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: white;
  color: #a855f7;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 1.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .hamburger-btn {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
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
    width: 100%;
  }
}
</style>
