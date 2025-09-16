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
      $and: [
        { participants: req.user.id },
        { participants: { $size: 2 } } // Only get conversations with exactly 2 participants
      ]
    })
      .populate({
        path: 'participants',
        select: 'name email profilePic',
        match: { _id: { $ne: req.user.id } } // Exclude current user
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Keep only the most recent conversation per other user (dedupe duplicates)
    const deduped = [];
    const seen = new Set();
    for (const convo of conversations) {
      if (!convo.participants || convo.participants.length === 0) continue;
      const otherUser = convo.participants[0];
      const uid = otherUser && otherUser._id ? otherUser._id.toString() : null;
      if (!uid) continue;
      if (seen.has(uid)) continue; // already have a more recent convo for this user
      seen.add(uid);
      deduped.push(convo);
    }

    // Format response to include user info and unread count
    const formattedConversations = await Promise.all(
      deduped.map(async (convo) => {
        const otherUser = convo.participants[0];

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: req.user.id,
          read: false
        });

        return {
          _id: convo._id,
          user: otherUser,
          lastMessage: convo.lastMessage,
          unreadCount
        };
      })
    );

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error loading conversations:', error);
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
    console.error('Error loading messages:', error);
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
    console.error('Error searching users:', error);
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
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or get conversation between two users
router.post('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if conversation already exists (ensure exactly 2 participants)
    const participants = Array.from(new Set([req.user.id, userId])).sort();
    if (participants.length !== 2) {
      return res.status(400).json({ message: 'Conversation must have two distinct participants' });
    }

    // Atomic upsert to avoid creating duplicate conversations
    const filter = { 'participants.0': participants[0], 'participants.1': participants[1] };
    const update = { $setOnInsert: { participants }, $set: { updatedAt: new Date() } };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    let conversation = await Conversation.findOneAndUpdate(filter, update, options)
      .populate('participants', 'name email profilePic')
      .populate('lastMessage');

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;