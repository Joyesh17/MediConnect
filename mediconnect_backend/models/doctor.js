'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
        static associate(models) {
      // A Doctor has many Appointments
      Doctor.hasMany(models.Appointment, {
        foreignKey: 'doctorId',
        as: 'appointments'
      });

      // A Doctor writes many Prescriptions
      Doctor.hasMany(models.Prescription, {
        foreignKey: 'doctorId',
        as: 'prescriptions'
      });
    }
  }
  Doctor.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    specialization: DataTypes.STRING,
    dob: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Doctor',
  });
  return Doctor;
};