import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="container" style={{paddingTop: '100px'}}>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access wrong one
        if (user.role === 'hospital') return <Navigate to="/dashboard/hospital" replace />;
        if (user.role === 'donor') return <Navigate to="/dashboard/donor" replace />;
        return <Navigate to="/" replace />; 
    }

    return children;
};

export default ProtectedRoute;
