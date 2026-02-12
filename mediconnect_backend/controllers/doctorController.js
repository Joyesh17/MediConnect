const db = require('../models');
const { User, DoctorDetails, NurseDetails, Appointment, LabRequest, LabTest, Prescription } = db;
const { Op } = require('sequelize');

// 1. Get Pending Appointment Requests
exports.getPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const requests = await Appointment.findAll({
      where: { doctorId, status: 'pending' },
      include: [{ model: User, as: 'patient', attributes: ['name', 'gender', 'dob'] }]
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// 2. Get Available Nurses for a specific time slot (Requirement 6.2)
exports.getAvailableNurses = async (req, res) => {
  try {
    const { date, time } = req.query;

    // Find nurses who already have an appointment at this time
    const busyNurses = await Appointment.findAll({
      where: { date, time, status: 'confirmed' },
      attributes: ['nurseId'],
      raw: true
    });
    const busyNurseIds = busyNurses.map(n => n.nurseId);

    // Get nurses who are 'active', 'available', and NOT in the busy list
    const availableNurses = await User.findAll({
      where: { 
        role: 'nurse', 
        status: 'active',
        id: { [Op.notIn]: busyNurseIds.length ? busyNurseIds : [0] }
      },
      attributes: ['id', 'name'],
      include: [{
        model: NurseDetails,
        where: { isAvailable: true },
        attributes: ['department']
      }]
    });

    res.status(200).json(availableNurses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nurses", error: error.message });
  }
};

// 3. Accept Appointment & Assign Nurse
exports.acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { nurseId } = req.body; // Doctor selects nurse from dropdown

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = 'confirmed';
    appointment.nurseId = nurseId;
    await appointment.save();

    res.status(200).json({ message: "Appointment confirmed and nurse assigned." });
  } catch (error) {
    res.status(500).json({ message: "Error accepting appointment", error: error.message });
  }
};

// 4. Create Digital Prescription & Suggest Lab Tests
exports.completeConsultation = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId, medications, instructions, diagnosis, labTests } = req.body;

    // Create Prescription
    await Prescription.create({
      appointmentId,
      medications,
      instructions,
      diagnosis
    }, { transaction });

    // If lab tests were suggested, create entries in LabRequest
    if (labTests && labTests.length > 0) {
      const labRequests = labTests.map(testId => ({
        appointmentId,
        testId,
        status: 'suggested'
      }));
      await LabRequest.bulkCreate(labRequests, { transaction });
    }

    // Mark Appointment as Completed
    await Appointment.update({ status: 'completed' }, { where: { id: appointmentId }, transaction });

    await transaction.commit();
    res.status(200).json({ message: "Consultation completed and records saved." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Error saving consultation", error: error.message });
  }
};