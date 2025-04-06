const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  department: String,
  position: String,
  profile: String,
  dateOfJoining: Date,
});

module.exports = mongoose.model('Employee', employeeSchema);