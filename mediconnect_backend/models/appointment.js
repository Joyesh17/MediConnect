module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING
    },
    status: { 
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), 
      defaultValue: 'pending' 
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid'
    }
    // Note: patientId, doctorId, nurseId are added automatically by index.js
  });
  return Appointment;
};