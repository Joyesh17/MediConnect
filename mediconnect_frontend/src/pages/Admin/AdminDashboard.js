import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { UserCheck, UserX, Users, Activity, PlusCircle, DollarSign, Database } from 'lucide-react';

const AdminDashboard = () => {
    // State for different dashboard sections
    const [users, setUsers] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [stats, setStats] = useState({ patients: 0, doctors: 0, nurses: 0 });
    const [earnings, setEarnings] = useState(0);
    const [loading, setLoading] = useState(true);

    // State for the "Add Lab Test" form
    const [newTest, setNewTest] = useState({ name: '', description: '', fee: '' });

    // Fetch all required data in parallel, safely
    const fetchData = async () => {
        try {
            // OPTIMAL: Added strict catch blocks to prevent a single API failure from crashing the entire dashboard
            const [usersRes, testsRes, statsRes, earningsRes] = await Promise.all([
                API.get('/admin/users').catch(err => { console.error("Admin Users failed", err); return { data: [] }; }),
                API.get('/admin/lab-tests').catch(err => { console.error("Admin Lab tests failed", err); return { data: [] }; }),
                API.get('/admin/stats').catch(err => { console.error("Admin Stats failed", err); return { data: { patients: 0, doctors: 0, nurses: 0 } }; }),
                API.get('/admin/earnings').catch(err => { console.error("Admin Earnings failed", err); return { data: { earnings: 0 } }; })
            ]);
            
            setUsers(usersRes.data);
            setLabTests(testsRes.data);
            setStats(statsRes.data);
            setEarnings(earningsRes.data.earnings);
            setLoading(false);
        } catch (error) {
            console.error("Critical error in Admin dashboard:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- USER MANAGEMENT ---
    const handleStatusChange = async (userId, newStatus) => {
        try {
            await API.put(`/admin/users/${userId}/status`, { status: newStatus });
            fetchData(); 
        } catch (error) {
            alert("Failed to update user status");
        }
    };

    // --- LAB TEST MANAGEMENT ---
    const handleAddTest = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/lab-tests', newTest);
            alert("Lab test added successfully!");
            setNewTest({ name: '', description: '', fee: '' });
            fetchData();
        } catch (error) {
            alert("Failed to add lab test");
        }
    };

    const handleUpdateTestFee = async (testId, currentFee) => {
        const newFee = prompt("Enter new fee (BDT):", currentFee);
        if (newFee && !isNaN(newFee)) {
            try {
                await API.put(`/admin/lab-tests/${testId}`, { fee: parseInt(newFee) });
                fetchData();
            } catch (error) {
                alert("Failed to update test fee");
            }
        }
    };

    const handleToggleTestStatus = async (testId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await API.put(`/admin/lab-tests/${testId}`, { status: newStatus });
            fetchData();
        } catch (error) {
            alert("Failed to toggle lab test status");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Top Row: Statistics & Earnings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #2563eb' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Patients</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={24} color="#2563eb" />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.patients}</span>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #059669' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Active Doctors</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={24} color="#059669" />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.doctors}</span>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #db2777' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Active Nurses</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserCheck size={24} color="#db2777" />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.nurses}</span>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #eab308' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Hospital Revenue (Tests)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <DollarSign size={24} color="#eab308" />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{earnings} BDT</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* Left Column: User Management */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Users size={24} color="#2563eb" />
                        <h2 style={{ margin: 0 }}>User Management</h2>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Name</th>
                                <th style={{ padding: '12px' }}>Role</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{user.name}</td>
                                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{user.role}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                                            backgroundColor: user.status === 'active' ? '#dcfce7' : (user.status === 'disabled' ? '#fee2e2' : '#fef9c3'),
                                            color: user.status === 'active' ? '#166534' : (user.status === 'disabled' ? '#991b1b' : '#854d0e')
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {user.status !== 'active' && (
                                            <button onClick={() => handleStatusChange(user.id, 'active')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: '#2563eb', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px' }}>
                                                <UserCheck size={16} /> {user.status === 'pending' ? 'Approve' : 'Enable'}
                                            </button>
                                        )}
                                        {user.status === 'active' && user.role !== 'admin' && (
                                            <button onClick={() => handleStatusChange(user.id, 'disabled')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
                                                <UserX size={16} /> Disable
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Column: Lab Test Catalog */}
                <div>
                    {/* Add Test Form */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <PlusCircle size={20} color="#eab308" />
                            <h3 style={{ margin: 0 }}>Add New Lab Test</h3>
                        </div>
                        <form onSubmit={handleAddTest} style={{ display: 'grid', gap: '10px' }}>
                            <input placeholder="Test Name (e.g., Blood Test)" value={newTest.name} onChange={e => setNewTest({...newTest, name: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            <input type="number" placeholder="Fee (BDT)" value={newTest.fee} onChange={e => setNewTest({...newTest, fee: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            <textarea placeholder="Description / Instructions" value={newTest.description} onChange={e => setNewTest({...newTest, description: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }} />
                            <button type="submit" style={{ background: '#eab308', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add to Catalog</button>
                        </form>
                    </div>

                    {/* Catalog List */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Database size={20} color="#4b5563" />
                            <h3 style={{ margin: 0 }}>Active Catalog</h3>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {labTests.map(test => (
                                <div key={test.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', marginBottom: '10px', opacity: test.status === 'inactive' ? 0.6 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '15px' }}>{test.name}</strong>
                                        <span style={{ fontWeight: 'bold', color: '#059669' }}>{test.fee} BDT</span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>{test.description}</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button onClick={() => handleUpdateTestFee(test.id, test.fee)} style={{ background: '#f3f4f6', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Edit Fee</button>
                                        <button onClick={() => handleToggleTestStatus(test.id, test.status)} style={{ background: test.status === 'active' ? '#fee2e2' : '#dcfce7', color: test.status === 'active' ? '#991b1b' : '#166534', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                                            {test.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;