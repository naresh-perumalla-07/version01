import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const EditProfileModal = ({ onClose }) => {
    const { user, login } = useAuth(); // login is effectively setUser in our simple context? No, check AuthContext.
    // Actually AuthContext usually exposes setUser or we can reload /me. 
    // Let's assume we need to update local state or reload.
    // checking AuthContext... usually 'login' sets the user state.
    
    // We will assume useAuth has a method to update user or we'll manually call API then reload window or similar.
    // Ideally AuthContext has 'updateUser'
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        city: user?.city || '',
        address: {
            street: user?.address?.street || '',
            state: user?.address?.state || '',
            zip: user?.address?.zip || ''
        },
        age: user?.age || '',
        height: user?.height || '',
        weight: user?.weight || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            if (data.success) {
                // Determine how to update global state. 
                // Since we don't have a direct 'updateUser' in context visible here, 
                // we might need to rely on a page reload or context re-fetch.
                // But a dirty hack is to use 'login' if it accepts user object, or just alert and reload.
                alert('Profile Updated Successfully!');
                window.location.reload(); // Simplest way to sync all state for Hackathon
            }
        } catch (err) {
            alert('Failed to update: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card-premium" style={{ width: '90%', maxWidth: '500px', animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 className="text-gradient">Edit Profile</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div className="form-group">
                        <label className="label">Phone Number</label>
                        <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>

                    <div className="form-group">
                        <label className="label">Street Address</label>
                        <input className="input" value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} />
                    </div>

                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                         <div className="form-group">
                            <label className="label">City</label>
                            <input className="input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="label">State</label>
                            <input className="input" value={formData.address.state} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value}})} />
                        </div>
                        <div className="form-group">
                            <label className="label">Zip Code</label>
                            <input className="input" value={formData.address.zip} onChange={e => setFormData({...formData, address: {...formData.address, zip: e.target.value}})} />
                        </div>
                    </div>

                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                            <label className="label">Age</label>
                            <input type="number" className="input" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="label">Height (cm)</label>
                            <input type="number" className="input" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="label">Weight (kg)</label>
                            <input type="number" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
