import { useState, useEffect, createContext, useContext } from "react";
import { socketService } from "../utils/socket";
import { notificationAPI } from "../services/notificationService"; // Add this import
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initializeNotifications = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch initial notifications
          const initialNotifications = await notificationAPI.getNotifications();
          setNotifications(initialNotifications);

          // Calculate initial unread count
          const initialUnread = initialNotifications.filter(
            (n) => !n.read
          ).length;
          setUnreadCount(initialUnread);

          // Connect to socket for real-time updates
          const socket = socketService.connect(token);

          socket.on("new-notification", (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // KEEP THIS TOAST FOR REAL-TIME NOTIFICATIONS! 🎯
            toast.success(notification.message || "New notification!");
          });

          // Cleanup
          return () => {
            socket.off("new-notification");
            socketService.disconnect();
          };
        } catch (error) {
          console.error("Error initializing notifications:", error);
        }
      }
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch initial notifications
          const initialNotifications = await notificationAPI.getNotifications();
          setNotifications(initialNotifications);

          // Calculate initial unread count
          const initialUnread = initialNotifications.filter(
            (n) => !n.read
          ).length;
          setUnreadCount(initialUnread);

          // Connect to socket for real-time updates
          const socket = socketService.connect(token);

          socket.on("new-notification", (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            console.log("New real-time notification:", notification);
          });

          // Cleanup on unmount
          return () => {
            socket.off("new-notification");
            socketService.disconnect();
          };
        } catch (error) {
          console.error("Error initializing notifications:", error);
        }
      }
    };

    initializeNotifications();
  }, []);

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
    deleteNotification, // ← Add this
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
