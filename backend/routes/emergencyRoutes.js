import express from 'express'
import {
  requestEmergencyService,
  getEmergencyRequest,
  getUserEmergencyRequests,
  updateEmergencyStatus
} from '../controllers/emergencyController.js'
import { authenticate } from '../middleware/authMiddleware.js' // or { protect }

const router = express.Router()

// All routes require authentication
router.use(authenticate) // This will fetch the user for every request

router.post('/request', requestEmergencyService)
router.get('/my-requests', getUserEmergencyRequests)
router.get('/:requestId', getEmergencyRequest)
router.patch('/:requestId/status', updateEmergencyStatus)

export default router
