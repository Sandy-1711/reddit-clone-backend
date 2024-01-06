const express = require('express');
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const auth = require('./routes/auth/auth')
const user = require('./routes/user/user')
const cors = require('cors')
const cloudinary = require('cloudinary')
const multer = require('multer')
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(multer().any())
app.use(express.json())
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

mongoose.connect(process.env.DB_URL).then(function () {
    console.log('connected to database');
}).catch(function (err) {
    console.log(err);
});

app.use('/api/test', function (req, res) {
    res.status(200).json('Server is up and running!')
})
app.use('/api/auth', auth)
app.use('/api/user', user)
app.listen(process.env.PORT || 5000, function () {
    console.log('server is running');
})
