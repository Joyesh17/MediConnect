import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { User, ClipboardCheck, Syringe, MessageSquare } from 'lucide-react';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [selectedNurse, setSelectedNurse] = useState('');

    const fetchData = async () => {
        try {
            const apptRes = await API.get('/doctor/pending-appointments');
            const nurseRes = await API.get('/doctor/available-nurses');
            setAppointments(apptRes.data);
            setNurses(nurseRes.data);
        } catch (error) {
            console.error("Error fetching doctor data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAccept = async (appointmentId) => {
        if (!selectedNurse) return alert("Please select a nurse first!");
        try {
            await API.put(`/doctor/accept-appointment/${appointmentId}`, { nurseId: selectedNurse });
            alert("Appointment accepted and nurse assigned!");
            fetchData();
        } catch (error) {
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
                                <th style={{ padding: '10px' }}>Assign Nurse</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appt => (
                                <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{appt.patient?.name}</td>
                                    <td style={{ padding: '10px' }}>{new Date(appt.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '10px' }}>
                                        <select 
                                            onChange={(e) => setSelectedNurse(e.target.value)}
                                            style={{ padding: '5px', borderRadius: '4px' }}
                                        >
                                            <option value="">Select Nurse</option>
                                            {nurses.map(n => (
                                                <option key={n.id} value={n.id}>{n.name}</option>
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