const db = require('../models');
const { User, Appointment, NurseDetails } = db;

// 1. Get Appointments Assigned to this Nurse
exports.getAssignedAppointments = async (req, res) => {
  try {
    const nurseId = req.user.id;
    const appointments = await Appointment.findAll({
      where: { nurseId, status: 'confirmed' },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'gender', 'dob'] },
        { model: User, as: 'doctor', attributes: ['name'] }
      ]
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned tasks", error: error.message });
  }
};

// 2. Record Patient Vitals (Requirement 6.3)
exports.recordVitals = async (req, res) => {
  try {
    const { appointmentId, bloodPressure, heartRate, temperature, weight } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Save vitals into the appointment record
    appointment.vitals = {
      bloodPressure,
      heartRate,
      temperature,
      weight,
      recordedAt: new Date()
    };
    
    // Once vitals are recorded, the patient is ready for the doctor
    await appointment.save();

    res.status(200).json({ message: "Vitals recorded successfully. Patient is ready." });
  } catch (error) {
    res.status(500).json({ message: "Error recording vitals", error: error.message });
  }
};

// 3. Update Availability Status
exports.toggleAvailability = async (req, res) => {
  try {
    const nurseId = req.user.id;
    const { isAvailable } = req.body;

    await NurseDetails.update(
      { isAvailable },
      { where: { userId: nurseId } }
    );

    res.status(200).json({ message: `Availability updated to ${isAvailable}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error: error.message });
  }
};