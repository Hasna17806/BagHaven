import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Make socket available globally for debugging
    window.socket = socketInstance;

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Join user room if logged in
      if (user?._id) {
        socketInstance.emit('join-user-room', user._id);
        console.log('👤 Joined user room:', user._id);
      }
      
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        socketInstance.emit('join-admin-room');
        console.log('👑 Joined admin room');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socketInstance.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
      setIsConnected(true);
    });

    socketInstance.on('user-update', (data) => {
      console.log('👤 User update received:', data);
      
      if (data.type === 'account-status-changed' && data.data.status === 'blocked') {
        // If user is blocked, force logout
        if (user?._id === data.data.userId) {
          toast.error('Your account has been blocked by an administrator');
          setTimeout(() => {
            logout();
          }, 2000);
        }
      }
      
      if (data.type === 'profile-updated') {
        toast.success('Your profile has been updated by an admin');
      }
      
      if (data.type === 'password-reset') {
        toast.success('Your password has been reset by an administrator');
      }
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        delete window.socket;
      }
    };
  }, [user?._id, logout]);

  const emitAdminAction = (type, data) => {
    if (socket && isConnected) {
      socket.emit('admin-action', { type, data });
      console.log('📤 Emitted admin action:', type, data);
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      emitAdminAction
    }}>
      {children}
    </SocketContext.Provider>
  );
};