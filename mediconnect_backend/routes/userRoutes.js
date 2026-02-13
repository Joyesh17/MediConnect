const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: /api/users/doctors
// Middleware: verifyToken ensures security, but anyone logged in can view doctors
router.get('/doctors', verifyToken, userController.getActiveDoctors);

module.exports = router;