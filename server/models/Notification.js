import mongoose from 'mongoose';

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
      'item_request', 
      'request_response',
      'donation_request',  
      'exchange_offer',
      'transaction_update',
      'new_message',
      'system_alert',
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
      enum: ['Item', 'Donation', 'Exchange', 'Message']
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
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actions: {
    approve: {
      type: Boolean,
      default: false
    },
    reject: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

export default mongoose.model('Notification', NotificationSchema);