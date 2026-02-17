<template>
  <div class="emergency-view">
    <div class="hamburger" @click="toggleSidebar">
      ☰
    </div>

    <aside class="sidebar" :class="{ show: isSidebarVisible }">
      <img src="/zappoint-logo.png" alt="ZapPoint Logo" class="logo" />
      <nav>
        <RouterLink to="/dashboard" class="nav-item">
          <i class="icon-dashboard" /> Dashboard
        </RouterLink>
        <RouterLink to="/" class="nav-item">
          <i class="icon-home" /> Home
        </RouterLink>
        <RouterLink to="/map" class="nav-item">
          <i class="icon-map" /> Location
        </RouterLink>
        <RouterLink to="/emergency" class="nav-item active">
          <i class="icon-emergency" /> Emergency
        </RouterLink>
        <RouterLink to="/create" class="nav-item">
          <i class="icon-create" /> Create Station
        </RouterLink>
        <RouterLink to="/update" class="nav-item">
          <i class="icon-update" /> Update Station
        </RouterLink>
        <RouterLink to="/delete" class="nav-item">
          <i class="icon-delete" /> Delete Station
        </RouterLink>
      </nav>
    </aside>

    <div class="main-content">
      <div class="form-container">
        <div class="form-header">
          <h1 class="title">Emergency Charging Service</h1>
          <p class="subtitle">Request immediate assistance at your location</p>
        </div>

        <form @submit.prevent="onSubmit" class="emergency-form">
          <!-- Location Section -->
          <div class="form-section">
            <h3 class="section-title">Your Location</h3>
            
            <div class="location-tabs">
              <button
                type="button"
                :class="['tab-btn', { active: locationMethod === 'gps' }]"
                @click="locationMethod = 'gps'"
              >
                📍 GPS
              </button>
              <button
                type="button"
                :class="['tab-btn', { active: locationMethod === 'manual' }]"
                @click="locationMethod = 'manual'"
              >
                ✏️ Manual
              </button>
            </div>

            <!-- GPS Location -->
            <div v-if="locationMethod === 'gps'" class="location-gps">
              <div class="location-display">
                <div v-if="userLocation" class="location-info">
                  <div class="location-item">
                    <span class="location-label">Latitude:</span>
                    <span class="location-value">{{ userLocation.latitude.toFixed(6) }}</span>
                  </div>
                  <div class="location-item">
                    <span class="location-label">Longitude:</span>
                    <span class="location-value">{{ userLocation.longitude.toFixed(6) }}</span>
                  </div>
                </div>
                <div v-else class="location-placeholder">
                  <p>📍 Click the button below to get your location</p>
                </div>
              </div>

              <Button 
                type="button" 
                @click="getUserLocation" 
                :disabled="isGettingLocation"
                class="location-btn"
              >
                <span v-if="isGettingLocation">⏳ Getting Location...</span>
                <span v-else>📍 Get My Location</span>
              </Button>

              <p v-if="locationError" class="error-text">
                {{ locationError }}
                <span class="error-hint">💡 Try using manual input instead</span>
              </p>
            </div>

            <!-- Manual Location Input -->
            <div v-else class="location-manual">
              <div class="coordinate-group">
                <FormField v-slot="{ componentField }" name="latitude">
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder="e.g., 28.6139"
                        v-bind="componentField"
                        @input="handleManualLocationInput"
                        class="coordinate-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="longitude">
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder="e.g., 77.2090"
                        v-bind="componentField"
                        @input="handleManualLocationInput"
                        class="coordinate-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <p class="help-text">💡 Enter your coordinates or switch to GPS</p>
            </div>
          </div>

          <!-- Vehicle Details Section -->
          <div class="form-section">
            <h3 class="section-title">Vehicle Details</h3>

<FormField v-slot="{ componentField }" name="connectorType">
  <FormItem>
    <FormLabel>Connector Type</FormLabel>
    <Select v-bind="componentField">
      <FormControl>
        <SelectTrigger class="select-trigger">
          <SelectValue placeholder="Select connector type" />
        </SelectTrigger>
      </FormControl>
      <SelectContent class="select-content" position="popper" :side-offset="4">
        <SelectItem value="CHAdeMO" class="select-item">CHAdeMO</SelectItem>
        <SelectItem value="CCS" class="select-item">CCS</SelectItem>
        <SelectItem value="Type" class="select-item">Type</SelectItem>
        <SelectItem value="Type 1" class="select-item">Type 1</SelectItem>
        <SelectItem value="Type 2" class="select-item">Type 2</SelectItem>
        <SelectItem value="Type 3" class="select-item">Type 3</SelectItem>
        <SelectItem value="Type c" class="select-item">Type c</SelectItem>

        <SelectItem value="type c" class="select-item">type c</SelectItem>

      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
</FormField>


<FormField v-slot="{ componentField }" name="powerRequired">
  <FormItem>
    <FormLabel>Power Required</FormLabel>
    <Select v-bind="componentField">
      <FormControl>
        <SelectTrigger class="select-trigger">
          <SelectValue placeholder="Select power output" />
        </SelectTrigger>
      </FormControl>
      <SelectContent class="select-content" position="popper" :side-offset="4">
        <SelectItem value="7" class="select-item">7 kW (Slow)</SelectItem>
        <SelectItem value="50" class="select-item">50 kW</SelectItem>
        <SelectItem value="70" class="select-item">70 kW</SelectItem>
        <SelectItem value="75" class="select-item">75 kW</SelectItem>
        <SelectItem value="100" class="select-item">100 kW</SelectItem>
        <SelectItem value="180" class="select-item">180 kW</SelectItem>
        <SelectItem value="400" class="select-item">400 kW</SelectItem>
        <SelectItem value="600" class="select-item">600 kW</SelectItem>
      </SelectContent>
    </Select>
    <FormMessage />
  </FormItem>
</FormField>

          </div>

          <!-- Contact Section -->
          <div class="form-section">
            <h3 class="section-title">Contact Information</h3>

            <FormField v-slot="{ componentField }" name="contactNumber">
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    v-bind="componentField"
                    class="phone-input"
                  />
                </FormControl>
                <FormDescription class="form-description">
                  Enter 10-digit phone number (with or without +91)
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <Button 
            type="submit" 
            class="submit-btn" 
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">🔄 Requesting Service...</span>
            <span v-else>⚡ Request Emergency Service</span>
          </Button>

          <!-- Debug Info (remove in production) -->
          <div v-if="debugMode" class="debug-info">
            <p><strong>Location:</strong> {{ userLocation ? 'Set' : 'Not set' }}</p>
            <p><strong>Connector:</strong> {{ form.values.connectorType || 'Not selected' }}</p>
            <p><strong>Power:</strong> {{ form.values.powerRequired || 'Not selected' }}</p>
            <p><strong>Phone:</strong> {{ form.values.contactNumber || 'Not entered' }}</p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const router = useRouter()
const isSidebarVisible = ref(false)
const isSubmitting = ref(false)
const isGettingLocation = ref(false)
const userLocation = ref(null)
const locationError = ref(null)
const locationMethod = ref('gps')

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}

// FIXED: Changed validation to accept both string and number, then coerce to number
const formSchema = toTypedSchema(
  z.object({
    latitude: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    longitude: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
    connectorType: z.string().min(1, 'Please select a connector type'),
    powerRequired: z.string().min(1, 'Please select power requirement'),
    contactNumber: z.string()
      .min(10, 'Phone number must be at least 10 digits')
      .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid phone number (10-15 digits)')
  })
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    latitude: '',
    longitude: '',
    connectorType: '',
    powerRequired: '',
    contactNumber: ''
  }
})

const { handleSubmit } = form

const handleManualLocationInput = () => {
  const lat = parseFloat(form.values.latitude)
  const lng = parseFloat(form.values.longitude)
  
  console.log('Manual input - lat:', lat, 'lng:', lng)
  
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    userLocation.value = {
      latitude: lat,
      longitude: lng
    }
    locationError.value = null
    console.log('Manual location set:', userLocation.value)
  }
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser'
    return
  }

  isGettingLocation.value = true
  locationError.value = null

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      userLocation.value = {
        latitude: lat,
        longitude: lng
      }

      console.log('GPS location obtained:', userLocation.value)
      isGettingLocation.value = false
      locationError.value = null
    },
    (error) => {
      isGettingLocation.value = false
      console.error('Geolocation error:', error)
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = 'Location permission denied. Please enable location access or use manual input.'
          break
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Location unavailable. Try manual input.'
          break
        case error.TIMEOUT:
          locationError.value = 'Request timed out. Try manual input.'
          break
        default:
          locationError.value = 'Error occurred. Try manual input.'
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const onSubmit = handleSubmit(async (values) => {
  console.log('Form submitted with values:', values)
  console.log('User location:', userLocation.value)

  if (!userLocation.value) {
    locationError.value = 'Please provide your location using GPS or manual input'
    alert('Please provide your location first')
    return
  }

  if (!values.connectorType) {
    alert('Please select a connector type')
    return
  }

  if (!values.powerRequired) {
    alert('Please select power requirement')
    return
  }

  if (!values.contactNumber) {
    alert('Please enter your contact number')
    return
  }

  isSubmitting.value = true

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      alert('Authentication required. Please login again.')
      router.push('/login')
      return
    }

    const requestBody = {
      latitude: userLocation.value.latitude,
      longitude: userLocation.value.longitude,
      connectorType: values.connectorType,
      powerRequired: parseInt(values.powerRequired),
      contactNumber: values.contactNumber
    }

    console.log('Sending request:', requestBody)

    const response = await fetch('http://localhost:5000/api/emergency/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status)

    const data = await response.json()
    console.log('Response data:', data)

    if (response.ok) {
      alert('Emergency service requested successfully!')
      
      // FIX: Check for the request ID in the response
      const requestId = data.emergencyRequest?._id || data.emergencyRequest?.id
      
      console.log('Request ID:', requestId)
      
      if (requestId) {
        // Navigate to tracking page with the correct request ID
        router.push(`/track/${requestId}`)
      } else {
        console.error('No request ID in response:', data)
        alert('Request submitted but tracking unavailable. Missing request ID.')
      }
    } else {
      alert(data.message || 'Failed to request emergency service')
    }
  } catch (error) {
    console.error('Emergency request failed:', error)
    alert(`Error: ${error.message}. Please check console for details.`)
  } finally {
    isSubmitting.value = false
  }
}, (errors) => {
  console.error('Form validation errors:', errors)
  alert('Please fix the form errors before submitting')
})

</script>


<style scoped>
* {
  box-sizing: border-box;
}

.emergency-view {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar {
  width: 240px;
  background-color: #1e293b;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
  flex-shrink: 0;
}

.logo {
  padding-left: 1rem;
  width: 130px;
  margin-bottom: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: white;
  text-decoration: none;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background-color: #334155;
}

.nav-item i {
  margin-right: 0.5rem;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.emergency-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.location-tabs {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
}

.tab-btn {
  flex: 1;
  padding: 0.625rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.tab-btn.active {
  background: white;
  color: #1e293b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-display {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  padding: 1.25rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-info {
  width: 100%;
}

.location-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.location-label {
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
}

.location-value {
  color: #1e293b;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: 500;
}

.location-placeholder {
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}

.location-btn {
  width: 100%;
  background: #8b5cf6;
  color: white;
  padding: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  transition: background 0.2s;
  font-size: 1rem;
}

.location-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #dc2626;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 8px;
  border-left: 3px solid #dc2626;
}

.error-hint {
  display: block;
  margin-top: 0.5rem;
  color: #f59e0b;
  font-weight: 500;
}

.location-manual {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.coordinate-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.help-text {
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
  text-align: center;
}

.form-description {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Fixed Input Sizing */
.coordinate-input,
.phone-input,
:deep(input[type="text"]),
:deep(input[type="tel"]),
:deep(input[type="number"]) {
  width: 100% !important;
  height: 44px !important;
  padding: 0.75rem !important;
  font-size: 0.95rem !important;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  background: white !important;
  transition: all 0.2s !important;
}

.coordinate-input:focus,
.phone-input:focus,
:deep(input:focus) {
  outline: none !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.select-content {
  width: var(--radix-select-trigger-width);
  background: white !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
              0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  z-index: 9999 !important;
  overflow: hidden !important;
}

.select-trigger {
  width: 100% !important;
  min-height: 44px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  background: white !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  position: relative !important;
}

.select-item {
  width: 100% !important;
  background: white !important;
  position: relative !important;
  padding: 8px 12px !important;
  user-select: none !important;
  outline: none !important;
  cursor: pointer !important;
}

:deep([data-radix-popper-content-wrapper]) {
  width: var(--radix-select-trigger-width) !important;
  background: white !important;
  z-index: 9999 !important;
}

:deep(.select-viewport) {
  background: white !important;
  padding: 5px !important;
}

.select-item:hover {
  background: #f8fafc !important;
}

:deep(.select-item[data-highlighted]) {
  background: #f1f5f9 !important;
}

:deep(.form-item) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(label) {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem;
  font-weight: 600;
  font-size: 1.05rem;
  border-radius: 10px;
  margin-top: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.debug-info {
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.debug-info p {
  margin: 0.25rem 0;
}

.hamburger {
  display: none;
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1000;
  font-size: 1.5rem;
  color: white;
  background: #1e293b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 999;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    padding: 5rem 1rem 2rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .coordinate-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .form-container {
    padding: 1.25rem;
  }
}
</style>
