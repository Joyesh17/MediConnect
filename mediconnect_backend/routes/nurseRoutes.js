const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all nurse routes
router.use(verifyToken);
router.use(authorizeRole('nurse'));

// --- PHASE 3: NURSE ASSIGNMENT ---
// 1. View assigned appointments (Patient has paid and doctor assigned you)
router.get('/my-tasks', nurseController.getAssignedAppointments);

// --- PHASE 4 & 5: LAB TESTS & RESULTS ---
// 2. View specific lab tests requested by the doctor (Filters out unpaid tests)
router.get('/appointments/:appointmentId/lab-requests', nurseController.getLabRequestsForAppointment);

// 3. Upload the results of a specific lab test (Safety locked to paid tests only)
router.put('/lab-requests/:requestId/result', nurseController.updateLabResult);

// --- DASHBOARD UTILITIES ---
// 4. Toggle availability status (Available / Busy)
router.put('/update-status', nurseController.toggleAvailability);

module.exports = router;