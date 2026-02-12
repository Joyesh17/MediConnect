import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, User } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '15px 30px', 
            backgroundColor: '#ffffff', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        }}>
            {/* Logo Section */}
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={24} /> MediConnect
                </Link>
            </div>

            {/* Links Section */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {!token ? (
                    // Show these if NOT logged in
                    <>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>Login</Link>
                        <Link to="/register" style={{ 
                            padding: '8px 16px', 
                            backgroundColor: '#2563eb', 
                            color: 'white', 
                            borderRadius: '4px', 
                            textDecoration: 'none' 
                        }}>
                            Register
                        </Link>
                    </>
                ) : (
                    // Show these if LOGGED IN
                    <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4b5563' }}>
                            <User size={18} /> Hi, {user?.name || 'User'}
                        </span>
                        
                        {/* Dynamic Dashboard Link based on Role */}
                        <Link to={`/${user?.role || 'dashboard'}`} style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '600' }}>
                            Dashboard
                        </Link>

                        <button onClick={handleLogout} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            background: 'none', 
                            border: '1px solid #dc2626', 
                            color: '#dc2626', 
                            padding: '6px 12px', 
                            borderRadius: '4px', 
                            cursor: 'pointer' 
                        }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;