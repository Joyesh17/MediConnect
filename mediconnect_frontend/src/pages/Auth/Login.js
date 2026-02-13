import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { LogIn, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // OPTIMAL: Prevents multiple clicks
    const navigate = useNavigate();

    // OPTIMAL: Clear any lingering sessions if the user navigates back to the login page
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/login', { email, password });
            
            // Save token and user info safely to the browser
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect based on the authenticated user's role
            const role = response.data.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'doctor') navigate('/doctor');
            else if (role === 'patient') navigate('/patient');
            else if (role === 'nurse') navigate('/nurse');
            else throw new Error("Unknown user role");
            
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
            setLoading(false); // Re-enable the button so they can try again
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', background: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ display: 'inline-flex', padding: '15px', background: '#eff6ff', borderRadius: '50%', marginBottom: '10px' }}>
                    <LogIn size={40} color="#2563eb" />
                </div>
                <h2 style={{ margin: 0, color: '#1f2937' }}>MediConnect Login</h2>
                <p style={{ color: '#6b7280', margin: '5px 0 0 0', fontSize: '14px' }}>Welcome back! Please enter your details.</p>
            </div>
            
            {error && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #fecaca' }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email</label>
                    <input 
                        type="email" 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' }}
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>
                
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Password</label>
                    <input 
                        type="password" 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' }}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={loading}
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', padding: '12px', background: loading ? '#93c5fd' : '#2563eb', 
                        color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', 
                        fontSize: '16px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : 'Login'}
                </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>
                Don't have an account? <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
            </div>
        </div>
    );
};

export default Login;