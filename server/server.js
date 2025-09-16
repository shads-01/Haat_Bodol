import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import User from "./models/user.js";
import notificationRoutes from "./routes/notification.js";
import Notification from "./models/Notification.js"; // ADD THIS IMPORT

const app = express();
const httpServer = createServer(app);

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
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
      chat: "/api/chat",
      notif: "/api/notifications"
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running." });
});

app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

const sendNotification = async (ioInstance, {
  recipientId,
  senderId = null,
  type,
  title,
  message,
  relatedEntity = null
}) => {
  try {
    // Save notification to database
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedEntity,
      read: false
    });

    await notification.save();
    
    // Populate sender info if available
    if (senderId) {
      await notification.populate('sender', 'name profilePic');
    }

    // Emit to recipient if online
    ioInstance.to(recipientId).emit('new-notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Make sendNotification available to routes
app.locals.sendNotification = (notificationData) => sendNotification(io, notificationData);

// Socket.io connection handling with JWT authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "name email profilePic"
    );

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Join user's personal room
  socket.join(socket.userId);
  console.log(`User ${socket.userId} joined their room`);

  // Handle sending messages
  socket.on("send-message", async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;

      // Validate that we have both sender and receiver
      if (!receiverId) {
        throw new Error("Receiver ID is required");
      }

      // Save message to database
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        timestamp: new Date(),
      });

      await message.save();

      // Defensive: ensure exactly two distinct participants for 1-to-1 chat
      if (!senderId || !receiverId) {
        throw new Error("Both sender and receiver IDs are required");
      }

      if (senderId === receiverId) {
        throw new Error("Cannot send message to self");
      }

      // Sort and dedupe participants to ensure consistent ordering for unique index
      const participants = Array.from(new Set([senderId, receiverId])).sort();

      if (participants.length !== 2) {
        throw new Error("Conversation must have exactly 2 unique participants");
      }

      // Atomically find and update (or insert) the 1-to-1 conversation
      const filter = {
        "participants.0": participants[0],
        "participants.1": participants[1],
      };
      const update = {
        $set: { lastMessage: message._id, updatedAt: new Date() },
        $setOnInsert: { participants },
      };

      const conversationOptions = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };
      let conversation = await Conversation.findOneAndUpdate(
        filter,
        update,
        conversationOptions
      ).exec();

      // Populate message with sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name profilePic")
        .populate("receiver", "name profilePic");

      // Emit to sender
      socket.emit("receive-message", populatedMessage);

      // Emit to receiver if they're online
      socket.to(receiverId).emit("receive-message", populatedMessage);

      // Send notification to receiver
      await sendNotification(io, {
        recipientId: receiverId,
        senderId: senderId,
        type: "new_message",
        title: "New Message",
        message: `You have a new message from ${socket.user.name}`,
        relatedEntity: { type: "Message", id: message._id },
      });

      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message-error", {
        error: "Failed to send message: " + error.message,
      });
    }
  });

  // Handle typing indicators
  socket.on("typing-start", (data) => {
    socket.to(data.receiverId).emit("typing-start", {
      senderId: socket.userId,
      senderName: socket.user.name,
    });
  });

  socket.on("typing-stop", (data) => {
    socket.to(data.receiverId).emit("typing-stop", {
      senderId: socket.userId,
    });
  });

  // Notification events
  socket.on("get-notifications", async (data) => {
    try {
      const { limit = 20, skip = 0 } = data;
      const notifications = await Notification.find({
        recipient: socket.userId,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("sender", "name profilePic");

      socket.emit("notifications-list", notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      socket.emit("notifications-error", {
        error: "Failed to fetch notifications",
      });
    }
  });

  socket.on("mark-notification-read", async (data) => {
    try {
      const { notificationId } = data;
      await Notification.updateOne(
        { _id: notificationId, recipient: socket.userId },
        { read: true }
      );

      socket.emit("notification-read", { success: true, notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      socket.emit("notifications-error", {
        error: "Failed to mark notification as read",
      });
    }
  });

  socket.on("mark-all-notifications-read", async () => {
    try {
      await Notification.updateMany(
        { recipient: socket.userId, read: false },
        { read: true }
      );

      socket.emit("all-notifications-read", { success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      socket.emit("notifications-error", {
        error: "Failed to mark all notifications as read",
      });
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Ensure conversation indexes are correct
    (async () => {
      try {
        const collection = mongoose.connection.collection("conversations");

        // List existing indexes
        const indexes = await collection.indexes();
        const hasSingleKeyParticipantsIndex = indexes.some(
          (idx) => idx.key && idx.key.participants === 1
        );

        if (hasSingleKeyParticipantsIndex) {
          console.log("Dropping stale single-key index on participants");
          await collection.dropIndex("participants_1");
        }

        // Ensure the compound unique index exists
        await collection.createIndex(
          { "participants.0": 1, "participants.1": 1 },
          { unique: true }
        );
        console.log("Conversation indexes ensured");
      } catch (idxErr) {
        console.error(
          "Error ensuring conversation indexes:",
          idxErr.message || idxErr
        );
      }
    })();

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
  console.error("Unhandled error:", error);
  res.status(500).json({
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

export default app;