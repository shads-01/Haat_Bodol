import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/user.js';
import mongoose from 'mongoose'; 
import Notification from '../models/Notification.js';

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    
    const notifications = await Notification.find({ 
      recipient: req.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .populate('sender', 'name profilePic');
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread notifications count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

router.post('/item-request', auth, async (req, res) => {
  try {
    const { donorId, itemId, itemName } = req.body;

    // Simple validation
    if (!donorId || !itemId || !itemName) {
      return res.status(400).json({ 
        error: 'Missing required fields: donorId, itemId, itemName' 
      });
    }

    const requester = await User.findById(req.user.id);
    console.log('Requester found:', requester);

    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    // Create notification
    const notification = new Notification({
      recipient: donorId,
      sender: req.user.id,
      type: 'item_request',
      title: 'New Item Request',
      message: `${requester.name} requested your item: ${itemName}`,
      relatedEntity: { 
        type: 'Item', 
        id: itemId 
      },
      read: false
    });

    await notification.save();
    console.log('Notification saved successfully:', notification._id);

    // Populate sender info
    await notification.populate('sender', 'name profilePic');

    // Emit real-time notification via Socket.io
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(donorId).emit('new-notification', notification);
        console.log('Real-time notification emitted to donor:', donorId);
      }
    } catch (socketError) {
      console.log('Socket emission error:', socketError);
    }

    res.json({ 
      success: true, 
      message: 'Notification sent successfully',
      notification 
    });

  } catch (error) {
    console.error('ERROR in item-request:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed' });
    }

    res.status(500).json({ 
      error: 'Failed to send notification',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
// Delete single notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id // User can only delete their own notifications
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all notifications for user
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;