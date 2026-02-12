const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: /api/users/doctors
// Middleware: verifyToken (Checks if user is logged in), but NO verifyRole('admin')
router.get('/doctors', verifyToken, userController.getActiveDoctors);

module.exports = router;