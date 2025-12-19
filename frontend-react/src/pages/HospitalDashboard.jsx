import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const HospitalDashboard = () => {
    const { user, logout } = useAuth();
    const [emergencyData, setEmergencyData] = useState({
        bloodGroup: 'O+',
        units: 1,
        criticality: 'High',
        message: ''
    });
    const [success, setSuccess] = useState('');

    const broadcastEmergency = async (e) => {
        e.preventDefault();
        try {
            // Include lat/lng from user profile or fixed for now
            const payload = {
                ...emergencyData,
                unitsNeeded: emergencyData.units, // Map to backend expected field
                hospitalName: user.name,
                location: {
                   type: 'Point',
                   coordinates: [user.longitude || 78.4867, user.latitude || 17.3850] // Default Hyd if missing
                }
            };
            
            await api.post('/emergencies', payload);
            setSuccess('Emergency Broadcasted Successfully! 🚨');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert("Failed to broadcast: " + err.message);
        }
    };

    return (
        <div className="container page active dashboard-layout">
            <aside className="sidebar">
                <div style={{ padding: '0 12px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Hospital Menu
                </div>
                <div className="sidebar-item active">Overview</div>
                <div className="sidebar-item">Active Requests</div>
                <div className="sidebar-item">Inventory</div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                     <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#F87171' }}>Logout</button>
                </div>
            </aside>

            <main>
                <div style={{ marginBottom: '32px' }}>
                    <h2 className="text-gradient">Hospital Command Center</h2>
                    <p>{user?.name} - {user?.city}</p>
                </div>

                {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34D399', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #064E3B' }}>{success}</div>}

                <div className="glass-card-premium" style={{ border: '1px solid #E11D48' }}>
                    <h3 style={{ color: '#E11D48', marginBottom: '16px' }}>🚨 Broadcast Emergency</h3>
                    <form onSubmit={broadcastEmergency}>
                        <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label className="label">Blood Group</label>
                                <select className="input" value={emergencyData.bloodGroup} onChange={e => setEmergencyData({...emergencyData, bloodGroup: e.target.value})}>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="B+">B+</option>
                                    <option value="AB+">AB+</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Units Required</label>
                                <input type="number" className="input" value={emergencyData.units} onChange={e => setEmergencyData({...emergencyData, units: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="label">Criticality</label>
                                <select className="input" value={emergencyData.criticality} onChange={e => setEmergencyData({...emergencyData, criticality: e.target.value})}>
                                    <option value="High">High (Immediate)</option>
                                    <option value="Medium">Medium (Within 4h)</option>
                                    <option value="Low">Low (Scheduled)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Additional Message</label>
                            <input className="input" placeholder="E.g. Trauma case, urgent response needed..." value={emergencyData.message} onChange={e => setEmergencyData({...emergencyData, message: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>📢 BROADCAST TO NETWORK</button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default HospitalDashboard;
