const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    postimg: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Subreddit' },
    communityName: { type: String },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
