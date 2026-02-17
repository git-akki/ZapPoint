import { createRouter, createWebHistory } from 'vue-router'
import 'leaflet/dist/leaflet.css'
import Home from '../views/HomeView.vue'
import Login from '../views/LoginView.vue'
import Register from '../views/RegisterView.vue'
import ChargerListView from '../views/ChargerListView.vue'
import CreateStationView from '../views/CreateStationView.vue'
import UpdateStationView from '../views/UpdateStationView.vue'
import DeleteStationView from '../views/DeleteStationView.vue'
import MapView from '../views/MapView.vue'
import EmergencyView from '../views/EVC.vue'
import TrackView from '../views/TrackView.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home 
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login 
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register 
  },
  { 
    path: '/dashboard', 
    name: 'ChargerList', 
    component: ChargerListView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/create', 
    name: 'CreateStation', 
    component: CreateStationView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/update', 
    name: 'UpdateStation', 
    component: UpdateStationView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/delete', 
    name: 'DeleteStation', 
    component: DeleteStationView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/map', 
    name: 'Map', 
    component: MapView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/emergency', 
    name: 'Emergency', 
    component: EmergencyView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/track/:requestId',  // THIS IS THE KEY - Dynamic route parameter
    name: 'Track', 
    component: TrackView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard for Authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken')
  const isAuthenticated = !!token

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    // Redirect to dashboard if already logged in and trying to access login/register
    next({ name: 'ChargerList' })
  } else {
    // Allow navigation
    next()
  }
})

export default router
