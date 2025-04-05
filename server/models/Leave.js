const mongoose = require('mongoose');
const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  date: Date,
  reason: String,
  status: { type: String, default: 'Pending' },
  docs: String,
});
module.exports = mongoose.model('Leave', leaveSchema);