
<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/zappoint-logo.png" alt="ZapPoint" class="logo" />
      <h2 class="title">Welcome back</h2>
      <p class="subtitle">Sign in to your ZapPoint account</p>
      <form @submit.prevent="handleLogin" class="auth-form">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="auth-input"
          required
        />

        <div class="password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="auth-input"
            required
          />
          <button type="button" class="toggle-eye" @click="togglePassword" :title="showPassword ? 'Hide password' : 'Show password'">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <button type="submit" class="auth-button" :disabled="submitting">
          {{ submitting ? 'Logging in…' : 'Login' }}
        </button>
      </form>
      <p class="auth-switch">
        Don’t have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'

const email = ref('')
const password = ref('')
const submitting = ref(false)
const router = useRouter()

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    const token = response.data.user.token
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    router.push('/dashboard')
  } catch (err) {
    let errorMessage = 'Login failed'
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as any).response
      errorMessage = response?.data?.message || errorMessage
    }
    alert(`Error: ${errorMessage}`)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Auth pages share the same dark gradient + centered card. The look is
   intentionally identical between Login and Register so the user feels
   continuity when toggling between them. */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  background: var(--zp-bg-dark);
  position: relative;
  overflow: hidden;
}

/* Subtle radial gradients echo the landing hero. */
.auth-page::before,
.auth-page::after {
  content: '';
  position: absolute;
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  pointer-events: none;
}
.auth-page::before {
  background: radial-gradient(circle, #a855f7, transparent 60%);
  top: -20%;
  right: -20%;
}
.auth-page::after {
  background: radial-gradient(circle, #06b6d4, transparent 60%);
  bottom: -20%;
  left: -20%;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--zp-radius-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-align: center;
  color: var(--zp-text-on-dark);
  animation: zp-rise 500ms var(--zp-ease-out) both;
}

.logo {
  width: 56px;
  height: 56px;
  margin-bottom: 1rem;
  border-radius: 12px;
}

.title {
  font-family: var(--zp-font-display);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.4rem;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--zp-text-on-dark-soft);
  margin: 0 0 1.75rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper .auth-input {
  flex: 1;
  padding-right: 2.75rem;
}

.toggle-eye {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.05rem;
  user-select: none;
  color: var(--zp-text-on-dark-soft);
  background: none;
  border: 0;
  padding: 0;
}

.auth-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--zp-radius);
  font-size: 0.95rem;
  color: var(--zp-text-on-dark);
  font-family: var(--zp-font-sans);
  transition: border-color var(--zp-fast) var(--zp-ease), background var(--zp-fast) var(--zp-ease);
}

.auth-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.auth-input:focus {
  outline: none;
  border-color: var(--zp-violet);
  background: rgba(255, 255, 255, 0.06);
}

.auth-button {
  margin-top: 0.5rem;
  padding: 0.9rem 1.25rem;
  background: white;
  color: var(--zp-bg-dark);
  border: 0;
  border-radius: var(--zp-radius);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: var(--zp-font-sans);
  cursor: pointer;
  transition: transform var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease), opacity var(--zp-fast) var(--zp-ease);
}

.auth-button:hover:not(:disabled) {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.auth-button:active:not(:disabled) {
  transform: scale(0.98);
}

.auth-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--zp-text-on-dark-soft);
}

.auth-switch a {
  color: var(--zp-text-on-dark);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color var(--zp-fast) var(--zp-ease);
}

.auth-switch a:hover {
  border-bottom-color: var(--zp-text-on-dark);
}
</style>
