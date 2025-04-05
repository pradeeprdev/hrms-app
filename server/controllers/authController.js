const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({ message: 'User registered successfully' });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(user);
};
