import axios from "axios";
const API_URL = "http://localhost:5000/api";

export const notificationAPI = {
  getNotifications: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },
  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
  sendItemRequest: async (donorId, itemId, itemName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/notifications/item-request`,
        {
          donorId,
          itemId,
          itemName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending item request:", error);
      throw error;
    }
  },
  deleteNotification: async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
  deleteAllNotifications: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  },
};
