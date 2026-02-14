const db = require('../models');
// OPTIMAL: Added Payment model to track Hospital revenue
const { User, LabTest, Payment } = db;
const { Op } = require('sequelize');

// --- 1. USER MANAGEMENT ---

// 1. Get All Pending Staff (Doctors/Nurses awaiting approval)
exports.getPendingApprovals = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { status: 'pending' },
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error("Admin Pending Approvals Error:", error);
    res.status(500).json({ message: "Error fetching pending approvals", error: error.message });
  }
};

// 2. Approve or Reject Staff Account
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' or 'disabled'

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

// 3. Get All Users (For User Management Table)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin GetAllUsers Error:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


// --- 2. LAB TEST CATALOG MANAGEMENT ---

// 4. Get All Lab Tests (Admin View)
exports.getLabTests = async (req, res) => {
  try {
    const tests = await LabTest.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lab tests", error: error.message });
  }
};

// 5. Add New Lab Test
exports.addLabTest = async (req, res) => {
  try {
    // OPTIMAL: Changed 'price' to 'fee' to match our upgraded Database Model
    const { name, description, fee } = req.body;
    const newTest = await LabTest.create({ name, description, fee });
    res.status(201).json({ message: "Lab test added to catalog", newTest });
  } catch (error) {
    res.status(500).json({ message: "Error adding lab test", error: error.message });
  }
};

// 6. Update Existing Lab Test (Price changes, activation/deactivation)
exports.updateLabTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { name, description, fee, status } = req.body;

    const test = await LabTest.findByPk(testId);
    if (!test) return res.status(404).json({ message: "Lab test not found." });

    // Update only the provided fields
    if (name) test.name = name;
    if (description) test.description = description;
    if (fee !== undefined) test.fee = fee;
    if (status) test.status = status;

    await test.save();
    res.status(200).json({ message: "Lab test updated successfully.", test });
  } catch (error) {
    res.status(500).json({ message: "Error updating lab test", error: error.message });
  }
};


// --- 3. SYSTEM STATISTICS & REVENUE ---

// 7. System Statistics (Dashboard Summary)
exports.getStats = async (req, res) => {
  try {
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalNurses = await User.count({ where: { role: 'nurse' } });
    
    res.status(200).json({
      patients: totalPatients,
      doctors: totalDoctors,
      nurses: totalNurses
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};

// 8. Hospital Earnings (Total revenue from Lab Tests)
exports.getHospitalEarnings = async (req, res) => {
  try {
    // Sum all completed payments where the payee is 'hospital'
    const totalEarnings = await Payment.sum('amount', {
      where: { payee: 'hospital', status: 'completed' }
    });

    res.status(200).json({ earnings: totalEarnings || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching hospital earnings", error: error.message });
  }
};