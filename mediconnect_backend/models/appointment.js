'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // An Appointment belongs to a specific Doctor, Patient, and Nurse
      Appointment.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
      Appointment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
      Appointment.belongsTo(models.Nurse, { foreignKey: 'nurseId', as: 'nurse' });

      // An Appointment can have multiple Prescriptions and Lab Results
      Appointment.hasMany(models.Prescription, { foreignKey: 'appointmentId', as: 'prescriptions' });
      Appointment.hasMany(models.LabResult, { foreignKey: 'appointmentId', as: 'labResults' });

      // An Appointment has one Bill
      Appointment.hasOne(models.Bill, { foreignKey: 'appointmentId', as: 'bill' });
    }
  }
  Appointment.init({
    date: DataTypes.DATEONLY,
    time: DataTypes.TIME,
    status: DataTypes.STRING,
    type: DataTypes.STRING,
    reason: DataTypes.TEXT,
    doctorId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    nurseId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};