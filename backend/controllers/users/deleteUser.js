const User = require('../../models/User')

module.exports = async function deleteUser(req, res) {
  const { id } = req.params

  try {
    const user = await User.findByIdAndDelete(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('deleteUser error', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}
