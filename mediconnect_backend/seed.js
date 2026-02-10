const db = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    // 1. Reset Database
    await db.sequelize.sync({ force: true }); 

    // 2. Create Users (Admin, Doctor, Patient, Nurse)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt); // Password is '123456'

    await db.User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    await db.User.create({
      username: 'doctor',
      email: 'doctor@example.com',
      password: hashedPassword,
      role: 'doctor'
    });

    await db.User.create({
      username: 'patient',
      email: 'patient@example.com',
      password: hashedPassword,
      role: 'patient'
    });
    
    await db.User.create({
      username: 'nurse',
      email: 'nurse@example.com',
      password: hashedPassword,
      role: 'nurse'
    });

    console.log('Users created with password "123456"');

    // 3. Create Doctors
    const doctor1 = await db.Doctor.create({
      name: 'Dr. Rashed Khan',
      specialization: 'Cardiology',
      email: 'rashed@example.com',
      phone: '01700000001',
      schedule: 'Mon-Fri 9am-5pm'
    });

    // 4. Create Patients
    const patient1 = await db.Patient.create({
      name: 'Rahim Uddin',
      email: 'rahim@example.com',
      phone: '01800000001',
      dob: '1985-06-15'
    });

    // 5. Create Nurses (ADDED THIS BACK)
    const nurse1 = await db.Nurse.create({
      name: 'Sister Mary',
      email: 'mary@example.com',
      phone: '01900000001',
      dob: '1992-03-10'
    });

    // 6. Create Appointments
    await db.Appointment.create({
      date: '2023-10-25',
      time: '10:00:00',
      status: 'Scheduled',
      type: 'Checkup',
      reason: 'Chest pain',
      doctorId: doctor1.id,
      patientId: patient1.id,
      nurseId: nurse1.id
    });

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seed();