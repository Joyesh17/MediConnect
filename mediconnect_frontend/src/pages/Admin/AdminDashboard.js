import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { UserCheck, UserX, Users } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all users from the backend
    const fetchUsers = async () => {
        try {
            const response = await API.get('/admin/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Function to Approve/Enable/Disable a user
    const handleStatusChange = async (userId, newStatus) => {
        try {
            await API.put(`/admin/users/${userId}/status`, { status: newStatus });
            fetchUsers(); // Refresh the list after update
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Users...</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Users size={32} color="#2563eb" />
                <h1>User Management</h1>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Name</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Role</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Status</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.name}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '12px',
                                    backgroundColor: user.status === 'active' ? '#dcfce7' : (user.status === 'disabled' ? '#fee2e2' : '#fef9c3'),
                                    color: user.status === 'active' ? '#166534' : (user.status === 'disabled' ? '#991b1b' : '#854d0e')
                                }}>
                                    {user.status}
                                </span>
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                {/* Show Enable/Approve button if status is NOT active */}
                                {user.status !== 'active' && (
                                    <button 
                                        onClick={() => handleStatusChange(user.id, 'active')}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '5px', 
                                            cursor: 'pointer', 
                                            background: '#2563eb', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px' 
                                        }}
                                    >
                                        <UserCheck size={16} /> 
                                        {user.status === 'pending' ? 'Approve' : 'Enable'}
                                    </button>
                                )}

                                {/* Show Disable button if user is currently active (and not the admin themselves) */}
                                {user.status === 'active' && user.role !== 'admin' && (
                                    <button 
                                        onClick={() => handleStatusChange(user.id, 'disabled')}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '5px', 
                                            cursor: 'pointer', 
                                            background: '#dc2626', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px' 
                                        }}
                                    >
                                        <UserX size={16} /> Disable
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;