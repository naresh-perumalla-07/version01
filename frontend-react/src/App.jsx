import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import FindBlood from './pages/FindBlood';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWindow from './components/ChatWindow';
import './assets/css/styles.css';
import './assets/css/animations.css';

function App() {
  const [chatRecipient, setChatRecipient] = useState(null);

  useEffect(() => {
    const handleOpenChat = (e) => {
        setChatRecipient({ id: e.detail.id, name: e.detail.name });
    };
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/find-blood" element={<FindBlood />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                    path="/dashboard/donor" 
                    element={
                        <ProtectedRoute allowedRoles={['donor']}>
                            <DonorDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/hospital" 
                    element={
                        <ProtectedRoute allowedRoles={['hospital']}>
                            <HospitalDashboard />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
            {chatRecipient && (
                <ChatWindow 
                    recipientId={chatRecipient.id} 
                    recipientName={chatRecipient.name} 
                    onClose={() => setChatRecipient(null)} 
                />
            )}
            <Footer />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
