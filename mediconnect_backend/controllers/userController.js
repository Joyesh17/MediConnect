const { User, DoctorDetails } = require('../models');

// Get only Active Doctors for the Patient Dashboard
exports.getActiveDoctors = async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: {
        role: 'doctor',
        status: 'active'
      },
      attributes: ['id', 'name', 'email', 'status', 'phone'], // Added phone for patient contact
      include: [{
        model: DoctorDetails,
        required: true, // OPTIMAL: This ensures only doctors with a profile are returned (INNER JOIN)
        attributes: ['specialization', 'consultationFee', 'bio', 'isAvailable']
      }]
    });

    // Map and flatten results for the frontend
    const formattedDoctors = doctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      status: doc.status,
      // Sequelize uses the singular model name by default for the include property
      specialization: doc.DoctorDetail ? doc.DoctorDetail.specialization : 'N/A',
      consultationFee: doc.DoctorDetail ? doc.DoctorDetail.consultationFee : 0,
      bio: doc.DoctorDetail ? doc.DoctorDetail.bio : '',
      isAvailable: doc.DoctorDetail ? doc.DoctorDetail.isAvailable : false
    }));

    res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error("Sequelize error in getActiveDoctors:", error);
    res.status(500).json({ 
      message: "Error fetching doctors", 
      error: error.message 
    });
  }
};