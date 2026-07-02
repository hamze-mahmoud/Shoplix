const User = require('../../models/User')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function validateUser(firstName, email, password) {
  const errors = []
  if (!firstName || firstName.trim().length === 0) {
    errors.push('firstName is required')
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('valid email is required')
  }
  if (!password || password.length < 6) {
    errors.push('password must be at least 6 characters')
  }
  return errors
}

module.exports = async function createUser(req, res) {
  const { firstName, lastName, email, password } = req.body

  const errors = validateUser(firstName, email, password)
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const passwordHash = await User.hashPassword(password)

    const user = new User({
      firstName,
      lastName: lastName || '',
      email,
      passwordHash
    })

    await user.save()

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const userObj = user.toObject()
    delete userObj.passwordHash
    delete userObj.cart

    res.status(201).json({ user: userObj, token })
  } catch (err) {
    console.error('createUser error', err)
    res.status(500).json({ error: 'Failed to create user' })
  }
}
