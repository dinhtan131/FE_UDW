const mongoose = require('mongoose');

// Định nghĩa schema cho bài đăng
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Liên kết với model User
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Liên kết với model User (danh sách người thích bài đăng)
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Liên kết với model Comment
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo model từ schema
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
