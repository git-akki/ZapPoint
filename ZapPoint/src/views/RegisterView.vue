<template> 
  <div class="auth-page">
    <div class="auth-card">
      <img src="/zappoint-logo.png" alt="ZapPoint" class="logo" />
      <h2 class="title">Create your account</h2>
      <p class="subtitle">Free forever. No card required.</p>
      <form @submit.prevent="handleRegister" class="auth-form">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="auth-input"
          required
          pattern="^[\w.-]+@[\w.-]+\.\w{2,}$"
          title="Please enter a valid email address"
        />

        <div class="password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="auth-input"
            required
            title="Password must be at least 8 characters long and include at least one letter and one number"
          />
          <button type="button" class="toggle-eye" @click="togglePassword" :title="showPassword ? 'Hide password' : 'Show password'">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        <p class="auth-hint">8+ characters with at least one letter and one number.</p>

        <button type="submit" class="auth-button" :disabled="submitting">
          {{ submitting ? 'Creating account…' : 'Create account' }}
        </button>
      </form>
      <p class="auth-switch">
        Already have an account?
        <router-link to="/login">Login</router-link>
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
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const router = useRouter()

const handleRegister = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    await api.post('/auth/register', {
      email: email.value,
      password: password.value,
    })
    alert('Registration successful! Check your email for confirmation.')
    router.push('/login')
  } catch (err) {
    const msg = (err as any)?.response?.data?.message || 'Registration failed'
    alert(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Mirrors LoginView so the two screens feel like one continuous flow. */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  background: var(--zp-bg);
  color: var(--zp-text);
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 50% at 50% -10%,
    rgba(10, 132, 255, 0.18),
    transparent 65%
  );
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 2.25rem 1.85rem 2rem;
  background: rgba(20, 20, 20, 0.72);
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius-lg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: var(--zp-lift);
  text-align: center;
  animation: zp-rise 500ms var(--zp-spring) both;
}

.logo {
  width: 44px;
  height: 44px;
  margin-bottom: 1.25rem;
  border-radius: 10px;
}

.title {
  font-family: var(--zp-font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  margin: 0 0 0.35rem;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--zp-text-soft);
  margin: 0 0 1.75rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: left;
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
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1rem;
  user-select: none;
  color: var(--zp-text-muted);
  background: transparent;
  border: 0;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: color var(--zp-fast) var(--zp-ease), background var(--zp-fast) var(--zp-ease);
}
.toggle-eye:hover {
  color: var(--zp-text);
  background: var(--zp-bg-3);
}

.auth-input {
  width: 100%;
  padding: 0.8rem 0.95rem;
  background: var(--zp-bg-2);
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  font-size: 0.92rem;
  color: var(--zp-text);
  font-family: var(--zp-font);
  letter-spacing: var(--zp-track-normal);
  transition:
    border-color var(--zp-fast) var(--zp-ease),
    box-shadow var(--zp-fast) var(--zp-ease);
}

.auth-input::placeholder {
  color: var(--zp-text-faint);
}

.auth-input:focus {
  outline: none;
  border-color: var(--zp-accent);
  box-shadow: 0 0 0 4px var(--zp-accent-soft);
}

.auth-hint {
  font-size: 0.76rem;
  color: var(--zp-text-muted);
  margin: -0.1rem 0 0;
  padding-left: 0.15rem;
  letter-spacing: var(--zp-track-normal);
}

.auth-button {
  margin-top: 0.85rem;
  padding: 0.85rem 1.25rem;
  background: white;
  color: black;
  border: 0;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  font-family: var(--zp-font);
  cursor: pointer;
  transition:
    transform var(--zp-fast) var(--zp-spring),
    background var(--zp-fast) var(--zp-ease),
    opacity var(--zp-fast) var(--zp-ease);
}

.auth-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.92);
}

.auth-button:active:not(:disabled) {
  transform: scale(0.98);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--zp-text-muted);
  text-align: center;
}

.auth-switch a {
  color: var(--zp-accent);
  font-weight: 500;
  text-decoration: none;
  margin-left: 0.25rem;
  transition: opacity var(--zp-fast) var(--zp-ease);
}

.auth-switch a:hover {
  opacity: 0.75;
}
</style>
