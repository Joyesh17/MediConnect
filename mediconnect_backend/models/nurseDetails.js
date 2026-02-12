module.exports = (sequelize, DataTypes) => {
  const NurseDetails = sequelize.define('NurseDetails', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    department: {
      type: DataTypes.STRING
    },
    salary: {
      type: DataTypes.FLOAT,
      defaultValue: 3000.00
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    } // "Busy/Available" toggle
  });
  return NurseDetails;
};