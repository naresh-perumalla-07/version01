import React from 'react';
import LiveMap from './LiveMap'; // Reusing LiveMap for the visual

const EmergencyDetailsModal = ({ emergency, onClose }) => {
    if (!emergency) return null;

    const handleChat = () => {
        window.dispatchEvent(new CustomEvent('openChat', { detail: { id: emergency._id, name: emergency.hospitalName } }));
        onClose();
    };

    const handleNavigate = () => {
        const lat = emergency.location?.coordinates?.[1] || 17.3850;
        const lng = emergency.location?.coordinates?.[0] || 78.4867;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card-premium" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0', animation: 'scaleUp 0.3s ease' }}>
                
                {/* Header Map */}
                <div style={{ height: '250px', background: '#334155', position: 'relative' }}>
                    {/* Placeholder for map - ideally we pass coordinates to LiveMap or similar */}
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'url(https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif) center/cover' }}>
                        <div style={{ color: 'white', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '8px' }}>
                            📍 {emergency.hospitalName}
                        </div>
                    </div>
                    
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                        width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem'
                    }}>&times;</button>
                </div>

                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                        <div>
                            <div className="badge badge-brand" style={{ marginBottom: '8px' }}>URGENT REQUEST</div>
                            <h2 style={{ fontSize: '2rem', margin: 0 }}>{emergency.hospitalName}</h2>
                            <p style={{ color: '#aaa', fontSize: '1.1rem' }}>{emergency.address?.street || 'Hyderabad, Telangana'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#E11D48', lineHeight: 1 }}>{emergency.bloodGroup}</div>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', color: '#aaa' }}>Required</div>
                        </div>
                    </div>

                    <div className="grid-features" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>Patient Condition</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{emergency.condition || 'Critical Surgery'}</div>
                        </div>
                         <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>Units Needed</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{emergency.unitsNeeded || '2 Units'}</div>
                        </div>
                        <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>Contact Person</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{emergency.contactPerson || 'Dr. Smith'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={handleChat} className="btn btn-primary flow-glow" style={{ flex: 2, height: '56px', fontSize: '1.1rem' }}>
                            💬 Chat with Requester
                        </button>
                        <button onClick={handleNavigate} className="btn btn-secondary" style={{ flex: 1, height: '56px', fontSize: '1.1rem' }}>
                            📍 Navigate
                        </button>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '1.5rem' }}>👥</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#34D399' }}>Live Updates</div>
                            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Real-time coordination active. Other donors are viewing this request.</div>
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default EmergencyDetailsModal;
