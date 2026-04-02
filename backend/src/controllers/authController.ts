import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendVerificationEmail } from '../services/email.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({
      email,
      password,
      role: role === 'responder' ? 'citizen' : role,
      profile: { name, phone }
    });
    
    const verificationToken = jwt.sign(
      { userId: user._id, purpose: 'verification' },
      process.env.JWT_SECRET || 'jwt_dev_secret_12345',
      { expiresIn: '24h' }
    );
    
    await sendVerificationEmail(email, verificationToken);
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await (user as any).comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    user.lastActive = new Date();
    await user.save();
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refresh_dev_secret_67890') as any;
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const newAccessToken = generateAccessToken(user);
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'jwt_dev_secret_12345',
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_SECRET || 'refresh_dev_secret_67890',
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  const { password, ...userObj } = user.toObject();
  return userObj;
}
