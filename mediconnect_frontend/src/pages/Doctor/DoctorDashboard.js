import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { ClipboardCheck } from 'lucide-react';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    
    // OPTIMAL: Use objects to track lists and selections per appointment ID
    const [nursesByAppt, setNursesByAppt] = useState({});
    const [selectedNurses, setSelectedNurses] = useState({});

    const fetchData = async () => {
        try {
            // 1. Fetch all pending requests
            const apptRes = await API.get('/doctor/pending-appointments');
            const pendingAppts = apptRes.data;
            setAppointments(pendingAppts);

            // 2. Fetch available nurses specifically for EACH appointment's date & time
            const nursesMap = {};
            
            // Promise.all runs these requests in parallel for maximum speed
            await Promise.all(pendingAppts.map(async (appt) => {
                try {
                    // This now properly sends the date and time to prevent the Backend crash
                    const nurseRes = await API.get(`/doctor/available-nurses?date=${appt.date}&time=${appt.time}`);
                    nursesMap[appt.id] = nurseRes.data;
                } catch (err) {
                    console.error(`Failed to fetch nurses for appt ${appt.id}`);
                    nursesMap[appt.id] = [];
                }
            }));
            
            setNursesByAppt(nursesMap);
        } catch (error) {
            console.error("Error fetching doctor data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Safely update the selection for a specific row
    const handleNurseSelect = (appointmentId, nurseId) => {
        setSelectedNurses(prev => ({ ...prev, [appointmentId]: nurseId }));
    };

    const handleAccept = async (appointmentId) => {
        // Grab the specific nurse selected for THIS row
        const nurseId = selectedNurses[appointmentId];
        if (!nurseId) return alert("Please select a nurse for this appointment first!");
        
        try {
            await API.put(`/doctor/accept-appointment/${appointmentId}`, { nurseId });
            alert("Appointment accepted and nurse assigned!");
            fetchData(); // Refresh to remove the accepted appointment from the list
        } catch (error) {
            console.error("Accept Error:", error);
            alert("Error accepting appointment.");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <ClipboardCheck size={32} color="#059669" />
                <h1>Doctor Consultations</h1>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>Pending Patient Requests</h3>
                
                {appointments.length === 0 ? <p>No new appointment requests.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: '#f9fafb' }}>
                                <th style={{ padding: '10px' }}>Patient</th>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px' }}>Time</th>
                                <th style={{ padding: '10px' }}>Assign Nurse</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appt => (
                                <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{appt.patient?.name}</td>
                                    {/* Make sure to show the time so the doctor knows the schedule! */}
                                    <td style={{ padding: '10px' }}>{new Date(appt.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px' }}>{appt.time}</td>
                                    
                                    <td style={{ padding: '10px' }}>
                                        <select 
                                            value={selectedNurses[appt.id] || ''}
                                            onChange={(e) => handleNurseSelect(appt.id, e.target.value)}
                                            style={{ padding: '5px', borderRadius: '4px' }}
                                        >
                                            <option value="">Select Nurse</option>
                                            {/* Render the specific nurses available for this specific timeslot */}
                                            {(nursesByAppt[appt.id] || []).map(n => (
                                                <option key={n.id} value={n.id}>
                                                    {n.name} ({n.NurseDetail?.department || 'General'})
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button 
                                            onClick={() => handleAccept(appt.id)}
                                            style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Accept
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;