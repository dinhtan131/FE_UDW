const mongoose = require('mongoose');
const User = require('./models/userModels'); // Đảm bảo rằng bạn import đúng schema User

mongoose.connect('mongodb+srv://PTUDW:se7AeECrLmX6FjwW@ptudw.7otyu.mongodb.net', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Starting migration...');

    // Lấy tất cả người dùng trong cơ sở dữ liệu
    const users = await User.find();

    // Cập nhật mỗi người dùng
    for (let user of users) {
      // Kiểm tra và khởi tạo các trường nếu chưa có
      if (!user.posts) user.posts = [];
      if (!user.replies) user.replies = [];
      if (!user.reposts) user.reposts = [];

      // Lưu lại sau khi cập nhật
      await user.save();
    }

    console.log('Migration completed successfully!');
    mongoose.connection.close(); // Đóng kết nối sau khi hoàn tất
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    mongoose.connection.close();
  });
