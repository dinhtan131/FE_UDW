const express = require('express');
const router = express.Router();
const Post = require('../models/postModels'); // Import Post model
const User = require('../models/userModels'); // Import User model


router.get('/activity', (req, res) => {
    res.render('activity');
});

router.get('/profile', (req, res) => {
    res.render('profile');
});

module.exports = router;