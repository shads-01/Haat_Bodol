import { useState, useEffect, createContext, useContext } from 'react';
import { socketService } from '../utils/socket';
import { notificationAPI } from '../services/notificationService';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketInitialized, setSocketInitialized] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      const token = localStorage.getItem('token');
      
      if (token && !socketInitialized) {
        try {
          console.log('Initializing notifications...');
          
          // Fetch initial notifications
          const initialNotifications = await notificationAPI.getNotifications();
          setNotifications(initialNotifications);
          
          // Calculate initial unread count
          const initialUnread = initialNotifications.filter(n => !n.read).length;
          setUnreadCount(initialUnread);

          // Connect to socket for real-time updates (only once!)
          const socket = socketService.connect(token);
          
          // Remove any existing listeners first
          socket.off('new-notification');
          
          // Add new listener
          socket.on('new-notification', (notification) => {
            console.log('Received new notification:', notification);
            
            // Prevent duplicates by checking if notification already exists
            setNotifications(prev => {
              const exists = prev.some(n => n._id === notification._id);
              if (!exists) {
                return [notification, ...prev];
              }
              return prev;
            });
            
            setUnreadCount(prev => prev + 1);
            toast.success(notification.message || 'New notification!');
          });

          setSocketInitialized(true);

          // Cleanup on unmount
          return () => {
            console.log('Cleaning up socket listeners');
            socket.off('new-notification');
            // Don't disconnect here - let the socket service manage connection
          };

        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    };

    initializeNotifications();

    // Cleanup when component unmounts or token changes
    return () => {
      setSocketInitialized(false);
    };
  }, [socketInitialized]); // Only run when socketInitialized changes

  // Add function to manually refresh notifications (without duplicates)
  const refreshNotifications = async () => {
    try {
      const freshNotifications = await notificationAPI.getNotifications();
      setNotifications(freshNotifications);
      const unread = freshNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      // Also reduce unread count if the deleted notification was unread
      setUnreadCount((prev) => {
        const deletedNotif = notifications.find(
          (n) => n._id === notificationId
        );
        return deletedNotif && !deletedNotif.read
          ? Math.max(0, prev - 1)
          : prev;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };
  const deleteAllNotifications = async () => {
    try {
      await notificationAPI.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  };

  const value = {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};