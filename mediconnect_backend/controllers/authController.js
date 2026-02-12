const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

const User = db.User;
const DoctorDetails = db.DoctorDetails;
const NurseDetails = db.NurseDetails;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, department, phone, gender, dob } = req.body;

    // 1. Security Check: Block public Admin registration
    if (role === 'admin') {
      return res.status(403).json({ 
        message: "Registration of Admin accounts is restricted for security reasons." 
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3. Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Set Status (Patients = Active, Staff = Pending)
    let userStatus = 'pending';
    if (role === 'patient') {
      userStatus = 'active';
    }

    // 5. Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: userStatus,
      phone,
      gender,
      dob
    });

    // 6. Create Specific Profile based on role
    if (role === 'doctor') {
      await DoctorDetails.create({ 
        userId: newUser.id, 
        specialization: specialization || 'General' 
      });
    } else if (role === 'nurse') {
      await NurseDetails.create({ 
        userId: newUser.id, 
        department: department || 'General' 
      });
    }

    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 3. Check Approval Status
    if (user.status === 'pending') {
      return res.status(403).json({ message: "Account is pending approval. Please contact Admin." });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ message: "Account is disabled." });
    }

    // 4. Generate Token (Using a simple secret for now)
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      'SECRET_KEY', 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};