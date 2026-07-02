const User = require('../../models/User')

module.exports = async function updateUser(req, res) {
  // Use the ID from the authenticated user (set by protect middleware)
  const id = req.user.id
  const { firstName, lastName, email } = req.body

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

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName

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
