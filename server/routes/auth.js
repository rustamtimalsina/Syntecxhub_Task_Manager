const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: makeToken(user._id),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'That email is already registered' });
    }
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // password has select:false, so we ask for it explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: makeToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/auth/me  (protected)
router.get('/me', protect, (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
});
module.exports = router;