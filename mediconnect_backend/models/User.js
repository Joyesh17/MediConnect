module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true,
      validate: { isEmail: true } 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    role: { 
      type: DataTypes.ENUM('admin', 'doctor', 'nurse', 'patient'), 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('pending', 'active', 'disabled'), 
      defaultValue: 'pending' 
    },
    phone: { 
      type: DataTypes.STRING 
    },
    gender: { 
      type: DataTypes.STRING 
    },
    dob: { 
      type: DataTypes.DATEONLY 
    }
  }, {
    tableName: 'users',
    timestamps: true // Essential for tracking when accounts were created/updated
  });

  return User;
};