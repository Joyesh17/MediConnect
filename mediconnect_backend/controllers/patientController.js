const db = require('../models');
// Added Payment model to handle the financial tracking
const { User, DoctorDetails, Appointment, LabRequest, LabTest, Prescription, Payment } = db;
const { Op } = require('sequelize');

// --- PHASE 1: DISCOVERY & BOOKING ---

// 1. Search Doctors by Specialization or Name
exports.searchDoctors = async (req, res) => {
  try {
    const { specialization, name } = req.query;
    
    let userWhere = { role: 'doctor', status: 'active' };
    if (name) {
      userWhere.name = { [Op.like]: `%${name}%` }; 
    }

    const doctors = await User.findAll({
      where: userWhere,
      attributes: ['id', 'name', 'email', 'phone'],
      include: [{
        model: DoctorDetails,
        where: specialization ? { specialization } : {},
        // OPTIMAL: Now fetching 'degree' and 'consultationFee' for the Doctor Card
        attributes: ['specialization', 'degree', 'consultationFee', 'bio', 'isAvailable']
      }]
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Error searching doctors", error: error.message });
  }
};

// 2. Book an Appointment (Status defaults to 'pending')
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

// 3. Cancel an Appointment (Only allowed if still pending)
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findOne({ where: { id: appointmentId, patientId: req.user.id } });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== 'pending') return res.status(400).json({ message: "You can only cancel pending requests." });

    appointment.status = 'cancelled_by_patient';
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error("Cancel Error:", error);
    res.status(500).json({ message: "Error cancelling appointment", error: error.message });
  }
};


// --- PHASE 2: PAYMENT & CONFIRMATION ---

// 4. Pay Consultation Fee (Changes status to 'confirmed')
exports.payConsultationFee = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.id;

    // Find appointment and include the Doctor's fee
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, patientId },
      include: [{ model: User, as: 'doctor', include: [DoctorDetails] }]
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== 'pay_now_consultation') {
      return res.status(400).json({ message: "This appointment is not awaiting payment." });
    }

    const feeAmount = appointment.doctor.DoctorDetail.consultationFee;

    // 1. Log the money to the Doctor's account
    await Payment.create({
      patientId,
      appointmentId,
      amount: feeAmount,
      payee: 'doctor', // Identifies who gets the money
      status: 'completed'
    }, { transaction });

    // 2. Upgrade the appointment status
    appointment.status = 'confirmed';
    appointment.paymentStatus = 'paid';
    await appointment.save({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Payment successful. Appointment confirmed!" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
};

// 5. View All My Appointments
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


// --- PHASE 4 & 5: LAB TESTS & RECORDS ---

// 6. View Lab Test Suggestions
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
        { model: LabTest, attributes: ['name', 'fee', 'description'] }
      ]
    });
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lab suggestions", error: error.message });
  }
};

// 7. Respond to Lab Request (Pay or Reject)
exports.respondToLabTest = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'pay' or 'reject'
    const patientId = req.user.id;

    const labReq = await LabRequest.findOne({
      where: { id: requestId },
      include: [{ model: LabTest }] // Needed to get the test fee
    });

    if (!labReq) return res.status(404).json({ message: "Request not found" });
    if (labReq.status !== 'suggested') return res.status(400).json({ message: "This test has already been processed." });

    if (action === 'reject') {
      labReq.status = 'rejected_by_patient';
      await labReq.save({ transaction });
      await transaction.commit();
      return res.status(200).json({ message: "Lab test rejected." });
    } 
    
    if (action === 'pay') {
      // Log the money to the Hospital's account
      await Payment.create({
        patientId,
        appointmentId: labReq.appointmentId,
        amount: labReq.LabTest.fee,
        payee: 'hospital', 
        status: 'completed'
      }, { transaction });

      // Upgrade status so the Nurse can see it
      labReq.status = 'paid';
      await labReq.save({ transaction });
      await transaction.commit();
      return res.status(200).json({ message: "Payment successful. Nurse will be notified." });
    }

    return res.status(400).json({ message: "Invalid action. Use 'pay' or 'reject'." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Lab Test Response Error:", error);
    res.status(500).json({ message: "Error updating lab request", error: error.message });
  }
};

// 8. View Prescription History (Now includes lab results!)
exports.getPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;
    const records = await Prescription.findAll({
      include: [{
        model: Appointment,
        where: { patientId },
        include: [
          { model: User, as: 'doctor', attributes: ['name'] },
          { model: LabRequest, include: [LabTest] } // Brings the lab report into the prescription view
        ]
      }]
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
};