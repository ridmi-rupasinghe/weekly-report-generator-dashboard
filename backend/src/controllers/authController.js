const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const allowedRole = role === 'manager' ? 'manager' : 'team_member';
    const user = await User.create({ name, email, password, role: allowedRole });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (_req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedProjects', 'name color');
  res.json({ user });
};

exports.getUsers = async (_req, res) => {
  const users = await User.find().select('name email role assignedProjects').populate('assignedProjects', 'name');
  res.json({ users });
};
