import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import User from "./models/user.js";

const app = express();
const httpServer = createServer(app);

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Haat_Bodol API Server",
    endpoints: {
      health: "/api/health",
      donations: "/api/items",
      auth: "/api/auth",
      chat: "/api/chat"
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running." });
});

app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io connection handling with JWT authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('name email profilePic');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join user's personal room
  socket.join(socket.userId);
  console.log(`User ${socket.userId} joined their room`);

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;

      // Save message to database
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        timestamp: new Date()
      });

      await message.save();

      // Update or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, receiverId]
        });
      }

      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
      await conversation.save();

      // Populate message with sender info
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePic')
        .populate('receiver', 'name profilePic');

      // Emit to sender
      socket.emit('receive-message', populatedMessage);
      
      // Emit to receiver if they're online
      socket.to(receiverId).emit('receive-message', populatedMessage);

      console.log(`Message sent from ${senderId} to ${receiverId}`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    socket.to(data.receiverId).emit('typing-start', {
      senderId: socket.userId,
      senderName: socket.user.name
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(data.receiverId).emit('typing-stop', {
      senderId: socket.userId
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default app;