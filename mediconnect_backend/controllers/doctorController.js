const db = require('../models');
// OPTIMAL: Added Payment to track doctor earnings
const { User, NurseDetails, Appointment, LabRequest, Prescription, Payment } = db;
const { Op } = require('sequelize');

// --- PHASE 1: DISCOVERY & ACCEPTANCE ---

// 1. Get Pending Appointment Requests for this specific Doctor
exports.getPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const requests = await Appointment.findAll({
      where: { doctorId, status: 'pending' },
      include: [{ model: User, as: 'patient', attributes: ['id', 'name', 'gender', 'dob'] }]
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// 2. Respond to Appointment (Accept or Reject)
exports.respondToAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({ where: { id: appointmentId, doctorId } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== 'pending') return res.status(400).json({ message: "Only pending appointments can be responded to." });

    if (action === 'accept') {
      appointment.status = 'pay_now_consultation'; // Pushes to Patient for payment
      await appointment.save();
      return res.status(200).json({ message: "Appointment accepted. Waiting for patient payment." });
    } else if (action === 'reject') {
      appointment.status = 'rejected_by_doctor';
      await appointment.save();
      return res.status(200).json({ message: "Appointment rejected." });
    }

    return res.status(400).json({ message: "Invalid action." });
  } catch (error) {
    res.status(500).json({ message: "Error responding to appointment", error: error.message });
  }
};

// --- PHASE 3: NURSE ASSIGNMENT & SCHEDULE ---

// 3. Get Appointments Awaiting Nurse Assignment (Patient has paid!)
exports.getAppointmentsAwaitingNurse = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.findAll({
      // Fetch only paid ('confirmed') appointments that don't have a nurse yet
      where: { doctorId, status: 'confirmed', nurseId: null },
      include: [{ model: User, as: 'patient', attributes: ['name'] }]
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching paid appointments", error: error.message });
  }
};

// 4. Get Available Nurses (Now supports Department Filtering!)
exports.getAvailableNurses = async (req, res) => {
  try {
    const { date, time, department } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Missing parameters: 'date' and 'time' are required." });
    }

    const busyNurses = await Appointment.findAll({
      where: { date, time, status: 'confirmed', nurseId: { [Op.ne]: null } },
      attributes: ['nurseId'],
      raw: true
    });
    const busyNurseIds = busyNurses.map(n => n.nurseId);

    // Apply department filter if the doctor provided one
    let nurseDetailsWhere = { isAvailable: true };
    if (department) nurseDetailsWhere.department = department;

    const availableNurses = await User.findAll({
      where: { 
        role: 'nurse', status: 'active',
        id: { [Op.notIn]: busyNurseIds.length ? busyNurseIds : [0] }
      },
      attributes: ['id', 'name'],
      include: [{
        model: NurseDetails,
        required: true, 
        where: nurseDetailsWhere,
        attributes: ['department']
      }]
    });

    res.status(200).json(availableNurses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nurses", error: error.message });
  }
};

// 5. Assign Nurse to Appointment
exports.assignNurse = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { nurseId } = req.body; 

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== 'confirmed') return res.status(400).json({ message: "Patient must pay before a nurse can be assigned." });

    appointment.nurseId = nurseId;
    await appointment.save();

    res.status(200).json({ message: "Nurse assigned successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error assigning nurse", error: error.message });
  }
};

// 6. Get Doctor's Schedule (Confirmed & Nurse Assigned)
exports.getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const schedule = await Appointment.findAll({
      where: { doctorId, status: 'confirmed', nurseId: { [Op.ne]: null } },
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


// --- PHASE 3 & 5: CONSULTATION & PRESCRIPTION ---

// 7. Initial Consultation: Write Diagnosis & Order Tests
exports.initialConsultation = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId, diagnosis, medications, instructions, labTests } = req.body;

    // Create the first draft of the prescription
    await Prescription.create({
      appointmentId, diagnosis, medications, instructions
    }, { transaction });

    // If lab tests were suggested, push them to the patient for payment
    if (labTests && labTests.length > 0) {
      const labRequests = labTests.map(testId => ({
        appointmentId, testId, status: 'suggested'
      }));
      await LabRequest.bulkCreate(labRequests, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: "Initial checkup complete. Lab tests suggested." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: "Error saving initial consultation", error: error.message });
  }
};

// 8. Finalize Consultation: Update Prescription & Complete Appointment
exports.finalizeConsultation = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId, finalMedications, finalInstructions } = req.body;

    const prescription = await Prescription.findOne({ where: { appointmentId } });
    if (!prescription) return res.status(404).json({ message: "Prescription record not found." });

    // Update the existing prescription with final details
    prescription.medications = finalMedications || prescription.medications;
    prescription.instructions = finalInstructions || prescription.instructions;
    await prescription.save({ transaction });

    // Officially close the appointment
    await Appointment.update(
      { status: 'completed' }, 
      { where: { id: appointmentId }, transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Consultation finalized and appointment completed." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: "Error finalizing consultation", error: error.message });
  }
};

// --- DOCTOR EARNINGS ---

// 9. Get Total Doctor Earnings
exports.getEarnings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Find all completed payments mapped to this specific doctor's appointments
    const appointments = await Appointment.findAll({
      where: { doctorId },
      attributes: ['id']
    });
    const appointmentIds = appointments.map(a => a.id);

    const totalEarnings = await Payment.sum('amount', {
      where: { 
        appointmentId: { [Op.in]: appointmentIds }, 
        payee: 'doctor', 
        status: 'completed' 
      }
    });

    res.status(200).json({ earnings: totalEarnings || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error calculating earnings", error: error.message });
  }
};