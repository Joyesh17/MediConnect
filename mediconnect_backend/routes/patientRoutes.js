const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect all patient routes
router.use(verifyToken);
router.use(authorizeRole('patient'));

// --- PHASE 1: DISCOVERY & BOOKING ---
router.get('/doctors', patientController.searchDoctors);
router.post('/appointments', patientController.bookAppointment); 
// NEW: Allow patient to cancel before doctor responds
router.put('/appointments/:appointmentId/cancel', patientController.cancelAppointment); 

// --- PHASE 2: PAYMENT & CONFIRMATION ---
// NEW: Pay the consultation fee to move from 'pay_now_consultation' to 'confirmed'
router.post('/appointments/:appointmentId/pay', patientController.payConsultationFee); 
router.get('/appointments', patientController.getMyAppointments);

// --- PHASE 4 & 5: LAB TESTS & RECORDS ---
router.get('/lab-suggestions', patientController.getLabSuggestions);
// Handles both 'pay' and 'reject' actions in the request body
router.put('/lab-suggestions/:requestId', patientController.respondToLabTest);

router.get('/prescriptions', patientController.getPrescriptions);

module.exports = router;