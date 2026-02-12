const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

const { User, DoctorDetails, NurseDetails, sequelize } = db;

exports.register = async (req, res) => {
    // Start a Transaction
    const t = await sequelize.transaction();

    try {
        const { name, email, password, role, specialization, department, phone, gender, dob } = req.body;

        if (role === 'admin') {
            await t.rollback();
            return res.status(403).json({ 
                message: "Registration of Admin accounts is restricted for security reasons." 
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let userStatus = (role === 'patient') ? 'active' : 'pending';

        // 1. Create User within the transaction
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            status: userStatus,
            phone,
            gender,
            dob
        }, { transaction: t });

        // 2. Create Profile based on role within the same transaction
        if (role === 'doctor') {
            await DoctorDetails.create({ 
                userId: newUser.id, 
                specialization: specialization || 'General' 
            }, { transaction: t });
        } else if (role === 'nurse') {
            await NurseDetails.create({ 
                userId: newUser.id, 
                department: department || 'General' 
            }, { transaction: t });
        }

        // If everything is fine, commit the changes to DB
        await t.commit();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        // If any error occurs, undo all database changes made during this request
        if (t) await t.rollback();
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        if (user.status === 'pending') {
            return res.status(403).json({ message: "Account is pending approval. Please contact Admin." });
        }
        if (user.status === 'disabled') {
            return res.status(403).json({ message: "Account is disabled." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'SECRET_KEY', 
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
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};