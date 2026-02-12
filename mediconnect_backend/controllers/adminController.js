const db = require('../models');
const User = db.User;
const LabTest = db.LabTest;

// 1. Get All Users (with filters for Role and Status)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let whereClause = {};

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] } // Security: Don't send passwords to frontend
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// 2. Approve or Reject a Doctor/Nurse
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' or 'disabled'

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Requirement: Admin cannot deactivate themselves
    if (user.id === req.user.id && status === 'disabled') {
      return res.status(400).json({ message: "You cannot deactivate your own admin account." });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

// 3. Add a New Lab Test Service
exports.addLabTest = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    const newTest = await LabTest.create({
      name,
      description,
      price,
      status: 'active'
    });

    res.status(201).json({ message: "Lab test service added!", test: newTest });
  } catch (error) {
    res.status(500).json({ message: "Error adding lab test", error: error.message });
  }
};

// 4. Get System Statistics (Requirement 3.1)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeDoctors = await User.count({ where: { role: 'doctor', status: 'active' } });
    const activeNurses = await User.count({ where: { role: 'nurse', status: 'active' } });
    const totalServices = await LabTest.count({ where: { status: 'active' } });

    res.status(200).json({
      totalUsers,
      activeDoctors,
      activeNurses,
      totalServices
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};