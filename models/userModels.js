const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  avatar: {
    type: String, // URL hoặc tên file của avatar (nếu có)
    default: 'icons/profile.svg',
  },
  bio: {
    type: String,
    maxlength: 200,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      console.log('Mật khẩu người dùng nhập:', this.password);
        const hashedPassword = await bcrypt.hash(this.password, 10);
        console.log('Mật khẩu sau khi mã hóa:', hashedPassword); // Xem mật khẩu sau khi mã hóa
        this.password = hashedPassword;
    }
    next();
});


// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;
