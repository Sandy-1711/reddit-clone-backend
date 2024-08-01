const router = require('express').Router();
const bcrypt = require('bcrypt')
const validator = require('validator');
const User = require('../../models/User');
const multer = require('multer')
const jwt = require('jsonwebtoken')
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });
const cloudinary = require('cloudinary')
router.post('/register', async function (req, res) {
    var { username, email, password, profilePic } = req.body;
    // console.log(req.body);
    // var email = req.body.email;
    // var profilePic = await req.body.profilePic;
    // var username = req.body.username;
    // console.log(password);
    try {

        if (!username || !email || !password) {
            res.status(400).json('Invalid Credentials')
            return;
        }
        if (!validator.isEmail(email)) {

            res.status(400).json('Email is invalid')
            return;
        }
        if (password.length < 10) {
            res.status(400).json('Password is too short');
            return;
        }
        if (await User.findOne({ username: username }) || await User.findOne({ email: username })) {
            res.status(400).json('User already registered');
            return;
        }
        var profileImageURL = null;
        if (profilePic) {
            const result = await cloudinary.uploader.upload(req.body.profilePic, {
                folder: 'profile_images', // Specify a folder in Cloudinary
                public_id: `user_${username}`, // Unique identifier for the image
                format: 'jpg', // Specify the format if needed
                transformation: [{ width: 150, height: 150, crop: 'thumb' }] // Optional image transformations
            });

            profileImageURL = result.secure_url;
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newuser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            profilePic: profileImageURL,
        })
        await newuser.save();
        // console.log(newuser);
        const token = jwt.sign({ username: newuser.username, id: newuser._id, isAdmin: newuser.isAdmin }, process.env.JWT_SEC, { expiresIn: '1h' });
        const { password: userPassword, ...others } = newuser._doc;
        res.status(200).json({ ...others, token });

    }
    catch (err) {
        console.log(err?.message);
        res.status(500).json(err);
    }

})

router.post('/login', async function (req, res) {
    const { username, email, password } = req.body;
    try {
        const foundUser = await User.findOne({ username: username });
        // console.log(foundUser);
        if (!foundUser) {
            res.status(404).json({ message: 'User not found' });
            return ;
        }
        else {
            if (!(await bcrypt.compare(password, foundUser.password))) {
                // console.log(bcrypt.hashSync(password, 10));                
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            else {
                const token = jwt.sign({ username: foundUser.username, id: foundUser._id, isAdmin: foundUser.isAdmin }, process.env.JWT_SEC, { expiresIn: '1h' });
                const { password: userPassword, ...others } = foundUser._doc;
                res.status(200).json({ user: { ...others, token } });
            }
        }
    }
    catch (err) {
        // console.log(err);
        res.status(500).json(err);
    }
})

module.exports = router;