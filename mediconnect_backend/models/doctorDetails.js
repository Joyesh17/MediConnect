module.exports = (sequelize, DataTypes) => {
  const DoctorDetails = sequelize.define('DoctorDetails', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    specialization: { type: DataTypes.STRING, allowNull: false },
    consultationFee: { type: DataTypes.FLOAT, defaultValue: 50.00 },
    bio: { type: DataTypes.TEXT },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
  return DoctorDetails;
};