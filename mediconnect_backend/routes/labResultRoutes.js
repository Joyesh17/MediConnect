const express = require('express');
const router = express.Router();
const labResultController = require('../controllers/labResultController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected: Logged-in users can view lab results
router.get('/', protect, labResultController.getAllLabResults);
router.get('/:id', protect, labResultController.getLabResultById);

// Admin Only: Create, Update, or Delete lab results
router.post('/', protect, admin, labResultController.createLabResult);
router.put('/:id', protect, admin, labResultController.updateLabResult);
router.delete('/:id', protect, admin, labResultController.deleteLabResult);

module.exports = router;