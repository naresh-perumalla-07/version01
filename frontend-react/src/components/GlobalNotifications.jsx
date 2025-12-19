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
                
                // Show In-App Toast
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
                toast.style.gap = '12px';
                toast.style.border = '1px solid #E11D48';
                
                toast.innerHTML = `
                    <div style="width: 32px; height: 32px; background: #E11D48; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">💬</div>
                    <div>
                        <div style="font-weight: bold;">${data.senderName}</div>
                        <div style="font-size: 0.9rem; color: #ccc;">${data.text.substring(0, 30)}${data.text.length > 30 ? '...' : ''}</div>
                    </div>
                `;
                
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }
        };

        socket.on('receive_message', handleMessage);
        return () => socket.off('receive_message', handleMessage);
    }, [socket, user, currentChatId]);

    return null; // Logic only component
};

export default GlobalNotifications;
