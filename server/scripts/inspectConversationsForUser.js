import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';

async function run(userId) {
    if (!process.env.MONGODB_URI) {
        console.error('Please set MONGODB_URI');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const convos = await Conversation.find({ participants: userId }).populate('participants', 'name email').populate('lastMessage').sort({ updatedAt: -1 }).lean();

    console.log(`Found ${convos.length} conversations containing user ${userId}`);
    for (const c of convos) {
        console.log('---');
        console.log('id:', c._id.toString());
        console.log('participants:', c.participants.map(p => `${p._id.toString()}(${p.name || 'n/a'})`).join(', '));
        console.log('lastMessage:', c.lastMessage ? `${c.lastMessage._id} - ${c.lastMessage.content}` : 'none');
        console.log('updatedAt:', c.updatedAt);
    }

    process.exit(0);
}

const arg = process.argv[2];
if (!arg) {
    console.error('Usage: node server/scripts/inspectConversationsForUser.js <userId>');
    process.exit(1);
}

run(arg).catch(err => { console.error(err); process.exit(1); });
