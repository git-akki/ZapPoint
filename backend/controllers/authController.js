import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Server-side password rule: ≥8 chars with at least one letter and one digit.
// Mirrors the help text shown to the user on the Register form. The frontend
// previously claimed this rule but never enforced it — a single-character
// password would happily pass through bcrypt and land in the DB.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EMAIL_RULE = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_RULE.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (!password || !PASSWORD_RULE.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and contain a letter and a number',
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Anti-enumeration: respond with the same generic 200 we send for new
      // users so an attacker can't probe which emails are registered.
      // Skipping the email send here is deliberate — we don't want to spam
      // existing users with duplicate welcome mails.
      return res.status(200).json({
        message: 'If this email is new, you will receive a confirmation shortly.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    const htmlContent = `
<body style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f0f2f5; margin: 0; padding: 0;">  
  <link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #006400, #32CD32); color: white; padding: 20px; text-align: center;">
      <img src="https://i.ibb.co/xc5gM7W/a-modern-logo-design-for-zappoint-a-char-xov6sn-JJSv-W38-Ow-Tg2s-Pw-dh-Pt-Gr-Uc-Ss-SUumkwjc2-Yw-remo.png" alt="ZapPoint Logo" style="height: 150px; width: auto; margin-bottom: 10px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600; font-family: 'Audiowide', sans-serif;">ZapPoint</h1>
      <p style="margin: 0; font-size: 14px;">Powering Smarter Journeys</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #4a4a4a; margin-top: 0;">Welcome!</h2>
      <p>Thank you for registering with <strong>ZapPoint</strong>. We're excited to have you onboard.</p>
      <p>Start exploring your dashboard and manage your smart charging experience with ease.</p>
      <p>Best regards,<br><strong>ZapPoint Team</strong></p>
    </div>
    <div style="background-color: #2e8b57; color: white; text-align: center; padding: 20px; font-size: 14px;">
      <p><strong>ZapPoint</strong><br>Reliable Charging. Smart Mobility.</p>
    </div>
  </div>
</body>`;

    // Email send is best-effort — a flaky SMTP must not break registration.
    sendEmail(email, 'Welcome to ZapPoint!', htmlContent).catch(() => {});

    // Same generic message the dup branch returns. We still issue the token
    // so the new user can log in immediately; the message stays neutral.
    res.status(201).json({
      message: 'If this email is new, you will receive a confirmation shortly.',
      user: {
        _id: newUser._id,
        email: newUser.email,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
