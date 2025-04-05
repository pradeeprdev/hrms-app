const Candidate = require('../models/Candidate');
const fs = require('fs');
const path = require('path');

exports.addCandidate = async (req, res) => {
  try {
    const resumePath = req.file?.path || '';
    const newCandidate = new Candidate({
      ...req.body,
      resume: resumePath
    });
    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (candidate.resume) fs.unlinkSync(candidate.resume);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate.resume) return res.status(404).json({ msg: 'Resume not found' });
    res.download(path.resolve(candidate.resume));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};