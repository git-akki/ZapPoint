import mongoose from 'mongoose'

const emergencyServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    connectorType: {
      type: String,
      required: true,
      enum: [
        'Type 1',
        'Type 2', 
        'Type 3',
        'Type c',
        'Type1',
        'type 1',
        'type 2',
        'type 3',
        'type c',
        'type1',
        'CHAdeMO',
        'CCS',
        'Type',
        'Tesla'
      ]
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
