import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length === 2; // Ensure exactly 2 participants
            },
            message: 'Conversation must have exactly 2 participants'
        }
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure each participant pair has only one chat
// Enforce unique 1-to-1 conversation pair (participants must be stored in sorted order)
conversationSchema.index({ 'participants.0': 1, 'participants.1': 1 }, { unique: true });

export default mongoose.model('Conversation', conversationSchema);