const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

module.exports = (io) => {
  io.use((socket, next) => {
    // Authenticate socket connection using JWT
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    
    // Join user's personal room
    socket.join(socket.userId);
    
    // Handle sending messages (Step 5)
    socket.on('send-message', async (data) => {
      try {
        // Save message to database
        const message = new Message({
          sender: data.senderId,
          receiver: data.receiverId,
          content: data.content
        });
        
        await message.save();
        
        // Update conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [data.senderId, data.receiverId] }
        });
        
        if (!conversation) {
          conversation = new Conversation({
            participants: [data.senderId, data.receiverId]
          });
        }
        
        conversation.lastMessage = message._id;
        conversation.updatedAt = Date.now();
        await conversation.save();
        
        // Populate message with sender info
        await message.populate('sender', 'name profilePic');
        await message.populate('receiver', 'name profilePic');
        
        // Emit to receiver
        socket.to(data.receiverId).emit('receive-message', message);
        
        // Also emit to sender for confirmation
        socket.emit('receive-message', message);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(data.receiverId).emit('typing-start');
    });
    
    socket.on('typing-stop', (data) => {
      socket.to(data.receiverId).emit('typing-stop');
    });
    
    // Handle user joining their room
    socket.on('join-user', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });
};