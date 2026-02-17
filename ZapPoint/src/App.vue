<script setup>
import { RouterView, useRoute, RouterLink } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()


const showHeader = computed(() => ['login', 'register'].includes(route.name))
</script>

<template>
  <div class="app-wrapper">
    <header v-if="showHeader" class="app-header">
      <img alt="ZapPoint Logo" class="logo" src="/zappoint-logo.png" width="100" />

      <div class="nav-content">
        <h1>Welcome to <span class="brand">ZapPoint</span></h1>

        <nav>
          <RouterLink to="/register">Register</RouterLink>
          <RouterLink to="/login">Login</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

* {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-wrapper {
  background: linear-gradient(to bottom right, #f6fcff, #ecf9f1);
  min-height: 100vh;
  color: #1f3b2d;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #d0e5d9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
}

.logo {
  height: 64px;
  width: auto;
}

.nav-content {
  flex: 1;
  text-align: right;
}

.nav-content h1 {
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.brand {
  color: #7c3aed;
}

nav a {
  margin-left: 1rem;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

nav a:hover {
  background-color: #ede9fe;
}

</style>
