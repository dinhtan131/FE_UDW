const express = require("express");
const router = express.Router();
const Post = require("../models/postModels"); // Import Post model
const User = require("../models/userModels"); // Import User model
const Comment = require("../models/commentModels");
const Notification = require("../models/notificationModel"); // Import Notification model
const { postImageUpload } = require('../middleware/upload');
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


router.post(
  "/create",
  authenticateToken,
  postImageUpload.array("postImages", 5), // Cho phép upload tối đa 5 file
  async (req, res) => {
    try {
      const authorId = req.user._id; // Lấy ID từ middleware
      const { content } = req.body; // Lấy nội dung bài đăng

      // Kiểm tra nội dung bài đăng
      if (!content && req.files.length === 0) {
        return res.status(400).json({
          message: "Content or at least one image is required",
        });
      }

      // Tạo đường dẫn đến các ảnh upload
      const uploadedImages = req.files.map((file) => `/postImage/${file.filename}`);

      // Tạo bài đăng mới với nội dung và ảnh
      const newPost = new Post({
        content,
        author: authorId,
        postImage: uploadedImages, // Đẩy mảng đường dẫn ảnh vào postImage
      });

      // Lưu bài đăng vào database
      await newPost.save();

      // Cập nhật trường "posts" trong người dùng (thêm ID bài viết vào danh sách posts)
      const user = await User.findById(authorId);
      user.posts.push(newPost._id); // Thêm ID bài viết vào mảng posts của người dùng
      await user.save();

      res.status(201).json(newPost); // Trả về bài đăng đã tạo
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);



router.get("/post/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    // Tìm các comment gốc và populate đầy đủ thông tin
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("author", "username avatar") // Tác giả của comment
      .populate({
        path: "parentComment",
        populate: { path: "author", select: "username avatar" }, // Tác giả của comment cha (nếu có)
      })
      .sort({ createdAt: -1 }); // Sắp xếp comment mới nhất lên đầu

    res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/post/:postId/comments", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body; // parentComment là optional
    const userId = req.user._id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    // Kiểm tra bài viết tồn tại
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Nếu có parentComment, kiểm tra comment cha có tồn tại không
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
    }

    // Tạo comment mới
    const comment = new Comment({
      content,
      author: userId,
      post: postId,
      parentComment: parentComment || null, // Gán parentComment nếu có
    });

    await comment.save();

    // Thêm comment vào bài viết
    post.comments.push(comment._id);
    await post.save();

    // Populate author của comment trước khi gửi phản hồi
    await comment.populate("author", "username avatar");

    // Tạo thông báo comment (nếu là phản hồi thì thông báo cho tác giả comment cha)
    let notificationRecipient = post.author; // Mặc định thông báo cho tác giả bài viết

    if (parentComment) {
      const parent = await Comment.findById(parentComment).populate("author");
      notificationRecipient = parent.author; // Nếu là phản hồi, thông báo cho tác giả comment cha
    }

    const notification = new Notification({
      user: notificationRecipient._id,
      initiator: userId,
      type: 'comment',
      message: `${req.user.username} đã ${parentComment ? "phản hồi" : "bình luận"} trên bài viết của bạn.`,
      link: `/post/${postId}`, // Dẫn đến bài viết
    });

    await notification.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
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

    res.render("post", {
      post,
      currentUserId: req.user ? req.user._id.toString() : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.get('/repost/:postId', authenticateToken, async (req, res) => {
  try {
    // Lấy thông tin bài viết cần repost
    const postToRepost = await Post.findById(req.params.postId);

    if (!postToRepost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Xác định bài viết gốc (nếu bài viết này là repost, lấy originalPost; nếu không, chính nó là bài viết gốc)
    const originalPostId = postToRepost.originalPost
      ? postToRepost.originalPost
      : postToRepost._id;

    // Tạo bài viết repost mới
    const repost = new Post({
      content: postToRepost.content, // Nội dung giống bài viết gốc
      author: req.user._id, // Người thực hiện repost
      postImage: postToRepost.postImage, // Sao chép hình ảnh (nếu có)
      originalPost: originalPostId, // ID của bài viết gốc
    });

    // Lưu bài viết repost vào database
    await repost.save();

    // Cập nhật bài viết gốc (lưu ID của bài repost vào trường reposts)
    await Post.findByIdAndUpdate(originalPostId, {
      $push: { reposts: repost._id },
    });

    // Cập nhật user (lưu ID của bài repost vào trường reposts của user)
    await User.findByIdAndUpdate(req.user._id, {
      $push: { reposts: repost._id },
    });

    res.status(201).json({
      message: "Reposted successfully",
      repost,
    });
  } catch (error) {
    console.error("Error reposting:", error);
    res.status(500).json({ error: "Server error" });
  }
});





module.exports = router;
