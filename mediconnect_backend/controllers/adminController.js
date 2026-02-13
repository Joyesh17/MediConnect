const db = require('../models');
const { User, LabTest } = db;

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

// 3. Manage Lab Test Catalog (Add New Test)
exports.addLabTest = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newTest = await LabTest.create({ name, description, price });
    res.status(201).json({ message: "Lab test added to catalog", newTest });
  } catch (error) {
    res.status(500).json({ message: "Error adding lab test", error: error.message });
  }
};

// 4. System Statistics (Dashboard Summary)
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

// 5. Get All Users (For User Management Table)
exports.getAllUsers = async (req, res) => {
  try {
    console.log("Admin Request: Fetching all users...");
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Successfully found ${users.length} users.`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin GetAllUsers Error:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};