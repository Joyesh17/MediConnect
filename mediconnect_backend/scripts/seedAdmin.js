const bcrypt = require('bcryptjs');
const db = require('../models');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@mediconnect.com';
  const plainPassword = process.env.ADMIN_PASSWORD || '123456';
  const name = process.env.ADMIN_NAME || 'System Admin';

  try {
    await db.sequelize.authenticate();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const [user, created] = await db.User.findOrCreate({
      where: { email },
      defaults: {
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      }
    });

    if (!created) {
      user.name = name;
      user.password = hashedPassword;
      user.role = 'admin';
      user.status = 'active';
      await user.save();
      console.log(`Admin already existed. Updated credentials for: ${email}`);
    } else {
      console.log(`Admin created successfully: ${email}`);
    }

    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    await db.sequelize.close();
    process.exit(1);
  }
}

seedAdmin();
