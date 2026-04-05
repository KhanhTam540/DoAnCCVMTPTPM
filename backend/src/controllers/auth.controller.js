var bcrypt  = require('bcryptjs');
var jwt  = require('jsonwebtoken');
var nodemailer  = require('nodemailer');
var authModel  = require('../models/auth.model');

// Email transporter
let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Generate 6-digit OTP
let generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==================== REGISTER ====================
let register = async (req, res) => {
  try {
    let { username, password, email } = req.body;

    let existing = await authModel.findUserIdByUsernameOrEmail(username, email);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    let result = await authModel.createUser({ username, password: hashedPassword, email });
    let userId = result.insertId;

    await authModel.assignDefaultUserRole(userId);

    let otpCode = generateOTP();
    let expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await authModel.createOtpVerification(userId, otpCode, expiresAt);

    try {
      await transporter.sendMail({
        from: `"Car Parts Store" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Xác thực tài khoản - Mã OTP',
        html: `
          <h2>Xin chào ${username}!</h2>
          <p>Mã OTP xác thực tài khoản của bạn là:</p>
          <h1 style="color: #2563eb; letter-spacing: 8px;">${otpCode}</h1>
          <p>Mã có hiệu lực trong <strong>10 phút</strong>.</p>
        `
      });
    } catch (mailErr) {
      console.error('Mail error:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      data: { userId, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== VERIFY OTP ====================
let verifyOtp = async (req, res) => {
  try {
    let { email, otp_code } = req.body;

    let users = await authModel.findUserIdByEmail(email);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    let userId = users[0].id;

    let otps = await authModel.findValidOtpByUserId(userId, otp_code);

    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await authModel.activateUserById(userId);
    await authModel.deleteOtpsByUserId(userId);

    res.json({ success: true, message: 'Account verified successfully. You can now login.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== LOGIN (SỬA QUAN TRỌNG) ====================
let login = async (req, res) => {
  try {
    let { username, password } = req.body;
    
    console.log('=================================');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('Username:', username);
    console.log('Time:', new Date().toISOString());

    // Sử dụng GROUP_CONCAT để lấy tất cả roles của user
    let users = await authModel.findLoginUserByUsername(username);

    console.log(`Found ${users.length} user(s) with this username`);

    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    let user = users[0];
    
    // Xác định role từ database
    let role = 'user';
    if (user.roles) {
      let rolesList = user.roles.split(',');
      // Nếu có role admin trong danh sách, ưu tiên admin
      role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
    }
    
    console.log('📊 User details:');
    console.log('  - ID:', user.id);
    console.log('  - Username:', user.username);
    console.log('  - Email:', user.email);
    console.log('  - Is Active:', user.is_active);
    console.log('  - Roles from DB:', user.roles);
    console.log('  - Selected Role:', role);
    console.log('  - Password Hash Length:', user.password.length);

    if (!user.is_active) {
      console.log('❌ Account is not active');
      return res.status(403).json({ 
        success: false, 
        message: 'Account not verified or has been locked. Please verify your email first or contact admin.' 
      });
    }

    console.log('🔑 Comparing password...');
    let isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    console.log('✅ Password correct!');

    // Tạo JWT token với role đã xác định
    let token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: role  // QUAN TRỌNG: role phải được đưa vào token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Login successful!');
    console.log('=================================');

    // Trả về đầy đủ thông tin user bao gồm role
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: role,  // QUAN TRỌNG: role phải được trả về
          is_active: user.is_active === 1 || user.is_active === true
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error details:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { register, verifyOtp, login };
