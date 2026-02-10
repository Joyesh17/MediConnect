const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected: Logged-in users can view prescriptions
router.get('/', protect, prescriptionController.getAllPrescriptions);
router.get('/:id', protect, prescriptionController.getPrescriptionById);

// Admin Only: Create, Update, or Delete prescriptions
router.post('/', protect, admin, prescriptionController.createPrescription);
router.put('/:id', protect, admin, prescriptionController.updatePrescription);
router.delete('/:id', protect, admin, prescriptionController.deletePrescription);

module.exports = router;