const User = require('../../models/User')
const { phoneKeyOf, isValidPhone } = require('../../utils/phone')

module.exports = async function updateUser(req, res) {
  // Use the ID from the authenticated user (set by protect middleware)
  const id = req.user.id
  const { firstName, lastName, email, phone } = req.body

  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (email && email !== user.email) {
      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(409).json({ error: 'Email already exists' })
      }
      user.email = email
    }

    // Phone change: recompute the canonical last-9-digits lookup key and make
    // sure no other account already owns that number before saving.
    if (phone !== undefined && String(phone).trim() !== (user.phone || '')) {
      const trimmed = String(phone).trim()
      if (trimmed) {
        if (!isValidPhone(trimmed)) {
          return res.status(400).json({ error: 'Please enter a valid phone number' })
        }
        const phoneKey = phoneKeyOf(trimmed)
        const clash = await User.findOne({ phoneKey, _id: { $ne: user._id } })
        if (clash) {
          return res.status(409).json({ error: 'Phone number already in use' })
        }
        user.phone = trimmed
        user.phoneKey = phoneKey
      }
    }

    if (firstName) user.firstName = firstName
    if (lastName !== undefined) user.lastName = lastName

    await user.save()

    const userObj = user.toObject()
    delete userObj.passwordHash
    delete userObj.cart

    res.json(userObj)
  } catch (err) {
    console.error('updateUser error', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
}
