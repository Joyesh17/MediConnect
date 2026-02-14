const db = require('../models');
const { User, Appointment, LabRequest, LabTest } = db;
const { Op } = require('sequelize');

// --- PHASE 3: NURSE ASSIGNMENT ---

// 1. Get Appointments assigned to this specific Nurse
exports.getAssignedAppointments = async (req, res) => {
  try {
    const nurseId = req.user.id;
    // Fetches 'confirmed' appointments (meaning the patient paid the consultation fee and doctor assigned the nurse)
    const assignments = await Appointment.findAll({
      where: { nurseId, status: 'confirmed' },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'gender', 'dob', 'phone'] },
        { model: User, as: 'doctor', attributes: ['name'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned tasks", error: error.message });
  }
};

// --- PHASE 4 & 5: LAB TESTS & RESULTS ---

// 2. Get Lab Requests for an Appointment (Filters out unpaid/rejected tests)
exports.getLabRequestsForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const requests = await LabRequest.findAll({
      where: { 
        appointmentId,
        // OPTIMAL: Hide 'suggested' (unpaid) and 'rejected_by_patient' tests from the Nurse's queue
        status: { [Op.in]: ['paid', 'completed'] } 
      },
      include: [{ model: LabTest, attributes: ['name', 'description'] }]
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lab requests", error: error.message });
  }
};

// 3. Update Lab Test Result (Nurse uploads the medical report)
exports.updateLabResult = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { result } = req.body; // The massive text findings/data

    const labRequest = await LabRequest.findByPk(requestId);
    if (!labRequest) return res.status(404).json({ message: "Lab request not found" });

    // OPTIMAL: Safety lock. Ensure the hospital was paid before the nurse can submit the work
    if (labRequest.status !== 'paid' && labRequest.status !== 'completed') {
        return res.status(400).json({ message: "Cannot upload results. This test has not been paid for by the patient yet." });
    }

    labRequest.result = result;
    labRequest.status = 'completed'; // Pushes status forward so doctor can write the final prescription
    await labRequest.save();

    res.status(200).json({ message: "Lab report uploaded successfully. Doctor can now write the final prescription." });
  } catch (error) {
    res.status(500).json({ message: "Error updating lab result", error: error.message });
  }
};

// --- DASHBOARD UTILITIES ---

// 4. Toggle Nurse Availability (For Dashboard Switch)
exports.toggleAvailability = async (req, res) => {
  try {
    const nurseId = req.user.id;
    const { isAvailable } = req.body;

    const nurseDetail = await db.NurseDetails.findOne({ where: { userId: nurseId } });
    if (!nurseDetail) return res.status(404).json({ message: "Nurse profile not found" });

    nurseDetail.isAvailable = isAvailable;
    await nurseDetail.save();

    res.status(200).json({ message: `Availability status updated to ${isAvailable}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error: error.message });
  }
};