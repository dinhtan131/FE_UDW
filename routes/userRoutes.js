const express = require("express");
const router = express.Router();
const Post = require("../models/postModels"); // Import Post model
const User = require("../models/userModels"); // Import User model
const { authenticateToken } = require("../middleware/token"); // Import middleware
const upload = require("../middleware/upload"); // Import middleware upload

router.post(
  "/edit-profile",
  authenticateToken,
  upload.single("avatar"), // Xử lý file upload (field name là 'avatar')
  async (req, res) => {
    try {
      const userId = req.user._id; // Lấy ID từ middleware
      const { displayName, bio } = req.body; // Lấy thông tin từ form

      // Cập nhật avatar nếu có upload
      let avatarUrl = req.body.currentAvatar; // Dùng avatar cũ nếu không có file mới
      if (req.file) {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      // Cập nhật thông tin người dùng trong database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { displayName, bio, avatar: avatarUrl },
        { new: true, runValidators: true } // Trả về thông tin đã cập nhật
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res
        .status(200)
        .json({ message: "Profile updated successfully.", user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

router.get("/activity", (req, res) => {
  res.render("activity");
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // Lấy ID từ middleware
    const user = await User.findById(userId).select(
      "username email avatar bio createdAt"
    );
    console.log("User from DB:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.render("profile", { user });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/search", authenticateToken, async (req, res) => {
  try {
    const followList = await User.find({ _id: { $ne: req.user._id } })
      .select("username email avatar followers")
      .lean();

    res.render("search", { followList });
  } catch (error) {
    console.error(error);
    res.status(500).render("search", { followList: [] });
  }
});

router.post("/user/:userId/follow", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === userId) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn không thể follow chính mình." });
    }
    const currentUser = await User.findById(currentUserId);
    // Tìm người dùng cần follow
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại." });
    }

    // Kiểm tra nếu đã follow
    if (userToFollow.followers.includes(currentUserId)) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã follow người dùng này." });
    }

    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    currentUser.following.push(userId);
    await currentUser.save();

    return res
      .status(200)
      .json({ success: true, message: "Follow thành công!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống khi follow." });
  }
});

router.post("/user/:userId/unfollow", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params; // ID của người cần unfollow
    const currentUserId = req.user._id; // ID của người đang thực hiện unfollow

    // Không cho phép unfollow chính mình
    if (currentUserId.toString() === userId) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn không thể unfollow chính mình." });
    }

    // Tìm người dùng cần unfollow
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại." });
    }

    // Tìm người dùng hiện tại
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng hiện tại không tồn tại." });
    }

    // Kiểm tra nếu chưa follow
    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn chưa follow người dùng này." });
    }

    // Xóa `currentUserId` khỏi danh sách `followers` của người dùng mục tiêu
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== currentUserId.toString()
    );
    await userToUnfollow.save();

    // Xóa `userId` khỏi danh sách `following` của người dùng hiện tại
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== userId.toString()
    );
    await currentUser.save();

    // Trả về phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Unfollow thành công!",
      following: currentUser.following, // Danh sách following mới nếu cần cập nhật frontend
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống khi unfollow." });
  }
});


module.exports = router;
