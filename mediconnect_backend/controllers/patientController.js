const db = require('../models');
const { User, DoctorDetails, Appointment, LabRequest, LabTest, Prescription } = db;
const { Op } = require('sequelize');

// 1. Search Doctors by Specialization or Name
exports.searchDoctors = async (req, res) => {
  try {
    const { specialization, name } = req.query;
    
    let userWhere = { role: 'doctor', status: 'active' };
    if (name) {
      userWhere.name = { [Op.like]: `%${name}%` }; // Partial name search
    }

    const doctors = await User.findAll({
      where: userWhere,
      attributes: ['id', 'name', 'email', 'phone'],
      include: [{
        model: DoctorDetails,
        where: specialization ? { specialization } : {},
        attributes: ['specialization', 'consultationFee', 'bio', 'isAvailable']
      }]
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Error searching doctors", error: error.message });
  }
};

// 2. Book an Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user.id;

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason,
      status: 'pending' 
    });

    res.status(201).json({ message: "Appointment requested successfully", appointment });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
};

// 3. View All My Appointments (History & Upcoming)
exports.getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.findAll({
      where: { patientId },
      include: [
        { model: User, as: 'doctor', attributes: ['name'] },
        { model: User, as: 'nurse', attributes: ['name'] }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// 4. View Lab Test Suggestions & Accept/Reject
exports.getLabSuggestions = async (req, res) => {
  try {
    const patientId = req.user.id;
    const suggestions = await LabRequest.findAll({
      include: [
        {
          model: Appointment,
          where: { patientId },
          attributes: ['date'],
          include: [{ model: User, as: 'doctor', attributes: ['name'] }]
        },
        { model: LabTest }
      ],
      where: { status: 'suggested' }
    });
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lab suggestions", error: error.message });
  }
};

// 5. Respond to Lab Request (Accept/Reject)
exports.respondToLabTest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accepted' or 'rejected'

    const labReq = await LabRequest.findByPk(requestId);
    if (!labReq) return res.status(404).json({ message: "Request not found" });

    labReq.status = action;
    await labReq.save();

    res.status(200).json({ message: `Lab test ${action}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating lab request", error: error.message });
  }
};

// 6. View Prescription History
exports.getPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;
    const records = await Prescription.findAll({
      include: [{
        model: Appointment,
        where: { patientId },
        include: [{ model: User, as: 'doctor', attributes: ['name'] }]
      }]
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
};