import React, { useEffect, useState } from 'react';
import API from '../../services/api';
// Removed the unused 'Activity' import to clear the ESLint warning
import { ClipboardList, Beaker } from 'lucide-react';

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

    // 3. Handle typing in the result input box
    const handleResultChange = (requestId, value) => {
        setLabResults({ ...labResults, [requestId]: value });
    };

    // 4. Submit a specific lab result to the backend
    const submitLabResult = async (e, requestId) => {
        e.preventDefault();
        
        const resultValue = labResults[requestId];
        if (!resultValue) return alert("Please enter a result before submitting.");

        try {
            // Matches: router.put('/lab-requests/:requestId/result', nurseController.updateLabResult);
            await API.put(`/nurse/lab-requests/${requestId}/result`, {
                result: resultValue
            });
            
            alert("Lab result recorded successfully!");
            
            // Refresh the lab requests to show this one is completed
            handleAppointmentSelect(selectedAppointment);
            
        } catch (error) {
            console.error("Error saving lab result:", error);
            alert("Error saving lab result.");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <ClipboardList size={32} color="#db2777" />
                <h1>Nurse Task Queue</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedAppointment ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Task List (Left Side) */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>Assigned Appointments</h3>
                    {tasks.length === 0 ? <p>No pending appointments assigned to you.</p> : (
                        tasks.map(task => (
                            <div key={task.id} 
                                 onClick={() => handleAppointmentSelect(task)}
                                 style={{ 
                                     padding: '15px', border: '1px solid #eee', marginBottom: '10px', 
                                     borderRadius: '5px', cursor: 'pointer',
                                     borderLeft: selectedAppointment?.id === task.id ? '5px solid #db2777' : '1px solid #eee',
                                     backgroundColor: selectedAppointment?.id === task.id ? '#fdf2f8' : '#fff'
                                 }}>
                                <strong>Patient: {task.patient?.name}</strong>
                                <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>
                                    Doctor: {task.doctor?.name} | Date: {new Date(task.date).toLocaleDateString()} | Time: {task.time}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Lab Requests Form (Right Side) */}
                {selectedAppointment && (
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <Beaker size={20} color="#db2777" />
                            <h3>Required Lab Tests: {selectedAppointment.patient?.name}</h3>
                        </div>
                        
                        {labRequests.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>No lab tests requested for this appointment yet.</p>
                        ) : (
                            labRequests.map(request => (
                                <div key={request.id} style={{ 
                                    padding: '15px', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: '6px',
                                    marginBottom: '15px',
                                    backgroundColor: request.status === 'completed' ? '#f0fdf4' : '#fff'
                                }}>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{request.LabTest?.name}</h4>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px 0' }}>{request.LabTest?.description}</p>
                                    
                                    <form onSubmit={(e) => submitLabResult(e, request.id)}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input 
                                                type="text"
                                                placeholder={request.status === 'completed' ? "Result already submitted" : "Enter test results..."}
                                                value={labResults[request.id] || request.result || ''}
                                                onChange={(e) => handleResultChange(request.id, e.target.value)}
                                                disabled={request.status === 'completed'}
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
                                            />
                                            {request.status !== 'completed' && (
                                                <button 
                                                    type="submit" 
                                                    style={{ 
                                                        padding: '8px 15px', background: '#db2777', color: 'white', 
                                                        border: 'none', borderRadius: '4px', cursor: 'pointer' 
                                                    }}
                                                >
                                                    Save Result
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