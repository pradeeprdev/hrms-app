// controllers/leaveController.js
const Leave = require('../models/Leave');

// Create a new leave
exports.createLeave = async (req, res) => {
  try {
    const { employeeId, date, reason } = req.body;
    const docs = req.file ? req.file.filename : null;

    const leave = new Leave({ employeeId, date, reason, docs });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create leave', error });
  }
};

// Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employeeId', 'name');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get leaves', error });
  }
};

// Get leave by ID
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employeeId', 'name');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave', error });
  }
};

// Update leave (status or info)
exports.updateLeave = async (req, res) => {
  try {
    const updatedData = req.body;
    if (req.file) {
      updatedData.docs = req.file.filename;
    }

    const leave = await Leave.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update leave', error });
  }
};

// Delete leave
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete leave', error });
  }
};