import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(formData.email, formData.password);
        if (res.success) {
            navigate('/');
        } else {
            console.error("Login Failed UI:", res.message);
            setError(res.message);
            alert("Login Failed: " + res.message); // Force user visibility
        }
    };

    return (
        <div className="container page active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-card-premium" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome Back</h2>
                
                {error && <div style={{ color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input 
                            type="email" 
                            className="input" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input 
                            type="password" 
                            className="input" 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                    
                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary-main)', textDecoration: 'none' }}>Register</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
