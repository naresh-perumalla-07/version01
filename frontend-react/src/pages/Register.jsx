import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    
    // Split format for Address, simplified for state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        role: 'donor', // Default
        bloodGroup: '', // Required if donor
        age: '',
        gender: 'male',
        addressStreet: '',
        addressState: '',
        addressZip: '',
        addressState: '',
        addressZip: '',
        healthIssues: 'None',
        unitsNeeded: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if ((formData.role === 'donor' || formData.role === 'person') && !formData.bloodGroup) {
            setError('Blood Group is required.');
            return;
        }

        // Transform for backend
        const payload = {
            ...formData,
            address: {
                street: formData.addressStreet,
                state: formData.addressState,
                zip: formData.addressZip
            }
        };

        const res = await register(payload);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="container page active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingBottom: '40px' }}>
            <div className="glass-card-premium" style={{ width: '100%', maxWidth: '600px' }}>
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '8px' }}>Join the Network</h2>
                <p style={{ textAlign: 'center', marginBottom: '24px', opacity: 0.7 }}>Global Life Saving Community</p>

                {error && <div style={{ color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    
                    {/* Basic Info */}
                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label className="label">Full Name</label>
                            <input name="name" className="input" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="label">Role</label>
                            <select name="role" className="input" value={formData.role} onChange={handleChange}>
                                <option value="donor">Donor</option>
                                
                                <option value="person">Receiver (Looking for Blood)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input type="password" name="password" className="input" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="label">Phone</label>
                            <input name="phone" className="input" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="label">City</label>
                            <input name="city" className="input" value={formData.city} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Extended Profile Fields */}
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
                    <h4 style={{ marginBottom: '16px', color: 'var(--primary-glow)' }}>Profile Details</h4>

                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="label">Age</label>
                            <input type="number" name="age" className="input" value={formData.age} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="label">Gender</label>
                            <select name="gender" className="input" value={formData.gender} onChange={handleChange}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        {(formData.role === 'donor' || formData.role === 'person') && (
                            <div className="form-group">
                                <label className="label">Blood Group</label>
                                <select name="bloodGroup" className="input" value={formData.bloodGroup} onChange={handleChange} required>
                                    <option value="">Select...</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        )}
                        {formData.role === 'person' && (
                            <div className="form-group">
                                <label className="label">Units Needed</label>
                                <input type="number" name="unitsNeeded" className="input" placeholder="e.g. 2" value={formData.unitsNeeded} onChange={handleChange} required />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="label">Full Address (Street, Apt)</label>
                        <input name="addressStreet" className="input" value={formData.addressStreet} onChange={handleChange} placeholder="123 Main St" />
                    </div>

                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="label">State / Region</label>
                            <input name="addressState" className="input" value={formData.addressState} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="label">Zip Code</label>
                            <input name="addressZip" className="input" value={formData.addressZip} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Health Issues (Optional)</label>
                        <input name="healthIssues" className="input" placeholder="Any chronic conditions..." value={formData.healthIssues} onChange={handleChange} />
                    </div>

                    <div className="grid-features" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <div className="form-group">
                            <label className="label">Height (cm)</label>
                            <input type="number" name="height" className="input" placeholder="175" value={formData.height} onChange={handleChange} />
                        </div>
                         <div className="form-group">
                            <label className="label">Weight (kg)</label>
                            <input type="number" name="weight" className="input" placeholder="70" value={formData.weight} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>Create Account</button>
                    
                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary-main)', textDecoration: 'none' }}>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
