const express = require('express');
const router = express.Router();
const Post = require('../models/postModels'); // Import Post model
const User = require('../models/userModels'); // Import User model
const { authenticateToken } = require('../middleware/token');  // Import middleware
const upload = require('../middleware/upload'); // Import middleware upload

router.post(
    '/edit-profile',
    authenticateToken, 
    upload.single('avatar'), // Xử lý file upload (field name là 'avatar')
    async (req, res) => {
        try {
            const userId = req.userId; // Lấy ID từ middleware
            const { username, bio } = req.body; // Lấy thông tin từ form

            // Cập nhật avatar nếu có upload
            let avatarUrl = req.body.currentAvatar; // Dùng avatar cũ nếu không có file mới
            if (req.file) {
                avatarUrl = `/uploads/avatars/${req.file.filename}`;
            }

            // Cập nhật thông tin người dùng trong database
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { username, bio, avatar: avatarUrl },
                { new: true, runValidators: true } // Trả về thông tin đã cập nhật
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    }
);

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
// Route chỉnh sửa hồ sơ người dùng
router.post('/edit-profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId; // Lấy ID từ middleware
        const { username, bio, avatar } = req.body; // Lấy dữ liệu từ form

        // Cập nhật thông tin người dùng trong database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, bio, avatar },
            { new: true, runValidators: true } // Trả về thông tin đã cập nhật
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;