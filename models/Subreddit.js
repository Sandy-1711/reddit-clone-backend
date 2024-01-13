const mongoose = require('mongoose');

const subredditSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, {
    timestamps: true,
});

const Subreddit = mongoose.model('Subreddit', subredditSchema);

module.exports = Subreddit;
