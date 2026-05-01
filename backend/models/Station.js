import mongoose from 'mongoose'
import { CONNECTOR_TYPES, normalizeConnectorType } from '../utils/connectorTypes.js'

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  location: {
    // Range checks reject obviously invalid coordinates the frontend
    // previously allowed (e.g. lat 543.6139). Without these, garbage points
    // would land on the map outside the world.
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  powerOutput: { type: Number, required: true, min: 0, max: 500 },
  connectorType: {
    type: String,
    required: true,
    // Canonical enum (5 values). The previous list had 14 entries with
    // case/space variants of the same connector ('Type 1', 'type1', etc.)
    // which polluted filter dropdowns and filtered nothing usefully.
    // The setter normalizes legacy / inconsistent input on the way in.
    enum: CONNECTOR_TYPES,
    set: normalizeConnectorType,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('Station', stationSchema)
