import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: { 
    type: String, 
    required: true, 
    enum: [
      'donation_request',
      'donation_approved',
      'donation_rejected',
      'exchange_offer',
      'exchange_accepted',
      'exchange_rejected',
      'new_message',
      'system_alert'
    ] 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedEntity: {
    type: { 
      type: String, 
      enum: ['Donation', 'Exchange', 'Message'] 
    },
    id: { 
      type: mongoose.Schema.Types.ObjectId 
    }
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);