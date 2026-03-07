const db = require('../models');
const { User, NurseDetails, Appointment, LabRequest, LabTest, Prescription, Payment } = db;
const { Op } = require('sequelize');

// --- PHASE 1: DISCOVERY & ACCEPTANCE ---
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

exports.respondToAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { action } = req.body; 
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({ where: { id: appointmentId, doctorId } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== 'pending') return res.status(400).json({ message: "Only pending appointments can be responded to." });

    if (action === 'accept') {
      appointment.status = 'pay_now_consultation'; 
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
exports.getAppointmentsAwaitingNurse = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.findAll({
      where: { doctorId, status: 'confirmed', nurseId: null },
      include: [{ model: User, as: 'patient', attributes: ['name'] }]
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching paid appointments", error: error.message });
  }
};

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

exports.getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const schedule = await Appointment.findAll({
      where: { doctorId, status: 'confirmed', nurseId: { [Op.ne]: null } },
      include: [
        { model: User, as: 'patient', attributes: ['name'] },
        { model: User, as: 'nurse', attributes: ['name'] },
        { model: Prescription }, 
        { model: LabRequest, include: [{ model: LabTest }] } 
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedule", error: error.message });
  }
};

// --- PHASE 3 & 5: CONSULTATION & PRESCRIPTION ---
exports.initialConsultation = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId, diagnosis, medications, instructions, labTests } = req.body;

    const [prescription, created] = await Prescription.findOrCreate({
      where: { appointmentId },
      defaults: { diagnosis, medications, instructions },
      transaction
    });

    if (!created) {
      prescription.diagnosis = diagnosis;
      prescription.instructions = instructions;
      prescription.medications = medications;
      await prescription.save({ transaction });
    }

    if (labTests && labTests.length > 0) {
      const labRequests = labTests.map(id => ({
        appointmentId: appointmentId,
        AppointmentId: appointmentId,
        testId: id,          
        LabTestId: id,       
        labTestId: id,       
        status: 'suggested'
      }));
      await LabRequest.bulkCreate(labRequests, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: "Initial checkup complete. Lab tests ordered." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Consultation Error:", error);
    res.status(500).json({ message: "Error saving initial consultation", error: error.message });
  }
};

exports.finalizeConsultation = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId, finalMedications, finalInstructions } = req.body;

    const prescription = await Prescription.findOne({ where: { appointmentId } });
    if (!prescription) return res.status(404).json({ message: "Prescription record not found." });

    prescription.medications = finalMedications || prescription.medications;
    prescription.instructions = finalInstructions || prescription.instructions;
    await prescription.save({ transaction });

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

// --- HISTORY & EARNINGS ---
exports.getEarnings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const appointments = await Appointment.findAll({
      where: { doctorId },
      attributes: ['id']
    });
    const appointmentIds = appointments.map(a => a.id);

    if (appointmentIds.length === 0) {
        return res.status(200).json({ earnings: 0 });
    }

    const totalEarnings = await Payment.sum('amount', {
      where: { 
        appointmentId: { [Op.in]: appointmentIds }, 
        payee: 'doctor', 
        status: 'completed' 
      }
    });

    res.status(200).json({ earnings: totalEarnings || 0 });
  } catch (error) {
    console.error("Earnings Error:", error);
    res.status(500).json({ message: "Error calculating earnings", error: error.message });
  }
};

exports.getConsultationHistory = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const history = await Appointment.findAll({
      where: { doctorId, status: 'completed' },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'gender', 'dob'] },
        { model: Prescription },
        { model: LabRequest, include: [{ model: LabTest }] }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};