import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    // Prevent multiple connections
    if (this.isConnected && this.socket) {
      console.log('Socket already connected, returning existing connection');
      return this.socket;
    }

    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'] // Better connection handling
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  getSocket() {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected');
    }
  }

  // New method to check connection status
  isConnected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();