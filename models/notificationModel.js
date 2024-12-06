const mongoose = require('mongoose');

// Định nghĩa schema cho thông báo
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Người nhận thông báo
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String, // Liên kết đến bài viết, người dùng, hoặc trang liên quan
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false, // Thông báo đã được đọc hay chưa
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo model từ schema
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
