import mongoose from 'mongoose'

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  powerOutput: { type: Number, required: true },
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
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('Station', stationSchema)
