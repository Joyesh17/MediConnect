import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Calendar, User, Stethoscope, X, Clock, FileText, Activity, CreditCard, Ban, Beaker, ClipboardList, Filter } from 'lucide-react';

const PatientDashboard = () => {
    // Data States
    const [doctors, setDoctors] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]); 
    const [labSuggestions, setLabSuggestions] = useState([]); 
    const [prescriptions, setPrescriptions] = useState([]);   
    const [loading, setLoading] = useState(true);
    
    // Filter States
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    // Booking Modal States
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');     
    const [bookingReason, setBookingReason] = useState(''); 

    const fetchData = async () => {
        try {
            const [docsRes, apptsRes, labsRes, presRes] = await Promise.all([
                API.get('/patient/doctors'), 
                API.get('/patient/appointments'),
                API.get('/patient/lab-suggestions'),
                API.get('/patient/prescriptions')
            ]);
            
            const fetchedDoctors = docsRes.data;
            setDoctors(fetchedDoctors);
            
            // Extract unique specialties for the dropdown filter
            const uniqueSpecialties = [...new Set(fetchedDoctors.map(doc => doc.DoctorDetail?.specialization || 'General'))];
            setSpecialties(uniqueSpecialties.sort());

            setMyAppointments(apptsRes.data);
            setLabSuggestions(labsRes.data);
            setPrescriptions(presRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived state: Filter the doctors list based on the dropdown selection
    const filteredDoctors = selectedSpecialty 
        ? doctors.filter(doc => (doc.DoctorDetail?.specialization || 'General') === selectedSpecialty)
        : [];

    // --- PHASE 1: BOOKING & CANCELING ---
    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!bookingDate || !bookingTime || !bookingReason) {
            return alert("Please fill in all fields (Date, Time, Reason)");
        }

        const timeHour = parseInt(bookingTime.split(':')[0]);
        if (timeHour < 9 || timeHour >= 22) {
            return alert("Appointments are only available between 9:00 AM and 10:00 PM.");
        }

        try {
            await API.post('/patient/appointments', {
                doctorId: selectedDoctor.id,
                date: bookingDate,
                time: bookingTime,
                reason: bookingReason
            });
            alert("Appointment Booked Successfully!");
            
            setSelectedDoctor(null); 
            setBookingDate(''); setBookingTime(''); setBookingReason('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Booking Failed");
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        try {
            await API.put(`/patient/appointments/${appointmentId}/cancel`);
            fetchData();
        } catch (error) {
            alert("Error cancelling appointment.");
        }
    };

    // --- PHASE 2: PAY CONSULTATION FEE ---
    const handlePayConsultation = async (appointmentId) => {
        try {
            await API.post(`/patient/appointments/${appointmentId}/pay`);
            alert("Payment Successful! Appointment Confirmed.");
            fetchData();
        } catch (error) {
            alert("Payment Failed.");
        }
    };

    // --- PHASE 4: RESPOND TO LAB TESTS ---
    const handleLabResponse = async (requestId, action) => {
        const confirmMessage = action === 'pay' 
            ? "Proceed to pay for this lab test?" 
            : "Are you sure you want to reject this lab test? The doctor highly recommends it.";
            
        if (!window.confirm(confirmMessage)) return;

        try {
            await API.put(`/patient/lab-suggestions/${requestId}`, { action });
            alert(action === 'pay' ? "Payment complete! A nurse will assist you soon." : "Lab test rejected.");
            fetchData();
        } catch (error) {
            alert("Failed to process lab test response.");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <Stethoscope size={32} color="#7c3aed" />
                <h1>Patient Portal</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* --- LEFT COLUMN: DOCTORS & MEDICAL RECORDS --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Browse Doctors with Filter */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
                            <h3 style={{ margin: 0 }}>Find a Specialist</h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f9fafb', padding: '8px 15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <Filter size={18} color="#6b7280" />
                                <select 
                                    value={selectedSpecialty} 
                                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: '#374151', cursor: 'pointer' }}
                                >
                                    <option value="">-- Select Specialization --</option>
                                    {specialties.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Doctor Grid (Only shows if a specialty is selected) */}
                        <div style={{ marginTop: '20px' }}>
                            {!selectedSpecialty ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
                                    <Stethoscope size={48} color="#d1d5db" style={{ marginBottom: '10px' }} />
                                    <p style={{ margin: 0 }}>Please select a specialization from the dropdown menu to view available doctors.</p>
                                </div>
                            ) : filteredDoctors.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#ef4444' }}>No doctors found for this specialization.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {filteredDoctors.map(doc => (
                                        <div key={doc.id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', background: '#fff', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                                <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '50%' }}>
                                                    <User size={24} color="#7c3aed" />
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '18px' }}>Dr. {doc.name}</h4>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
                                                        {doc.DoctorDetail?.degree || 'MBBS'} | {doc.DoctorDetail?.specialization || 'General'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '14px', color: '#4b5563' }}>Consultation Fee:</span>
                                                <strong style={{ color: '#059669' }}>{doc.DoctorDetail?.consultationFee || 500} BDT</strong>
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

                    {/* Medical Records (Phase 5) */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <ClipboardList size={24} color="#7c3aed" />
                            <h3 style={{ margin: 0 }}>My Medical Records</h3>
                        </div>
                        {prescriptions.length === 0 ? <p style={{ color: '#666' }}>No medical records available yet.</p> : (
                            prescriptions.map(record => (
                                <div key={record.id} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Consultation with Dr. {record.Appointment?.doctor?.name}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Medicines:</strong> {record.medications || 'Pending final review'}</p>
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Instructions:</strong> {record.instructions}</p>
                                    
                                    {record.Appointment?.LabRequests?.length > 0 && (
                                        <div style={{ marginTop: '15px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                                            <strong style={{ fontSize: '13px', color: '#4b5563' }}>Attached Lab Results:</strong>
                                            {record.Appointment.LabRequests.map(test => (
                                                <p key={test.id} style={{ margin: '5px 0 0 0', fontSize: '13px' }}>
                                                    - {test.LabTest?.name}: {test.status === 'completed' ? <strong>{test.result}</strong> : <span style={{ fontStyle: 'italic' }}>Pending nurse upload</span>}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- RIGHT COLUMN: ACTION CENTER (APPOINTMENTS & LABS) --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Appointments Queue */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <Activity size={20} color="#7c3aed" />
                            <h3 style={{ margin: 0 }}>Appointment Status</h3>
                        </div>
                        
                        {myAppointments.length === 0 ? <p style={{ color: '#666', fontSize: '14px' }}>No active bookings.</p> : (
                            myAppointments.map(appt => (
                                <div key={appt.id} style={{ padding: '15px', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                                    <strong style={{ display: 'block', fontSize: '16px' }}>Dr. {appt.doctor?.name}</strong>
                                    <span style={{ fontSize: '13px', color: '#666' }}>{new Date(appt.date).toLocaleDateString()} at {appt.time}</span>
                                    
                                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content', background: '#f3f4f6' }}>
                                            Status: {appt.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>

                                        {appt.status === 'pending' && (
                                            <button onClick={() => handleCancelAppointment(appt.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', padding: '8px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                                <Ban size={14} /> Cancel Request
                                            </button>
                                        )}
                                        {appt.status === 'pay_now_consultation' && (
                                            <button onClick={() => handlePayConsultation(appt.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', padding: '8px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                                <CreditCard size={14} /> Pay Consultation Fee
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pending Lab Tests Queue */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <Beaker size={20} color="#eab308" />
                            <h3 style={{ margin: 0 }}>Suggested Lab Tests</h3>
                        </div>
                        
                        {labSuggestions.length === 0 ? <p style={{ color: '#666', fontSize: '14px' }}>No pending tests.</p> : (
                            labSuggestions.map(req => (
                                <div key={req.id} style={{ padding: '15px', border: '1px solid #eab308', borderRadius: '8px', marginBottom: '10px', background: '#fefce8' }}>
                                    <strong style={{ display: 'block', fontSize: '15px' }}>{req.LabTest?.name}</strong>
                                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Ordered by Dr. {req.Appointment?.doctor?.name}</p>
                                    <strong style={{ color: '#059669', fontSize: '14px', display: 'block', marginBottom: '10px' }}>Fee: {req.LabTest?.fee} BDT</strong>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleLabResponse(req.id, 'pay')} style={{ flex: 1, padding: '8px', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                            Pay Now
                                        </button>
                                        <button onClick={() => handleLabResponse(req.id, 'reject')} style={{ flex: 1, padding: '8px', background: '#f3f4f6', color: '#dc2626', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                            Reject Test
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>

            {/* --- BOOKING MODAL --- */}
            {selectedDoctor && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', position: 'relative' }}>
                        <button onClick={() => setSelectedDoctor(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={20} color="#666" />
                        </button>
                        
                        <h2 style={{ marginTop: 0, color: '#7c3aed' }}>Book Appointment</h2>
                        <p>With <strong>Dr. {selectedDoctor.name}</strong></p>
                        
                        <form onSubmit={handleBookAppointment} style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Select Date</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                                <Calendar size={18} color="#666" />
                                <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} />
                            </div>

                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Select Time (9 AM - 10 PM)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                                <Clock size={18} color="#666" />
                                <input type="time" required min="09:00" max="22:00" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }} />
                            </div>

                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Reason for Visit</label>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
                                <FileText size={18} color="#666" style={{ marginTop: '2px' }} />
                                <textarea required placeholder="Briefly describe your symptoms..." value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', resize: 'vertical', minHeight: '60px' }} />
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