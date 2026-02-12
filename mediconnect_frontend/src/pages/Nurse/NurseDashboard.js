import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Activity, ClipboardList, CheckCircle } from 'lucide-react';

const NurseDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [vitals, setVitals] = useState({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: ''
    });

    const fetchTasks = async () => {
        try {
            const response = await API.get('/nurse/my-tasks');
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching nurse tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleVitalChange = (e) => {
        setVitals({ ...vitals, [e.target.name]: e.target.value });
    };

    const submitVitals = async (e) => {
        e.preventDefault();
        try {
            await API.put('/nurse/record-vitals', {
                appointmentId: selectedAppointment.id,
                ...vitals
            });
            alert("Vitals recorded successfully!");
            setSelectedAppointment(null);
            setVitals({ bloodPressure: '', heartRate: '', temperature: '', weight: '' });
            fetchTasks(); // Refresh list
        } catch (error) {
            alert("Error saving vitals.");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <ClipboardList size={32} color="#db2777" />
                <h1>Nurse Task Queue</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedAppointment ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Task List */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Assigned Appointments</h3>
                    {tasks.length === 0 ? <p>No pending vitals to record.</p> : (
                        tasks.map(task => (
                            <div key={task.id} 
                                 onClick={() => setSelectedAppointment(task)}
                                 style={{ 
                                     padding: '15px', border: '1px solid #eee', marginBottom: '10px', 
                                     borderRadius: '5px', cursor: 'pointer',
                                     borderLeft: selectedAppointment?.id === task.id ? '5px solid #db2777' : '1px solid #eee'
                                 }}>
                                <strong>Patient: {task.patient?.name}</strong>
                                <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>Date: {new Date(task.date).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Vitals Form */}
                {selectedAppointment && (
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={20} color="#db2777" />
                            <h3>Record Vitals: {selectedAppointment.patient?.name}</h3>
                        </div>
                        <form onSubmit={submitVitals}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Blood Pressure (e.g. 120/80)</label>
                                <input name="bloodPressure" style={{ width: '100%', padding: '8px' }} onChange={handleVitalChange} required />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Heart Rate (bpm)</label>
                                <input name="heartRate" style={{ width: '100%', padding: '8px' }} onChange={handleVitalChange} required />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Temperature (°C)</label>
                                <input name="temperature" style={{ width: '100%', padding: '8px' }} onChange={handleVitalChange} required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label>Weight (kg)</label>
                                <input name="weight" style={{ width: '100%', padding: '8px' }} onChange={handleVitalChange} required />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '10px', background: '#db2777', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Submit Vitals & Mark Ready
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NurseDashboard;