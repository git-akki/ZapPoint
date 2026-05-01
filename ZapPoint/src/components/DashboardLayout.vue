<script setup>
// Shared sidebar + chrome for every authenticated page. Replaces hand-copied
// sidebars across the dashboard views. Each consumer just slots its main
// content; the active link is computed from the current route name so
// pages don't need to pass it.
//
// Visual style intentionally references Vercel: monochrome canvas, soft
// borders, single-pixel hover states, user chip pinned to the bottom.
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
  { to: '/map', label: 'Live map', icon: '📍', match: ['Map'] },
  { to: '/emergency', label: 'Emergency', icon: '🚨', match: ['Emergency'] },
  { to: '/create', label: 'Add station', icon: '➕', match: ['CreateStation'] },
  { to: '/update', label: 'Update station', icon: '✏️', match: ['UpdateStation'] },
  { to: '/delete', label: 'Delete station', icon: '🗑️', match: ['DeleteStation'] },
]

const isActive = (item) => item.match.includes(String(route.name))

// Fail soft if the localStorage user blob is malformed (manual tampering,
// half-cleared session). The chip degrades to "Account" / generic avatar.
const currentUser = computed(() => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
})

const userEmail = computed(() => currentUser.value?.email || 'Account')
const userInitial = computed(() => userEmail.value.charAt(0).toUpperCase())

const handleSignOut = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-shell">
    <button class="hamburger-btn" @click="toggleSidebar" aria-label="Toggle menu">
      <span class="hamburger-bars" :class="{ open: isSidebarOpen }">&#9776;</span>
    </button>

    <aside :class="['sidebar', { 'sidebar-open': isSidebarOpen }]">
      <RouterLink to="/" class="sidebar-brand">
        <img src="/zappoint-logo.png" alt="ZapPoint" class="brand-logo" />
        <div class="brand-text">
          <span class="brand-name">ZapPoint</span>
          <span class="brand-tag">Powering smarter journeys</span>
        </div>
      </RouterLink>

      <p class="nav-section-label">Navigation</p>
      <nav class="nav-list">
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
          <span v-if="isActive(item)" class="nav-active-bar" aria-hidden="true"></span>
        </RouterLink>
      </nav>

      <!-- User chip pinned to bottom — the same identity card on every page,
           replaces the hardcoded "Ananya Singh / Admin" that used to live
           inside individual views. -->
      <div class="user-chip">
        <div class="user-avatar" aria-hidden="true">{{ userInitial }}</div>
        <div class="user-meta">
          <span class="user-email" :title="userEmail">{{ userEmail }}</span>
          <span class="user-role">Member</span>
        </div>
        <button class="signout-btn" @click="handleSignOut" title="Sign out">
          ↪
        </button>
      </div>
    </aside>

    <main class="dashboard-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  font-family: var(--zp-font-sans);
  min-height: 100vh;
  background: var(--zp-bg-soft);
  color: var(--zp-text);
}

/* ─── SIDEBAR ──────────────────────────────────────── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--zp-bg);
  border-right: 1px solid var(--zp-border);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s var(--zp-ease-out);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;
  padding: 0.5rem 0.5rem 1.5rem;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-family: var(--zp-font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.brand-tag {
  font-size: 0.7rem;
  color: var(--zp-text-muted);
  margin-top: 2px;
}

.nav-section-label {
  margin: 0.5rem 0.5rem 0.25rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--zp-text-muted);
  font-weight: 600;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  color: var(--zp-text-soft);
  text-decoration: none;
  border-radius: var(--zp-radius);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background var(--zp-fast) var(--zp-ease), color var(--zp-fast) var(--zp-ease);
}

.nav-item:hover {
  background: var(--zp-bg-mute);
  color: var(--zp-text);
}

.nav-item.active {
  background: var(--zp-violet-50);
  color: var(--zp-violet-700);
  font-weight: 600;
}

.nav-icon {
  width: 1.4rem;
  text-align: center;
  font-size: 0.95rem;
}

.nav-active-bar {
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  background: var(--zp-violet-600);
  border-radius: 0 3px 3px 0;
}

/* ─── USER CHIP ────────────────────────────────────── */
.user-chip {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius);
  background: var(--zp-bg);
  transition: border-color var(--zp-fast) var(--zp-ease);
}

.user-chip:hover {
  border-color: var(--zp-text-muted);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--zp-gradient-brand);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.user-email {
  font-size: 0.78rem;
  color: var(--zp-text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 0.65rem;
  color: var(--zp-text-muted);
  margin-top: 1px;
}

.signout-btn {
  background: none;
  border: 0;
  color: var(--zp-text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 6px;
  border-radius: 4px;
  transition: color var(--zp-fast) var(--zp-ease), background var(--zp-fast) var(--zp-ease);
  flex-shrink: 0;
}

.signout-btn:hover {
  color: var(--zp-error);
  background: var(--zp-error-bg);
}

/* ─── MAIN ─────────────────────────────────────────── */
.dashboard-content {
  flex: 1;
  padding: 2rem;
  min-width: 0;
}

/* ─── HAMBURGER ────────────────────────────────────── */
.hamburger-btn {
  display: none;
  position: fixed;
  top: 0.85rem;
  left: 0.85rem;
  z-index: 1100;
  background: white;
  color: var(--zp-text);
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius);
  font-size: 1.2rem;
  padding: 0.5rem 0.7rem;
  cursor: pointer;
  box-shadow: var(--zp-shadow-sm);
}

@media (max-width: 1024px) {
  .hamburger-btn {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    padding-top: 4rem;
    overflow-y: auto;
    box-shadow: var(--zp-shadow-lg);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .dashboard-content {
    margin-top: 3.5rem;
    padding: 1.25rem;
    width: 100%;
  }
}
</style>
