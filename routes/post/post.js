const { verifyToken, verifyTokenAndAuthorisation } = require('../../middlewares/verifyAuthToken');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment')
const router = require('express').Router();


// Fetch latest posts

router.get('/latestposts', verifyToken, async function (req, res) {
    try {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const latestPosts = await Post.find({ createdAt: { $gte: oneHourAgo } }).sort({ createdAt: 'desc' })
        if (latestPosts.length === 0) {
            res.status(404).json("No posts found at the moment");
            return;
        }
        res.status(200).json(latestPosts);

    }
    catch (err) {
        res.status(404).json(err);
    }
})

// Add Posts by user

router.post('/u/:id/addPost', verifyTokenAndAuthorisation, async function (req, res) {
    const id = req.params.id;
    try {
        if (title.length === 0 || content.length === 0) {
            res.status(400).json({ message: 'Please fill out all the fields' })
            return;
        }
        const newpost = new Post({
            title: req.body.title,
            content: req.body.content,
            author: id,
        })
        await newpost.save();
        res.status(200).json(newpost);
    } catch (err) {
        res.status(500).json(err);
    }
})

// Add posts to a community or subreddit

router.post('/u/:userid/r/:communityid/addPost', verifyTokenAndAuthorisation, async function (req, res) {
    const userid = req.params.userid;
    const communityid = req.params.communityid;
    const { title, content } = req.body;
    try {
        if (title.length === 0 || content.length === 0) {
            res.status(400).json({ message: 'Please fill out all the fields' });
            return;
        }
        const newpost = new Post({
            author: userid,
            title: title,
            content: content,
            community: communityid,

        })
        await newpost.save();
        res.status(200).json(newpost);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

// Deleting a post

router.delete('/u/deletePost/:postid', verifyTokenAndAuthorisation, async function (req, res) {
    try {
        let postId = req.params.postid;

        const postToBeDeleted = await Post.findById(postId).populate('comments');
        if (!postToBeDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (postToBeDeleted.comments && postToBeDeleted.comments.length.length > 0) {
            const commentIds = postToBeDeleted.comments.map(comment => commment._id);
            await Comment.deleteMany({ _id: { $in: commentIds } })
        }
        const postcreator = await user.findById(postToBeDeleted.author);
        if (postcreator) {
            postcreator.posts.pull(postId);
            await user.save();
        }
        await postToBeDeleted.remove();
        res.status(200).json({ message: 'Post deleted successfully' })
    }
    catch (err) {
        res.status(500).json(err);
    }
})



module.exports = router;