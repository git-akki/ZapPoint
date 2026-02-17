import EmergencyService from '../models/EmergencyService.js'
import Station from '../models/Station.js'

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Find nearest active station
const findNearestStation = async (latitude, longitude, connectorType, powerRequired) => {
  const stations = await Station.find({
    status: 'Active',
    connectorType: connectorType,
    powerOutput: { $gte: powerRequired }
  })

  if (stations.length === 0) {
    return null
  }

  let nearestStation = null
  let minDistance = Infinity

  stations.forEach(station => {
    const distance = calculateDistance(
      latitude,
      longitude,
      station.location.latitude,
      station.location.longitude
    )

    if (distance < minDistance) {
      minDistance = distance
      nearestStation = {
        ...station.toObject(),
        distance: distance.toFixed(2),
        eta: Math.ceil(distance * 2) // Rough estimate: 2 minutes per km
      }
    }
  })

  return nearestStation
}

// Request emergency service
export const requestEmergencyService = async (req, res) => {
  try {
    console.log('Request body:', req.body)
    console.log('Request user:', req.user)

    const { latitude, longitude, connectorType, powerRequired, contactNumber } = req.body

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      })
    }

    if (!connectorType) {
      return res.status(400).json({
        success: false,
        message: 'Connector type is required'
      })
    }

    if (!powerRequired) {
      return res.status(400).json({
        success: false,
        message: 'Power requirement is required'
      })
    }

    if (!contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required'
      })
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      })
    }

    // Find nearest available station
    const nearestStation = await findNearestStation(
      parseFloat(latitude),
      parseFloat(longitude),
      connectorType,
      parseInt(powerRequired)
    )

    if (!nearestStation) {
      return res.status(404).json({
        success: false,
        message: 'No available stations found matching your requirements'
      })
    }

    // Create emergency service request with userId
    const emergencyRequest = await EmergencyService.create({
      userId: req.user._id, // Make sure this is set
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      connectorType,
      powerRequired: parseInt(powerRequired),
      contactNumber,
      assignedStation: nearestStation._id,
      status: 'assigned'
    })

    console.log('Emergency request created:', emergencyRequest)

    res.status(201).json({
      success: true,
      message: 'Emergency service requested successfully',
      emergencyRequest,
      assignedStation: {
        name: nearestStation.name,
        distance: nearestStation.distance,
        eta: nearestStation.eta,
        contact: '+91 98765 43210',
        coordinates: {
          latitude: nearestStation.location.latitude,
          longitude: nearestStation.location.longitude
        }
      }
    })
  } catch (error) {
    console.error('Emergency request error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process emergency request',
      error: error.message
    })
  }
}

// Get emergency request by ID
export const getEmergencyRequest = async (req, res) => {
  try {
    const { requestId } = req.params

    const emergencyRequest = await EmergencyService.findById(requestId)
      .populate('assignedStation')

    if (!emergencyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      })
    }

    // Check if user owns this request
    if (emergencyRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      })
    }

    const assignedStation = emergencyRequest.assignedStation
    const distance = calculateDistance(
      emergencyRequest.coordinates.latitude,
      emergencyRequest.coordinates.longitude,
      assignedStation.location.latitude,
      assignedStation.location.longitude
    )

    res.status(200).json({
      success: true,
      emergencyRequest,
      assignedStation: {
        ...assignedStation.toObject(),
        distance: distance.toFixed(2),
        eta: Math.ceil(distance * 2),
        contact: '+91 98765 43210',
        coordinates: {
          latitude: assignedStation.location.latitude,
          longitude: assignedStation.location.longitude
        }
      }
    })
  } catch (error) {
    console.error('Get request error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency request',
      error: error.message
    })
  }
}

// Get all emergency requests for a user
export const getUserEmergencyRequests = async (req, res) => {
  try {
    const requests = await EmergencyService.find({ userId: req.user._id })
      .populate('assignedStation')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    })
  } catch (error) {
    console.error('Get requests error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency requests',
      error: error.message
    })
  }
}

// Update emergency request status
export const updateEmergencyStatus = async (req, res) => {
  try {
    const { requestId } = req.params
    const { status } = req.body

    const emergencyRequest = await EmergencyService.findByIdAndUpdate(
      requestId,
      { 
        status,
        ...(status === 'completed' && { completedAt: Date.now() })
      },
      { new: true }
    ).populate('assignedStation')

    if (!emergencyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      emergencyRequest
    })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    })
  }
}
