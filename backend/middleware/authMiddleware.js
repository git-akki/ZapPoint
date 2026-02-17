import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided' 
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    console.log('Decoded token:', decoded)

    // Fetch full user from database using the ID from token
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    console.log('Authenticated user:', user._id, user.email)

    // Set the full user object (with _id) to req.user
    req.user = user
    
    next()
  } catch (err) {
    console.error('Token verification error:', err)
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    })
  }
}

// Alternative export if you're using 'protect' elsewhere
export const protect = authenticate
