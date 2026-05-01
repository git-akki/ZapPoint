<template>
  <DashboardLayout>
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
  </DashboardLayout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import api from '@/lib/api'
import DashboardLayout from '@/components/DashboardLayout.vue'

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
const isSubmitting = ref(false)
const isGettingLocation = ref(false)
const userLocation = ref(null)
const locationError = ref(null)
const locationMethod = ref('gps')

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
  
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    userLocation.value = {
      latitude: lat,
      longitude: lng,
    }
    locationError.value = null
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

      isGettingLocation.value = false
      locationError.value = null
    },
    (error) => {
      isGettingLocation.value = false
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
    const requestBody = {
      latitude: userLocation.value.latitude,
      longitude: userLocation.value.longitude,
      connectorType: values.connectorType,
      powerRequired: parseInt(values.powerRequired),
      contactNumber: values.contactNumber,
    }

    const { data } = await api.post('/emergency/request', requestBody)

    alert('Emergency service requested successfully!')

    const requestId = data.emergencyRequest?._id || data.emergencyRequest?.id
    if (requestId) {
      router.push(`/track/${requestId}`)
    } else {
      alert('Request submitted but tracking unavailable. Missing request ID.')
    }
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || 'Failed to request emergency service'
    alert(`Error: ${msg}`)
  } finally {
    isSubmitting.value = false
  }
}, (errors) => {
  if (import.meta.env.DEV) console.error('Form validation errors:', errors)
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
  background: var(--zp-bg);
  color: var(--zp-text);
  font-family: var(--zp-font);
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
  max-width: 560px;
  padding: 2rem;
  background: var(--zp-bg-1);
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius-lg);
  box-shadow: var(--zp-lift);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-family: var(--zp-font-display);
  font-size: 1.65rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  color: var(--zp-text);
  margin-bottom: 0.4rem;
}

.subtitle {
  color: var(--zp-text-muted);
  font-size: 0.92rem;
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
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-caps);
  text-transform: uppercase;
  color: var(--zp-text-muted);
  margin: 0;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--zp-line);
}

.location-tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--zp-bg-2);
  padding: 0.25rem;
  border-radius: var(--zp-radius);
  border: 1px solid var(--zp-line);
}

.tab-btn {
  flex: 1;
  padding: 0.55rem;
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-weight: 500;
  color: var(--zp-text-muted);
  cursor: pointer;
  transition: background var(--zp-fast) var(--zp-ease), color var(--zp-fast) var(--zp-ease);
  font-size: 0.88rem;
  font-family: var(--zp-font);
}

.tab-btn.active {
  background: var(--zp-bg-3);
  color: var(--zp-text);
}

.location-display {
  background: var(--zp-bg-2);
  border: 1px dashed var(--zp-line-strong);
  border-radius: var(--zp-radius);
  padding: 1.1rem;
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-info { width: 100%; }

.location-item {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
}

.location-label {
  font-weight: 500;
  color: var(--zp-text-muted);
  font-size: 0.88rem;
}

.location-value {
  color: var(--zp-text);
  font-family: var(--zp-font-mono);
  font-size: 0.88rem;
  font-weight: 500;
}

.location-placeholder {
  text-align: center;
  color: var(--zp-text-faint);
  font-size: 0.9rem;
}

.location-btn {
  width: 100%;
  background: var(--zp-accent);
  color: white;
  padding: 0.7rem;
  font-weight: 500;
  border-radius: 999px;
  transition: background var(--zp-fast) var(--zp-ease), opacity var(--zp-fast) var(--zp-ease);
  font-size: 0.9rem;
  border: 0;
  font-family: var(--zp-font);
  cursor: pointer;
}

.location-btn:hover:not(:disabled) {
  background: #1a8cff;
}

.location-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.error-text {
  color: var(--zp-error);
  font-size: 0.86rem;
  line-height: 1.5;
  padding: 0.7rem 0.85rem;
  background: var(--zp-error-soft);
  border-radius: var(--zp-radius);
  border: 1px solid rgba(255, 69, 58, 0.25);
}

.error-hint {
  display: block;
  margin-top: 0.45rem;
  color: var(--zp-warn);
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
  font-size: 0.85rem;
  color: var(--zp-text-muted);
  text-align: center;
}

.form-description {
  font-size: 0.82rem;
  color: var(--zp-text-muted);
  margin-top: 0.25rem;
}

/* Inputs — Apple form-row aesthetic on dark */
.coordinate-input,
.phone-input,
:deep(input[type="text"]),
:deep(input[type="tel"]),
:deep(input[type="number"]) {
  width: 100% !important;
  height: 42px !important;
  padding: 0.65rem 0.85rem !important;
  font-size: 0.92rem !important;
  font-family: var(--zp-font) !important;
  border-radius: var(--zp-radius) !important;
  border: 1px solid var(--zp-line) !important;
  background: var(--zp-bg-2) !important;
  color: var(--zp-text) !important;
  transition: border-color var(--zp-fast) var(--zp-ease), box-shadow var(--zp-fast) var(--zp-ease) !important;
}

.coordinate-input:focus,
.phone-input:focus,
:deep(input:focus) {
  outline: none !important;
  border-color: var(--zp-accent) !important;
  box-shadow: 0 0 0 3px var(--zp-accent-soft) !important;
}

/* Radix Select dropdown — dark theme.
   Radix portals the dropdown to <body>, so scoped CSS without :deep()
   doesn't apply (the portaled DOM lacks our component's scope attribute).
   Every selector below uses :deep() so it punches through.
   We use a solid (non-transparent) background — the previous transparent
   item background let the page bleed through and made the menu unreadable. */
:deep([data-radix-popper-content-wrapper]),
:deep(.select-content) {
  width: var(--radix-select-trigger-width);
  background: #1c1c1e !important; /* solid; no see-through */
  border: 1px solid var(--zp-line) !important;
  border-radius: var(--zp-radius) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
  z-index: 9999 !important;
  overflow: hidden !important;
  color: var(--zp-text) !important;
  padding: 4px !important;
}

.select-trigger {
  width: 100% !important;
  min-height: 42px !important;
  padding: 0.65rem 0.95rem !important;
  font-size: 0.92rem !important;
  font-family: var(--zp-font) !important;
  border-radius: var(--zp-radius) !important;
  border: 1px solid var(--zp-line) !important;
  background: var(--zp-bg-2) !important;
  color: var(--zp-text) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

:deep(.select-item),
:deep([role="option"]) {
  width: 100% !important;
  background: #1c1c1e !important; /* solid; matches container */
  color: var(--zp-text) !important;
  padding: 8px 12px !important;
  user-select: none !important;
  outline: none !important;
  cursor: pointer !important;
  font-size: 0.9rem !important;
  border-radius: 6px !important;
}

:deep(.select-viewport) {
  background: #1c1c1e !important;
  padding: 4px !important;
}

:deep(.select-item:hover),
:deep([role="option"]:hover),
:deep(.select-item[data-highlighted]),
:deep([role="option"][data-highlighted]) {
  background: #2c2c2e !important; /* one notch lighter on hover */
  color: var(--zp-text) !important;
}

:deep(.select-item[data-state="checked"]),
:deep([role="option"][data-state="checked"]) {
  background: var(--zp-accent-soft) !important;
  color: var(--zp-accent) !important;
}

:deep(.form-item) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(label) {
  font-weight: 500;
  font-size: 0.78rem;
  letter-spacing: var(--zp-track-loose);
  text-transform: uppercase;
  color: var(--zp-text-muted);
  font-size: 0.95rem;
}

.submit-btn {
  width: 100%;
  background: white;
  color: black;
  padding: 0.85rem;
  font-weight: 600;
  font-size: 0.92rem;
  border-radius: 999px;
  margin-top: 0.5rem;
  transition:
    background var(--zp-fast) var(--zp-ease),
    transform var(--zp-fast) var(--zp-spring),
    opacity var(--zp-fast) var(--zp-ease);
  border: 0;
  font-family: var(--zp-font);
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
}

.submit-btn:active:not(:disabled) { transform: scale(0.99); }

.submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.debug-info {
  padding: 0.85rem 1rem;
  background: var(--zp-bg-2);
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius);
  font-size: 0.82rem;
  color: var(--zp-text-muted);
  margin-top: 1rem;
  font-family: var(--zp-font-mono);
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
