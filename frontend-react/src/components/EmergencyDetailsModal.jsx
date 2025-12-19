import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import LiveMap from './LiveMap';
import { MapPin, MessageCircle, Navigation, HeartPulse, Activity, User, Droplet } from 'lucide-react';

const EmergencyDetailsModal = ({ emergency, onClose }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    if (!emergency) return null;

    const handleChat = () => {
        const recipientId = emergency.createdBy?._id || emergency.createdBy || 'admin';
        window.dispatchEvent(new CustomEvent('openChat', { detail: { id: recipientId, name: emergency.hospitalName } }));
        onClose();
    };

    const handleNavigate = () => {
        const lat = emergency.location?.coordinates?.[1] || 17.3850;
        const lng = emergency.location?.coordinates?.[0] || 78.4867;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(16px)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: animate ? 1 : 0, transition: 'opacity 0.3s ease'
        }}>
            <div className="glass-card-premium" style={{ 
                width: '95%', maxWidth: '900px', height: '85vh', 
                padding: '0', 
                overflow: 'hidden', 
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                transform: animate ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                
                {/* 1. Hero Map Section */}
                <div style={{ height: '45%', position: 'relative', background: '#0F172A' }}>
                    <div style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                        <LiveMap /> 
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '70%',
                        background: 'linear-gradient(to top, #020617 0%, transparent 100%)',
                        pointerEvents: 'none'
                    }}></div>

                    {/* Close Button */}
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '24px', right: '24px',
                        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                        width: '40px', height: '40px', borderRadius: '50%', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', transition: 'all 0.2s', zIndex: 20
                    }} className="btn-close">
                        &times;
                    </button>

                    {/* Title Overlay */}
                    <div style={{ position: 'absolute', bottom: '32px', left: '32px', zIndex: 10, maxWidth: '70%' }}>
                        <div className="badge badge-brand anim-pulse" style={{ marginBottom: '12px', border: '1px solid #E11D48' }}>
                            URGENT REQUEST
                        </div>
                        <h1 style={{ fontSize: '2.5rem', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.8)', lineHeight: 1.1 }}>
                            {emergency.hospitalName}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', marginTop: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                            <MapPin size={16} />
                            <span>{emergency.address?.street || 'Hyderabad, Telangana'}</span>
                        </div>
                    </div>

                    {/* Blood Group Floating Badge */}
                    <div style={{ 
                        position: 'absolute', bottom: '-40px', right: '40px', 
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #E11D48 0%, #881337 100%)',
                        boxShadow: '0 10px 30px rgba(225, 29, 72, 0.4)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        zIndex: 20, border: '6px solid #020617'
                    }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{emergency.bloodGroup}</span>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8, color: 'white' }}>Needed</span>
                    </div>
                </div>

                {/* 2. Content Section */}
                <div style={{ padding: '40px 40px 32px', flex: 1, overflowY: 'auto', background: '#020617' }}>
                    
                    {/* Essential Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px', marginTop: '10px' }}>
                        <div className="glass-tile">
                            <Activity size={24} color="#F87171" style={{ marginBottom: '12px' }} />
                            <div className="label">Condition</div>
                            <div className="value">{emergency.condition || 'Critical Surgery'}</div>
                        </div>
                        <div className="glass-tile">
                            <Droplet size={24} color="#F87171" style={{ marginBottom: '12px' }} />
                            <div className="label">Units Required</div>
                            <div className="value">{emergency.unitsNeeded || '2 Units'}</div>
                        </div>
                        <div className="glass-tile">
                            <User size={24} color="#F87171" style={{ marginBottom: '12px' }} />
                            <div className="label">Contact</div>
                            <div className="value">{emergency.contactPerson || 'Dr. Smith'}</div>
                        </div>
                    </div>

                    {/* Live Response Tracker */}
                    <div style={{ 
                        padding: '24px', borderRadius: '20px', 
                        background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px'
                    }}>
                        <div style={{ 
                            width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', flexShrink: 0
                        }}>
                             <HeartPulse size={24} color="#34D399" />
                             <span className="ping"></span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34D399' }}>
                                {emergency.respondents?.length || 0} Donors Responding
                            </div>
                            <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                                Live updates from the network. Help is on the way.
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={handleChat} className="btn btn-primary flow-glow" style={{ flex: 2, height: '60px', fontSize: '1.1rem', borderRadius: '16px' }}>
                            <MessageCircle size={20} /> Chat with Requester
                        </button>
                        <button onClick={handleNavigate} className="btn btn-secondary" style={{ flex: 1, height: '60px', fontSize: '1.1rem', borderRadius: '16px' }}>
                            <Navigation size={20} /> Navigate
                        </button>
                    </div>

                </div>
            </div>

            <style>{`
                .glass-tile {
                    background: rgba(30, 41, 59, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                }
                .glass-tile:hover {
                    background: rgba(30, 41, 59, 0.5);
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .glass-tile .label {
                    color: #94A3B8;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                }
                .glass-tile .value {
                    color: #F1F5F9;
                    font-size: 1.1rem;
                    font-weight: 700;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .ping {
                    position: absolute;
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    border: 2px solid #34D399;
                    opacity: 0;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                @keyframes ping {
                    75%, 100% { transform: scale(1.5); opacity: 0; }
                }
                .btn-close:hover {
                    background: rgba(255,255,255,0.2) !important;
                    transform: rotate(90deg);
                }
                
                /* Custom Scrollbar for Modal */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.3); 
                }
                ::-webkit-scrollbar-thumb {
                    background: #334155; 
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #475569; 
                }
            `}</style>
        </div>,
        document.body
    );
};

export default EmergencyDetailsModal;
