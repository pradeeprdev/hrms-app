const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  addCandidate,
  getAllCandidates,
  updateStatus,
  deleteCandidate,
  updateCandidate
} = require('../controllers/candidateController');

// Resume storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc, .docx files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes
router.post('/', upload.single('resume'), addCandidate);
router.get('/', getAllCandidates);
router.patch('/:id/status', updateStatus);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

router.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/', req.params.filename);
  res.download(filePath);
});

module.exports = router;
