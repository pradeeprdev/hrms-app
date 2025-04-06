const Attendance = require("../models/Attendance");

// Get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employee");
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get attendance by employee
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const records = await Attendance.find({ employee: employeeId }).populate("employee");
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Create new attendance
exports.createAttendance = async (req, res) => {
  try {
    const newRecord = new Attendance(req.body);
    const saved = await newRecord.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete attendance
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};