MediConnect is a full-stack hospital management system built to streamline interactions between patients, doctors, nurses, and administrators. This web application facilitates role-based access, appointment scheduling, medical record tracking, and lab test management.

*Note:* This application was developed as a university Web Engineering lab project.

## 🚀 Features

* *Multi-Role Dashboards:* Secure, dedicated interfaces for Patients, Doctors, Nurses, and Admins.
* *Appointment Management:* Complete booking lifecycle from scheduling to doctor approval and payment verification.
* *Medical Records:* Centralized tracking of patient prescriptions, diagnoses, and doctor instructions.
* *Lab Test Integration:* Doctors can suggest lab tests, patients can approve/pay for them, and nurses can upload the final results.
* *Secure Authentication:* JWT-based session management and encrypted passwords.

## 💻 Tech Stack

*Frontend*
* React.js
* React Router DOM
* Axios (API Client)
* Lucide React (Icons)
* Pure Inline CSS (No external frameworks)

*Backend*
* Node.js
* Express.js
* JSON Web Tokens (JWT) & Bcrypt

*Database*
* MySQL
* Sequelize ORM

## 🛠️ Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) installed and running

### 1. Database Configuration
1. Open your MySQL client and create a new database:
   CREATE DATABASE mediconnect_db;

### 2. Backend Setup
1. Navigate to the backend directory:
   cd mediconnect_backend
2. Install dependencies:
   npm install
3. Create a .env file in the backend root directory and add your credentials:
   
   > PORT=5000
   > DB_HOST=127.0.0.1
   > DB_USER=root
   > DB_PASSWORD=your_mysql_password
   > DB_NAME=mediconnect_db
   > JWT_SECRET=your_super_secret_key

4. Start the server (Sequelize will automatically sync and create the tables):
   node server.js

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   cd mediconnect_frontend
2. Install dependencies:
   npm install
3. Start the React development server:
   npm start
4. Open http://localhost:3000 in your browser.

## 📝 License
This project is created for educational purposes.
