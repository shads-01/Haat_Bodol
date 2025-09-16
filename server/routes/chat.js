import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/user.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email profilePic')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Format response to include user info and unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (convo) => {
        const otherUser = convo.participants.find(
          participant => participant._id.toString() !== req.user.id
        );
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: req.user.id,
          read: false
        });

        return {
          _id: otherUser._id, // Using user ID as conversation identifier
          user: otherUser,
          lastMessage: convo.lastMessage,
          unreadCount
        };
      })
    );

    res.json(formattedConversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages between authenticated user and another user
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'name profilePic')
    .populate('receiver', 'name profilePic')
    .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users for chatting
router.get('/search-users', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('name email profilePic');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID for chat
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email profilePic');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;