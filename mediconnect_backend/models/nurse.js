'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Nurse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // Nurse assists many Appointments
      Nurse.hasMany(models.Appointment, {
        foreignKey: 'nurseId',
        as: 'appointments'
      });
    }
  }
  Nurse.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    dob: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Nurse',
  });
  return Nurse;
};