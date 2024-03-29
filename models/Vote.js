const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', unique: true},
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    value: { type: Number, required: true },
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
