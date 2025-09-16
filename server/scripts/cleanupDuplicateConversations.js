import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('Please set MONGODB_URI');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const coll = mongoose.connection.collection('conversations');

    // Aggregate by sorted participant pair string
    const pipeline = [
        {
            $project: {
                participants: 1,
                lastMessage: 1,
                updatedAt: 1,
                participantsKey: {
                    $reduce: {
                        input: { $map: { input: '$participants', as: 'p', in: { $toString: '$$p' } } },
                        initialValue: '',
                        in: { $concat: ['$$value', '|', '$$this'] }
                    }
                }
            }
        },
        {
            $group: {
                _id: '$participantsKey',
                docs: { $push: { id: '$_id', updatedAt: '$updatedAt' } },
                count: { $sum: 1 }
            }
        },
        { $match: { count: { $gt: 1 } } }
    ];

    const duplicates = await coll.aggregate(pipeline).toArray();

    console.log(`Found ${duplicates.length} duplicate participant groups`);

    let totalRemoved = 0;

    for (const group of duplicates) {
        // Sort docs by updatedAt desc and keep first
        group.docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const keep = group.docs[0].id;
        const remove = group.docs.slice(1).map(d => d.id);

        if (remove.length > 0) {
            const res = await coll.deleteMany({ _id: { $in: remove } });
            totalRemoved += res.deletedCount || 0;
            console.log(`Removed ${res.deletedCount} duplicates for group ${group._id}`);
        }
    }

    console.log(`Done. Removed ${totalRemoved} duplicate conversations.`);
    process.exit(0);
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
