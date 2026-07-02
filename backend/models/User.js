const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  isVerified: {
    type: Boolean,
    default: false
  },
 email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
},
  // Optional: social-login users (Google/Facebook) have no local password.
  passwordHash: { type: String },
  // Auth provider this account was created with / can use.
  provider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  providerId: { type: String }, // Google `sub` / Facebook user id
  avatar: { type: String },     // profile picture URL from the provider
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },

  createdAt: { type: Date, default: Date.now },
})

userSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10)
}

module.exports = mongoose.model('User', userSchema)
