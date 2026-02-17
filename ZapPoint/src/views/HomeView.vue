<template>
  <div class="homepage">
    
    <header class="navbar">
      <div class="logo">
        <img src="/zappoint-logo.png" alt="ZapPoint Logo" />
      </div>
      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/">Features</RouterLink>
        <RouterLink to="/">About us</RouterLink>
        <RouterLink to="/">App</RouterLink>
      </nav>
      <div class="auth-buttons">
        <RouterLink class="btn-outline" to="/login">Sign In</RouterLink>
        <RouterLink class="btn-filled" to="/register">Create an Account</RouterLink>
      </div>
            <div class="hamburger" @click="toggleMenu">
        &#9776;
      </div>
    </header>


     
    <div class="mobile-menu" v-if="isMenuOpen">
      <RouterLink to="/" @click="closeMenu">Home</RouterLink>
      <RouterLink to="/features" @click="closeMenu">Features</RouterLink>
      <RouterLink to="/about" @click="closeMenu">About us</RouterLink>
      <RouterLink to="/app" @click="closeMenu">App</RouterLink>
      <RouterLink class="btn-outline" to="/login" @click="closeMenu">Sign In</RouterLink>
      <RouterLink class="btn-filled" to="/register" @click="closeMenu">Register</RouterLink>
    </div>

    
    <section class="hero">
      <div class="hero-text">
        <h1>
          Charge<br />
          <span>Smarter</span>,<br />
          Drive <span>Farther</span>.
        </h1>
        <p>
          Manage, optimize, and monetize EV charging<br />
          stations effortlessly.
        </p>
      </div>
      <div class="hero-image">
        <img src="/ev-charger.png" alt="EV Charger" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'


const isMenuOpen = ref(false)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
const closeMenu = () => {
  isMenuOpen.value = false
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

* { 
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  background-color: #ffffff;
  color: #1a1a1a;
  padding: 0 1rem;
}


.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  flex-wrap: wrap;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  height: 80px;
}

.brand {
  font-size: 1.25rem;
  font-weight: 600;
  color: #16a34a;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  font-weight: 500;
}

.nav-links a {
  color: #000000;
  text-decoration: none;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-outline,
.btn-filled {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

.btn-outline {
  border: 2px solid #000000;
  color: #000000;
}

.btn-filled {
  background-color: #7c3aed;
  color: #ffffff;
}


.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1rem; 
  flex-wrap: wrap;
  gap: 2rem;
}

.hero-text {
  flex: 1;
  max-width: 500px;
}

.hero-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a1a;
}

.hero-text h1 span {
  color: #7c3aed;
}

.hero-text p {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #808080;
}

.hero-image {
  flex: 1;
  max-width: 500px;
}

.hero-image img {
  width: 100%;
  height: auto;
}


.hamburger {
  display: none;
  font-size: 1.8rem;
  cursor: pointer;
}


.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.mobile-menu a {
  color: #000;
  text-decoration: none;
  font-weight: 500;
}


@media (max-width: 768px) {
  .logo img {
    height: 65px;
  }

  .nav-links,
  .auth-buttons {
    display: none;
  }

  .hamburger {
    display: block;
  }

  .mobile-menu {
    display: flex;
  }

  .hero {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }

  .hero-text h1 {
    font-size: 2rem;
  }

  .hero-text p {
    font-size: 1rem;
  }

  .hero-image {
    max-width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  .hero {
    padding: 2.5rem 3rem;
  }

  .hero-text h1 {
    font-size: 2.75rem;
  }
}

@media (min-width: 1024px) {
  .hero {
    padding: 4rem 6rem;
  }

  .hero-text h1 {
    font-size: 3rem;
  }
}

</style>
