import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { ClipboardList, Beaker, CheckCircle } from 'lucide-react';

const NurseDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    // State to hold the specific lab tests requested for the selected appointment
    const [labRequests, setLabRequests] = useState([]);
    
    // State to hold the nurse's input for a specific lab test result
    const [labResults, setLabResults] = useState({});

    // 1. Fetch assigned appointments
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

    // 2. When a nurse clicks an appointment, fetch the required lab tests for it
    const handleAppointmentSelect = async (task) => {
        setSelectedAppointment(task);
        setLabResults({}); // Clear old inputs
        try {
            const response = await API.get(`/nurse/appointments/${task.id}/lab-requests`);
            setLabRequests(response.data);
        } catch (error) {
            console.error("Error fetching lab requests:", error);
            setLabRequests([]);
        }
    };

    // 3. Handle typing in the result textarea
    const handleResultChange = (requestId, value) => {
        setLabResults({ ...labResults, [requestId]: value });
    };

    // 4. Submit a specific lab result to the backend
    const submitLabResult = async (e, requestId) => {
        e.preventDefault();
        
        const resultValue = labResults[requestId];
        if (!resultValue) return alert("Please enter the test findings before submitting.");

        try {
            await API.put(`/nurse/lab-requests/${requestId}/result`, {
                result: resultValue
            });
            
            alert("Lab report uploaded successfully!");
            
            // Refresh the lab requests to show this one is completed
            handleAppointmentSelect(selectedAppointment);
            
        } catch (error) {
            console.error("Error saving lab result:", error);
            alert("Error saving lab result. Check connection.");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <ClipboardList size={32} color="#db2777" />
                <h1>Nurse Task Queue</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedAppointment ? '1fr 1fr' : '1fr', gap: '30px' }}>
                {/* Task List (Left Side) */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee', height: 'fit-content' }}>
                    <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginTop: 0 }}>Assigned Patients</h3>
                    {tasks.length === 0 ? <p style={{ color: '#666' }}>No pending appointments assigned to you.</p> : (
                        tasks.map(task => (
                            <div key={task.id} 
                                 onClick={() => handleAppointmentSelect(task)}
                                 style={{ 
                                     padding: '15px', border: '1px solid #eee', marginBottom: '10px', 
                                     borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease',
                                     borderLeft: selectedAppointment?.id === task.id ? '5px solid #db2777' : '1px solid #eee',
                                     backgroundColor: selectedAppointment?.id === task.id ? '#fdf2f8' : '#fff'
                                 }}>
                                <strong style={{ fontSize: '16px' }}>{task.patient?.name}</strong>
                                <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>
                                    <strong>Doctor:</strong> Dr. {task.doctor?.name}
                                </p>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                                    <strong>Time:</strong> {new Date(task.date).toLocaleDateString()} at {task.time}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Lab Requests Form (Right Side) */}
                {selectedAppointment && (
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #f3f4f6' }}>
                            <Beaker size={24} color="#db2777" />
                            <h3 style={{ margin: 0 }}>Lab Tests for {selectedAppointment.patient?.name}</h3>
                        </div>
                        
                        {labRequests.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                                All required tests are completed, or the patient hasn't paid yet.
                            </p>
                        ) : (
                            labRequests.map(request => (
                                <div key={request.id} style={{ 
                                    padding: '20px', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    backgroundColor: request.status === 'completed' ? '#f0fdf4' : '#fff'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{request.LabTest?.name}</h4>
                                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{request.LabTest?.description}</p>
                                        </div>
                                        {/* OPTIMAL: Visual status badges so the nurse knows the hospital got paid */}
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: request.status === 'completed' ? '#dcfce7' : '#e0f2fe',
                                            color: request.status === 'completed' ? '#166534' : '#0369a1'
                                        }}>
                                            {request.status === 'completed' ? 'COMPLETED' : 'PAID - READY'}
                                        </span>
                                    </div>
                                    
                                    <form onSubmit={(e) => submitLabResult(e, request.id)} style={{ marginTop: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {/* OPTIMAL: Upgraded to a textarea to support the database TEXT upgrade */}
                                            <textarea 
                                                placeholder={request.status === 'completed' ? "Report already submitted." : "Enter detailed lab findings and measurements here..."}
                                                value={labResults[request.id] || request.result || ''}
                                                onChange={(e) => handleResultChange(request.id, e.target.value)}
                                                disabled={request.status === 'completed'}
                                                style={{ 
                                                    width: '100%', padding: '12px', borderRadius: '6px', 
                                                    border: '1px solid #ccc', minHeight: '80px', resize: 'vertical',
                                                    fontFamily: 'inherit', fontSize: '14px'
                                                }} 
                                            />
                                            {request.status !== 'completed' && (
                                                <button 
                                                    type="submit" 
                                                    style={{ 
                                                        alignSelf: 'flex-end', padding: '10px 20px', background: '#db2777', color: 'white', 
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                                                        display: 'flex', alignItems: 'center', gap: '8px'
                                                    }}
                                                >
                                                    <CheckCircle size={16} /> Upload Report
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NurseDashboard;