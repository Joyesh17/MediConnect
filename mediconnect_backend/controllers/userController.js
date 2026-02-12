const { User, DoctorDetails } = require('../models');

// Get only Active Doctors for the Patient Dashboard
exports.getActiveDoctors = async (req, res) => {
    try {
        // Using Sequelize to find all users with role 'doctor' and status 'active'
        const doctors = await User.findAll({
            where: {
                role: 'doctor',
                status: 'active'
            },
            attributes: ['id', 'name', 'email', 'status'], // User table fields
            include: [{
                model: DoctorDetails,
                attributes: ['specialization', 'consultationFee', 'bio', 'isAvailable'] // DoctorDetails table fields
            }]
        });

        // Map the results to make the frontend's job easier
        // This flattens the specialization so it looks like it did before
        const formattedDoctors = doctors.map(doc => ({
            id: doc.id,
            name: doc.name,
            email: doc.email,
            status: doc.status,
            specialization: doc.DoctorDetail ? doc.DoctorDetail.specialization : 'General',
            consultationFee: doc.DoctorDetail ? doc.DoctorDetail.consultationFee : 0,
            isAvailable: doc.DoctorDetail ? doc.DoctorDetail.isAvailable : false
        }));

        res.status(200).json(formattedDoctors);
    } catch (error) {
        console.error("Sequelize error:", error);
        res.status(500).json({ 
            message: "Error fetching doctors", 
            error: error.message 
        });
    }
};