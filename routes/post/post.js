const { verifyToken, verifyTokenAndAuthorisation } = require('../../middlewares/verifyAuthToken');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const Subreddit = require('../../models/Subreddit')
const router = require('express').Router();
const socket = require('socket.io');
const cloudinary = require('cloudinary');
const Saved = require('../../models/Saved');
//checking post route

router.get('/test', async function (req, res) {
    res.status(200).json('working');
})

// Fetch latest posts
router.get('/latestposts', verifyToken, async function (req, res) {
    try {
        const twelvehoursAgo = new Date();
        twelvehoursAgo.setHours(twelvehoursAgo.getHours() - 12);
        const latestPosts = await Post.find({ createdAt: { $gte: twelvehoursAgo } }).sort({ createdAt: 'desc' }).populate('comments')
        console.log(latestPosts);
        if (latestPosts.length === 0) {
            res.status(404).json({ message: "No posts found at the moment" });
            return;
        }
        res.status(200).json({ posts: latestPosts });
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

// Add Posts by User

router.post('/u/:id/addPost', verifyTokenAndAuthorisation, async function (req, res) {
    const id = req.params.id;
    const { title, content } = req.body;

    console.log(req.body);
    try {
        if (title.length === 0) {
            // console.log("empty");
            res.status(400).json({ message: 'Please fill out all the fields' })
            return;
        }
        if (content && req.body.postimg) {
            res.status(400).json({ message: "Both photos and content not allowed" });
            return;
        }
        if (!content && !req.body.postimg) {
            res.status(400).json({ message: "Content Missing" });
            return;
        }
        var profileImageURL = null;
        const nameofauthor = (await User.findById(id)).username;
        if (req.body.postimg) {
            const result = await cloudinary.uploader.upload(req.body.postimg, {
                folder: 'profile_images', // Specify a folder in Cloudinary
                public_id: `user_${nameofauthor}`, // Unique identifier for the image
                format: 'jpg', // Specify the format if needed
                transformation: [{ width: 150, height: 150, crop: 'thumb' }] // Optional image transformations
            });

            profileImageURL = result.secure_url;
        }
        const newpost = new Post({
            title: req.body.title,
            content: req.body?.content,
            author: id,
            authorName: nameofauthor,
            postimg: profileImageURL,
        })
        // console.log(newpost);
        await newpost.save();
        const useruploadingpost = await User.findById(id);
        useruploadingpost.posts.push(newpost);
        // console.log(useruploadingpost);
        useruploadingpost.save();
        // addposttouser();
        req.app.get('io').emit('newpost', newpost)

        res.status(200).json({ message: "Post saved successfully", newpost });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

// Add posts to a community or subreddit

router.post('/u/:id/r/:communityid/addPost', verifyTokenAndAuthorisation, async function (req, res) {
    const userid = req.params.id;
    const communityid = req.params.communityid;
    const { title, content } = req.body;
    try {
        if (title.length === 0 || content.length === 0) {
            res.status(400).json({ message: 'Please fill out all the fields' });
            return;
        }
        const nameofauthor = (await User.findById(userid)).username;
        const nameofcommunity = (await Subreddit.findById(communityid)).name;
        const newpost = new Post({
            author: userid,
            title: title,
            content: content,
            community: communityid,
            authorName: nameofauthor,
            communityName: nameofcommunity,
        })
        await newpost.save();
        res.status(200).json(newpost);
    }
    catch (err) {
        res.status(500).json(err);
    }
})

// Deleting a post

router.delete('/u/delete/:id/:postid', verifyTokenAndAuthorisation, async function (req, res) {
    try {
        let postId = req.params.postid;

        const postToBeDeleted = await Post.findById(postId).populate('comments');
        if (!postToBeDeleted) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (postToBeDeleted.comments && postToBeDeleted.comments.length.length > 0) {
            const commentIds = postToBeDeleted.comments.map(comment => comment._id);
            await Comment.deleteMany({ _id: { $in: commentIds } })
        }
        if (postToBeDeleted.community) {
            await Subreddit.posts.pull(postToBeDeleted._id);
        }
        const postcreator = await User.findById(postToBeDeleted.author);
        if (postcreator) {
            postcreator.posts.pull(postId);
            await postcreator.save();
        }
        await Post.deleteOne(postToBeDeleted);
        req.app.get('io').emit('postdeleted', postToBeDeleted);
        res.status(200).json({ message: 'Post deleted successfully' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

router.post('/u/:id/:postid/savepost', verifyToken, async function (req, res) {
    try {

        const newSavePost = new Saved({
            userid: req.params.id,
            postid: req.params.postid,
        })
        await newSavePost.save();
        const user = await User.findById(req.params.id);
        user.saved.push(newSavePost._id);
        await user.save();
        res.status(200).json({message:"Post saved successfully",newSavePost});
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})

module.exports = router;