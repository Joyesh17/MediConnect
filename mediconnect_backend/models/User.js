module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
      type: DataTypes.ENUM('admin', 'doctor', 'nurse', 'patient'), 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('pending', 'active', 'disabled'), 
      defaultValue: 'pending' 
    },
    phone: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATEONLY }
  });
  return User;
};