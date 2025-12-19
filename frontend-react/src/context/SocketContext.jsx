import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();
    
    // Connect only when user is logged in
    useEffect(() => {
        if (user) {
            const URL = import.meta.env.VITE_API_URL.replace('/api', ''); // Base URL
            const newSocket = io(URL, {
                query: { userId: user._id, role: user.role }
            });

            newSocket.on('connect', () => {
                console.log('🔗 Socket Connected:', newSocket.id);
                // Join specific rooms based on role/location?
                if (user.role === 'donor') newSocket.emit('join_room', 'donors');
                if (user.role === 'hospital') newSocket.emit('join_room', 'hospitals');
            });

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if(socket) socket.close();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
