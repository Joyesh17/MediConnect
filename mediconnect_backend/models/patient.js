'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // Patient has many Appointments
      Patient.hasMany(models.Appointment, {
        foreignKey: 'patientId',
        as: 'appointments'
      });
      
      // Patient has received many Prescriptions
      Patient.hasMany(models.Prescription, {
        foreignKey: 'patientId',
        as: 'prescriptions'
      });

      // Patient has many Bills
      Patient.hasMany(models.Bill, {
        foreignKey: 'patientId',
        as: 'bills'
      });

      // Patient has many Lab Results
      Patient.hasMany(models.LabResult, {
        foreignKey: 'patientId',
        as: 'labResults'
      });
    }
  }
  Patient.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    dob: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};