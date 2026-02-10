const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: Anyone can see the list of nurses
router.get('/', nurseController.getAllNurses);
router.get('/:id', nurseController.getNurseById);

// Admin Only: Create, Update, or Delete nurses
router.post('/', protect, admin, nurseController.createNurse);
router.put('/:id', protect, admin, nurseController.updateNurse);
router.delete('/:id', protect, admin, nurseController.deleteNurse);

module.exports = router;