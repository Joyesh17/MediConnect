const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes here require the user to be logged in AND have the 'admin' role
router.use(verifyToken);
router.use(authorizeRole('admin'));

// 1. User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// 2. Service/Lab Test Management
router.post('/lab-tests', adminController.addLabTest);

// 3. Dashboard Statistics
router.get('/stats', adminController.getStats);

module.exports = router;