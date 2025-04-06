const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const upload = require('../middleware/upload');

router.post('/', upload.single('docs'), leaveController.createLeave);
router.get('/', leaveController.getAllLeaves);
router.get('/:id', leaveController.getLeaveById);
router.put('/:id', upload.single('docs'), leaveController.updateLeave);
router.delete('/:id', leaveController.deleteLeave);

module.exports = router;