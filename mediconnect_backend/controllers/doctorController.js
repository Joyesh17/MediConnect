const db = require('../models');
const { User, NurseDetails, Appointment, LabRequest, Prescription } = db;
const { Op } = require('sequelize');

// 1. Get Pending Appointment Requests for this specific Doctor
exports.getPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const requests = await Appointment.findAll({
      where: { doctorId, status: 'pending' },
      include: [{ 
        model: User, 
        as: 'patient', 
        attributes: ['id', 'name', 'gender', 'dob'] 
      }]
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// 2. Get Available Nurses for a specific time slot
exports.getAvailableNurses = async (req, res) => {
  try {
    const { date, time } = req.query;

    // OPTIMAL: Input Validation to prevent server crashes
    if (!date || !time) {
      return res.status(400).json({ 
        message: "Missing parameters: 'date' and 'time' are required to find available nurses." 
      });
    }

    // Find nurses who are already assigned to a 'confirmed' appointment at this specific time
    const busyNurses = await Appointment.findAll({
      where: { date, time, status: 'confirmed', nurseId: { [Op.ne]: null } },
      attributes: ['nurseId'],
      raw: true
    });
    const busyNurseIds = busyNurses.map(n => n.nurseId);

    // Get nurses who are 'active' and NOT in the busy list
    const availableNurses = await User.findAll({
      where: { 
        role: 'nurse', 
        status: 'active',
        id: { [Op.notIn]: busyNurseIds.length ? busyNurseIds : [0] }
      },
      attributes: ['id', 'name'],
      include: [{
        model: NurseDetails,
        required: true, // INNER JOIN: Ensures we only fetch nurses with a complete profile
        where: { isAvailable: true },
        attributes: ['department']
      }]
    });

    res.status(200).json(availableNurses);
  } catch (error) {
    console.error("Fetch Nurses Error:", error);
    res.status(500).json({ message: "Error fetching nurses", error: error.message });
  }
};

// 3. Accept Appointment & Assign Nurse
exports.acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { nurseId } = req.body; 

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Update the appointment status and link the nurse
    appointment.status = 'confirmed';
    appointment.nurseId = nurseId;
    await appointment.save();

    res.status(200).json({ message: "Appointment confirmed and nurse assigned." });
  } catch (error) {
    console.error("Accept Appointment Error:", error);
    res.status(500).json({ message: "Error accepting appointment", error: error.message });
  }
};

// 4. Create Digital Prescription & Suggest Lab Tests
exports.completeConsultation = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId, medications, instructions, diagnosis, labTests } = req.body;

    // 1. Create Prescription record
    await Prescription.create({
      appointmentId,
      medications,
      instructions,
      diagnosis
    }, { transaction });

    // 2. If lab tests were suggested, create entries in LabRequest
    if (labTests && labTests.length > 0) {
      const labRequests = labTests.map(testId => ({
        appointmentId,
        testId,
        status: 'suggested'
      }));
      await LabRequest.bulkCreate(labRequests, { transaction });
    }

    // 3. Mark Appointment as Completed
    await Appointment.update(
      { status: 'completed' }, 
      { where: { id: appointmentId }, transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Consultation completed and records saved." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Complete Consultation Error:", error);
    res.status(500).json({ message: "Error saving consultation", error: error.message });
  }
};

// 5. Get Doctor's Schedule/Upcoming Appointments
exports.getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const schedule = await Appointment.findAll({
      where: { doctorId, status: 'confirmed' },
      include: [
        { model: User, as: 'patient', attributes: ['name'] },
        { model: User, as: 'nurse', attributes: ['name'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedule", error: error.message });
  }
};