const db = require('../models');
const { User, DoctorDetails, Appointment, LabRequest, LabTest, Prescription } = db;

// 1. Search Doctors by Specialization
exports.searchDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    let whereClause = { role: 'doctor', status: 'active' };

    const doctors = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email'],
      include: [{
        model: DoctorDetails,
        where: specialization ? { specialization } : {},
        attributes: ['specialization', 'consultationFee', 'bio']
      }]
    });

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error searching doctors", error: error.message });
  }
};

// 2. Book an Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user.id; // From Middleware

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason,
      status: 'pending' // Requirement: Initially pending
    });

    res.status(201).json({ message: "Appointment requested successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
};

// 3. View Lab Test Suggestions & Accept/Reject
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

// 4. View Prescription History
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