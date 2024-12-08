const express = require('express');
const router = express.Router();
const Post = require('../models/postModels'); // Import Post model
const User = require('../models/userModels'); // Import User model
const { authenticateToken } = require('../middleware/token');  // Import middleware

router.get('/activity', (req, res) => {
    res.render('activity');
});


router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId; // Lấy ID từ middleware
        const user = await User.findById(userId).select('username email avatar bio createdAt');
        console.log('User from DB:', user);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.render('profile', { user });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});
module.exports = router;