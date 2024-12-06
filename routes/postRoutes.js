const express = require('express');
const router = express.Router();
const Post = require('../models/postModels'); // Import Post model
const User = require('../models/userModels'); // Import User model
const { authenticateToken } = require('../middleware/token');  // Import middleware

router.get('/home', authenticateToken, async (req, res) => {
    try {
        // Tìm tất cả bài đăng và populate thông tin tác giả (author) từ User
        const posts = await Post.find()
            .populate('author', 'username avatar') // Populate dữ liệu tác giả (username và avatar)
            .sort({ createdAt: -1 }); // Sắp xếp bài đăng mới nhất lên đầu

        res.render('index', { posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



router.get('/search', (req, res) => {
    const followList = [
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 },
        { userIDName: "doc.sach.moi.ngay", UserName: "Đọc sách mỗi ngày", numUserFolower: 216 }
    ];
    res.render('search', {followList});
});



router.post('/create', authenticateToken, async (req, res) => {
    try {
        console.log("User ID in route:", req.userId);  // Kiểm tra giá trị của req.userId

        const { content } = req.body;
        const authorId = req.userId;  // Lấy ID người dùng từ token (được gán trong middleware)
        console.log("Author ID:", authorId);

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Kiểm tra người dùng có tồn tại không (từ token)
        const author = await User.findById(authorId);
        if (!author) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Tạo bài đăng mới
        const newPost = new Post({
            content,
            author: author._id,
        });

        await newPost.save();

        res.status(201).json(newPost);  // Trả về bài đăng đã tạo
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});





router.get('/thread', (req, res) => {
    res.render('thread');
});

module.exports = router;