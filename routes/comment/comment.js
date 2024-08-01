const { verifyTokenAndAuthorisation } = require('../../middlewares/verifyAuthToken');
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const router = require('express').Router();

router.post('/u/:id/:postid/:commentid?', verifyTokenAndAuthorisation, async function (req, res) {
    try {
        const content = req.body.content;
        const { id, postid, commentid } = req.params;
        console.log(id, postid, commentid);
        if (!content || content.length <= 0) {
            return res.status(422).json({ error: "Field cannot be empty" });
        }
        const newComment = new Comment({
            content: content,
            author: id,
            parentId: commentid,
            post: postid,
        })
        await newComment.save();
        const commentedOnPost = await Post.findById(postid);
        commentedOnPost.comments.push(newComment._id);
        await commentedOnPost.save();
        req.app.get('io').emit('newcomment', newComment)
        res.status(200).json({ comment: newComment, message: "Comment added successfully" });

    }
    catch (err) {
        console.log(err.message);
        res.status(500).json(err);
    }

})
module.exports = router;