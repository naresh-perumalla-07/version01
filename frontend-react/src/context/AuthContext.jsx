import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log("Attempting Login:", email);
            const { data } = await api.post('/auth/login', { email, password });
            console.log("Login Success:", data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (error) {
            console.error("Login Error Details:", error);
            const msg = error.response?.data?.message || error.message || 'Login failed';
            return { success: false, message: msg };
        }
    };

    const register = async (userData) => {
        try {
            console.log("Attempting Register:", userData);
            const { data } = await api.post('/auth/register', userData);
            console.log("Register Success:", data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error("Register Error Details:", error);
            const msg = error.response?.data?.message || error.message || 'Registration failed';
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Update local user data without full re-login (e.g. after profile edit)
    const updateUser = (userData) => {
        const updated = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
