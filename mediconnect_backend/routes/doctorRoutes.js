const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all doctor routes
router.use(verifyToken);
router.use(authorizeRole('doctor'));

// 1. Appointment Management
router.get('/pending-appointments', doctorController.getPendingAppointments);
router.get('/available-nurses', doctorController.getAvailableNurses);
router.put('/accept-appointment/:appointmentId', doctorController.acceptAppointment);

// 2. Consultation & Prescription
router.post('/complete-consultation', doctorController.completeConsultation);

module.exports = router;