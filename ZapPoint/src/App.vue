<script setup>
// App shell. The public header (Home/Login/Register) borrows from Apple's
// frosted top-nav: minimal links, low-weight type, blurred backdrop. The
// dashboard owns its own chrome via DashboardLayout, so the public header
// is suppressed there.
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
    <header v-if="showPublicHeader" class="zp-header" :class="{ tight: isAuthRoute }">
      <RouterLink to="/" class="brand">
        <img src="/zappoint-logo.png" alt="ZapPoint" class="brand-logo" />
        <span class="brand-name">ZapPoint</span>
      </RouterLink>

      <nav class="zp-nav">
        <template v-if="!isAuthed">
          <RouterLink to="/login" class="link">Sign in</RouterLink>
          <RouterLink to="/register" class="link link-primary">Get started</RouterLink>
        </template>
        <RouterLink v-else to="/dashboard" class="link link-primary">Dashboard</RouterLink>
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
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--zp-line-soft);
}

/* Auth pages keep the chrome transparent so the gradient bleeds through */
.zp-header.tight {
  background: transparent;
  backdrop-filter: none;
  border-bottom: 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--zp-text);
  transition: opacity var(--zp-fast) var(--zp-ease);
}
.brand:hover {
  opacity: 0.7;
}

.brand-logo {
  width: 26px;
  height: 26px;
  border-radius: 7px;
}

.brand-name {
  font-family: var(--zp-font-display);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: var(--zp-track-tight);
}

.zp-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.link {
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  color: var(--zp-text-soft);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color var(--zp-fast) var(--zp-ease), background var(--zp-fast) var(--zp-ease);
}
.link:hover {
  color: var(--zp-text);
  background: var(--zp-bg-2);
}

.link-primary {
  background: white;
  color: black;
}
.link-primary:hover {
  background: rgba(255, 255, 255, 0.88);
  color: black;
}

.app-main {
  min-height: calc(100vh - 4rem);
}

@media (max-width: 640px) {
  .zp-header { padding: 0.85rem 1.1rem; }
  .brand-name { display: none; }
}
</style>
