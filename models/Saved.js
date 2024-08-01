const mongoose = require('mongoose');
const SavedSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postid: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
}, {
    timestamps: true,
})
module.exports = mongoose.model('Saved', SavedSchema);
