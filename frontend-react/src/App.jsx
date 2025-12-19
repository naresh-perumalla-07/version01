import React from 'react';
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
import './assets/css/styles.css';
import './assets/css/animations.css';

function App() {
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
            <Footer />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
