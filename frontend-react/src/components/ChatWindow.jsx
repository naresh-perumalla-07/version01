import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ recipientId, recipientName, onClose }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        // Join a private room unique to this pair (e.g., sorted IDs)
        const roomId = [user._id, recipientId].sort().join('_');
        socket.emit('join_chat', roomId);

        // Listen for incoming messages
        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('receive_message');
            socket.emit('leave_chat', roomId);
        };
    }, [socket, recipientId, user._id]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            roomId: [user._id, recipientId].sort().join('_'),
            senderId: user._id,
            senderName: user.name,
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        socket.emit('send_message', messageData);
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div className="glass-card-premium" style={{ 
            position: 'fixed', bottom: '20px', right: '20px', width: '350px', 
            height: '500px', display: 'flex', flexDirection: 'column', 
            zIndex: 1000, padding: 0 
        }}>
            {/* Header */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {recipientName ? recipientName[0] : 'U'}
                    </div>
                    <span style={{ fontWeight: 'bold' }}>{recipientName || 'Chat'}</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ 
                        marginBottom: '10px', 
                        textAlign: msg.senderId === user._id ? 'right' : 'left' 
                    }}>
                        <div style={{ 
                            display: 'inline-block', 
                            padding: '8px 12px', 
                            borderRadius: '12px', 
                            background: msg.senderId === user._id ? '#E11D48' : 'rgba(255,255,255,0.1)',
                            borderBottomRightRadius: msg.senderId === user._id ? '2px' : '12px',
                            borderBottomLeftRadius: msg.senderId === user._id ? '12px' : '2px',
                            maxWidth: '80%'
                        }}>
                            <div style={{ fontSize: '0.9rem' }}>{msg.text}</div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
                <input 
                    className="input" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    style={{ flex: 1, padding: '10px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>➤</button>
            </form>
        </div>
    );
};

export default ChatWindow;
