import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

const Home = () => {
    return (
        <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
            {/* Hero Section */}
            <header style={{ 
                backgroundColor: '#eff6ff', 
                padding: '80px 20px', 
                textAlign: 'center',
                borderBottom: '1px solid #dbeafe'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <HeartPulse size={64} color="#2563eb" />
                </div>
                <h1 style={{ fontSize: '3rem', color: '#1e3a8a', marginBottom: '10px' }}>MediConnect</h1>
                <p style={{ fontSize: '1.2rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 30px' }}>
                    Your trusted platform for seamless healthcare management. Connect with top doctors, manage appointments, and track your health records securely.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link to="/login" style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', 
                        textDecoration: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' 
                    }}>
                        <LogIn size={20} /> Login
                    </Link>
                    <Link to="/register" style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', backgroundColor: '#fff', color: '#2563eb', 
                        border: '1px solid #2563eb', textDecoration: 'none', borderRadius: '6px', 
                        fontSize: '1rem', fontWeight: 'bold' 
                    }}>
                        <UserPlus size={20} /> Register
                    </Link>
                </div>
            </header>

            {/* Features Section */}
            <section style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '40px' }}>Why Choose MediConnect?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                    
                    {/* Feature 1 */}
                    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#dbeafe', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                            <ShieldCheck color="#2563eb" />
                        </div>
                        <h3>Secure & Private</h3>
                        <p style={{ color: '#666' }}>Your medical data is encrypted and accessible only to authorized personnel.</p>
                    </div>

                    {/* Feature 2 */}
                    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#fce7f3', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                            <HeartPulse color="#db2777" />
                        </div>
                        <h3>Expert Care</h3>
                        <p style={{ color: '#666' }}>Connect with certified specialists and experienced nursing staff easily.</p>
                    </div>

                    {/* Feature 3 */}
                    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ background: '#dcfce7', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                            <UserPlus color="#16a34a" />
                        </div>
                        <h3>Easy Scheduling</h3>
                        <p style={{ color: '#666' }}>Book appointments online and track your consultation history in one place.</p>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '20px', textAlign: 'center', marginTop: '40px' }}>
                <p>&copy; 2026 MediConnect System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;