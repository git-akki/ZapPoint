/// <reference types="vite/client" />
import axios, { type InternalAxiosRequestConfig } from 'axios'

// Single source of truth for the API base URL. All views go through this
// client so we never reintroduce the hardcoded-localhost / hardcoded-render
// split that previously broke the deployed build.
const baseURL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the auth token (if present) to every outgoing request. Storing in
// localStorage is fine for this app's threat model; rotate to httpOnly
// cookies if/when refresh tokens are introduced.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-redirect on 401 so a stale/expired token kicks the user back to login
// instead of silently returning empty pages.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      // Avoid redirect loops if we're already on /login.
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
