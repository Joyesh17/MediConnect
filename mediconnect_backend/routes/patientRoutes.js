const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all patient routes
router.use(verifyToken);
router.use(authorizeRole('patient'));

// 1. Doctor Discovery
router.get('/doctors', patientController.searchDoctors);

// 2. Appointments
router.post('/appointments', patientController.bookAppointment);

// 3. Lab Tests
router.get('/lab-suggestions', patientController.getLabSuggestions);
router.put('/lab-suggestions/:requestId', patientController.respondToLabTest);

// 4. Medical Records
router.get('/prescriptions', patientController.getPrescriptions);

module.exports = router;