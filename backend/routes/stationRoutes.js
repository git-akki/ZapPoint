import express from 'express'
import {
  createStation,
  getStations,
  updateStation,
  deleteStation,
} from '../controllers/stationController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticate)
router.post('/', createStation)
router.get('/', getStations)
router.put('/:id', updateStation)
router.delete('/:id', deleteStation)

export default router
