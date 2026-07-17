const User = require('../../models/User')

// Change password for the signed-in user. Requires the CURRENT password so a
// stolen/forgotten open session can't silently take over the account.
module.exports = async function changePassword(req, res) {
  const id = req.user.id
  const { currentPassword, newPassword } = req.body

  if (String(newPassword || '').length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    // `protect` strips passwordHash off req.user, so re-fetch the full doc.
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const ok = await user.verifyPassword(String(currentPassword || ''))
    if (!ok) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    user.passwordHash = await User.hashPassword(newPassword)
    await user.save()

    res.json({ message: 'Password updated' })
  } catch (err) {
    console.error('changePassword error', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
}
