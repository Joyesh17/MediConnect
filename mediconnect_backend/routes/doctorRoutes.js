const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import the guards

// Public Routes (Anyone can see)
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected Routes (Only logged-in Admins can do these)
router.post('/', protect, admin, doctorController.createDoctor);
router.put('/:id', protect, admin, doctorController.updateDoctor);
router.delete('/:id', protect, admin, doctorController.deleteDoctor);

module.exports = router;