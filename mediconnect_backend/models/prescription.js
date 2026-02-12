module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    medications: {
      type: DataTypes.TEXT,
      allowNull: false
    }, // Stores medicine details as a long string or JSON
    instructions: {
      type: DataTypes.TEXT
    },
    diagnosis: {
      type: DataTypes.STRING
    }
  });
  return Prescription;
};