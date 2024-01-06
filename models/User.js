const mongoose = require('mongoose')
const user = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    isAdmin: { type: Boolean, default: false },
}, { timestamps: true }))
module.exports = user;