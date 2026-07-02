const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // 🔍 اطبع الهيدر
    console.log('AUTH HEADER:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    console.log('TOKEN:', token)

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ error: 'Invalid token format' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select('-passwordHash')

    if (!req.user) {
      return res.status(401).json({ error: 'User not found' })
    }

    next()

  } catch (error) {
    console.error('JWT ERROR:', error.message)

    return res.status(401).json({
      error: 'Not authorized, token failed'
    })
  }
}


const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' })
  }
}

module.exports = { protect, admin }