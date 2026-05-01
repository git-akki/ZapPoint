import mongoose from 'mongoose'
import { CONNECTOR_TYPES, normalizeConnectorType } from '../utils/connectorTypes.js'

const emergencyServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coordinates: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 }
    },
    connectorType: {
      type: String,
      required: true,
      // Shares the canonical 5-value enum + normalizer with Station.js so
      // an EV's connector lookup actually matches against stored stations.
      enum: CONNECTOR_TYPES,
      set: normalizeConnectorType,
    },
    powerRequired: {
      type: Number,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    assignedStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

export default mongoose.model('EmergencyService', emergencyServiceSchema)
