import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api';

import EmergencyDetailsModal from '../components/EmergencyDetailsModal';
import EditProfileModal from '../components/EditProfileModal';

const DonorDashboard = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    useEffect(() => {
        if (!socket) return;
        
        // Listen for new alerts
        socket.on('emergency_alert', (data) => {
            console.log("🚨 NEW ALERT:", data);
            setAlerts(prev => [data, ...prev]);
            if(Notification.permission === "granted") {
                new Notification("Blood Emergency!", { body: `${data.hospitalName} needs ${data.bloodGroup} blood.` });
            }
        });

        // Listen for updates (Fulfillment, Responses)
        socket.on('emergency_updated', (data) => {
            console.log("🔄 UPDATE:", data);
            
            if (data.type === 'response') {
                // Show notification that someone responded
                const toast = document.createElement('div');
                toast.className = 'glass-card-premium fade-in-up';
                toast.style.position = 'fixed';
                toast.style.bottom = '80px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.zIndex = '3000';
                toast.style.padding = '12px 24px';
                toast.style.border = '1px solid #34D399';
                toast.style.color = '#34D399';
                toast.innerHTML = `🙌 A Donor just responded to an emergency! (${data.respondents} total)`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }

            if (data.type === 'status_change' && data.status === 'fulfilled') {
                // Remove the fulfilled emergency
                setAlerts(prev => prev.filter(e => e._id !== data.emergencyId));
            }
        });

        return () => {
            socket.off('emergency_alert');
            socket.off('emergency_updated');
        };
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
            {/* Sidebar (Enhanced) */}
            <aside className="sidebar glass-card-premium" style={{ height: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ padding: '0 12px 24px', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #E11D48, #881337)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 800, border: '4px solid rgba(0,0,0,0.2)' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{user?.city}</div>
                </div>

                <div style={{ padding: '0 12px 12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Menu
                </div>
                <div className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Dashboard</div>
                <div className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📜 History</div>
                <div className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</div>
                
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                     <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#F87171' }}>Log Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ paddingBottom: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '32px' }}>
                    <div>
                        <h2 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: 1.1 }}>Hello, Hero.</h2>
                        <p style={{ fontSize: '1.1rem', color: '#94A3B8' }}>Your mission status is <strong>Active</strong>.</p>
                    </div>
                    {/* Status Badge */}
                    <div className="glass-tile" style={{ padding: '8px 16px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <span className="ping-dot"></span>
                        <span style={{ color: '#34D399', fontWeight: 700, fontSize: '0.9rem' }}>ONLINE & READY</span>
                    </div>
                </div>

                {/* Hero Stats (Only on Overview) */}
                {activeTab === 'overview' && (
                    <>
                        <div className="grid-features" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <div className="glass-tile hover-scale">
                                <div style={{ fontSize: '0.9rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Donations</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{user?.totalDonations || 0}</div>
                                <div style={{ fontSize: '0.8rem', color: '#34D399' }}>+1 this month</div>
                            </div>
                            <div className="glass-tile hover-scale">
                                <div style={{ fontSize: '0.9rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Lives Saved</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{(user?.totalDonations || 0) * 3}</div>
                                <div style={{ fontSize: '0.8rem', color: '#FB7185' }}>Estimated Impact</div>
                            </div>
                            <div className="glass-tile hover-scale">
                                <div style={{ fontSize: '0.9rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Community Rank</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>#42</div>
                                <div style={{ fontSize: '0.8rem', color: '#FBBF24' }}>Top 5% Donor</div>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '8px', height: '32px', background: '#E11D48', borderRadius: '4px' }}></span>
                            Active Missions
                            <span className="badge badge-brand" style={{ fontSize: '0.8rem' }}>{alerts.length} URGENT</span>
                            <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.85rem', padding: '8px 16px' }}>
                                🔄 Refresh Data
                            </button>
                        </h3>
                        
                        {alerts.length === 0 ? (
                            <div className="glass-card-premium" style={{ textAlign: 'center', padding: '60px', opacity: 0.8 }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛡️</div>
                                <h3>All Clear</h3>
                                <p>No active emergencies in your sector. Good work.</p>
                                <button  
                                    onClick={async () => {
                                        // Demo: Create a fake emergency
                                        try {
                                            await api.post('/emergencies', {
                                                patientName: "Demo Patient " + Math.floor(Math.random()*100),
                                                bloodGroup: ["A+", "B+", "O+", "AB-"][Math.floor(Math.random()*4)],
                                                unitsNeeded: Math.floor(Math.random() * 5) + 1,
                                                condition: "Accident Trauma",
                                                urgency: "critical",
                                                hospitalName: "General Hospital " + Math.floor(Math.random()*10),
                                                contactPerson: "Dr. House",
                                                contactPhone: "9999999999",
                                                latitude: 17.3850 + (Math.random() * 0.05),
                                                longitude: 78.4867 + (Math.random() * 0.05)
                                            });
                                            // Manual fetch after create (or rely on socket)
                                            const { data } = await api.get('/emergencies?status=active');
                                            setAlerts(data.emergencies);
                                        } catch(e) { console.error(e); }
                                    }}
                                    className="btn btn-ghost" style={{ marginTop: '16px', color: '#334155' }}
                                >
                                    (Dev: Simulate Emergency)
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '24px' }}>
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className="glass-card-premium mission-card" style={{ 
                                        borderLeft: 'none', 
                                        position: 'relative', overflow: 'hidden', padding: '0' 
                                    }}>
                                        {/* Status Bar */}
                                        <div style={{ width: '6px', height: '100%', position: 'absolute', left: 0, top: 0, background: '#E11D48', boxShadow: '0 0 15px #E11D48' }}></div>
                                        
                                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ paddingLeft: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                    <span className="badge badge-brand anim-pulse" style={{ border: '1px solid #E11D48' }}>URGENT REQUEST</span>
                                                    <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>• Just Now</span>
                                                </div>
                                                <h4 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white' }}>{alert.hospitalName || "City Hospital"}</h4>
                                                <div style={{ display: 'flex', gap: '24px', color: '#CBD5E1' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ color: '#E11D48', fontWeight: 700 }}>BLOOD:</span> {alert.bloodGroup}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ color: '#E11D48', fontWeight: 700 }}>UNITS:</span> {alert.unitsNeeded}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                 <div style={{ textAlign: 'right', marginRight: '16px' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase' }}>Distance</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{alert.distance || '2.4'} km</div>
                                                </div>
                                                <button 
                                                    className="btn btn-secondary"
                                                    onClick={() => setSelectedEmergency(alert)}
                                                    style={{ height: '50px', padding: '0 24px' }}
                                                >
                                                    Details
                                                </button>
                                                <button 
                                                    className="btn btn-primary flow-glow"
                                                    onClick={() => {
                                                        const recipientId = alert.createdBy?._id || alert.createdBy || 'admin';
                                                        window.dispatchEvent(new CustomEvent('openChat', { detail: { id: recipientId, name: alert.hospitalName } }));
                                                    }}
                                                    style={{ height: '50px', padding: '0 24px', fontSize: '1rem' }}
                                                >
                                                    📣 RESPOND
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'profile' && (
                    <div className="glass-card-premium" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>Profile Dossier</h3>
                            <button className="btn btn-secondary" onClick={() => setIsEditingProfile(true)}>✏️ Edit Data</button>
                        </div>
                        <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label className="label">Full Name</label>
                                <div className="input" style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>{user?.name}</div>
                            </div>
                             <div>
                                <label className="label">Location</label>
                                <div className="input" style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>{user?.city}</div>
                            </div>
                             <div>
                                <label className="label">Blood Group</label>
                                <div className="input" style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: '#E11D48', fontWeight: 700 }}>{user?.bloodGroup}</div>
                            </div>
                             <div>
                                <label className="label">Age</label>
                                <div className="input" style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>{user?.age || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                )}
                
                <EmergencyDetailsModal 
                    emergency={selectedEmergency} 
                    onClose={() => setSelectedEmergency(null)} 
                />

                {isEditingProfile && (
                    <EditProfileModal onClose={() => setIsEditingProfile(false)} />
                )}

            </main>
            
            <style>{`
                .glass-tile {
                    background: rgba(30, 41, 59, 0.4);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 24px;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .hover-scale:hover {
                    transform: translateY(-5px);
                    background: rgba(30, 41, 59, 0.6);
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .ping-dot {
                    width: 8px; height: 8px;
                    background: #34D399;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #34D399;
                    animation: pulse 2s infinite;
                }
                .mission-card {
                    transition: transform 0.2s;
                }
                .mission-card:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
};

export default DonorDashboard;
