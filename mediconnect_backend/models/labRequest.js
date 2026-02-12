module.exports = (sequelize, DataTypes) => {
  const LabRequest = sequelize.define('LabRequest', {
    status: { 
      type: DataTypes.ENUM('suggested', 'accepted', 'rejected', 'completed'), 
      defaultValue: 'suggested' 
    },
    result: {
      type: DataTypes.TEXT
    }, // Nurse uploads text result here
    doctorNote: {
      type: DataTypes.STRING
    } // Note from doctor
  });
  return LabRequest;
};