const User = require('../../models/User')
const nodemailer = require('nodemailer')
const createToken = require('./createToken')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

module.exports = async function signUp(req, res) {
  const { firstName, lastName, email, password } = req.body
   console.log("Received sign-up data:", req.body)
  if (!firstName || !email || !password || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' })
    }

    const user = new User({ firstName, lastName, email,isVerified: false })
    const passwordHash = await User.hashPassword(password)
    user.passwordHash = passwordHash

    // ✅ Use createToken function
    const verificationToken = createToken(user)

    await user.save();

    // The verification link must hit THIS backend (where the handler lives),
    // not the frontend. Fall back to localhost for local development.
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

    const verificationUrl = `${serverUrl}/api/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    })
         
    
    
    
    res.status(200).json({
      message:"please verify your email to complete registration"
     })




   
   

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Signup failed' })
  }
}