import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', 
        gender: 'Male', dob: '', role: 'patient',
        specialization: '', department: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData);
            alert("Registration Successful! Please Login.");
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.message || "Registration Failed");
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <UserPlus size={40} color="#2563eb" />
                <h2>Create Account</h2>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '15px' }}>
                <input name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '10px' }} />
                <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '10px' }} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input name="phone" placeholder="Phone Number" onChange={handleChange} required style={{ padding: '10px' }} />
                    <select name="gender" onChange={handleChange} style={{ padding: '10px' }}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <input name="dob" type="date" onChange={handleChange} required style={{ padding: '10px' }} />

                <select name="role" onChange={handleChange} style={{ padding: '10px', background: '#f0f9ff' }}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                </select>

                {/* Conditional Fields */}
                {formData.role === 'doctor' && (
                    <input name="specialization" placeholder="Specialization (e.g. Cardiology)" onChange={handleChange} required style={{ padding: '10px', borderColor: '#2563eb' }} />
                )}
                {formData.role === 'nurse' && (
                    <input name="department" placeholder="Department (e.g. Pediatrics)" onChange={handleChange} required style={{ padding: '10px', borderColor: '#db2777' }} />
                )}

                <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                    Register
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account? <Link to="/login" style={{ color: '#2563eb' }}>Login here</Link>
            </p>
        </div>
    );
};

export default Register;