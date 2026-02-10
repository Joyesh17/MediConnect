const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected: Logged-in users can view bills
router.get('/', protect, billController.getAllBills);
router.get('/:id', protect, billController.getBillById);

// Admin Only: Create, Update, or Delete bills
router.post('/', protect, admin, billController.createBill);
router.put('/:id', protect, admin, billController.updateBill);
router.delete('/:id', protect, admin, billController.deleteBill);

module.exports = router;