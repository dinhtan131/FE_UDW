const express = require("express");
const router = express.Router();
const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const expressSession = require("express-session");
require("dotenv").config();
const { authenticateToken } = require("../middleware/token");

// Route gốc, chuyển hướng dựa trên trạng thái đăng nhập
router.get("/",authenticateToken, (req, res) => {
  const token = req.cookies.token || req.session.token;
  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/login");
    }
    return res.redirect("/home");
  });
});

// Route login
router.get("/login", (req, res) => {
  const token = req.cookies.token || req.session.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        return res.redirect("/home");
      }
    });
  }
  res.render("login", { error: null });
});

// Route register
router.get("/register", (req, res) => {
  const token = req.cookies.token || req.session.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        return res.redirect("/home");
      }
    });
  }
  res.render("register", { error: null });
});

// Route forgot password
router.get("/forgotPassWord", (req, res) => {
  res.render("forgotPassWord", { error: null });
});

// Đăng nhập
router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.render("login", {
      error: "Vui lòng nhập tên người dùng hoặc email và mật khẩu.",
    });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.render("login", {
        error: "Tên người dùng hoặc email không tồn tại.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Mật khẩu không đúng." });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: false, maxAge: 3600000 });
    return res.redirect("/home");
  } catch (error) {
    console.error(error);
    return res.render("login", { error: "Lỗi hệ thống khi đăng nhập." });
  }
});

// Đăng ký
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.render("register", { error: "Vui lòng điền đầy đủ thông tin." });
  }

  if (password !== confirmPassword) {
    return res.render("register", {
      error: "Mật khẩu và xác thực mật khẩu không trùng khớp.",
    });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.render("register", {
        error: "Email hoặc tên người dùng đã được sử dụng.",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: false, maxAge: 3600000 });
    return res.redirect("/home");
  } catch (error) {
    console.error(error);
    return res.render("register", { error: "Lỗi hệ thống khi đăng ký." });
  }
});

// Route GET logout
router.get("/logout",authenticateToken, (req, res) => {
  res.clearCookie("token");
  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi khi đăng xuất:", err);
      return res.status(500).render("login", { error: "Lỗi khi đăng xuất." });
    }
    return res.redirect("/login");
  });
});

// Đăng xuất
router.post("/logout",authenticateToken, (req, res) => {
  res.clearCookie("token");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
});

// Hàm tạo chuỗi ngẫu nhiên
function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

router.get("/create-users",authenticateToken, async (req, res) => {
  try {
    const numberOfUsers = req.body.numberOfUsers || 5; // Số lượng người dùng cần tạo (mặc định là 5)
    const createdUsers = [];

    for (let i = 0; i < numberOfUsers; i++) {
      // Tạo dữ liệu ngẫu nhiên
      const username = `user_${generateRandomString(5)}`;
      const email = `${generateRandomString(5)}@example.com`;
      const password = "password123"; // Mặc định password giống nhau (hoặc tạo ngẫu nhiên nếu cần)

      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const newUser = new User({
          username,
          email,
          password: password,
        });

        // Lưu vào cơ sở dữ liệu
        await newUser.save();
        createdUsers.push(newUser);
      }
    }

    res.status(201).json({
      message: `${createdUsers.length} users created successfully!`,
      createdUsers,
    });
  } catch (error) {
    console.error("Error creating users:", error);
    res.status(500).json({ message: "Error creating users", error });
  }
});

module.exports = router;
