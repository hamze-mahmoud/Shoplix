const User = require('../../models/User')

module.exports = async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id, { passwordHash: 0 })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    console.error('getCurrentUser error', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}
