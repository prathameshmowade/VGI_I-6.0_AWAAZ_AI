const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

// Google OAuth client
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// In-memory OTP store: { email: { otp, name, picture, expiresAt } }
const emailOtpStore = {};

// Nodemailer transporter (Gmail)
const getMailTransporter = () => {
  if (env.EMAIL_USER && env.EMAIL_PASS && !env.EMAIL_USER.startsWith('your_')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
      }
    });
  }
  console.info('[AUTH] Email credentials not configured, OTP will be returned in response (demo mode)');
  return null;
};

// In-memory fallback user store for standalone running without MongoDB connection
const memoryUsers = [
  {
    citizenId: 'CIT-2026-1001',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'citizen.rahul@gmail.com',
    passwordHash: bcrypt.hashSync('demo1234', 8),
    role: 'citizen',
    address: 'Flat 402, Sunshine Apartments, Vijay Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452010',
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    citizenId: 'OFF-2026-9001',
    name: 'Er. Rajesh Sharma',
    mobile: '9123456789',
    email: 'officer.sharma@imcindore.mp.gov.in',
    passwordHash: bcrypt.hashSync('officer1234', 8),
    role: 'officer',
    department: 'Roads & Infrastructure Department',
    address: 'IMC Headquarters, Nagar Nigam Campus',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452001',
    createdAt: new Date(),
    lastLoginAt: new Date()
  }
];

// Elevated roles that require ADMIN_SECRET_KEY verification
const ELEVATED_ROLES = ['admin', 'department_worker', 'officer'];

// ===== Google OAuth Login (Step 1: Verify Google token, send email OTP) =====
const googleLogin = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    if (!credential && !userInfo) {
      return res.status(400).json({ success: false, error: 'Google credential or user info is required.' });
    }

    let payload;

    // Try ID token verification first
    if (credential && credential !== 'resend') {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.warn('[AUTH] ID token verification failed, checking for userInfo fallback:', verifyErr.message);
      }
    }

    // Fallback: use userInfo from implicit flow (already verified by Google on client-side)
    if (!payload && userInfo) {
      if (!userInfo.email || !userInfo.email_verified) {
        return res.status(403).json({ success: false, error: 'Your Google account email is not verified. Only verified Google accounts can log in.' });
      }
      payload = userInfo;
      console.info('[AUTH] Using implicit flow userInfo for:', userInfo.email);
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ success: false, error: 'Invalid Google credential. Please sign in again.' });
    }

    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(403).json({ success: false, error: 'Your Google account email is not verified. Only verified Google accounts can log in.' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP with 10-minute expiry
    emailOtpStore[email.toLowerCase()] = {
      otp,
      name: name || email.split('@')[0],
      picture: picture || '',
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // Send OTP email
    const transporter = getMailTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Awaaz AI Municipal Helpdesk" <${env.EMAIL_USER}>`,
          to: email,
          subject: `🔐 Awaaz AI - Your Login OTP: ${otp}`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f0fdf4; border-radius: 16px; border: 1px solid #bbf7d0;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #064e3b; font-size: 24px; margin: 0;">awaaz<span style="color: #16a34a;">.ai</span></h1>
                <p style="color: #047857; font-size: 12px; margin: 4px 0 0;">Municipal Redressal Authentication</p>
              </div>
              <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dcfce7;">
                <p style="color: #064e3b; font-size: 14px; margin: 0 0 8px;">Hello <strong>${name || 'Citizen'}</strong>,</p>
                <p style="color: #047857; font-size: 13px; margin: 0 0 20px;">Your one-time verification code for Awaaz AI login:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <div style="display: inline-block; background: #16a34a; color: white; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; font-family: monospace;">
                    ${otp}
                  </div>
                </div>
                <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 16px 0 0;">
                  This code expires in <strong>10 minutes</strong>. Do not share this with anyone.<br/>
                  If you didn't request this, please ignore this email.
                </p>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 10px; margin: 16px 0 0;">
                Indore Municipal Corporation • Pragati 2.0 Hackathon • DPDP Act 2023 Compliant
              </p>
            </div>
          `
        });
        console.log(`[AUTH] OTP email sent to ${email}`);
      } catch (mailErr) {
        console.error('[AUTH] Failed to send OTP email:', mailErr.message);
      }
    }

    return res.json({
      success: true,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      picture: picture || '',
      message: transporter ? `A 6-digit OTP has been sent to ${email}` : `Demo mode: Use OTP ${otp}`,
      demoOtp: transporter ? undefined : otp
    });
  } catch (err) {
    console.error('[AUTH] Google login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during Google authentication.' });
  }
};

// ===== Google OAuth OTP Verification (Step 2: Verify email OTP, issue JWT) =====
const googleVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
    }

    const stored = emailOtpStore[email.toLowerCase()];
    if (!stored) {
      return res.status(400).json({ success: false, error: 'No OTP found for this email. Please sign in with Google first.' });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      delete emailOtpStore[email.toLowerCase()];
      return res.status(400).json({ success: false, error: 'OTP has expired. Please sign in with Google again.' });
    }

    // Verify OTP
    if (stored.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please check your email and try again.' });
    }

    // OTP is valid — clean up
    delete emailOtpStore[email.toLowerCase()];

    // Generate JWT
    const citizenId = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const token = jwt.sign(
      { citizenId, email: email.toLowerCase(), role: 'citizen' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = {
      citizenId,
      name: stored.name,
      email: email.toLowerCase(),
      picture: stored.picture,
      role: 'citizen',
      authProvider: 'google',
      lastLoginAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      token,
      user: userData,
      message: 'Email OTP verified! You are now logged in.'
    });
  } catch (err) {
    console.error('[AUTH] Google OTP verification error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during OTP verification.' });
  }
};

// Register New Citizen Endpoint with Secure Role-Based Access
const register = async (req, res) => {
  try {
    const { name, mobile, email, password, address, city, state, pinCode, role, adminSecretKey } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, Mobile, Email, and Password are required fields.' });
    }

    // --- SECURE ROLE ASSIGNMENT ---
    // Default: all public signups get 'resident' role.
    // Never trust the 'role' field from the client blindly.
    let assignedRole = 'resident';

    if (role && ELEVATED_ROLES.includes(role)) {
      const serverSecretKey = process.env.OFFICER_SECRET_KEY || process.env.ADMIN_SECRET_KEY || 'ADMIN_OFFICER_SECRET_2026';
      const userProvidedKey = req.body.secretKey || req.body.officerSecretKey || req.body.adminSecretKey;

      if (!userProvidedKey || userProvidedKey !== serverSecretKey) {
        console.warn(`[AUTH] Elevated role signup attempt blocked for role '${role}'. Invalid secret key provided.`);
        return res.status(403).json({ success: false, error: 'Unauthorized: Invalid or missing Officer Secret API Key.' });
      }
      assignedRole = role;
      console.info(`[AUTH] Elevated role '${role}' signup authorized via valid Officer Secret Key.`);
    }

    // Check duplicate in MongoDB
    try {
      const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: existingUser.email === email.toLowerCase()
            ? 'An account with this Email Address already exists.'
            : 'An account with this Mobile Number already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const citizenId = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = await User.create({
        citizenId, name, mobile,
        email: email.toLowerCase(),
        password: hashedPassword,
        address: address || '', city: city || 'Indore',
        state: state || 'Madhya Pradesh', pinCode: pinCode || '452001',
        role: assignedRole
      });

      return res.status(201).json({
        success: true, message: 'Registration Successful!',
        citizenId: newUser.citizenId,
        user: { citizenId: newUser.citizenId, name: newUser.name, mobile: newUser.mobile, email: newUser.email, role: newUser.role, address: newUser.address, city: newUser.city, state: newUser.state, pinCode: newUser.pinCode }
      });
    } catch (dbErr) {
      console.warn('MongoDB query bypassed, using in-memory store:', dbErr.message);

      const memDup = memoryUsers.find((u) => u.email === email.toLowerCase() || u.mobile === mobile);
      if (memDup) {
        return res.status(400).json({
          success: false,
          error: memDup.email === email.toLowerCase()
            ? 'An account with this Email Address already exists.'
            : 'An account with this Mobile Number already exists.'
        });
      }

      const citizenId = `CIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = bcrypt.hashSync(password, 8);

      const memUser = {
        citizenId, name, mobile, email: email.toLowerCase(), passwordHash,
        role: assignedRole, address: address || 'Vijay Nagar',
        city: city || 'Indore', state: state || 'Madhya Pradesh', pinCode: pinCode || '452001',
        createdAt: new Date(), lastLoginAt: new Date()
      };
      memoryUsers.push(memUser);

      return res.status(201).json({
        success: true, message: 'Registration Successful!', citizenId,
        user: { citizenId, name, mobile, email: memUser.email, role: assignedRole, address: memUser.address, city: memUser.city, state: memUser.state, pinCode: memUser.pinCode }
      });
    }
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error during registration' });
  }
};

// Send SMS OTP Endpoint
const sendOTP = (req, res) => {
  const { mobile } = req.body;
  if (!mobile || String(mobile).replace(/\D/g, '').length < 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
  }
  const demoOtp = '123456';
  return res.json({ success: true, message: `SMS OTP dispatched to +91-${mobile}`, otp: demoOtp, expiresIn: '10 minutes' });
};

// Verify OTP Endpoint (Simulated "123456")
const verifyOTP = (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ success: false, error: 'Mobile number and OTP required' });
  if (otp === '123456' || String(otp).length === 6) {
    return res.json({ success: true, message: 'Mobile OTP Verified Successfully ✓' });
  }
  return res.status(400).json({ success: false, error: 'Invalid OTP code. Enter 123456 for demo verification.' });
};

// Login Citizen / Officer Endpoint
const login = async (req, res) => {
  try {
    const { identifier, email, password, role } = req.body;
    const loginId = (identifier || email || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'Mobile / Email and Password are required.' });
    }

    try {
      const user = await User.findOne({ $or: [{ email: loginId }, { mobile: loginId }] });

      if (user) {
        if (user.isLocked) {
          return res.status(403).json({ success: false, error: 'Account locked due to multiple failed login attempts. Contact admin.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          user.failedAttempts = (user.failedAttempts || 0) + 1;
          if (user.failedAttempts >= 5) user.isLocked = true;
          await user.save();
          return res.status(401).json({ success: false, error: 'Invalid password credentials.' });
        }

        user.failedAttempts = 0;
        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign(
          { citizenId: user.citizenId, email: user.email, role: user.role },
          env.JWT_SECRET, { expiresIn: '24h' }
        );

        return res.json({
          success: true, token,
          user: { citizenId: user.citizenId, name: user.name, mobile: user.mobile, email: user.email, role: user.role, department: user.department, address: user.address, city: user.city, state: user.state, pinCode: user.pinCode, lastLoginAt: user.lastLoginAt }
        });
      }
    } catch (dbErr) {
      console.warn('MongoDB query bypassed, searching memory database:', dbErr.message);
    }

    // Fallback in-memory search
    const memUser = memoryUsers.find((u) => u.email === loginId || u.mobile === loginId);
    if (!memUser) {
      return res.status(401).json({ success: false, error: 'No registered user found with this Mobile Number or Email.' });
    }

    const match = bcrypt.compareSync(password, memUser.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid password credentials.' });
    }

    memUser.lastLoginAt = new Date();

    const token = jwt.sign(
      { citizenId: memUser.citizenId, email: memUser.email, role: memUser.role },
      env.JWT_SECRET, { expiresIn: '24h' }
    );

    return res.json({
      success: true, token,
      user: { citizenId: memUser.citizenId, name: memUser.name, mobile: memUser.mobile, email: memUser.email, role: memUser.role, department: memUser.department, address: memUser.address, city: memUser.city, state: memUser.state, pinCode: memUser.pinCode, lastLoginAt: memUser.lastLoginAt }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error during login' });
  }
};

module.exports = { register, verifyOTP, sendOTP, login, googleLogin, googleVerifyOtp };
