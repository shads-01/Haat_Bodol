import axios from 'axios';

export const notificationAPI = {
  sendItemRequest: async (donorId, itemId, itemName) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `http://localhost:5000/api/notifications/item-request`,
      { donorId, itemId, itemName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  getNotifications: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};