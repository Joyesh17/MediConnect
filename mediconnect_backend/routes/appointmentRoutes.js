const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected: Logged-in users can view and book appointments
router.get('/', protect, appointmentController.getAllAppointments);
router.get('/:id', protect, appointmentController.getAppointmentById);
router.post('/', protect, appointmentController.createAppointment);

// Admin Only: Update status or delete appointments
router.put('/:id', protect, admin, appointmentController.updateAppointment);
router.delete('/:id', protect, admin, appointmentController.deleteAppointment);

module.exports = router;