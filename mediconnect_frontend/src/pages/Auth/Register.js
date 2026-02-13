import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { UserPlus, Loader2 } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', 
        gender: 'Male', dob: '', role: 'patient',
        specialization: '', department: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear errors when the user starts typing again
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // 1. Password Validation: Ensure it's a "proper" password (e.g., min 6 chars)
        if (formData.password.length < 6) {
            return setError("Please provide a proper password containing at least 6 characters.");
        }

        // 2. BD Phone Number Validation: Exactly 11 digits, starting with '01'
        const bdPhoneRegex = /^01\d{9}$/;
        if (!bdPhoneRegex.test(formData.phone)) {
            return setError("Please provide a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX).");
        }

        setLoading(true);
        try {
            await API.post('/auth/register', formData);
            alert("Registration Successful! Please wait for Admin approval if you are staff.");
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || "Registration Failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', background: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', padding: '15px', background: '#eff6ff', borderRadius: '50%', marginBottom: '10px' }}>
                    <UserPlus size={32} color="#2563eb" />
                </div>
                <h2 style={{ margin: 0, color: '#1f2937' }}>Create Account</h2>
                <p style={{ color: '#6b7280', margin: '5px 0 0 0', fontSize: '14px' }}>Join MediConnect today.</p>
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '15px' }}>
                <input name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                
                <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                
                <input name="password" type="password" placeholder="Password (Min. 6 characters)" onChange={handleChange} required minLength="6" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <input name="phone" type="tel" placeholder="01XXXXXXXXX" onChange={handleChange} required maxLength="11" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <select name="gender" onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Date of Birth</label>
                    <input name="dob" type="date" onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Account Type</label>
                    <select name="role" onChange={handleChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', fontWeight: '500', color: '#1e3a8a' }}>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                    </select>
                </div>

                {/* Conditional Fields mapped directly to Database Schema */}
                {formData.role === 'doctor' && (
                    <input name="specialization" placeholder="Specialization (e.g. Cardiology)" onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2563eb', background: '#f8fafc' }} />
                )}
                {formData.role === 'nurse' && (
                    <input name="department" placeholder="Department (e.g. Pediatrics)" onChange={handleChange} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #db2777', background: '#fdf2f8' }} />
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ background: loading ? '#93c5fd' : '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : 'Register'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#4b5563' }}>
                Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>Login here</Link>
            </p>
        </div>
    );
};

export default Register;