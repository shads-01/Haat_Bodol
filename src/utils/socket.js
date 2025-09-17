import { io } from 'socket.io-client';
import { logger } from './logger';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
  }

  connect(token) {
    // Prevent multiple connections
    if (this.isConnected && this.socket) {
      logger.debug('Socket already connected, returning existing connection');
      return this.socket;
    }
    logger.info('Establishing socket connection...');
    this.connectionAttempts++;

    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5, // Limit reconnection attempts
      timeout: 60000 
    });

    this.socket.on('connect', () => {
      logger.info('Connected to server');
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      logger.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Connection error:', error.message);
      this.isConnected = false;
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      logger.debug(`Reconnection attempt ${attempt}`);
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
      logger.log('Socket disconnected');
    }
  }
}

export const socketService = new SocketService();