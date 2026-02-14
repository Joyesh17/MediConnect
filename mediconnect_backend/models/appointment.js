module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT // Upgraded from STRING to TEXT in case the patient writes a long symptom description
    },
    status: { 
      type: DataTypes.ENUM(
        'pending',                // 1. Patient booked, waiting for doctor
        'rejected_by_doctor',     // 2a. Doctor said no
        'cancelled_by_patient',   // 2b. Patient cancelled before doctor responded
        'pay_now_consultation',   // 3. Doctor accepted, waiting for patient to pay
        'confirmed',              // 4. Patient paid, waiting for doctor to assign nurse
        'completed'               // 5. Consultation is fully finished
      ), 
      defaultValue: 'pending' 
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid'
    },
    // Explicit Foreign Keys for clarity and database integrity
    patientId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    doctorId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    nurseId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL', // If a nurse leaves, we keep the appointment record
      allowNull: true
    }
  }, {
    tableName: 'appointments',
    timestamps: true
  });

  return Appointment;
};