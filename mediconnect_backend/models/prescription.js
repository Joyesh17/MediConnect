'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Prescription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // A Prescription belongs to an Appointment, a Doctor, and a Patient
      Prescription.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
      Prescription.belongsTo(models.Doctor, {
        foreignKey: 'doctorId',
        as: 'doctor'
      });
      Prescription.belongsTo(models.Patient, {
        foreignKey: 'patientId',
        as: 'patient'
      });
    }
  }
  Prescription.init({
    medication: DataTypes.TEXT,
    appointmentId: DataTypes.INTEGER,
    doctorId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Prescription',
  });
  return Prescription;
};