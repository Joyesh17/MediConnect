'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LabResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // A Lab Result is linked to an Appointment and a Patient
      LabResult.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
      LabResult.belongsTo(models.Patient, {
        foreignKey: 'patientId',
        as: 'patient'
      });
    }
  }
  LabResult.init({
    testName: DataTypes.STRING,
    result: DataTypes.TEXT,
    date: DataTypes.DATEONLY,
    appointmentId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LabResult',
  });
  return LabResult;
};