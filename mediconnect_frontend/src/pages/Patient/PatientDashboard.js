import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Calendar, User, Stethoscope, X } from 'lucide-react';

const PatientDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null); // Tracks which doctor is being booked
    const [bookingDate, setBookingDate] = useState(''); // Tracks the date selected by the patient

    const fetchDoctors = async () => {
        try {
            const response = await API.get('/users/doctors');
            // Filter only active doctors
            const doctorList = response.data;
            setDoctors(doctorList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!bookingDate) return alert("Please select a date");

        try {
            await API.post('/patient/book-appointment', {
                doctorId: selectedDoctor.id,
                date: bookingDate
            });
            alert("Appointment Booked Successfully!");
            setSelectedDoctor(null); // Close the modal
            setBookingDate(''); // Reset date
        } catch (error) {
            alert(error.response?.data?.message || "Booking Failed");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <Stethoscope size={32} color="#7c3aed" />
                <h1>Patient Portal</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                {/* Main Content: Available Doctors */}
                <div>
                    <h3>Available Specialists</h3>
                    {loading ? <p>Loading doctors...</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
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
                    )}
                </div>
            </div>

            {/* Booking Modal (Popup) */}
            {selectedDoctor && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
                }}>
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Date</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
                                <Calendar size={20} color="#666" />
                                <input 
                                    type="date" 
                                    required
                                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px' }}
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