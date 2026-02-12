const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRole('nurse'));

router.get('/my-tasks', nurseController.getAssignedAppointments);
router.put('/record-vitals', nurseController.recordVitals);
router.put('/update-status', nurseController.toggleAvailability);

module.exports = router;