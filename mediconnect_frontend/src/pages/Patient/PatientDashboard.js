import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Calendar, User, Stethoscope, X, Clock, FileText, Activity } from 'lucide-react';

const PatientDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]); // Added state for patient's schedule
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');     // Added Time
    const [bookingReason, setBookingReason] = useState(''); // Added Reason

    const fetchData = async () => {
        try {
            // Fetch both doctors and the patient's existing appointments in parallel
            const [docsRes, apptsRes] = await Promise.all([
                API.get('/users/doctors'),
                API.get('/patient/appointments') // The optimal route we added earlier
            ]);
            setDoctors(docsRes.data);
            setMyAppointments(apptsRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!bookingDate || !bookingTime || !bookingReason) {
            return alert("Please fill in all fields (Date, Time, Reason)");
        }

        try {
            // Updated route to match backend exactly
            await API.post('/patient/appointments', {
                doctorId: selectedDoctor.id,
                date: bookingDate,
                time: bookingTime,
                reason: bookingReason
            });
            alert("Appointment Booked Successfully!");
            
            // Close modal and reset form
            setSelectedDoctor(null); 
            setBookingDate(''); 
            setBookingTime('');
            setBookingReason('');
            
            // Refresh dashboard to show the new pending appointment
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Booking Failed");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <Stethoscope size={32} color="#7c3aed" />
                <h1>Patient Portal</h1>
            </div>

            {/* Split layout: Doctors on left, My Appointments on right */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* Left Side: Available Doctors */}
                <div>
                    <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>Available Specialists</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {doctors.map(doc => (
                            <div key={doc.id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', background: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '50%' }}>
                                        <User size={24} color="#7c3aed" />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '18px' }}>Dr. {doc.name}</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                                            {doc.specialization || 'General Physician'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    style={{ width: '100%', padding: '10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    onClick={() => setSelectedDoctor(doc)}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: My Appointments */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                        <Activity size={20} color="#7c3aed" />
                        <h3 style={{ margin: 0 }}>My Appointments</h3>
                    </div>
                    
                    {myAppointments.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '14px' }}>You have no booked appointments.</p>
                    ) : (
                        myAppointments.map(appt => (
                            <div key={appt.id} style={{ padding: '15px', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                                <strong style={{ display: 'block', fontSize: '16px' }}>Dr. {appt.doctor?.name}</strong>
                                <span style={{ fontSize: '13px', color: '#666' }}>
                                    {new Date(appt.date).toLocaleDateString()} at {appt.time}
                                </span>
                                <div style={{ marginTop: '8px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                        backgroundColor: appt.status === 'confirmed' ? '#dcfce7' : (appt.status === 'completed' ? '#f3f4f6' : '#fef9c3'),
                                        color: appt.status === 'confirmed' ? '#166534' : (appt.status === 'completed' ? '#374151' : '#854d0e')
                                    }}>
                                        {appt.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            

            {/* Booking Modal (Popup) */}
            {selectedDoctor && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', position: 'relative' }}>
                        <button 
                            onClick={() => setSelectedDoctor(null)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color="#666" />
                        </button>
                        
                        <h2 style={{ marginTop: 0, color: '#7c3aed' }}>Book Appointment</h2>
                        <p>With <strong>Dr. {selectedDoctor.name}</strong></p>
                        
                        <form onSubmit={handleBookAppointment} style={{ marginTop: '20px' }}>
                            {/* Date Field */}
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Select Date</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                                <Calendar size={18} color="#666" />
                                <input 
                                    type="date" required min={new Date().toISOString().split('T')[0]} 
                                    value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                                />
                            </div>

                            {/* Time Field */}
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Select Time</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                                <Clock size={18} color="#666" />
                                <input 
                                    type="time" required
                                    value={bookingTime} onChange={(e) => setBookingTime(e.target.value)}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                                />
                            </div>

                            {/* Reason Field */}
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Reason for Visit</label>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
                                <FileText size={18} color="#666" style={{ marginTop: '2px' }} />
                                <textarea 
                                    required placeholder="Briefly describe your symptoms..."
                                    value={bookingReason} onChange={(e) => setBookingReason(e.target.value)}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', resize: 'vertical', minHeight: '60px' }}
                                />
                            </div>
                            
                            <button type="submit" style={{ width: '100%', padding: '12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;