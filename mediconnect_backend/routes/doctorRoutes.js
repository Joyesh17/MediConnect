const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const db = require('../models'); 

// Protect all doctor routes
router.use(verifyToken);
router.use(authorizeRole('doctor'));

// --- PHASE 1: DISCOVERY & ACCEPTANCE ---
router.get('/pending-appointments', doctorController.getPendingAppointments);
router.put('/appointments/:appointmentId/respond', doctorController.respondToAppointment);

// --- PHASE 3: NURSE ASSIGNMENT & SCHEDULE ---
router.get('/appointments/awaiting-nurse', doctorController.getAppointmentsAwaitingNurse);
router.get('/available-nurses', doctorController.getAvailableNurses);
router.put('/appointments/:appointmentId/assign-nurse', doctorController.assignNurse);

router.get('/schedule', doctorController.getDoctorSchedule);
router.get('/history', doctorController.getConsultationHistory);

// --- PHASE 3 & 5: CONSULTATION & PRESCRIPTION ---
router.post('/consultation/initial', doctorController.initialConsultation);
router.put('/consultation/finalize', doctorController.finalizeConsultation);

// --- DOCTOR EARNINGS ---
router.get('/earnings', doctorController.getEarnings);

// --- LAB TESTS CATALOG ---
router.get('/lab-tests', async (req, res) => {
    try {
        const tests = await db.LabTest.findAll({ where: { status: 'active' } });
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching lab tests", error: error.message });
    }
});

module.exports = router;