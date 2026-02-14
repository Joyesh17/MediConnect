const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes here require the user to be logged in AND have the 'admin' role
router.use(verifyToken);
router.use(authorizeRole('admin'));

// --- 1. USER MANAGEMENT ---
router.get('/users/pending', adminController.getPendingApprovals); // Place specific routes before dynamic parameters!
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// --- 2. SERVICE / LAB TEST MANAGEMENT ---
router.get('/lab-tests', adminController.getLabTests); // View the catalog
router.post('/lab-tests', adminController.addLabTest); // Add a new test
router.put('/lab-tests/:testId', adminController.updateLabTest); // Edit a test's fee or status

// --- 3. DASHBOARD STATISTICS & REVENUE ---
router.get('/stats', adminController.getStats);
router.get('/earnings', adminController.getHospitalEarnings); // View hospital revenue

module.exports = router;