const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  addCandidate,
  getCandidates,
  deleteCandidate,
  downloadResume
} = require('../controllers/candidateController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/', auth, getCandidates);
router.post('/', auth, upload.single('resume'), addCandidate);
router.delete('/:id', auth, deleteCandidate);
router.get('/download/:id', auth, downloadResume);

module.exports = router;