const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all doctor routes
router.use(verifyToken);
router.use(authorizeRole('doctor'));

// --- PHASE 1: DISCOVERY & ACCEPTANCE ---
router.get('/pending-appointments', doctorController.getPendingAppointments);
// Replaced simple 'accept' with dynamic respond (accept/reject pushes to pay_now_consultation)
router.put('/appointments/:appointmentId/respond', doctorController.respondToAppointment);

// --- PHASE 3: NURSE ASSIGNMENT & SCHEDULE ---
// Fetch patients who have successfully paid their consultation fee
router.get('/appointments/awaiting-nurse', doctorController.getAppointmentsAwaitingNurse);
router.get('/available-nurses', doctorController.getAvailableNurses);
// Assign nurse only after payment is verified
router.put('/appointments/:appointmentId/assign-nurse', doctorController.assignNurse);

router.get('/schedule', doctorController.getDoctorSchedule);

// --- PHASE 3 & 5: CONSULTATION & PRESCRIPTION ---
// Step 1: Write diagnosis and order lab tests
router.post('/consultation/initial', doctorController.initialConsultation);
// Step 2: Edit prescription with final meds after lab results arrive
router.put('/consultation/finalize', doctorController.finalizeConsultation);

// --- DOCTOR EARNINGS ---
// Fetch dynamically calculated earnings from the Payments table
router.get('/earnings', doctorController.getEarnings);

module.exports = router;