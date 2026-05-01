<script setup>
// App shell. Owns:
//  - the slim landing/auth header (only shown on Home, Login, Register)
//  - global route transitions (`zp-fade` defined in theme.css)
//
// Authenticated pages own their full chrome via DashboardLayout, so we
// suppress the public header for any route that isn't part of the
// landing/auth flow.
import { RouterView, useRoute, RouterLink } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const PUBLIC_ROUTES = ['Home', 'Login', 'Register']
const showPublicHeader = computed(() => PUBLIC_ROUTES.includes(String(route.name)))
const isAuthRoute = computed(() => ['Login', 'Register'].includes(String(route.name)))
const isAuthed = computed(() => !!localStorage.getItem('authToken'))
</script>

<template>
  <div class="app-wrapper">
    <header v-if="showPublicHeader" class="zp-header" :class="{ 'zp-header-tight': isAuthRoute }">
      <RouterLink to="/" class="brand">
        <img src="/zappoint-logo.png" alt="ZapPoint" class="brand-logo" />
        <span class="brand-name">ZapPoint</span>
      </RouterLink>
      <nav class="zp-header-nav">
        <template v-if="!isAuthed">
          <RouterLink to="/login" class="nav-link">Login</RouterLink>
          <RouterLink to="/register" class="nav-link nav-link-cta">Get started</RouterLink>
        </template>
        <RouterLink v-else to="/dashboard" class="nav-link nav-link-cta">Dashboard →</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="zp-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background: var(--zp-bg);
  color: var(--zp-text);
}

.zp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--zp-border-soft);
}

/* Auth pages already center a card on a gradient — keep the header transparent
   so the gradient bleeds through. */
.zp-header-tight {
  background: transparent;
  backdrop-filter: none;
  border-bottom: none;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--zp-text);
}

.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.brand-name {
  font-family: var(--zp-font-display);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.zp-header-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: var(--zp-radius);
  color: var(--zp-text-soft);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background var(--zp-fast) var(--zp-ease), color var(--zp-fast) var(--zp-ease);
}

.nav-link:hover {
  color: var(--zp-text);
  background: var(--zp-bg-mute);
}

.nav-link-cta {
  background: var(--zp-text);
  color: var(--zp-text-on-dark);
}

.nav-link-cta:hover {
  background: #1f1f1f;
  color: var(--zp-text-on-dark);
}

.app-main {
  min-height: calc(100vh - 5rem);
}

@media (max-width: 640px) {
  .zp-header {
    padding: 0.75rem 1rem;
  }
  .brand-name {
    display: none;
  }
}
</style>
