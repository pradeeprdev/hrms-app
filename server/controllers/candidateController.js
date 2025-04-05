const Candidate = require('../models/Candidate');
const fs = require('fs');
const path = require('path');

// Add candidate
exports.addCandidate = async (req, res) => {
  try {
    const { fullName, email, phone, position, experience } = req.body;
    const resume = req.file?.filename;

    const newCandidate = new Candidate({
      fullName,
      email,
      phone,
      position,
      experience,
      resume
    });

    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update candidate status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Candidate.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete candidate and resume
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    // Delete the resume file
    const filePath = path.join(__dirname, '../uploads/', candidate.resume);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCandidate = async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Candidate.findByIdAndUpdate(id, req.body, { new: true });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};