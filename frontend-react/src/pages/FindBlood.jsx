import React, { useState } from 'react';
import api from '../api';

const FindBlood = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        location: '',
        bloodGroup: '',
        urgency: 'Medium'
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            // Get user location for sorting
            let lat, lng;
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (err) { console.warn("Location denied, showing all."); }
            }

            const { data } = await api.get('/auth/donors', {
                params: {
                    bloodGroup: formData.bloodGroup,
                    location: formData.location, // Text search fallback (not implemented in backend yet but good to pass)
                    latitude: lat,
                    longitude: lng,
                    radius: 50 // Default 50km
                }
            });
            
            setResults(data.donors);
            setLoading(false);
            setStep(3);
        } catch (e) {
            console.error("Search Error Full:", e);
            const msg = e.response?.data?.message || e.message || "Unknown Search Error";
            setLoading(false);
            alert("Search failed: " + msg);
        }
    };

    return (
        <div className="container page active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
            <h2 className="text-gradient" style={{ marginBottom: '40px' }}>Find Blood Nearby</h2>

            <div className="glass-card-premium" style={{ width: '100%', maxWidth: '600px', minHeight: '400px' }}>
                
                {/* Step Indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', opacity: 0.8 }}>
                    <div style={{ color: step >= 1 ? '#E11D48' : '#aaa' }}>1. Details</div>
                    <div style={{ color: step >= 2 ? '#E11D48' : '#aaa' }}>2. Search</div>
                    <div style={{ color: step >= 3 ? '#E11D48' : '#aaa' }}>3. Results</div>
                </div>

                {step === 1 && (
                    <div className="fade-in">
                        <div className="form-group">
                            <label className="label">Blood Group Needed</label>
                            <select className="input" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                                <option value="">Select Blood Group</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option disabled>--- Rare Groups ---</option>
                                <option value="Bombay">Bombay Blood Group (hh)</option>
                                <option value="Rh-null">Rh-null (Golden Blood)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Location (City or Area)</label>
                            <input className="input" placeholder="e.g. Hyderabad" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="label">Urgency</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['Low', 'Medium', 'Critical'].map(level => (
                                    <button 
                                        key={level}
                                        className={`btn ${formData.urgency === level ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setFormData({...formData, urgency: level})}
                                        style={{ flex: 1 }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setStep(2)}>Next Step</button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                       {loading ? (
                           <>
                               <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
                               <h3 className="anim-pulse">Searching Network...</h3>
                               <p>Checking nearby hospitals and donors for <strong>{formData.bloodGroup}</strong>.</p>
                           </>
                       ) : (
                           <button className="btn btn-primary" onClick={handleSearch}>Confirm Search</button>
                       )}
                    </div>
                )}

                {step === 3 && results && (
                    <div className="fade-in">
                        <h3 style={{ marginBottom: '20px', color: '#34D399' }}>{results.length} Matches Found</h3>
                        {results.length === 0 && <p>No specific matches found nearby. Try increasing range or choosing 'Any'.</p>}
                        
                        {results.map((res, idx) => (
                            <div key={idx} className="card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{res.name}</h4>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{res.city} • <span style={{ color: '#F87171' }}>{res.bloodGroup}</span></div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>{res.distance}</div>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ fontSize: '0.8rem', padding: '6px 12px', marginTop: '4px' }}
                                        onClick={async () => {
                                            if(!confirm(`Send urgent request to ${res.name}?`)) return;
                                            try {
                                               await api.post('/auth/request', { 
                                                   donorId: res._id, 
                                                   message: `Urgent help needed for ${formData.bloodGroup} in ${formData.location}`,
                                                   details: formData 
                                               });
                                               alert(`Request sent to ${res.name}! 📨`);
                                            } catch(err) {
                                               alert("Failed to send request.");
                                            }
                                        }}
                                    >
                                        Request
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default FindBlood;
