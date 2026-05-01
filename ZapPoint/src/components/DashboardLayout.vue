<script setup>
// Dashboard chrome — Apple Pro app aesthetic (Logic Pro / Final Cut /
// Finder dark mode):
//   - sidebar uses a slightly elevated dark with hairline rule
//   - nav items are quiet labels with restrained hover, accent strip on
//     active row (echoes Apple Mail's selection)
//   - user chip pinned to bottom: avatar (gradient initial) + email
//
// All routes/nav targets unchanged.
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const isSidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }

const NAV = [
  { to: '/dashboard', label: 'Stations', match: ['ChargerList'], icon: 'list' },
  { to: '/map', label: 'Live map', match: ['Map'], icon: 'map' },
  { to: '/emergency', label: 'Emergency', match: ['Emergency'], icon: 'sos' },
  { to: '/create', label: 'Add station', match: ['CreateStation'], icon: 'plus' },
  { to: '/update', label: 'Update station', match: ['UpdateStation'], icon: 'pencil' },
  { to: '/delete', label: 'Delete station', match: ['DeleteStation'], icon: 'trash' },
]

const isActive = (item) => item.match.includes(String(route.name))

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
  <div class="shell">
    <button class="hamburger" @click="toggleSidebar" aria-label="Toggle menu">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <aside :class="['sidebar', { open: isSidebarOpen }]">
      <RouterLink to="/" class="brand">
        <img src="/zappoint-logo.png" alt="ZapPoint" class="brand-logo" />
        <span class="brand-name">ZapPoint</span>
      </RouterLink>

      <p class="section-label">Workspace</p>
      <nav class="nav">
        <RouterLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
          @click="isSidebarOpen = false"
        >
          <span class="nav-icon" aria-hidden="true">
            <!-- Inline SF-style minimal glyphs. Stroke-only, 1.5px, rounded
                 caps. Matches the visual weight of Apple's Symbols. -->
            <svg v-if="item.icon === 'list'" viewBox="0 0 16 16" width="14" height="14">
              <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" />
            </svg>
            <svg v-else-if="item.icon === 'map'" viewBox="0 0 16 16" width="14" height="14">
              <path d="M8 14s5-4.5 5-8a5 5 0 0 0-10 0c0 3.5 5 8 5 8Z" stroke="currentColor" stroke-width="1.5" fill="none" />
              <circle cx="8" cy="6" r="1.6" stroke="currentColor" stroke-width="1.3" fill="none" />
            </svg>
            <svg v-else-if="item.icon === 'sos'" viewBox="0 0 16 16" width="14" height="14">
              <path d="M8 2v6M8 11v.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />
              <circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.4" fill="none" />
            </svg>
            <svg v-else-if="item.icon === 'plus'" viewBox="0 0 16 16" width="14" height="14">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" />
            </svg>
            <svg v-else-if="item.icon === 'pencil'" viewBox="0 0 16 16" width="14" height="14">
              <path d="m3 13 2-.5 7-7-1.5-1.5-7 7L3 13Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none" />
            </svg>
            <svg v-else-if="item.icon === 'trash'" viewBox="0 0 16 16" width="14" height="14">
              <path d="M3 4h10M6 4V2.5h4V4M5 4l.6 9h4.8L11 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User chip — pinned bottom -->
      <div class="chip">
        <div class="avatar" aria-hidden="true">{{ userInitial }}</div>
        <div class="meta">
          <span class="email" :title="userEmail">{{ userEmail }}</span>
          <span class="role">Member</span>
        </div>
        <button class="signout" @click="handleSignOut" title="Sign out" aria-label="Sign out">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-1M7 8h8m0 0-2-2m2 2-2 2"
              stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
        </button>
      </div>
    </aside>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--zp-bg);
  color: var(--zp-text);
  font-family: var(--zp-font);
}

/* ─── SIDEBAR ──────────────────────────────────────────── */
.sidebar {
  width: 248px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  background: var(--zp-bg-1);
  border-right: 1px solid var(--zp-line-soft);
  transition: transform var(--zp-base) var(--zp-spring);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: inherit;
  padding: 0.4rem 0.6rem 1.5rem;
  transition: opacity var(--zp-fast) var(--zp-ease);
}
.brand:hover { opacity: 0.75; }

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 7px;
}

.brand-name {
  font-family: var(--zp-font-display);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: var(--zp-track-tight);
}

.section-label {
  margin: 0.25rem 0.6rem 0.4rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: var(--zp-track-caps);
  color: var(--zp-text-faint);
  font-weight: 600;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.6rem;
  color: var(--zp-text-soft);
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 500;
  letter-spacing: var(--zp-track-normal);
  transition:
    background var(--zp-fast) var(--zp-ease),
    color var(--zp-fast) var(--zp-ease);
}

.nav-item:hover {
  background: var(--zp-bg-2);
  color: var(--zp-text);
}

.nav-item.active {
  background: var(--zp-bg-3);
  color: var(--zp-text);
}

/* Apple Mail-style accent strip on the active row */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  background: var(--zp-accent);
  border-radius: 0 3px 3px 0;
}

.nav-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--zp-text-muted);
  transition: color var(--zp-fast) var(--zp-ease);
}

.nav-item.active .nav-icon,
.nav-item:hover .nav-icon {
  color: var(--zp-text);
}

/* ─── USER CHIP ────────────────────────────────────────── */
.chip {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.55rem;
  background: var(--zp-bg-2);
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  transition: border-color var(--zp-fast) var(--zp-ease);
}
.chip:hover { border-color: var(--zp-line-strong); }

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--zp-accent), #5e5ce6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.78rem;
  flex-shrink: 0;
  letter-spacing: 0;
}

.meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.email {
  font-size: 0.78rem;
  color: var(--zp-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: var(--zp-track-normal);
}

.role {
  font-size: 0.66rem;
  color: var(--zp-text-faint);
  letter-spacing: var(--zp-track-loose);
  text-transform: uppercase;
  margin-top: 1px;
}

.signout {
  background: transparent;
  border: 0;
  color: var(--zp-text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color var(--zp-fast) var(--zp-ease), background var(--zp-fast) var(--zp-ease);
  flex-shrink: 0;
}
.signout:hover {
  color: var(--zp-error);
  background: var(--zp-error-soft);
}

/* ─── MAIN ─────────────────────────────────────────────── */
.main {
  flex: 1;
  padding: 2rem 2.25rem;
  min-width: 0;
  background: var(--zp-bg);
}

/* ─── HAMBURGER (mobile only) ──────────────────────────── */
.hamburger {
  /* Hidden on desktop — only shown via the @media block below.
     Was previously stomped by a `display: flex` immediately after the
     `display: none`, which made it render on top of the logo on desktop. */
  display: none;
  position: fixed;
  top: 0.85rem;
  left: 0.85rem;
  z-index: 1100;
  background: var(--zp-bg-2);
  color: var(--zp-text);
  border: 1px solid var(--zp-line);
  border-radius: 10px;
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@media (max-width: 1024px) {
  .hamburger { display: inline-flex; }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    padding-top: 4rem;
    overflow-y: auto;
    background: var(--zp-bg-1);
  }

  .sidebar.open { transform: translateX(0); }

  .main {
    margin-top: 3rem;
    padding: 1.25rem;
    width: 100%;
  }
}
</style>
