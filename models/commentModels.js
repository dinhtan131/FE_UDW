const mongoose = require('mongoose');

// Định nghĩa schema cho bình luận
const commentSchema = new mongoose.Schema({
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
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Liên kết với model Post
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo model từ schema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
