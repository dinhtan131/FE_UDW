const express = require("express");
const router = express.Router();
const Post = require("../models/postModels"); // Import Post model
const User = require("../models/userModels"); // Import User model
const Comment = require("../models/commentModels");
const Notification = require("../models/notificationModel"); // Import Notification model

const { authenticateToken } = require("../middleware/token"); // Import middleware

router.get("/home", authenticateToken, async (req, res) => {
  try {
    // Tìm tất cả bài đăng và populate thông tin tác giả (author) từ User và likes từ User
    const posts = await Post.find()
      .populate("author", "username avatar") // Populate dữ liệu tác giả (username và avatar)
      .populate("likes", "username avatar") // Populate danh sách người like
      .populate({
        path: "comments",
        populate: { path: "author", select: "username avatar" },
      }) // Populate comments và thông tin tác giả của comments
      .sort({ createdAt: -1 }); // Sắp xếp bài đăng mới nhất lên đầu

    // Truyền currentUserId vào template EJS
    res.render("index", {
      posts,
      currentUserId: req.user._id.toString(), // Chuyển đổi ObjectId thành string
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/create", authenticateToken, async (req, res) => {
  try {
    console.log("User ID in route:", req.user._id); // Kiểm tra giá trị của req.user._id

    const { content } = req.body;
    const authorId = req.user._id; // Lấy ID người dùng từ req.user._id
    console.log("Author ID:", authorId);

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Tạo bài đăng mới
    const newPost = new Post({
      content,
      author: authorId,
    });

    // Lưu bài đăng vào database
    await newPost.save();

    // Cập nhật trường "posts" trong người dùng (thêm ID bài viết vào danh sách posts)
    const user = await User.findById(authorId);
    user.posts.push(newPost._id); // Thêm ID bài viết vào mảng posts của người dùng
    await user.save(); // Lưu thay đổi vào người dùng

    res.status(201).json(newPost); // Trả về bài đăng đã tạo
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/post/:postId/comments", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Tạo comment mới
    const comment = new Comment({
      content,
      author: userId,
      post: postId,
    });

    await comment.save();

    // Thêm comment vào bài viết
    post.comments.push(comment._id);
    await post.save();

    // Populate author của comment trước khi gửi phản hồi
    await comment.populate("author", "username avatar");

    // Tạo thông báo comment
    const postAuthor = post.author; // Tìm tác giả bài viết
    const notification = new Notification({
      user: postAuthor._id, // Người nhận thông báo là tác giả bài viết
      initiator: userId, // Người thực hiện hành động comment
      type: 'comment',
      message: `${comment.author.username} đã bình luận trên bài viết của bạn. Xem chi tiết tại: /post/${postId} (Bình luận bởi ${req.user.username})`,
      link: `/post/${postId}`, // Dẫn đến bài viết
    });

    await notification.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});




router.get("/post/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate(
      "likes",
      "username avatar"
    );

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/post/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const hasLiked = post.likes.includes(userId);
    const postAuthor = post.author; // Tìm tác giả bài viết

    if (!hasLiked) {
      post.likes.push(userId);
      await post.save();

      // Tạo thông báo khi like
      const notification = new Notification({
        user: postAuthor._id, // Người nhận thông báo là tác giả bài viết
        initiator: userId, // Người thực hiện hành động like
        type: 'like',
        message: `${postAuthor.username} đã thích bài viết của bạn.`,
        link: `/post/${postId}`,
      });

      await notification.save();
    }

    return res
      .status(200)
      .json({ message: "Post liked", likesCount: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.get("/api/post/:postId", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username avatar" },
      })
      .populate("likes", "username avatar");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/post/:postId", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    // Tìm bài viết trong MongoDB
    const post = await Post.findById(postId)
      .populate("author", "username avatar")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username avatar" },
      })
      .populate("likes", "username avatar");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Render template 'post.ejs' với dữ liệu bài viết
    // currentUserId: giả sử bạn đã đăng nhập, middleware authenticateToken gán req.user
    res.render("post", {
      post,
      currentUserId: req.user ? req.user._id.toString() : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;