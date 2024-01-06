const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Subreddit' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
}, {
    timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
