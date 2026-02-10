'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // A Bill belongs to an Appointment and a Patient
      Bill.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
      Bill.belongsTo(models.Patient, {
        foreignKey: 'patientId',
        as: 'patient'
      });
    }
  }
  Bill.init({
    amount: DataTypes.DECIMAL,
    date: DataTypes.DATEONLY,
    time: DataTypes.TIME,
    status: DataTypes.STRING,
    type: DataTypes.STRING,
    appointmentId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bill',
  });
  return Bill;
};