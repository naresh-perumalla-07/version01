import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const GlobalNotifications = ({ currentChatId }) => {
    const socket = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (!socket || !user) return;

        const handleMessage = (data) => {
            // Check if chat is NOT open or open with a different user
            const isChatOpen = currentChatId && (currentChatId === data.senderId || currentChatId === 'mock_0'); // Adjust logic for mock IDs
            
            if (!isChatOpen && data.senderId !== user._id) {
                // Show Notification
                if(Notification.permission === "granted") {
                    new Notification(`New Message from ${data.senderName}`, { body: data.text });
                }
                showToast(data.senderName, data.text, 'MESSAGE');
            }
        };

        const handleRequest = (data) => {
             // Urgent Blood Request Notification
             if(Notification.permission === "granted") {
                 new Notification(`URGENT: ${data.bloodGroup} Needed!`, { body: data.message });
             }
             showToast(data.requester, `${data.message} (${data.location})`, 'REQUEST', data.bloodGroup);
        };

        socket.on('receive_message', handleMessage);
        socket.on('blood_request', handleRequest);

        return () => {
            socket.off('receive_message', handleMessage);
            socket.off('blood_request', handleRequest);
        };
    }, [socket, user, currentChatId]);

    const showToast = (title, message, type, badge) => {
        const toast = document.createElement('div');
        toast.className = 'glass-card-premium fade-in-up';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.zIndex = '3000';
        toast.style.padding = '12px 24px';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '16px';
        toast.style.border = type === 'REQUEST' ? '2px solid #E11D48' : '1px solid #34D399';
        toast.style.background = type === 'REQUEST' ? 'rgba(225, 29, 72, 0.95)' : 'rgba(16, 185, 129, 0.9)';
        toast.style.color = '#fff';
        toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        toast.style.borderRadius = '12px';
        
        const icon = type === 'REQUEST' ? '🚨' : '💬';
        
        toast.innerHTML = `
            <div style="font-size: 1.5rem;">${icon}</div>
            <div>
                <div style="font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    ${title}
                    ${badge ? `<span style="background: #fff; color: #E11D48; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px;">${badge}</span>` : ''}
                </div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${message}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 6000);
    };

    return null; // Logic only component
};

export default GlobalNotifications;
