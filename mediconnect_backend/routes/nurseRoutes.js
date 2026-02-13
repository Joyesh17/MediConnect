const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes here require the user to be logged in AND have the 'nurse' role
router.use(verifyToken);
router.use(authorizeRole('nurse'));

// 1. View assigned appointments
router.get('/my-tasks', nurseController.getAssignedAppointments);

// 2. View specific lab tests requested by the doctor for an appointment
router.get('/appointments/:appointmentId/lab-requests', nurseController.getLabRequestsForAppointment);

// 3. Upload the results of a specific lab test
router.put('/lab-requests/:requestId/result', nurseController.updateLabResult);

// 4. Toggle availability status (Available / Busy)
router.put('/update-status', nurseController.toggleAvailability);

module.exports = router;