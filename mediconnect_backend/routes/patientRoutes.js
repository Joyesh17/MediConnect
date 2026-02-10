const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected: Only logged-in users can view patients (Privacy)
router.get('/', protect, patientController.getAllPatients);
router.get('/:id', protect, patientController.getPatientById);

// Admin Only: Create, Update, or Delete patients
router.post('/', protect, admin, patientController.createPatient);
router.put('/:id', protect, admin, patientController.updatePatient);
router.delete('/:id', protect, admin, patientController.deletePatient);

module.exports = router;