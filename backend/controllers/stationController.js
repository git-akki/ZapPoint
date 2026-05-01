import Station from '../models/Station.js'

export const createStation = async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body
    const station = new Station({
      name,
      location,
      status,
      powerOutput,
      connectorType,
      createdBy: req.user.id
    })
    await station.save()
    res.status(201).json(station)
  } catch (err) {
    res.status(500).json({ message: 'Error creating station' })
  }
}

// Paginated list. Defaults: page=1, limit=100. Hard-cap at 500 so a hostile
// client can't request a million-row scan. Previously this returned ALL
// stations unbounded, which would crash the browser at any meaningful scale.
export const getStations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100))
    const skip = (page - 1) * limit

    const [stations, total] = await Promise.all([
      Station.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Station.countDocuments({}),
    ])

    // Frontend code reads either a bare array OR `{ stations, ... }` (see the
    // shape-tolerant fetch in ChargerListView/MapView). Returning both keeps
    // both call sites working without breaking changes.
    res.status(200).json({
      stations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stations' })
  }
}

export const updateStation = async (req, res) => {
  try {
    const station = await Station.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    )
    if (!station) return res.status(404).json({ message: 'Station not found' })
    res.json(station)
  } catch (err) {
    res.status(500).json({ message: 'Error updating station' })
  }
}

export const deleteStation = async (req, res) => {
  try {
    const station = await Station.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    })
    if (!station) return res.status(404).json({ message: 'Station not found' })
    res.json({ message: 'Station deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting station' })
  }
}
