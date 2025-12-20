import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--primary-main)', opacity: '0.2', borderRadius: '50%', filter: 'blur(8px)' }}></div>
                        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--primary-main), #be123c)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(225, 29, 72, 0.4)', transform: 'rotate(45deg)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ transform: 'rotate(-45deg)' }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                <path d="M12 7v5" strokeLinecap="round" />
                                <path d="M9.5 9.5h5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', marginLeft: '12px', letterSpacing: '-0.02em', color: 'white' }}>BloodBridge</span>
                </Link>
            </div>

            <div className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                ☰
            </div>

            <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="nav-links-container">
                <Link to="/" className={`nav-item ${isActive('/')}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/find-blood" className={`nav-item ${isActive('/find-blood')}`} onClick={() => setMobileMenuOpen(false)}>Find Blood</Link>
                {user?.role === 'hospital' && (
                    <Link to="/dashboard/hospital" className={`nav-item ${isActive('/dashboard/hospital')}`} onClick={() => setMobileMenuOpen(false)}>Institutions</Link>
                )}
                {(user?.role === 'donor' || user?.role === 'person') && (
                    <Link to={user.role === 'donor' ? "/dashboard/donor" : "/dashboard/receiver"} className={`nav-item ${isActive('/dashboard/donor') || isActive('/dashboard/receiver')}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                )}
            </div>

            <div className="nav-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {!user ? (
                    <div id="auth-buttons" style={{ display: 'flex', gap: '12px' }}>
                        <Link to="/login" className="btn btn-secondary" style={{ padding: '10px 20px', textDecoration: 'none' }}>Log In</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '10px 24px', textDecoration: 'none' }}>Join Now</Link>
                    </div>
                ) : (
                    <div className="user-trigger">
                        <div style={{width: '32px', height: '32px', background: 'var(--primary-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
                            {user.name.charAt(0)}
                        </div>
                        <span style={{color: 'white', fontSize: '0.9rem'}}>{user.name.split(' ')[0]}</span>
                        <button onClick={logout} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px'}}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
