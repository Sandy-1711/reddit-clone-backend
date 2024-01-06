const { verifyTokenAndAuthorisation, verifyToken } = require('../../middlewares/verifyAuthToken');
const Post = require('../../models/Post');
const user = require('../../models/User');

const router = require('express').Router();

// My profile

router.get('/:id', verifyToken, async function (req, res) {
    const id = req.params.id;
    try {
        const foundUser = await user.findById(id).populate('posts');
        if (!foundUser) {
            res.status(400).json("User not found");
        }
        const { password, ...others } = foundUser._doc;
        res.status(200).json({ ...others });
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})


module.exports = router;