import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api';

const DonorDashboard = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!socket) return;
        
        socket.on('emergency_alert', (data) => {
            console.log("🚨 NEW ALERT:", data);
            // Add to top of list, ensure unique
            setAlerts(prev => [data, ...prev]);
            
            // Native Notification (if supported/granted)
            if(Notification.permission === "granted") {
                new Notification("Blood Emergency!", { body: `${data.hospitalName} needs ${data.bloodGroup} blood.` });
            }
        });

        return () => socket.off('emergency_alert');
    }, [socket]);

    // Initial Load of Active Emergencies
    useEffect(() => {
        const fetchEmergencies = async () => {
            try {
                const { data } = await api.get('/emergencies?status=active');
                setAlerts(data.emergencies);
            } catch (err) { console.error(err); }
        }
        fetchEmergencies();
    }, []);

    return (
        <div className="container page active dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div style={{ padding: '0 12px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Donor Menu
                </div>
                <div className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
                <div className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Donation History</div>
                <div className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Profile</div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                     <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#F87171' }}>Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 className="text-gradient">Hello, {user?.name}</h2>
                        <p>Thank you for being a hero.</p>
                    </div>
                    {/* Status Badge */}
                    <div className="badge badge-brand">
                        <span style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', marginRight: '8px' }}></span>
                        Available to Donate
                    </div>
                </div>

                {/* Alerts Section (Always visible on Overview) */}
                {activeTab === 'overview' && (
                    <>
                        <h3 style={{ marginBottom: '20px' }}>Urgent Requests</h3>
                        
                        {alerts.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
                                <p>No active emergencies in your area. Good news!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className="glass-card-premium" style={{ borderLeft: '4px solid #E11D48', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#F87171', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Emergency Request</div>
                                            <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{alert.hospitalName || "City Hospital"}</h4>
                                            <p style={{ fontSize: '0.95rem' }}>Needs <strong>{alert.bloodGroup}</strong> Blood immediately.</p>
                                        </div>
                                        <button className="btn btn-primary anim-pulse">Respond Now</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {/* Other tabs placeholders */}
                {activeTab === 'history' && <div className="card"><p>Donation History coming soon...</p></div>}
                
                {activeTab === 'profile' && (
                    <div className="card">
                        <h3>Profile Settings</h3>
                        <p><strong>Age:</strong> {user?.age || 'N/A'}</p>
                        <p><strong>Address:</strong> {user?.city}, {user?.address?.street}</p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default DonorDashboard;
