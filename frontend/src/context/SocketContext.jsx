// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [adminUpdates, setAdminUpdates] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Join admin room if admin token exists
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        socketInstance.emit('join-admin-room');
      }
      
      // Join user room if user token exists
      const userToken = localStorage.getItem('token');
      if (userToken) {
        // Decode user ID from token
        try {
          const base64Url = userToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64));
          const decoded = JSON.parse(jsonPayload);
          if (decoded.id) {
            socketInstance.emit('join-user-room', decoded.id);
          }
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
    });

    socketInstance.on('admin-update', (data) => {
      console.log('Admin update received:', data);
      setAdminUpdates(prev => [...prev, data]);
      
      // You can also show toast notifications here
      showNotification(data);
    });

    socketInstance.on('user-update', (data) => {
      console.log('User-specific update received:', data);
      // Handle user-specific updates
      handleUserUpdate(data);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const showNotification = (data) => {
    // Show browser notification or custom toast
    if (Notification.permission === 'granted') {
      new Notification(`Admin Update: ${data.type}`, {
        body: JSON.stringify(data.data),
        icon: '/logo.png'
      });
    }
  };

  const handleUserUpdate = (data) => {
    // Handle user-specific updates (profile changes, order updates, etc.)
    switch (data.type) {
      case 'profile-updated':
        // Update user profile in context/store
        break;
      case 'order-updated':
        // Update order status
        break;
      default:
        break;
    }
  };

  const emitAdminUpdate = (type, data) => {
    if (socket && isConnected) {
      socket.emit('admin-action', { type, data });
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      adminUpdates, 
      emitAdminUpdate,
      clearUpdates: () => setAdminUpdates([])
    }}>
      {children}
    </SocketContext.Provider>
  );
};