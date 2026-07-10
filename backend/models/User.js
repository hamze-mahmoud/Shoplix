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
  // Phone sign-in: `phone` is the number as typed (digits, for display and
  // WhatsApp), `phoneKey` is the canonical last-9-digits lookup key so the
  // same number matches with or without a country code.
  phone: { type: String, trim: true },
  phoneKey: { type: String, unique: true, sparse: true, index: true },
  passwordHash: { type: String, required: true },
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
