import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { ClipboardCheck, DollarSign, CheckCircle, XCircle, UserPlus, FileText, X } from 'lucide-react';

const DoctorDashboard = () => {
    // Phase Queues
    const [pendingAppts, setPendingAppts] = useState([]);
    const [awaitingNurseAppts, setAwaitingNurseAppts] = useState([]);
    const [scheduleAppts, setScheduleAppts] = useState([]);
    
    // Data & UI States
    const [earnings, setEarnings] = useState(0);
    const [labTestsCatalog, setLabTestsCatalog] = useState([]);
    const [nursesByAppt, setNursesByAppt] = useState({});
    const [selectedNurses, setSelectedNurses] = useState({});
    const [loading, setLoading] = useState(true);

    // Consultation Modal States
    const [consultModal, setConsultModal] = useState(null); // Holds the appointment object when open
    const [consultForm, setConsultForm] = useState({ diagnosis: '', medications: '', instructions: '', labTests: [] });

    const fetchData = async () => {
        try {
            // OPTIMAL: Fetch all doctor queues and earnings safely with .catch() fallbacks
            const [pendingRes, awaitingRes, scheduleRes, earnRes, labRes] = await Promise.all([
                API.get('/doctor/pending-appointments').catch(err => { console.error("Pending appts failed", err); return { data: [] }; }),
                API.get('/doctor/appointments/awaiting-nurse').catch(err => { console.error("Awaiting nurse failed", err); return { data: [] }; }),
                API.get('/doctor/schedule').catch(err => { console.error("Schedule failed", err); return { data: [] }; }),
                API.get('/doctor/earnings').catch(err => { console.error("Doctor Earnings failed", err); return { data: { earnings: 0 } }; }),
                API.get('/doctor/lab-tests').catch(err => { console.error("Doctor Lab Tests failed", err); return { data: [] }; }) 
            ]);

            setPendingAppts(pendingRes.data);
            setAwaitingNurseAppts(awaitingRes.data);
            setScheduleAppts(scheduleRes.data);
            setEarnings(earnRes.data.earnings);
            setLabTestsCatalog(labRes.data);

            // Fetch available nurses ONLY for appointments waiting for one
            const nursesMap = {};
            // Added fallback to [] in case awaitingRes.data failed
            await Promise.all((awaitingRes.data || []).map(async (appt) => {
                try {
                    const nurseRes = await API.get(`/doctor/available-nurses?date=${appt.date}&time=${appt.time}`);
                    nursesMap[appt.id] = nurseRes.data;
                } catch (err) {
                    nursesMap[appt.id] = [];
                }
            }));
            setNursesByAppt(nursesMap);
            setLoading(false);

        } catch (error) {
            console.error("Critical error in Doctor dashboard:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- PHASE 1: ACCEPT / REJECT ---
    const handleRespond = async (appointmentId, action) => {
        try {
            await API.put(`/doctor/appointments/${appointmentId}/respond`, { action });
            alert(action === 'accept' ? "Accepted! Waiting for patient to pay." : "Appointment rejected.");
            fetchData();
        } catch (error) {
            alert("Error responding to request.");
        }
    };

    // --- PHASE 3: ASSIGN NURSE ---
    const handleAssignNurse = async (appointmentId) => {
        const nurseId = selectedNurses[appointmentId];
        if (!nurseId) return alert("Please select a nurse from the dropdown first!");
        try {
            await API.put(`/doctor/appointments/${appointmentId}/assign-nurse`, { nurseId });
            alert("Nurse assigned successfully! Appointment moved to Schedule.");
            fetchData();
        } catch (error) {
            alert("Error assigning nurse.");
        }
    };

    // --- PHASE 3 & 5: CONSULTATION SUBMISSIONS ---
    const handleInitialConsult = async () => {
        try {
            await API.post('/doctor/consultation/initial', {
                appointmentId: consultModal.id,
                ...consultForm
            });
            alert("Initial consultation saved. Lab tests ordered!");
            setConsultModal(null);
            fetchData();
        } catch (error) {
            alert("Error saving initial consultation.");
        }
    };

    const handleFinalizeConsult = async () => {
        try {
            await API.put('/doctor/consultation/finalize', {
                appointmentId: consultModal.id,
                finalMedications: consultForm.medications,
                finalInstructions: consultForm.instructions
            });
            alert("Consultation finalized and closed!");
            setConsultModal(null);
            fetchData();
        } catch (error) {
            alert("Error finalizing consultation.");
        }
    };

    // Lab Test Checkbox Handler
    const handleLabTestToggle = (testId) => {
        setConsultForm(prev => {
            const isSelected = prev.labTests.includes(testId);
            return {
                ...prev,
                labTests: isSelected ? prev.labTests.filter(id => id !== testId) : [...prev.labTests, testId]
            };
        });
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header & Earnings Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ClipboardCheck size={32} color="#059669" />
                    <h1 style={{ margin: 0 }}>Doctor Command Center</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #059669' }}>
                    <DollarSign size={24} color="#059669" />
                    <div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Total Earnings</p>
                        <h2 style={{ margin: 0 }}>{earnings} BDT</h2>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                
                {/* 1. Pending Requests (Accept/Reject) */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #eab308' }}>
                    <h3 style={{ marginTop: 0 }}>1. Pending Patient Requests</h3>
                    {pendingAppts.length === 0 ? <p style={{ color: '#666' }}>No new requests.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {pendingAppts.map(appt => (
                                <div key={appt.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                                    <strong>{appt.patient?.name}</strong>
                                    <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>{new Date(appt.date).toLocaleDateString()} at {appt.time}</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <button onClick={() => handleRespond(appt.id, 'accept')} style={{ flex: 1, padding: '8px', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                            <CheckCircle size={16} /> Accept
                                        </button>
                                        <button onClick={() => handleRespond(appt.id, 'reject')} style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Awaiting Nurse Assignment (Paid) */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #3b82f6' }}>
                    <h3 style={{ marginTop: 0 }}>2. Paid Appointments (Assign Nurse)</h3>
                    {awaitingNurseAppts.length === 0 ? <p style={{ color: '#666' }}>No patients awaiting nurses.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Patient</th>
                                    <th style={{ padding: '12px' }}>Date & Time</th>
                                    <th style={{ padding: '12px' }}>Select Available Nurse</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {awaitingNurseAppts.map(appt => (
                                    <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{appt.patient?.name}</td>
                                        <td style={{ padding: '12px' }}>{new Date(appt.date).toLocaleDateString()} | {appt.time}</td>
                                        <td style={{ padding: '12px' }}>
                                            <select 
                                                value={selectedNurses[appt.id] || ''} 
                                                onChange={(e) => setSelectedNurses(prev => ({ ...prev, [appt.id]: e.target.value }))}
                                                style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                <option value="">-- Select Nurse --</option>
                                                {(nursesByAppt[appt.id] || []).map(n => (
                                                    <option key={n.id} value={n.id}>{n.name} ({n.NurseDetail?.department || 'General'})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button onClick={() => handleAssignNurse(appt.id)} style={{ padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <UserPlus size={16} /> Assign
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* 3. Confirmed Schedule */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #8b5cf6' }}>
                    <h3 style={{ marginTop: 0 }}>3. Today's Schedule (Confirmed)</h3>
                    {scheduleAppts.length === 0 ? <p style={{ color: '#666' }}>Your schedule is clear.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                            {scheduleAppts.map(appt => (
                                <div key={appt.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fdfa8ff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong style={{ fontSize: '18px' }}>{appt.patient?.name}</strong>
                                        <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px' }}>Assigned: {appt.nurse?.name}</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>{new Date(appt.date).toLocaleDateString()} at {appt.time}</p>
                                    
                                    <button onClick={() => { setConsultModal(appt); setConsultForm({ diagnosis: '', medications: '', instructions: '', labTests: [] }); }} style={{ width: '100%', padding: '10px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                                        <FileText size={18} /> Open Medical Form
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- CONSULTATION MODAL --- */}
            {consultModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button onClick={() => setConsultModal(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} color="#666" />
                        </button>
                        
                        <h2 style={{ marginTop: 0, color: '#8b5cf6', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>Consultation: {consultModal.patient?.name}</h2>
                        
                        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Diagnosis</label>
                                <textarea value={consultForm.diagnosis} onChange={e => setConsultForm({...consultForm, diagnosis: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }} placeholder="Enter medical diagnosis..." />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Medications</label>
                                <textarea value={consultForm.medications} onChange={e => setConsultForm({...consultForm, medications: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }} placeholder="List medicines here..." />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Instructions</label>
                                <textarea value={consultForm.instructions} onChange={e => setConsultForm({...consultForm, instructions: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }} placeholder="Rest, diet, follow-up..." />
                            </div>

                            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Order Lab Tests</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {labTestsCatalog.map(test => (
                                        <label key={test.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                            <input type="checkbox" checked={consultForm.labTests.includes(test.id)} onChange={() => handleLabTestToggle(test.id)} />
                                            {test.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                            <button onClick={handleInitialConsult} style={{ flex: 1, padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Step 1: Save & Order Tests
                            </button>
                            <button onClick={handleFinalizeConsult} style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Step 2: Finalize & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;