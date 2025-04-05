const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  position: String,
  experience: String,
  status: { type: String, enum: ['New', 'Shortlisted', 'Interviewed', 'Selected'], default: 'New' },
  resume: String
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);